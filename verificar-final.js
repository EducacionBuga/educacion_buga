require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarResultadoFinal() {
  try {
    console.log('🎯 Verificación final del sistema...')
    
    // 1. Contar items por categoría y etapa
    const { data: items, error } = await supabase
      .from('lista_chequeo_items_maestros')
      .select(`
        id,
        titulo,
        numero_item,
        lista_chequeo_categorias!inner(nombre),
        lista_chequeo_etapas!inner(nombre)
      `)
      .order('numero_item')
    
    if (error) {
      console.error('❌ Error al obtener items:', error)
      return
    }
    
    console.log(`📊 Total de items: ${items.length}`)
    
    // 2. Agrupar por categoría
    const porCategoria = {}
    items.forEach(item => {
      const categoria = item.lista_chequeo_categorias.nombre
      if (!porCategoria[categoria]) {
        porCategoria[categoria] = 0
      }
      porCategoria[categoria]++
    })
    
    console.log('\n📋 Items por tipo de contrato:')
    Object.entries(porCategoria).forEach(([categoria, count]) => {
      console.log(`   ${categoria}: ${count} items`)
    })
    
    // 3. Verificar que no hay duplicados
    const grupos = {}
    items.forEach(item => {
      const key = `${item.titulo}_${item.lista_chequeo_categorias.nombre}_${item.lista_chequeo_etapas.nombre}`
      if (!grupos[key]) {
        grupos[key] = 0
      }
      grupos[key]++
    })
    
    const duplicados = Object.values(grupos).filter(count => count > 1)
    console.log(`\n🔍 Verificación de duplicados: ${duplicados.length === 0 ? '✅ Sin duplicados' : `❌ ${duplicados.length} duplicados encontrados`}`)
    
    // 4. Verificar totales esperados
    const esperados = {
      'SAMC': 51,
      'MINIMA CUANTIA': 51,
      'INTERADMINISTRATIVO': 29,
      'PRESTACION DE SERVICIOS': 51
    }
    
    console.log('\n📊 Comparación con totales esperados:')
    Object.entries(esperados).forEach(([categoria, esperado]) => {
      const actual = porCategoria[categoria] || 0
      const estado = actual === esperado ? '✅' : '❌'
      console.log(`   ${categoria}: ${actual}/${esperado} ${estado}`)
    })
    
    const totalEsperado = Object.values(esperados).reduce((sum, val) => sum + val, 0)
    const totalActual = items.length
    console.log(`\n🎯 Total general: ${totalActual}/${totalEsperado} ${totalActual === totalEsperado ? '✅' : '❌'}`)
    
    if (totalActual === totalEsperado && duplicados.length === 0) {
      console.log('\n🎉 ¡Sistema verificado correctamente!')
      console.log('✅ No hay duplicados')
      console.log('✅ Totales coinciden con lo esperado')
      console.log('✅ El sistema está listo para usar')
    }
    
  } catch (error) {
    console.error('❌ Error en verificación final:', error)
  }
}

verificarResultadoFinal()
