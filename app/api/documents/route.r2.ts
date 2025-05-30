import { type NextRequest, NextResponse } from "next/server"
import { listR2Documents } from "@/lib/r2-document-service"
import { SLUG_TO_AREA_IDS } from "@/utils/areas"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaSlug = searchParams.get("areaId")
    const moduleType = searchParams.get("moduleType")
    const folderId = searchParams.get("folderId")

    if (!areaSlug || !moduleType) {
      return NextResponse.json({ error: "areaId y moduleType son requeridos" }, { status: 400 })
    }

    // Obtener el ID de área a partir del slug usando el mapeo existente
    const areaId = SLUG_TO_AREA_IDS[areaSlug as keyof typeof SLUG_TO_AREA_IDS]

    if (!areaId) {
      console.error(`ID de área no encontrado para slug: ${areaSlug}`)
      // Si no existe, devolver un array vacío en lugar de error para evitar bloquear la UI
      return NextResponse.json([])
    }

    console.log(`Obteniendo documentos para área: ${areaSlug}, módulo: ${moduleType}, carpeta: ${folderId || 'root'}`)

    // Usar R2 document service para obtener documentos
    const documents = await listR2Documents(areaSlug, moduleType, folderId || undefined)

    console.log(`Se encontraron ${documents.length} documentos`)

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error en GET /api/documents:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al obtener documentos",
      },
      { status: 500 },
    )
  }
}
