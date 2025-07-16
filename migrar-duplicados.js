require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrarYLimpiarDuplicados() {
  try {
    console.log('🧹 Iniciando migración y limpieza de duplicados...')
    
    // 1. Obtener todos los items
    const { data: items, error } = await supabase
      .from('lista_chequeo_items_maestros')
      .select('id, titulo, categoria_id, etapa_id, numero_item')
      .order('id')
    
    if (error) {
      console.error('❌ Error al obtener items:', error)
      return
    }
    
    console.log(`📊 Total de items encontrados: ${items.length}`)
    
    // 2. Agrupar por título, categoría y etapa
    const grupos = {}
    items.forEach(item => {
      const key = `${item.titulo}_${item.categoria_id}_${item.etapa_id}`
      if (!grupos[key]) {
        grupos[key] = []
      }
      grupos[key].push(item)
    })
    
    // 3. Identificar duplicados y crear mapeo
    const migracionMap = {}
    const duplicadosParaEliminar = []
    
    Object.values(grupos).forEach(grupo => {
      if (grupo.length > 1) {
        // Mantener el item con ID más bajo
        const itemOriginal = grupo.reduce((min, item) => item.id < min.id ? item : min)
        
        grupo.forEach(item => {
          if (item.id !== itemOriginal.id) {
            migracionMap[item.id] = itemOriginal.id
            duplicadosParaEliminar.push(item.id)
          }
        })
      }
    })
    
    console.log(`🔍 Duplicados encontrados: ${duplicadosParaEliminar.length}`)
    console.log(`🔄 Migraciones necesarias: ${Object.keys(migracionMap).length}`)
    
    if (Object.keys(migracionMap).length === 0) {
      console.log('✅ No hay duplicados para migrar')
      return
    }
    
    // 4. Verificar respuestas que referencian items duplicados
    const { data: respuestasAfectadas, error: errorRespuestas } = await supabase
      .from('lista_chequeo_respuestas')
      .select('id, item_id, registro_id, respuesta, observaciones')
      .in('item_id', duplicadosParaEliminar)
    
    if (errorRespuestas) {
      console.error('❌ Error al obtener respuestas afectadas:', errorRespuestas)
      return
    }
    
    console.log(`📝 Respuestas que necesitan migración: ${respuestasAfectadas.length}`)
    
    // 5. Migrar respuestas a items originales
    if (respuestasAfectadas.length > 0) {
      console.log('🔄 Migrando respuestas...')
      
      for (const respuesta of respuestasAfectadas) {
        const nuevoItemId = migracionMap[respuesta.item_id]
        
        // Verificar si ya existe una respuesta para el item original
        const { data: respuestaExistente, error: errorVerificar } = await supabase
          .from('lista_chequeo_respuestas')
          .select('id')
          .eq('registro_id', respuesta.registro_id)
          .eq('item_id', nuevoItemId)
          .single()
        
        if (errorVerificar && errorVerificar.code !== 'PGRST116') {
          console.error('❌ Error al verificar respuesta existente:', errorVerificar)
          continue
        }
        
        if (respuestaExistente) {
          // Ya existe respuesta para el item original, eliminar la duplicada
          const { error: errorEliminar } = await supabase
            .from('lista_chequeo_respuestas')
            .delete()
            .eq('id', respuesta.id)
          
          if (errorEliminar) {
            console.error(`❌ Error al eliminar respuesta duplicada ${respuesta.id}:`, errorEliminar)
          } else {
            console.log(`🗑️  Respuesta duplicada eliminada: ${respuesta.id}`)
          }
        } else {
          // Migrar respuesta al item original
          const { error: errorMigrar } = await supabase
            .from('lista_chequeo_respuestas')
            .update({ item_id: nuevoItemId })
            .eq('id', respuesta.id)
          
          if (errorMigrar) {
            console.error(`❌ Error al migrar respuesta ${respuesta.id}:`, errorMigrar)
          } else {
            console.log(`✅ Respuesta migrada: ${respuesta.id} -> item ${nuevoItemId}`)
          }
        }
      }
    }
    
    // 6. Eliminar items duplicados
    console.log('🗑️  Eliminando items duplicados...')
    const { error: errorEliminarItems } = await supabase
      .from('lista_chequeo_items_maestros')
      .delete()
      .in('id', duplicadosParaEliminar)
    
    if (errorEliminarItems) {
      console.error('❌ Error al eliminar items duplicados:', errorEliminarItems)
      return
    }
    
    console.log(`✅ ${duplicadosParaEliminar.length} items duplicados eliminados`)
    
    // 7. Verificar resultado final
    const { data: itemsFinales, error: errorFinal } = await supabase
      .from('lista_chequeo_items_maestros')
      .select(`
        id,
        titulo,
        lista_chequeo_categorias(nombre),
        lista_chequeo_etapas(nombre)
      `)
    
    if (errorFinal) {
      console.error('❌ Error al verificar resultado final:', errorFinal)
      return
    }
    
    // Agrupar por categoría y etapa
    const resumen = {}
    itemsFinales.forEach(item => {
      const categoria = item.lista_chequeo_categorias.nombre
      const etapa = item.lista_chequeo_etapas.nombre
      const key = `${categoria} - ${etapa}`
      
      if (!resumen[key]) {
        resumen[key] = 0
      }
      resumen[key]++
    })
    
    console.log('\n📋 Resumen final de items:')
    Object.entries(resumen).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} items`)
    })
    
    console.log(`\n🎯 Total final: ${itemsFinales.length} items`)
    console.log('✅ Migración y limpieza completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error en migración:', error)
  }
}

migrarYLimpiarDuplicados()
