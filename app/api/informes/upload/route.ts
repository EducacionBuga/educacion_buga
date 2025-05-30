import { type NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase-client"
import { uploadInforme } from "@/lib/r2-upload-service"
import { getAreaIdFromSlug } from "@/utils/areas"

// Tipos de archivos permitidos
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]

// Tamaño máximo de archivo (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const areaSlug = formData.get("areaId") as string
    const date = formData.get("date") as string

    // Validaciones
    if (!file || !name || !areaSlug || !date) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 })
    }

    // Validar tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Archivo demasiado grande (máximo 50MB)" }, { status: 400 })
    }

    // Convertir el slug del área a un UUID válido si es necesario
    let areaId: string = areaSlug
    if (areaSlug && !areaSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const resolvedAreaId = getAreaIdFromSlug(areaSlug)
      if (!resolvedAreaId) {
        console.error(`Invalid area slug: ${areaSlug}`)
        return NextResponse.json({ error: `Área inválida: ${areaSlug}` }, { status: 400 })
      }
      areaId = resolvedAreaId
    }

    console.log("Subiendo informe a R2:", {
      areaId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

    // Subir archivo a R2 usando el servicio centralizado
    const { fileId, filePath, fileUrl } = await uploadInforme(file, areaId)

    console.log("Informe subido exitosamente a R2:", filePath)

    // Guardar metadatos en Supabase usando el cliente admin para bypass RLS
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("informes_ejecucion")
      .insert({
        id: fileId,
        name,
        description,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        file_path: filePath,
        area_id: areaId,
        date,
        status: "active",
      })
      .select(`
        *,
        areas (
          codigo,
          nombre
        )
      `)
      .single()

    if (error) {
      console.error("Error al guardar metadatos en Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al subir informe:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al subir informe",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
