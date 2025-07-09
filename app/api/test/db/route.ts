import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-client'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Probar la conexión con una consulta simple
    const { data, error } = await supabase
      .from('areas')
      .select('id, nombre, codigo')
      .limit(5)

    if (error) {
      console.error('Error en conexión a DB:', error)
      return NextResponse.json(
        { error: 'Database connection error', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      areas: data 
    })

  } catch (error) {
    console.error('Error en test DB:', error)
    return NextResponse.json(
      { error: 'Unexpected error', details: String(error) },
      { status: 500 }
    )
  }
}
