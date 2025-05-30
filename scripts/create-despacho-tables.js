const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDespachoTables() {
  console.log('🔧 Creating Despacho area tables...');
  
  try {
    // Crear tabla informes_ejecucion
    console.log('📋 Creating informes_ejecucion table...');
    const { error: informesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS informes_ejecucion (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          file_url TEXT,
          file_type TEXT,
          file_size BIGINT NOT NULL,
          file_path TEXT,
          area_id UUID NOT NULL REFERENCES areas(id),
          date DATE NOT NULL,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (informesError) {
      console.error('❌ Error creating informes_ejecucion:', informesError.message);
    } else {
      console.log('✅ informes_ejecucion table created successfully');
    }

    // Crear tabla registros_fotograficos
    console.log('📸 Creating registros_fotograficos table...');
    const { error: registrosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS registros_fotograficos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          file_url TEXT,
          file_type TEXT,
          file_size BIGINT NOT NULL,
          file_path TEXT,
          thumbnail_url TEXT,
          area_id UUID NOT NULL REFERENCES areas(id),
          date DATE NOT NULL,
          location TEXT,
          tags TEXT[],
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (registrosError) {
      console.error('❌ Error creating registros_fotograficos:', registrosError.message);
    } else {
      console.log('✅ registros_fotograficos table created successfully');
    }

    // Crear índices
    console.log('🔍 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_informes_area ON informes_ejecucion(area_id);',
      'CREATE INDEX IF NOT EXISTS idx_informes_date ON informes_ejecucion(date);',
      'CREATE INDEX IF NOT EXISTS idx_registros_area ON registros_fotograficos(area_id);',
      'CREATE INDEX IF NOT EXISTS idx_registros_date ON registros_fotograficos(date);'
    ];

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (indexError) {
        console.error(`❌ Error creating index: ${indexError.message}`);
      }
    }

    console.log('✅ Indexes created successfully');

    // Crear función para actualizar updated_at
    console.log('⚙️ Creating update function...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });

    if (functionError) {
      console.error('❌ Error creating function:', functionError.message);
    } else {
      console.log('✅ Update function created successfully');
    }

    // Crear triggers
    console.log('🔄 Creating triggers...');
    const triggers = [
      'CREATE TRIGGER IF NOT EXISTS update_informes_updated_at BEFORE UPDATE ON informes_ejecucion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER IF NOT EXISTS update_registros_updated_at BEFORE UPDATE ON registros_fotograficos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();'
    ];

    for (const triggerSql of triggers) {
      const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSql });
      if (triggerError) {
        console.error(`❌ Error creating trigger: ${triggerError.message}`);
      }
    }

    console.log('✅ Triggers created successfully');

    // Habilitar RLS
    console.log('🔒 Enabling Row Level Security...');
    const rlsCommands = [
      'ALTER TABLE informes_ejecucion ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE registros_fotograficos ENABLE ROW LEVEL SECURITY;'
    ];

    for (const rlsSql of rlsCommands) {
      const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSql });
      if (rlsError) {
        console.error(`❌ Error enabling RLS: ${rlsError.message}`);
      }
    }

    console.log('✅ RLS enabled successfully');

    // Crear políticas RLS
    console.log('🛡️ Creating RLS policies...');
    const policies = [
      // Políticas para informes_ejecucion
      `CREATE POLICY IF NOT EXISTS "informes_select_policy" ON informes_ejecucion
        FOR SELECT TO authenticated, anon USING (true);`,
      
      `CREATE POLICY IF NOT EXISTS "informes_insert_policy" ON informes_ejecucion
        FOR INSERT TO authenticated, anon WITH CHECK (true);`,
      
      `CREATE POLICY IF NOT EXISTS "informes_update_policy" ON informes_ejecucion
        FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);`,
      
      `CREATE POLICY IF NOT EXISTS "informes_delete_policy" ON informes_ejecucion
        FOR DELETE TO authenticated, anon USING (true);`,
        
      `CREATE POLICY IF NOT EXISTS "informes_service_role_policy" ON informes_ejecucion
        FOR ALL TO service_role USING (true) WITH CHECK (true);`,

      // Políticas para registros_fotograficos
      `CREATE POLICY IF NOT EXISTS "registros_select_policy" ON registros_fotograficos
        FOR SELECT TO authenticated, anon USING (true);`,
      
      `CREATE POLICY IF NOT EXISTS "registros_insert_policy" ON registros_fotograficos
        FOR INSERT TO authenticated, anon WITH CHECK (true);`,
      
      `CREATE POLICY IF NOT EXISTS "registros_update_policy" ON registros_fotograficos
        FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);`,
      
      `CREATE POLICY IF NOT EXISTS "registros_delete_policy" ON registros_fotograficos
        FOR DELETE TO authenticated, anon USING (true);`,
        
      `CREATE POLICY IF NOT EXISTS "registros_service_role_policy" ON registros_fotograficos
        FOR ALL TO service_role USING (true) WITH CHECK (true);`
    ];

    for (const policySql of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policySql });
      if (policyError) {
        console.error(`❌ Error creating policy: ${policyError.message}`);
      }
    }

    console.log('✅ RLS policies created successfully');

    // Verificar que las tablas se crearon correctamente
    console.log('🔍 Verifying table creation...');
    
    const { data: informesTest, error: informesTestError } = await supabase
      .from('informes_ejecucion')
      .select('*')
      .limit(1);

    if (informesTestError) {
      console.error('❌ Error accessing informes_ejecucion:', informesTestError.message);
    } else {
      console.log('✅ informes_ejecucion table is accessible');
    }

    const { data: registrosTest, error: registrosTestError } = await supabase
      .from('registros_fotograficos')
      .select('*')
      .limit(1);

    if (registrosTestError) {
      console.error('❌ Error accessing registros_fotograficos:', registrosTestError.message);
    } else {
      console.log('✅ registros_fotograficos table is accessible');
    }

    console.log('🎉 Despacho tables setup completed!');
    console.log('💡 You can now upload documents and photos in the Despacho area');

  } catch (error) {
    console.error('💥 Error in table creation:', error.message);
  }
}

// Ejecutar el script
createDespachoTables();