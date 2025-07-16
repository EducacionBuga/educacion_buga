// Script para limpiar datos de prueba PDM
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zfulmordjpxceyubvceb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmdWxtb3JkanB4Y2V5dWJ2Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNTIyMTMsImV4cCI6MjA2MjkyODIxM30.ldcVI2M4c-0Zt5oAGnjF53RH2NezFL0wuR6ShCDM8w8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupTestData() {
  try {
    // Eliminar registros de prueba
    const { data, error } = await supabase
      .from('plan_accion')
      .delete()
      .like('programa', '%Programa de Prueba%')
      .select();

    if (error) {
      console.error('❌ Error eliminando datos de prueba:', error);
      return;
    }

    console.log(`✅ Eliminados ${data?.length || 0} registros de prueba`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanupTestData().then(() => process.exit(0));
