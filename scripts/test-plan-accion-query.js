// Script para probar la consulta de plan_accion con campos docenal
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Faltan credenciales de Supabase en .env.local')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'FALTA')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'OK' : 'FALTA')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
  console.log('🔍 Iniciando prueba de consulta a plan_accion...\n')

  // 1. Buscar el área "Calidad Educativa"
  console.log('📋 PASO 1: Buscando área "Calidad Educativa"')
  const { data: areas, error: areaError } = await supabase
    .from('areas')
    .select('id, nombre, codigo')
    .ilike('nombre', '%Calidad Educativa%')

  if (areaError) {
    console.error('❌ Error al buscar área:', areaError)
    process.exit(1)
  }

  console.log('✅ Áreas encontradas:', areas)

  if (!areas || areas.length === 0) {
    console.error('❌ No se encontró el área "Calidad Educativa"')
    process.exit(1)
  }

  const areaId = areas[0].id
  console.log(`\n✅ Área encontrada: ${areas[0].nombre} (ID: ${areaId})\n`)

  // 2. Consultar plan_accion con TODOS los campos incluyendo docenal
  console.log('📋 PASO 2: Consultando plan_accion con campos docenal')
  const { data: items, error: itemsError } = await supabase
    .from('plan_accion')
    .select(`
      *,
      meta_docenal,
      macroobjetivo_docenal,
      objetivo_docenal,
      programa_pdm,
      subprograma_pdm,
      proyecto_pdm,
      grupo_etareo,
      grupo_poblacion,
      zona,
      grupo_etnico,
      cantidad
    `)
    .eq('area_id', areaId)
    .order('created_at', { ascending: false })
    .limit(3)

  if (itemsError) {
    console.error('❌ Error al consultar plan_accion:', itemsError)
    process.exit(1)
  }

  console.log(`✅ Se encontraron ${items?.length || 0} registros\n`)

  if (items && items.length > 0) {
    items.forEach((item, index) => {
      console.log(`\n📝 REGISTRO ${index + 1}:`)
      console.log('━'.repeat(80))
      console.log('🆔 ID:', item.id)
      console.log('📌 Programa:', item.programa)
      console.log('🎯 Meta:', item.meta)
      console.log('')
      console.log('🎯 PLAN DECENAL:')
      console.log('  ├─ meta_docenal:', item.meta_docenal || '❌ NULL')
      console.log('  ├─ macroobjetivo_docenal:', item.macroobjetivo_docenal || '❌ NULL')
      console.log('  └─ objetivo_docenal:', item.objetivo_docenal || '❌ NULL')
      console.log('')
      console.log('📊 PDM 2024-2027:')
      console.log('  ├─ programa_pdm:', item.programa_pdm || '❌ NULL')
      console.log('  ├─ subprograma_pdm:', item.subprograma_pdm || '❌ NULL')
      console.log('  └─ proyecto_pdm:', item.proyecto_pdm || '❌ NULL')
      console.log('')
      console.log('👥 DEMOGRÁFICA:')
      console.log('  ├─ zona:', item.zona || '❌ NULL')
      console.log('  ├─ grupo_etnico:', item.grupo_etnico || '❌ NULL')
      console.log('  ├─ grupo_etareo:', item.grupo_etareo || '❌ NULL')
      console.log('  ├─ grupo_poblacion:', item.grupo_poblacion || '❌ NULL')
      console.log('  └─ cantidad:', item.cantidad || '❌ NULL')
      console.log('━'.repeat(80))
    })
  } else {
    console.log('⚠️ No hay registros en plan_accion para esta área')
  }

  console.log('\n✅ Prueba completada')
}

// Ejecutar la función
testQuery().catch(console.error)
