// filepath: d:\Clients\Secretaria de buga\sistema-educativo\app\api\documents\route.ts
import { type NextRequest, NextResponse } from "next/server"
import { HybridDocumentService } from "@/lib/hybrid-document-service"
import type { AreaId, ModuleType } from "@/hooks/use-document-store-generic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaSlug = searchParams.get("areaId")
    const moduleType = searchParams.get("moduleType")
    const folderId = searchParams.get("folderId")

    if (!areaSlug || !moduleType) {
      return NextResponse.json({ error: "areaId y moduleType son requeridos" }, { status: 400 })
    }

    console.log(`Obteniendo documentos para área: ${areaSlug}, módulo: ${moduleType}, carpeta: ${folderId || 'all'}`)

    // Usar servicio híbrido para obtener documentos desde Supabase
    const documents = await HybridDocumentService.listDocuments(
      areaSlug as AreaId, 
      moduleType as ModuleType, 
      folderId || undefined
    )

    console.log(`Se encontraron ${documents.length} documentos en Supabase`)

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
