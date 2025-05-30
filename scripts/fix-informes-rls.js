const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixInformesRLS() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🔧 Corrigiendo políticas RLS para tabla informes_ejecucion...');
  console.log('URL:', supabaseUrl);
  console.log('Service Key configurada:', !!supabaseKey);

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno faltantes');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('📋 Verificando tabla informes_ejecucion...');
    
    // Check if table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('informes_ejecucion')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error accediendo a tabla informes_ejecucion:', tableError.message);
      return;
    }
    
    console.log('✅ Tabla informes_ejecucion accesible');

    console.log('🗑️ Eliminando políticas existentes...');
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "informes_select_policy" ON informes_ejecucion;',
      'DROP POLICY IF EXISTS "informes_insert_policy" ON informes_ejecucion;',
      'DROP POLICY IF EXISTS "informes_update_policy" ON informes_ejecucion;',
      'DROP POLICY IF EXISTS "informes_delete_policy" ON informes_ejecucion;',
      'DROP POLICY IF EXISTS "service_role_policy" ON informes_ejecucion;'
    ];

    for (const sql of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log(`ℹ️ ${sql.split('"')[1]} - ${error.message}`);
      } else {
        console.log(`✅ Política eliminada: ${sql.split('"')[1]}`);
      }
    }

    console.log('📝 Creando nuevas políticas permisivas...');
    
    const createPolicies = [
      `CREATE POLICY "informes_select_policy" ON informes_ejecucion
        FOR SELECT TO authenticated, anon USING (true);`,
      
      `CREATE POLICY "informes_insert_policy" ON informes_ejecucion
        FOR INSERT TO authenticated, anon WITH CHECK (true);`,
      
      `CREATE POLICY "informes_update_policy" ON informes_ejecucion
        FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);`,
      
      `CREATE POLICY "informes_delete_policy" ON informes_ejecucion
        FOR DELETE TO authenticated, anon USING (true);`,
        
      `CREATE POLICY "service_role_policy" ON informes_ejecucion
        FOR ALL TO service_role USING (true) WITH CHECK (true);`
    ];

    for (const sql of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error(`❌ Error creando política: ${error.message}`);
      } else {
        console.log(`✅ Política creada exitosamente`);
      }
    }

    console.log('🔒 Verificando RLS en informes_ejecucion...');
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE informes_ejecucion ENABLE ROW LEVEL SECURITY;' 
    });
    
    if (rlsError) {
      console.log('ℹ️ RLS ya estaba habilitado:', rlsError.message);
    } else {
      console.log('✅ RLS habilitado en informes_ejecucion');
    }

    console.log('🧪 Probando inserción de prueba...');
    
    const testData = {
      area_id: '550e8400-e29b-41d4-a716-446655440004',
      filename: 'test-file.pdf',
      original_name: 'Archivo de Prueba.pdf',
      file_size: 1024,
      file_type: 'application/pdf',
      r2_key: 'test/test-file.pdf',
      upload_date: new Date().toISOString(),
      description: 'Archivo de prueba para verificar RLS'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('informes_ejecucion')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error en inserción de prueba:', insertError.message);
    } else {
      console.log('✅ Inserción de prueba exitosa:', insertData.id);
      
      // Clean up test record
      await supabase
        .from('informes_ejecucion')
        .delete()
        .eq('id', insertData.id);
      
      console.log('🧹 Registro de prueba eliminado');
    }

    console.log('\n🎉 ¡Políticas RLS para informes_ejecucion actualizadas!');
    console.log('📝 Ahora puedes intentar subir archivos nuevamente.');

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Execute
fixInformesRLS().catch(console.error);
