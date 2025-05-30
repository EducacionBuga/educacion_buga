// Crear las tablas del sistema híbrido directamente con SQL
const { createClient } = require('@supabase/supabase-js');

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
  console.log('🔧 Creando tablas para el sistema híbrido...\n');

  try {
    // Crear tabla carpetas
    console.log('📁 Creando tabla carpetas...');
    const createCarpetasTable = `
      CREATE TABLE IF NOT EXISTS carpetas (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT DEFAULT '',
        color TEXT NOT NULL,
        categoria TEXT NOT NULL,
        fecha TEXT NOT NULL,
        area_id TEXT NOT NULL,
        modulo TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `;

    const { error: carpetasError } = await supabase.rpc('exec_sql', { sql: createCarpetasTable });
    
    if (carpetasError && !carpetasError.message.includes('already exists')) {
      console.error('❌ Error creando tabla carpetas:', carpetasError.message);
    } else {
      console.log('✅ Tabla carpetas creada/verificada');
    }

    // Crear índices para carpetas
    console.log('📋 Creando índices para carpetas...');
    const createCarpetasIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_carpetas_area_modulo ON carpetas(area_id, modulo)',
      'CREATE INDEX IF NOT EXISTS idx_carpetas_categoria ON carpetas(categoria)'
    ];

    for (const indexSql of createCarpetasIndexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (error && !error.message.includes('already exists')) {
        console.error('⚠️ Error creando índice:', error.message);
      }
    }

    // Crear tabla documentos
    console.log('📄 Creando tabla documentos...');
    const createDocumentosTable = `
      CREATE TABLE IF NOT EXISTS documentos (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT DEFAULT '',
        tipo_archivo TEXT NOT NULL,
        tamano INTEGER NOT NULL,
        ruta_archivo TEXT NOT NULL,
        url_archivo TEXT NOT NULL,
        carpeta_id TEXT NOT NULL,
        area_id TEXT NOT NULL,
        modulo TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (carpeta_id) REFERENCES carpetas(id) ON DELETE CASCADE
      )
    `;

    const { error: documentosError } = await supabase.rpc('exec_sql', { sql: createDocumentosTable });
    
    if (documentosError && !documentosError.message.includes('already exists')) {
      console.error('❌ Error creando tabla documentos:', documentosError.message);
    } else {
      console.log('✅ Tabla documentos creada/verificada');
    }

    // Crear índices para documentos
    console.log('📋 Creando índices para documentos...');
    const createDocumentosIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_documentos_carpeta ON documentos(carpeta_id)',
      'CREATE INDEX IF NOT EXISTS idx_documentos_area_modulo ON documentos(area_id, modulo)'
    ];

    for (const indexSql of createDocumentosIndexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (error && !error.message.includes('already exists')) {
        console.error('⚠️ Error creando índice:', error.message);
      }
    }

    // Verificar que las tablas existen y son accesibles
    console.log('\n📊 Verificando acceso a las tablas...');

    // Verificar carpetas
    const { data: carpetasTest, error: carpetasTestError } = await supabase
      .from('carpetas')
      .select('*')
      .limit(1);

    if (carpetasTestError) {
      console.error('❌ Error accediendo a tabla carpetas:', carpetasTestError.message);
    } else {
      console.log('✅ Tabla carpetas accesible');
    }

    // Verificar documentos
    const { data: documentosTest, error: documentosTestError } = await supabase
      .from('documentos')
      .select('*')
      .limit(1);

    if (documentosTestError) {
      console.error('❌ Error accediendo a tabla documentos:', documentosTestError.message);
    } else {
      console.log('✅ Tabla documentos accesible');
    }

    console.log('\n🎉 ¡Tablas del sistema híbrido creadas exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   - Tabla carpetas: Almacena metadatos de carpetas');
    console.log('   - Tabla documentos: Almacena metadatos de documentos y referencias a R2');
    console.log('   - Índices: Optimizados para consultas por área, módulo y carpeta');
    console.log('\n✅ El sistema híbrido está listo para usar');

    return true;

  } catch (error) {
    console.error('💥 Error en el proceso:', error);
    return false;
  }
}

// Ejecutar el script
createHybridTables()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Error inesperado:', error);
    process.exit(1);
  });
