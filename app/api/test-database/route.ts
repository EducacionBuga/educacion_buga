import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export async function GET() {
  try {
    const supabase = createAdminClient()
    const results: string[] = []    // Test 1: Check if carpetas table exists
    try {
      const { data: carpetasData, error: carpetasError } = await supabase
        .from('carpetas')
        .select('*')
        .limit(1)

      if (carpetasError) {
        if (carpetasError.code === '42P01') {
          results.push('❌ Table carpetas does not exist')
          results.push('💡 Table needs to be created manually in Supabase dashboard')
          results.push('📋 Use the schema from hybrid-tables.sql file')
        } else {
          results.push(`❌ Error accessing carpetas: ${carpetasError.message}`)
        }
      } else {
        results.push(`✅ Table carpetas exists with ${carpetasData?.length || 0} records`)
      }
    } catch (err) {
      results.push(`💥 Error testing carpetas: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }    // Test 2: Check if documentos table exists
    try {
      const { data: documentosData, error: documentosError } = await supabase
        .from('documentos')
        .select('*')
        .limit(1)

      if (documentosError) {
        if (documentosError.code === '42P01') {
          results.push('❌ Table documentos does not exist')
          results.push('💡 Table needs to be created manually in Supabase dashboard')
          results.push('📋 Use the schema from hybrid-tables.sql file')
        } else {
          results.push(`❌ Error accessing documentos: ${documentosError.message}`)
        }
      } else {
        results.push(`✅ Table documentos exists with ${documentosData?.length || 0} records`)
      }
    } catch (err) {
      results.push(`💥 Error testing documentos: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }    // Test 3: Test connection to existing table
    try {
      results.push('🧪 Testing connection with existing plan_accion table...')
      
      const { data: planData, error: planError } = await supabase
        .from('plan_accion')
        .select('id')
        .limit(1)

      if (planError) {
        results.push(`❌ Failed to connect to plan_accion: ${planError.message}`)
      } else {
        results.push('✅ Successfully connected to Supabase database!')
        results.push(`📊 Plan_accion table accessible with ${planData?.length || 0} records`)
      }
    } catch (err) {
      results.push(`💥 Error in connection test: ${err instanceof Error ? err.message : 'Unknown error'}`)
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