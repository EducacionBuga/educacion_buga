import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: categorias, error } = await supabase
      .from('lista_chequeo_categorias')
      .select('*')
      .order('orden')

    if (error) {
      console.error('Error al obtener categorías:', error)
      return NextResponse.json(
        { error: 'Error al obtener las categorías de lista de chequeo' },
        { status: 500 }
      )
    }

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
