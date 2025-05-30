import { type NextRequest, NextResponse } from "next/server"
import { HybridDocumentService } from "@/lib/hybrid-document-service"
import type { AreaId, ModuleType } from "@/hooks/use-document-store-generic"

// Tipos de archivos permitidos
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
]

// Tamaño máximo de archivo (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const areaId = formData.get("areaId") as AreaId
    const moduleType = formData.get("moduleType") as ModuleType
    const folderId = formData.get("folderId") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    // Validaciones básicas
    if (!file || !areaId || !moduleType || !name || !folderId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: file, areaId, moduleType, name, folderId" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}` },
        { status: 400 }
      )
    }

    // Validar tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 50MB permitido." },
        { status: 400 }
      )
    }

    console.log(`Subiendo documento: ${name} para área: ${areaId}, módulo: ${moduleType}`)

    // Usar HybridDocumentService para subir el documento
    const document = await HybridDocumentService.uploadDocument({
      name,
      description: description || "",
      file,
      folderId,
      areaId,
      moduleType,
    })

    console.log(`Documento subido exitosamente: ${document.id}`)

    return NextResponse.json({
      success: true,
      message: "Documento subido exitosamente",
      document
    })

  } catch (error) {
    console.error("Error en POST /api/documents/upload:", error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al subir documento",
      },
      { status: 500 }
    )
  }
}
