// filepath: d:\Clients\Secretaria de buga\sistema-educativo\app\api\folders\route.ts
import { type NextRequest, NextResponse } from "next/server"
import { HybridDocumentService } from "@/lib/hybrid-document-service"
import { SLUG_TO_AREA_IDS } from "@/utils/areas"
import type { AreaId, ModuleType } from "@/hooks/use-document-store-generic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaSlug = searchParams.get("areaId")
    const moduleType = searchParams.get("moduleType")

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

    console.log(`Obteniendo carpetas para área: ${areaSlug}, módulo: ${moduleType}`)

    // Usar servicio híbrido para obtener las carpetas desde Supabase
    const folders = await HybridDocumentService.listFolders(areaSlug as AreaId, moduleType as ModuleType)

    console.log(`Se encontraron ${folders.length} carpetas en Supabase`)

    return NextResponse.json(folders)
  } catch (error) {
    console.error("Error en GET /api/folders:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al obtener carpetas",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, date, category, color, areaId: areaSlug, moduleType, description } = body

    if (!name || !category || !color || !areaSlug || !moduleType) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    console.log(`Creando carpeta: ${name} para área: ${areaSlug}, módulo: ${moduleType}`)

    // Usar servicio híbrido para crear la carpeta en Supabase y R2
    const folder = await HybridDocumentService.createFolder({
      name,
      description: description || "",
      color,
      category,
      date,
      areaId: areaSlug as AreaId,
      moduleType: moduleType as ModuleType,
    })

    console.log(`Carpeta creada exitosamente: ${folder.id}`)

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error en POST /api/folders:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al crear carpeta",
      },
      { status: 500 },
    )
  }
}
