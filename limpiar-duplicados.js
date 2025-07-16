require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔗 Conectando a Supabase...')
console.log('URL:', supabaseUrl ? 'configurada' : 'NO configurada')
console.log('Key:', supabaseKey ? 'configurada' : 'NO configurada')

const supabase = createClient(supabaseUrl, supabaseKey)

async function limpiarDuplicados() {
  try {
    console.log('🧹 Iniciando limpieza de duplicados...')
    
    // 1. Primero verificar duplicados
    const { data: duplicados, error: errorDuplicados } = await supabase
      .rpc('verificar_duplicados', {})
    
    if (errorDuplicados) {
      console.log('⚠️  No existe función RPC, verificando manualmente...')
      
      // Obtener todos los items
      const { data: items, error } = await supabase
        .from('lista_chequeo_items_maestros')
        .select('id, titulo, categoria_id, etapa_id')
        .order('id')
      
      if (error) {
        console.error('❌ Error al obtener items:', error)
        return
      }
      
      console.log(`📊 Total de items encontrados: ${items.length}`)
      
      // Agrupar por título, categoría y etapa
      const grupos = {}
      items.forEach(item => {
        const key = `${item.titulo}_${item.categoria_id}_${item.etapa_id}`
        if (!grupos[key]) {
          grupos[key] = []
        }
        grupos[key].push(item)
      })
      
      // Encontrar duplicados
      const duplicadosEncontrados = []
      Object.values(grupos).forEach(grupo => {
        if (grupo.length > 1) {
          // Mantener el primero, marcar el resto como duplicados
          grupo.slice(1).forEach(item => {
            duplicadosEncontrados.push(item.id)
          })
        }
      })
      
      console.log(`🔍 Duplicados encontrados: ${duplicadosEncontrados.length}`)
      
      if (duplicadosEncontrados.length > 0) {
        // Eliminar duplicados
        const { error: errorEliminar } = await supabase
          .from('lista_chequeo_items_maestros')
          .delete()
          .in('id', duplicadosEncontrados)
        
        if (errorEliminar) {
          console.error('❌ Error al eliminar duplicados:', errorEliminar)
          return
        }
        
        console.log(`✅ ${duplicadosEncontrados.length} duplicados eliminados`)
      } else {
        console.log('✅ No se encontraron duplicados')
      }
    }
    
    // 2. Verificar resultado final
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
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error)
  }
}

limpiarDuplicados()
