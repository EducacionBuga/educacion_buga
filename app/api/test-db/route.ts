import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    const supabase = createAdminClient()

    if (action === 'check_documentos_table') {
      // Check table structure
      const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'documentos'
          ORDER BY ordinal_position;
        `
      })

      if (columnsError) {
        return NextResponse.json({
          error: 'Error checking table structure',
          details: columnsError
        })
      }

      // Test basic access
      const { data: testData, error: testError } = await supabase
        .from('documentos')
        .select('*')
        .limit(1)

      return NextResponse.json({
        tableExists: !testError,
        columns: columns || [],
        sampleData: testData || [],
        accessError: testError
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (error) {
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
