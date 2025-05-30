import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { getAreaIdFromSlug } from "@/utils/areas"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaSlug = searchParams.get("areaId")

    // Convertir el slug del área a un UUID válido si es necesario
    let areaId = areaSlug
    if (areaSlug && !areaSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      areaId = getAreaIdFromSlug(areaSlug)
      if (!areaId) {
        console.error(`Invalid area slug: ${areaSlug}`)
        return NextResponse.json({ error: `Invalid area: ${areaSlug}` }, { status: 400 })
      }
    }

    const supabase = createAdminClient()

    let query = supabase
      .from("informes_ejecucion")
      .select(`
        *,
        areas (
          codigo,
          nombre
        )
      `)
      .eq("status", "active")

    if (areaId) {
      query = query.eq("area_id", areaId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching informes:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/informes:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
