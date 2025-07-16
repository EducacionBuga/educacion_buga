const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Iniciando migración de base de datos...')
console.log('🌐 URL:', supabaseUrl)
console.log('🔑 Service Key:', supabaseServiceKey ? 'Presente' : 'Faltante')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateDatabase() {
  try {
    // 1. Verificar estructura actual
    console.log('🔍 Verificando estructura actual de la tabla...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'lista_chequeo_registros')
    
    if (columnsError) {
      console.error('❌ Error al verificar columnas:', columnsError)
      return
    }
    
    console.log('📋 Columnas actuales:', columns.map(c => c.column_name))
    
    // 2. Agregar columnas faltantes
    const requiredColumns = [
      { name: 'contrato', type: 'VARCHAR(255)', defaultValue: "'Sin contrato'" },
      { name: 'contratista', type: 'VARCHAR(255)', defaultValue: "'Sin contratista'" },
      { name: 'valor', type: 'DECIMAL(15,2)', defaultValue: '0' },
      { name: 'objeto', type: 'TEXT', defaultValue: "'Sin descripción'" },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'NOW()' }
    ]
    
    const existingColumns = columns.map(c => c.column_name)
    
    for (const col of requiredColumns) {
      if (!existingColumns.includes(col.name)) {
        console.log(`➕ Agregando columna ${col.name}...`)
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE lista_chequeo_registros ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.defaultValue};`
        })
        
        if (error) {
          console.error(`❌ Error al agregar ${col.name}:`, error)
        } else {
          console.log(`✅ Columna ${col.name} agregada`)
        }
      } else {
        console.log(`⚪ Columna ${col.name} ya existe`)
      }
    }
    
    // 3. Actualizar registros existentes con valores por defecto
    console.log('🔄 Actualizando registros existentes...')
    
    const { data: registros, error: registrosError } = await supabase
      .from('lista_chequeo_registros')
      .select('id, contrato, contratista')
      .limit(5)
    
    if (registrosError) {
      console.error('❌ Error al obtener registros:', registrosError)
    } else {
      console.log('📊 Primeros 5 registros:', registros)
    }
    
    console.log('✅ Migración completada')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  }
}

migrateDatabase()
