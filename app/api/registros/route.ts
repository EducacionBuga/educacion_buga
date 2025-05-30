import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { getAreaUUID } from "@/lib/area-mapping"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaId = searchParams.get("areaId")

    console.log('Registros API called with areaId:', areaId)

    const supabase = createAdminClient()

    let query = supabase
      .from("registros_fotograficos")
      .select(`
        *,
        areas (
          codigo,
          nombre
        )
      `)
      .eq("status", "active")

    if (areaId) {
      // Convert area key to UUID if needed
      const areaUUID = getAreaUUID(areaId)
      console.log('Converting areaId:', areaId, 'to UUID:', areaUUID)
      query = query.eq("area_id", areaUUID)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching registros:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Registros fetched successfully, count:', data?.length || 0)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/registros:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
