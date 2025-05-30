import { type NextRequest, NextResponse } from "next/server"
import { listR2Folders } from "@/lib/r2-folder-service"
import { SLUG_TO_AREA_IDS } from "@/utils/areas"

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

    // Usar R2 para obtener las carpetas
    const folders = await listR2Folders(areaId, moduleType)

    console.log(`Se encontraron ${folders.length} carpetas en R2`)

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

    // Obtener el ID de área a partir del slug usando el mapeo existente
    const areaId = SLUG_TO_AREA_IDS[areaSlug as keyof typeof SLUG_TO_AREA_IDS]

    if (!areaId) {
      console.error(`Área inválida: ${areaSlug}`)
      return NextResponse.json({ error: `Área inválida: ${areaSlug}` }, { status: 400 })
    }

    console.log(`Creando carpeta: ${name} para área: ${areaSlug}, módulo: ${moduleType}`)

    // Usar R2 para crear la carpeta
    const { createR2Folder } = await import("@/lib/r2-folder-service")
    
    const folder = await createR2Folder(areaId, moduleType, {
      name,
      date,
      category,
      color,
      description: description || "",
    })

    console.log(`Carpeta creada exitosamente en R2: ${folder.id}`)

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
