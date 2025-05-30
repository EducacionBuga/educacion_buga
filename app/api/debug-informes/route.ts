import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaId = searchParams.get("areaId")

    const supabase = createClient()

    // Test 1: Verificar conexión básica
    console.log("🔍 Debug Informes - Starting diagnostic...")
    
    // Test 2: Contar todos los registros sin filtros
    const { data: allRecords, error: allError } = await supabase
      .from("informes_ejecucion")
      .select("*", { count: 'exact' })
    
    console.log("📊 All records count:", allRecords?.length)
    if (allError) console.error("❌ Error fetching all records:", allError)

    // Test 3: Verificar valores de status
    const { data: statusCheck, error: statusError } = await supabase
      .from("informes_ejecucion")
      .select("status")
    
    const statusValues = statusCheck?.map(r => r.status) || []
    const uniqueStatuses = [...new Set(statusValues)]
    console.log("📋 Unique status values:", uniqueStatuses)
    if (statusError) console.error("❌ Error checking status:", statusError)

    // Test 4: Contar registros activos
    const { data: activeRecords, error: activeError } = await supabase
      .from("informes_ejecucion")
      .select("*", { count: 'exact' })
      .eq("status", "active")
    
    console.log("✅ Active records count:", activeRecords?.length)
    if (activeError) console.error("❌ Error fetching active records:", activeError)

    // Test 5: Si se proporciona areaId, verificar registros para esa área
    let areaRecords = null
    if (areaId) {
      const { data: areaData, error: areaError } = await supabase
        .from("informes_ejecucion")
        .select("*")
        .eq("area_id", areaId)
      
      areaRecords = areaData
      console.log(`🎯 Records for area ${areaId}:`, areaData?.length)
      if (areaError) console.error("❌ Error fetching area records:", areaError)

      // Test 6: Verificar valores únicos de area_id
      const { data: areaIds, error: areaIdsError } = await supabase
        .from("informes_ejecucion")
        .select("area_id")
      
      const uniqueAreaIds = [...new Set(areaIds?.map(r => r.area_id) || [])]
      console.log("🏢 Unique area_ids in database:", uniqueAreaIds)
      if (areaIdsError) console.error("❌ Error fetching area_ids:", areaIdsError)
    }

    // Test 7: Probar la query exacta que usa el API original
    let originalQuery = supabase
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
      originalQuery = originalQuery.eq("area_id", areaId)
    }

    const { data: originalResult, error: originalError } = await originalQuery.order("created_at", { ascending: false })
    
    console.log("🔄 Original query result:", originalResult?.length)
    if (originalError) console.error("❌ Original query error:", originalError)

    // Preparar respuesta de diagnóstico
    const diagnostic = {
      timestamp: new Date().toISOString(),
      areaId: areaId,
      tests: {
        allRecords: {
          count: allRecords?.length || 0,
          error: allError?.message || null
        },
        statusCheck: {
          uniqueStatuses,
          error: statusError?.message || null
        },
        activeRecords: {
          count: activeRecords?.length || 0,
          error: activeError?.message || null
        },
        areaRecords: areaId ? {
          count: areaRecords?.length || 0,
          areaId: areaId
        } : null,
        uniqueAreaIds: areaId ? [...new Set((await supabase.from("informes_ejecucion").select("area_id")).data?.map(r => r.area_id) || [])] : null,
        originalQuery: {
          count: originalResult?.length || 0,
          error: originalError?.message || null,
          sample: originalResult?.slice(0, 2) || []
        }
      }
    }

    console.log("📋 Full diagnostic:", JSON.stringify(diagnostic, null, 2))
    
    return NextResponse.json(diagnostic)
  } catch (error) {
    console.error("🚨 Error in debug endpoint:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
