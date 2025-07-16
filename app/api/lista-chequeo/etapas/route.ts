import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: etapas, error } = await supabase
      .from('lista_chequeo_etapas')
      .select('*')
      .order('orden')

    if (error) {
      console.error('Error al obtener etapas:', error)
      return NextResponse.json(
        { error: 'Error al obtener las etapas de lista de chequeo' },
        { status: 500 }
      )
    }

    return NextResponse.json(etapas)
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
