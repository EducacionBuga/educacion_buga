import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoriaId = searchParams.get('categoria_id')

    if (!categoriaId) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro categoria_id' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Obtener items con sus etapas
    const { data: items, error } = await supabase
      .from('lista_chequeo_items_maestros')
      .select(`
        *,
        etapa:lista_chequeo_etapas(*)
      `)
      .eq('categoria_id', categoriaId)
      .order('numero_item')

    if (error) {
      console.error('Error al obtener items:', error)
      return NextResponse.json(
        { error: 'Error al obtener los items de lista de chequeo' },
        { status: 500 }
      )
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
