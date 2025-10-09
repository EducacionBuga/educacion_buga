import { type NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase-client"
import { uploadPlanAccionAttachment } from "@/lib/r2-upload-service"
import { getAreaIdFromSlug } from "@/utils/areas"

// Tipos de archivos permitidos para plan de acción
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
]

// Tamaño máximo de archivo (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const areaSlug = formData.get("areaId") as string
    const activityId = formData.get("activityId") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    // Validaciones
    if (!file || !areaSlug || !activityId || !name) {
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

    // Convertir el slug del área a un UUID válido
    let areaId = areaSlug
    if (areaSlug && !areaSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      areaId = getAreaIdFromSlug(areaSlug)
      if (!areaId) {
        console.error(`Invalid area slug: ${areaSlug}`)
        return NextResponse.json({ error: `Área inválida: ${areaSlug}` }, { status: 400 })
      }
    }

    console.log("Subiendo adjunto de plan de acción:", {
      areaId,
      activityId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })    // Subir archivo a R2 usando el servicio centralizado
    const { fileId, filePath, fileUrl } = await uploadPlanAccionAttachment(file, areaId, activityId)

    console.log("Adjunto subido exitosamente a R2:", filePath)

    // Guardar metadatos en Supabase usando cliente admin
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("plan_accion_adjuntos")
      .insert({
        id: fileId,
        nombre: name,
        descripcion: description || "",
        tipo_archivo: file.type,
        tamano: file.size,
        ruta_archivo: filePath,
        url_publica: fileUrl,
        actividad_id: activityId,
        area_id: areaId,
        estado: "activo",
      })
      .select()
      .single()

    if (error) {
      console.error("Error al guardar metadatos del adjunto:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      name: data.nombre,
      description: data.descripcion,
      fileType: data.tipo_archivo,
      fileSize: data.tamano,
      filePath: data.ruta_archivo,
      fileUrl: data.url_publica,
      activityId: data.actividad_id,
      createdAt: data.created_at,
    })
  } catch (error) {
    console.error("Error al subir adjunto de plan de acción:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al subir adjunto",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
