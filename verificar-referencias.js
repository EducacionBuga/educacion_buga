require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarReferencias() {
  try {
    console.log('🔍 Verificando referencias pendientes...')
    
    // 1. Obtener items duplicados
    const { data: items, error } = await supabase
      .from('lista_chequeo_items_maestros')
      .select('id, titulo, categoria_id, etapa_id')
      .order('id')
    
    if (error) {
      console.error('❌ Error al obtener items:', error)
      return
    }
    
    // 2. Identificar duplicados
    const grupos = {}
    items.forEach(item => {
      const key = `${item.titulo}_${item.categoria_id}_${item.etapa_id}`
      if (!grupos[key]) {
        grupos[key] = []
      }
      grupos[key].push(item)
    })
    
    const duplicados = []
    Object.values(grupos).forEach(grupo => {
      if (grupo.length > 1) {
        const itemOriginal = grupo.reduce((min, item) => item.id < min.id ? item : min)
        grupo.forEach(item => {
          if (item.id !== itemOriginal.id) {
            duplicados.push(item.id)
          }
        })
      }
    })
    
    console.log(`📊 Items duplicados identificados: ${duplicados.length}`)
    
    // 3. Verificar qué respuestas siguen referenciando duplicados
    if (duplicados.length > 0) {
      const { data: respuestasPendientes, error: errorRespuestas } = await supabase
        .from('lista_chequeo_respuestas')
        .select('id, item_id, registro_id')
        .in('item_id', duplicados)
      
      if (errorRespuestas) {
        console.error('❌ Error al obtener respuestas pendientes:', errorRespuestas)
        return
      }
      
      console.log(`📝 Respuestas que siguen referenciando duplicados: ${respuestasPendientes.length}`)
      
      if (respuestasPendientes.length > 0) {
        console.log('\n🔗 Respuestas pendientes:')
        respuestasPendientes.forEach(resp => {
          console.log(`   ID: ${resp.id}, Item: ${resp.item_id}, Registro: ${resp.registro_id}`)
        })
        
        // Eliminar estas respuestas directamente
        console.log('\n🗑️  Eliminando respuestas huérfanas...')
        const { error: errorEliminar } = await supabase
          .from('lista_chequeo_respuestas')
          .delete()
          .in('id', respuestasPendientes.map(r => r.id))
        
        if (errorEliminar) {
          console.error('❌ Error al eliminar respuestas huérfanas:', errorEliminar)
          return
        }
        
        console.log(`✅ ${respuestasPendientes.length} respuestas huérfanas eliminadas`)
      }
      
      // 4. Ahora intentar eliminar items duplicados
      console.log('🗑️  Eliminando items duplicados...')
      const { error: errorEliminarItems } = await supabase
        .from('lista_chequeo_items_maestros')
        .delete()
        .in('id', duplicados)
      
      if (errorEliminarItems) {
        console.error('❌ Error al eliminar items duplicados:', errorEliminarItems)
        return
      }
      
      console.log(`✅ ${duplicados.length} items duplicados eliminados`)
    }
    
    // 5. Verificar resultado final
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
    
    console.log(`\n🎯 Total final de items: ${itemsFinales.length}`)
    
    // Verificar que no hay más duplicados
    const gruposFinales = {}
    itemsFinales.forEach(item => {
      const key = `${item.titulo}_${item.lista_chequeo_categorias.nombre}_${item.lista_chequeo_etapas.nombre}`
      if (!gruposFinales[key]) {
        gruposFinales[key] = 0
      }
      gruposFinales[key]++
    })
    
    const duplicadosRestantes = Object.values(gruposFinales).filter(count => count > 1).length
    console.log(`🔍 Duplicados restantes: ${duplicadosRestantes}`)
    
    if (duplicadosRestantes === 0) {
      console.log('🎉 ¡Limpieza completada exitosamente! No hay más duplicados.')
    }
    
  } catch (error) {
    console.error('❌ Error en verificación:', error)
  }
}

verificarReferencias()
