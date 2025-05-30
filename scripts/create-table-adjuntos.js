const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createPlanAccionAdjuntosTable() {
  console.log('🔧 Creando tabla plan_accion_adjuntos...')
  
  try {
    const createTableSQL = `
      -- Crear tabla para adjuntos de plan de acción
      CREATE TABLE IF NOT EXISTS public.plan_accion_adjuntos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          tipo_archivo VARCHAR(100) NOT NULL,
          tamano BIGINT NOT NULL,
          ruta_archivo TEXT NOT NULL,
          url_publica TEXT NOT NULL,
          actividad_id VARCHAR(255) NOT NULL,
          area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
          estado VARCHAR(50) DEFAULT 'activo',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (createError) {
      console.error('❌ Error creando tabla:', createError.message)
      return false
    }
    
    console.log('✅ Tabla plan_accion_adjuntos creada')
    
    // Habilitar RLS
    const rlsSQL = `ALTER TABLE public.plan_accion_adjuntos ENABLE ROW LEVEL SECURITY;`
    await supabase.rpc('exec_sql', { sql: rlsSQL })
    console.log('✅ RLS habilitado')
    
    // Crear políticas permisivas
    const policiesSQL = `
      DROP POLICY IF EXISTS "plan_accion_adjuntos_select_policy" ON public.plan_accion_adjuntos;
      DROP POLICY IF EXISTS "plan_accion_adjuntos_insert_policy" ON public.plan_accion_adjuntos;
      DROP POLICY IF EXISTS "plan_accion_adjuntos_update_policy" ON public.plan_accion_adjuntos;
      DROP POLICY IF EXISTS "plan_accion_adjuntos_delete_policy" ON public.plan_accion_adjuntos;
      
      CREATE POLICY "plan_accion_adjuntos_select_policy" ON public.plan_accion_adjuntos
          FOR SELECT TO authenticated, anon USING (true);
      
      CREATE POLICY "plan_accion_adjuntos_insert_policy" ON public.plan_accion_adjuntos
          FOR INSERT TO authenticated, anon WITH CHECK (true);
      
      CREATE POLICY "plan_accion_adjuntos_update_policy" ON public.plan_accion_adjuntos
          FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
      
      CREATE POLICY "plan_accion_adjuntos_delete_policy" ON public.plan_accion_adjuntos
          FOR DELETE TO authenticated, anon USING (true);
    `
    
    await supabase.rpc('exec_sql', { sql: policiesSQL })
    console.log('✅ Políticas RLS creadas')
    
    // Crear índices
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_plan_accion_adjuntos_area_id ON public.plan_accion_adjuntos(area_id);
      CREATE INDEX IF NOT EXISTS idx_plan_accion_adjuntos_actividad_id ON public.plan_accion_adjuntos(actividad_id);
      CREATE INDEX IF NOT EXISTS idx_plan_accion_adjuntos_estado ON public.plan_accion_adjuntos(estado);
    `
    
    await supabase.rpc('exec_sql', { sql: indexesSQL })
    console.log('✅ Índices creados')
    
    // Verificar que la tabla se creó correctamente
    const { data: checkData, error: checkError } = await supabase
      .from('plan_accion_adjuntos')
      .select('*')
      .limit(1)
    
    if (checkError) {
      console.error('❌ Error verificando tabla:', checkError.message)
      return false
    }
    
    console.log('✅ Tabla plan_accion_adjuntos verificada y lista')
    return true
    
  } catch (error) {
    console.error('❌ Error general:', error)
    return false
  }
}

createPlanAccionAdjuntosTable().then(success => {
  if (success) {
    console.log('🎉 ¡Tabla plan_accion_adjuntos creada exitosamente!')
  } else {
    console.log('❌ Falló la creación de la tabla')
  }
  process.exit(success ? 0 : 1)
})
