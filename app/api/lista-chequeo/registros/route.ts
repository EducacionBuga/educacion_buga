import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaId = searchParams.get('area_id')

    if (!areaId) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro area_id' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: registros, error } = await supabase
      .from('lista_chequeo_registros')
      .select('*')
      .eq('dependencia', areaId)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error al obtener registros:', error)
      return NextResponse.json(
        { error: 'Error al obtener los registros de contratos' },
        { status: 500 }
      )
    }

    return NextResponse.json(registros || [])
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { area_id, categoria_id, numero_contrato, contratista, valor_contrato, objeto } = body

    if (!area_id || !numero_contrato || !contratista) {
      return NextResponse.json(
        { error: 'Se requieren área, número de contrato y contratista' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Verificar si ya existe un registro con el mismo número de contrato en el área
    const { data: existing, error: checkError } = await supabase
      .from('lista_chequeo_registros')
      .select('id')
      .eq('dependencia', area_id)
      .eq('numero_contrato', numero_contrato)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error al verificar registro existente:', checkError)
      return NextResponse.json(
        { error: 'Error al verificar registro existente' },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un registro con este número de contrato en esta área' },
        { status: 409 }
      )
    }

    // Crear nuevo registro
    const { data, error } = await supabase
      .from('lista_chequeo_registros')
      .insert({
        dependencia: area_id,
        categoria_id,
        numero_contrato,
        contratista,
        valor_contrato: valor_contrato || 0,
        objeto: objeto || ''
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear registro:', error)
      return NextResponse.json(
        { error: 'Error al crear el registro de contrato' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID del registro' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from('lista_chequeo_registros')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar registro:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el registro' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID del registro' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { error } = await supabase
      .from('lista_chequeo_registros')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error al eliminar registro:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el registro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Registro eliminado exitosamente' })
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
