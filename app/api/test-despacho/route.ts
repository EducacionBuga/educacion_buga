import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export async function GET() {
  try {
    const supabase = createAdminClient()
    const results: string[] = []
    
    results.push('🔍 Testing Despacho area tables...')
    
    // Test 1: Check if informes_ejecucion table exists
    try {
      const { data: informesData, error: informesError } = await supabase
        .from('informes_ejecucion')
        .select('*')
        .limit(1)

      if (informesError) {
        if (informesError.code === '42P01') {
          results.push('❌ Table informes_ejecucion does not exist')
          results.push('💡 Table needs to be created for Despacho area')
        } else {
          results.push(`❌ Error accessing informes_ejecucion: ${informesError.message}`)
        }
      } else {
        results.push(`✅ Table informes_ejecucion exists with ${informesData?.length || 0} records`)
      }
    } catch (err) {
      results.push(`💥 Error testing informes_ejecucion: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // Test 2: Check if registros_fotograficos table exists
    try {
      const { data: registrosData, error: registrosError } = await supabase
        .from('registros_fotograficos')
        .select('*')
        .limit(1)

      if (registrosError) {
        if (registrosError.code === '42P01') {
          results.push('❌ Table registros_fotograficos does not exist')
          results.push('💡 Table needs to be created for Despacho area')
        } else {
          results.push(`❌ Error accessing registros_fotograficos: ${registrosError.message}`)
        }
      } else {
        results.push(`✅ Table registros_fotograficos exists with ${registrosData?.length || 0} records`)
      }
    } catch (err) {
      results.push(`💥 Error testing registros_fotograficos: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // Test 3: Check Despacho area configuration
    try {
      const DESPACHO_AREA_ID = "9850c4bd-119a-444d-831f-2f410bbbaf8b"
      const { data: areaData, error: areaError } = await supabase
        .from('areas')
        .select('id, codigo, nombre')
        .eq('id', DESPACHO_AREA_ID)
        .single()

      if (areaError) {
        results.push(`❌ Error accessing Despacho area: ${areaError.message}`)
      } else if (areaData) {
        results.push(`✅ Despacho area found: ${areaData.nombre} (${areaData.codigo})`)
      } else {
        results.push('❌ Despacho area not found in database')
      }
    } catch (err) {
      results.push(`💥 Error testing Despacho area: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // Test 4: Try to create a test record in informes_ejecucion (if table exists)
    try {
      results.push('🧪 Testing informes_ejecucion insert capability...')
      
      const testData = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'TEST_INFORME',
        description: 'Test informe for database validation',
        file_url: 'https://test.com/test.pdf',
        file_type: 'application/pdf',
        file_size: 1024,
        file_path: 'test/path.pdf',
        area_id: '9850c4bd-119a-444d-831f-2f410bbbaf8b',
        date: '2025-01-01',
        status: 'test'
      }

      const { error: insertError } = await supabase
        .from('informes_ejecucion')
        .insert(testData)

      if (insertError) {
        results.push(`❌ Insert test failed: ${insertError.message}`)
      } else {
        results.push('✅ Insert test successful')
        
        // Clean up test record
        await supabase
          .from('informes_ejecucion')
          .delete()
          .eq('id', testData.id)
        
        results.push('🧹 Test record cleaned up')
      }
    } catch (err) {
      results.push(`💥 Error in insert test: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
