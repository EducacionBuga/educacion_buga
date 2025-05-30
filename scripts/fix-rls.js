const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

async function fixRLSPolicies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('🔧 Iniciando corrección de políticas RLS...')
  console.log('URL:', supabaseUrl)
  console.log('Key configurada:', !!supabaseKey)

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno faltantes')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('📊 Verificando políticas existentes en plan_accion...')
    
    // Verificar políticas existentes
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
          FROM pg_policies 
          WHERE tablename = 'plan_accion';
        `
      })

    if (policiesError) {
      console.log('ℹ️ No se pudieron verificar políticas existentes (puede ser normal)')
    } else {
      console.log('📋 Políticas existentes:', policies)
    }

    console.log('🗑️ Eliminando políticas existentes...')
    
    // Eliminar políticas existentes de plan_accion
    const dropCommands = [
      'DROP POLICY IF EXISTS "plan_accion_select_policy" ON plan_accion;',
      'DROP POLICY IF EXISTS "plan_accion_insert_policy" ON plan_accion;',
      'DROP POLICY IF EXISTS "plan_accion_update_policy" ON plan_accion;',
      'DROP POLICY IF EXISTS "plan_accion_delete_policy" ON plan_accion;'
    ]

    for (const command of dropCommands) {
      const { error } = await supabase.rpc('exec_sql', { sql: command })
      if (error) {
        console.log(`ℹ️ ${command} - ${error.message}`)
      } else {
        console.log(`✅ ${command}`)
      }
    }

    console.log('📝 Creando nuevas políticas permisivas...')
    
    // Crear nuevas políticas más permisivas
    const createCommands = [
      `CREATE POLICY "plan_accion_select_policy" ON plan_accion
        FOR SELECT TO authenticated USING (true);`,
      
      `CREATE POLICY "plan_accion_insert_policy" ON plan_accion
        FOR INSERT TO authenticated WITH CHECK (true);`,
      
      `CREATE POLICY "plan_accion_update_policy" ON plan_accion
        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,
      
      `CREATE POLICY "plan_accion_delete_policy" ON plan_accion
        FOR DELETE TO authenticated USING (true);`
    ]

    for (const command of createCommands) {
      const { error } = await supabase.rpc('exec_sql', { sql: command })
      if (error) {
        console.error(`❌ Error creando política: ${error.message}`)
      } else {
        console.log(`✅ Política creada exitosamente`)
      }
    }

    console.log('🔒 Habilitando RLS en plan_accion...')
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE plan_accion ENABLE ROW LEVEL SECURITY;' 
    })
    
    if (rlsError) {
      console.log('ℹ️ RLS ya estaba habilitado o error:', rlsError.message)
    } else {
      console.log('✅ RLS habilitado en plan_accion')
    }

    console.log('👥 Verificando políticas de usuarios...')
    
    // Política simple para usuarios
    const userCommands = [
      'DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;',
      'DROP POLICY IF EXISTS "usuarios_insert_policy" ON usuarios;',
      'DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;',
      `CREATE POLICY "usuarios_select_policy" ON usuarios
        FOR SELECT TO authenticated USING (true);`,
      `CREATE POLICY "usuarios_insert_policy" ON usuarios
        FOR INSERT TO authenticated WITH CHECK (true);`,
      `CREATE POLICY "usuarios_update_policy" ON usuarios
        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,
      'ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;'
    ]

    for (const command of userCommands) {
      const { error } = await supabase.rpc('exec_sql', { sql: command })
      if (error) {
        console.log(`ℹ️ ${command.substring(0, 50)}... - ${error.message}`)
      } else {
        console.log(`✅ Comando ejecutado`)
      }
    }

    console.log('🧪 Probando inserción en plan_accion...')
    
    // Probar inserción
    const testData = {
      nombre_plan: 'Test Plan ' + Date.now(),
      objetivo_general: 'Objetivo de prueba',
      estado: 'BORRADOR',
      fecha_creacion: new Date().toISOString(),
      institucion_educativa: 'IE Test'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('plan_accion')
      .insert(testData)
      .select()

    if (insertError) {
      console.error('❌ Error en prueba de inserción:', insertError)
    } else {
      console.log('✅ Prueba de inserción exitosa:', insertData)
      
      // Limpiar el registro de prueba
      if (insertData && insertData[0]) {
        await supabase
          .from('plan_accion')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🧹 Registro de prueba eliminado')
      }
    }

    console.log('✅ Corrección de políticas RLS completada')

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

fixRLSPolicies()
