const { createClient } = require('@supabase/supabase-js');

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

async function createTable() {
  try {
    console.log('🔧 Creating plan_accion_adjuntos table...');
    
    // First check if table exists
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'plan_accion_adjuntos');
      
    if (checkError) {
      console.log('⚠️ Could not check existing tables:', checkError.message);
    }
    
    if (existingTables && existingTables.length > 0) {
      console.log('✅ Table plan_accion_adjuntos already exists');
      return;
    }
    
    // Create table using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.plan_accion_adjuntos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          tipo_archivo VARCHAR(100) NOT NULL,
          tamano BIGINT NOT NULL,
          ruta_archivo TEXT NOT NULL,
          url_publica TEXT NOT NULL,
          actividad_id VARCHAR(255) NOT NULL,
          area_id UUID NOT NULL,
          estado VARCHAR(50) DEFAULT 'activo',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('❌ Error creating table:', error);
      // Try a simpler test
      console.log('🔄 Testing table access...');
      const { data: testData, error: testError } = await supabase
        .from('plan_accion_adjuntos')
        .select('*')
        .limit(1);
        
      if (testError) {
        console.log('❌ Table access test failed:', testError.message);
        console.log('📝 Please create the table manually in Supabase dashboard');
      } else {
        console.log('✅ Table exists and is accessible');
      }
    } else {
      console.log('✅ Table created successfully');
      
      // Set up RLS policies
      const rlsSQL = `
        ALTER TABLE public.plan_accion_adjuntos ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "plan_accion_adjuntos_select_policy" ON public.plan_accion_adjuntos
            FOR SELECT USING (true);
            
        CREATE POLICY IF NOT EXISTS "plan_accion_adjuntos_insert_policy" ON public.plan_accion_adjuntos
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY IF NOT EXISTS "plan_accion_adjuntos_update_policy" ON public.plan_accion_adjuntos
            FOR UPDATE USING (true) WITH CHECK (true);
            
        CREATE POLICY IF NOT EXISTS "plan_accion_adjuntos_delete_policy" ON public.plan_accion_adjuntos
            FOR DELETE USING (true);
      `;
      
      const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
      if (rlsError) {
        console.log('⚠️ Could not set RLS policies:', rlsError.message);
      } else {
        console.log('✅ RLS policies created');
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

createTable();
