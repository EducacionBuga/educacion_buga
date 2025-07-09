import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  console.log('🔧 Save API called - using admin client v2')
  try {
    const { areaId, items } = await request.json()

    if (!areaId || !items) {
      return NextResponse.json(
        { error: 'Area ID and items are required' },
        { status: 400 }
      )
    }

    // Usar cliente admin de Supabase (no requiere autenticación del usuario)
    const supabase = createAdminClient()
    
    // Para esta implementación, permitiremos NULL en usuario_id ya que no hay autenticación
    // En un escenario con autenticación, aquí obtendríamos el userId del token JWT o session
    const userId = null // Permitir NULL por ahora

    console.log('Guardando datos para área:', areaId, 'Items:', items.length)
    console.log('Estructura del primer item:', JSON.stringify(items[0], null, 2))

    // Guardar cada respuesta en Supabase
    for (const item of items) {
      let respuesta = null
      if (item.si) respuesta = "SI"
      else if (item.no) respuesta = "NO"
      else if (item.noAplica) respuesta = "NO_APLICA"

      console.log(`Item ${item.id}: respuesta = ${respuesta}, observaciones = "${item.observaciones}"`)

      // Si no hay respuesta, continuamos con el siguiente ítem
      if (!respuesta) {
        console.log(`Saltando item ${item.id} - sin respuesta`)
        continue
      }

      // Verificar si ya existe una respuesta para este ítem y área
      const { data: existingResponse, error: checkError } = await supabase
        .from("lista_chequeo_respuestas")
        .select("id")
        .eq("area_id", areaId)
        .eq("item_id", item.id)
        .maybeSingle()

      if (checkError) {
        console.error("Error al verificar respuesta existente:", checkError)
        return NextResponse.json(
          { error: 'Error checking existing responses' },
          { status: 500 }
        )
      }

      if (existingResponse) {
        // Actualizar respuesta existente
        console.log(`Actualizando respuesta existente ID: ${existingResponse.id}`)
        const updateData = {
          respuesta: respuesta,
          observaciones: item.observaciones || '',
          usuario_id: userId,
          updated_at: new Date().toISOString(),
        }
        console.log('Datos de actualización:', JSON.stringify(updateData, null, 2))
        
        const { error: updateError } = await supabase
          .from("lista_chequeo_respuestas")
          .update(updateData)
          .eq("id", existingResponse.id)

        if (updateError) {
          console.error("Error detallado al actualizar respuesta:", {
            error: updateError,
            existingResponseId: existingResponse.id,
            updateData: updateData,
            itemId: item.id,
            areaId: areaId
          })
          return NextResponse.json(
            { error: 'Error updating response', details: updateError.message },
            { status: 500 }
          )
        } else {
          console.log(`✅ Respuesta actualizada exitosamente para item ${item.id}`)
        }
      } else {
        // Crear nueva respuesta
        console.log(`Creando nueva respuesta para item ${item.id}`)
        const insertData = {
          id: uuidv4(),
          area_id: areaId,
          item_id: item.id,
          respuesta: respuesta,
          observaciones: item.observaciones || '',
          usuario_id: userId,
        }
        console.log('Datos de inserción:', JSON.stringify(insertData, null, 2))
        
        const { error: insertError } = await supabase
          .from("lista_chequeo_respuestas")
          .insert(insertData)

        if (insertError) {
          console.error("Error detallado al insertar respuesta:", {
            error: insertError,
            insertData: insertData,
            itemId: item.id,
            areaId: areaId
          })
          return NextResponse.json(
            { error: 'Error inserting response', details: insertError.message },
            { status: 500 }
          )
        } else {
          console.log(`✅ Respuesta creada exitosamente para item ${item.id}`)
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in save-data API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
