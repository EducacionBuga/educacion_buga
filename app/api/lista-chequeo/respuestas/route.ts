import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaId = searchParams.get('area_id')
    const categoriaId = searchParams.get('categoria_id')
    const registroId = searchParams.get('registro_id')

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    let query = supabase
      .from('lista_chequeo_respuestas')
      .select('*')

    // Si se proporciona registro_id, filtrar solo por él (más específico)
    if (registroId) {
      query = query.eq('registro_id', registroId)
    } else if (areaId && categoriaId) {
      // Fallback para compatibilidad con la lógica anterior
      // Buscar respuestas a través de la relación con registros
      query = query.eq('area_id', areaId).eq('categoria_id', categoriaId)
    } else {
      return NextResponse.json(
        { error: 'Se requiere registro_id o (area_id y categoria_id)' },
        { status: 400 }
      )
    }

    const { data: respuestas, error } = await query

    if (error) {
      console.error('Error al obtener respuestas:', error)
      return NextResponse.json(
        { error: 'Error al obtener las respuestas de lista de chequeo' },
        { status: 500 }
      )
    }

    return NextResponse.json(respuestas || [])
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
    const { area_id, categoria_id, registro_id, item_id, respuesta, observaciones } = body

    if (!area_id || !categoria_id || !item_id) {
      return NextResponse.json(
        { error: 'Se requieren area_id, categoria_id e item_id' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Verificar si ya existe una respuesta
    let query = supabase
      .from('lista_chequeo_respuestas')
      .select('id')
      .eq('area_id', area_id)
      .eq('categoria_id', categoria_id)
      .eq('item_id', item_id)

    if (registro_id) {
      query = query.eq('registro_id', registro_id)
    }

    const { data: existing, error: checkError } = await query.single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error al verificar respuesta existente:', checkError)
      return NextResponse.json(
        { error: 'Error al verificar respuesta existente' },
        { status: 500 }
      )
    }

    let result

    if (existing) {
      // Actualizar respuesta existente
      const { data, error } = await supabase
        .from('lista_chequeo_respuestas')
        .update({
          respuesta,
          observaciones,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error al actualizar respuesta:', error)
        return NextResponse.json(
          { error: 'Error al actualizar la respuesta' },
          { status: 500 }
        )
      }

      result = data
    } else {
      // Crear nueva respuesta
      const insertData: any = {
        area_id,
        categoria_id,
        item_id,
        respuesta,
        observaciones
      }

      if (registro_id) {
        insertData.registro_id = registro_id
      }

      const { data, error } = await supabase
        .from('lista_chequeo_respuestas')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error al crear respuesta:', error)
        return NextResponse.json(
          { error: 'Error al crear la respuesta' },
          { status: 500 }
        )
      }

      result = data
    }

    return NextResponse.json(result)
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
    const { respuestas } = body // Array de respuestas para guardar en lote

    if (!respuestas || !Array.isArray(respuestas)) {
      return NextResponse.json(
        { error: 'Se requiere un array de respuestas' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Procesar cada respuesta
    const resultados = []

    for (const respuestaData of respuestas) {
      const { registro_id, item_id, respuesta, observaciones } = respuestaData

      if (!registro_id || !item_id) {
        continue // Saltar respuestas incompletas
      }

      // Verificar si ya existe una respuesta para este registro e item
      const { data: existing, error: checkError } = await supabase
        .from('lista_chequeo_respuestas')
        .select('id')
        .eq('registro_id', registro_id)
        .eq('item_id', item_id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error al verificar respuesta:', checkError)
        continue
      }

      if (existing) {
        // Actualizar respuesta existente
        const { data, error } = await supabase
          .from('lista_chequeo_respuestas')
          .update({
            respuesta,
            observaciones,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (!error && data) {
          resultados.push(data)
        } else {
          console.error('Error al actualizar respuesta:', error)
        }
      } else {
        // Crear nueva respuesta
        const { data, error } = await supabase
          .from('lista_chequeo_respuestas')
          .insert({
            registro_id,
            item_id,
            respuesta,
            observaciones
          })
          .select()
          .single()

        if (!error && data) {
          resultados.push(data)
        } else {
          console.error('Error al crear respuesta:', error)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      resultados,
      count: resultados.length 
    })
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
