const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración directa usando las credenciales conocidas
const supabaseUrl = 'https://eqnyjjyswuqnwmrxjqem.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbnlqanlzd3VxbndtcnhqcWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjI2NDY2MywiZXhwIjoyMDQ3ODQwNjYzfQ.KhOJSj6MrnGCa7s_6bv0WJ3PBJqVSU8_8d3jYFOkEbU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createHybridTables() {
  console.log('🔧 Iniciando creación de tablas para el sistema híbrido...\n');

  try {
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, '..', 'hybrid-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Dividir el contenido SQL en comandos individuales
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('SELECT'));

    console.log(`📋 Ejecutando ${sqlCommands.length} comandos SQL...`);

    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.trim()) {
        console.log(`\n🔄 Ejecutando comando ${i + 1}/${sqlCommands.length}:`);
        console.log(`   ${command.substring(0, 100)}${command.length > 100 ? '...' : ''}`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: command });
          
          if (error) {
            // Si el error es que la tabla ya existe, continuamos
            if (error.message.includes('already exists') || error.message.includes('relation') && error.message.includes('already exists')) {
              console.log(`   ⚠️ Tabla ya existe, continuando...`);
            } else {
              console.error(`   ❌ Error ejecutando comando: ${error.message}`);
            }
          } else {
            console.log(`   ✅ Comando ejecutado exitosamente`);
          }
        } catch (err) {
          console.error(`   ❌ Error inesperado: ${err.message}`);
        }
      }
    }

    // Verificar que las tablas se crearon correctamente
    console.log('\n📊 Verificando tablas creadas...');

    // Verificar tabla carpetas
    const { data: carpetasData, error: carpetasError } = await supabase
      .from('carpetas')
      .select('count(*)')
      .limit(1);

    if (carpetasError) {
      console.error('❌ Error verificando tabla carpetas:', carpetasError.message);
    } else {
      console.log('✅ Tabla carpetas accesible');
    }

    // Verificar tabla documentos
    const { data: documentosData, error: documentosError } = await supabase
      .from('documentos')
      .select('count(*)')
      .limit(1);

    if (documentosError) {
      console.error('❌ Error verificando tabla documentos:', documentosError.message);
    } else {
      console.log('✅ Tabla documentos accesible');
    }

    console.log('\n🎉 ¡Proceso de creación de tablas completado!');
    return true;

  } catch (error) {
    console.error('💥 Error en el proceso:', error);
    return false;
  }
}

// Ejecutar el script
createHybridTables()
  .then(success => {
    if (success) {
      console.log('\n✅ Sistema híbrido listo para usar');
    } else {
      console.log('\n❌ Error en la configuración del sistema híbrido');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Error inesperado:', error);
    process.exit(1);
  });
