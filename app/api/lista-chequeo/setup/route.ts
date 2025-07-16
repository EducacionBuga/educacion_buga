import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Se requiere especificar una acción' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    switch (action) {
      case 'check_tables':
        return await checkTables(supabase)
      case 'create_tables':
        return await createTables(supabase)
      case 'populate_data':
        return await populateData(supabase)
      case 'reset_all':
        return await resetAll(supabase)
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error en setup lista chequeo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function checkTables(supabase: any) {
  try {
    const tables = [
      'lista_chequeo_categorias',
      'lista_chequeo_etapas', 
      'lista_chequeo_items_maestros',
      'lista_chequeo_item_categorias',
      'lista_chequeo_respuestas'
    ]

    const results = []

    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('count(*)', { count: 'exact', head: true })

      results.push({
        table: tableName,
        exists: !error,
        count: error ? 0 : data?.length || 0,
        error: error?.message
      })
    }

    return NextResponse.json({ tables: results })
  } catch (error) {
    console.error('Error checking tables:', error)
    return NextResponse.json(
      { error: 'Error verificando tablas' },
      { status: 500 }
    )
  }
}

async function createTables(supabase: any) {
  try {
    // Script de creación de tablas
    const createScript = `
      -- Tabla de categorías
      CREATE TABLE IF NOT EXISTS lista_chequeo_categorias (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(100) NOT NULL UNIQUE,
          descripcion TEXT,
          hoja_excel VARCHAR(50) NOT NULL,
          orden INTEGER NOT NULL DEFAULT 0,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Tabla de etapas
      CREATE TABLE IF NOT EXISTS lista_chequeo_etapas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(50) NOT NULL UNIQUE,
          descripcion TEXT,
          orden INTEGER NOT NULL DEFAULT 0,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Tabla de items maestros
      CREATE TABLE IF NOT EXISTS lista_chequeo_items_maestros (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          numero_item INTEGER NOT NULL,
          titulo VARCHAR(500) NOT NULL,
          descripcion TEXT,
          etapa_id UUID NOT NULL REFERENCES lista_chequeo_etapas(id) ON DELETE CASCADE,
          categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id) ON DELETE CASCADE,
          fila_excel INTEGER,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(categoria_id, numero_item)
      );

      -- Tabla de relación items-categorías
      CREATE TABLE IF NOT EXISTS lista_chequeo_item_categorias (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          item_id UUID NOT NULL REFERENCES lista_chequeo_items_maestros(id) ON DELETE CASCADE,
          categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id) ON DELETE CASCADE,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(item_id, categoria_id)
      );

      -- Tabla de respuestas
      CREATE TABLE IF NOT EXISTS lista_chequeo_respuestas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          area_id UUID NOT NULL,
          categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id) ON DELETE CASCADE,
          item_id UUID NOT NULL REFERENCES lista_chequeo_items_maestros(id) ON DELETE CASCADE,
          respuesta VARCHAR(20) CHECK (respuesta IN ('CUMPLE', 'NO_CUMPLE', 'NO_APLICA')),
          observaciones TEXT,
          usuario_creacion VARCHAR(100),
          usuario_modificacion VARCHAR(100),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(area_id, categoria_id, item_id)
      );

      -- Índices
      CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_categoria ON lista_chequeo_items_maestros(categoria_id);
      CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_etapa ON lista_chequeo_items_maestros(etapa_id);
      CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_area ON lista_chequeo_respuestas(area_id);
      CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_categoria ON lista_chequeo_respuestas(categoria_id);
      CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_item ON lista_chequeo_respuestas(item_id);

      -- Función de updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Triggers
      DROP TRIGGER IF EXISTS update_lista_chequeo_categorias_updated_at ON lista_chequeo_categorias;
      CREATE TRIGGER update_lista_chequeo_categorias_updated_at 
          BEFORE UPDATE ON lista_chequeo_categorias 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_lista_chequeo_etapas_updated_at ON lista_chequeo_etapas;
      CREATE TRIGGER update_lista_chequeo_etapas_updated_at 
          BEFORE UPDATE ON lista_chequeo_etapas 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_lista_chequeo_items_maestros_updated_at ON lista_chequeo_items_maestros;
      CREATE TRIGGER update_lista_chequeo_items_maestros_updated_at 
          BEFORE UPDATE ON lista_chequeo_items_maestros 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_lista_chequeo_respuestas_updated_at ON lista_chequeo_respuestas;
      CREATE TRIGGER update_lista_chequeo_respuestas_updated_at 
          BEFORE UPDATE ON lista_chequeo_respuestas 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- RLS
      ALTER TABLE lista_chequeo_categorias ENABLE ROW LEVEL SECURITY;
      ALTER TABLE lista_chequeo_etapas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE lista_chequeo_items_maestros ENABLE ROW LEVEL SECURITY;
      ALTER TABLE lista_chequeo_item_categorias ENABLE ROW LEVEL SECURITY;
      ALTER TABLE lista_chequeo_respuestas ENABLE ROW LEVEL SECURITY;

      -- Políticas RLS
      DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_categorias" ON lista_chequeo_categorias;
      CREATE POLICY "Allow all operations on lista_chequeo_categorias" 
          ON lista_chequeo_categorias FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_etapas" ON lista_chequeo_etapas;
      CREATE POLICY "Allow all operations on lista_chequeo_etapas" 
          ON lista_chequeo_etapas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_items_maestros" ON lista_chequeo_items_maestros;
      CREATE POLICY "Allow all operations on lista_chequeo_items_maestros" 
          ON lista_chequeo_items_maestros FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_item_categorias" ON lista_chequeo_item_categorias;
      CREATE POLICY "Allow all operations on lista_chequeo_item_categorias" 
          ON lista_chequeo_item_categorias FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_respuestas" ON lista_chequeo_respuestas;
      CREATE POLICY "Allow all operations on lista_chequeo_respuestas" 
          ON lista_chequeo_respuestas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    `

    const { error } = await supabase.rpc('exec_sql', { sql: createScript })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tablas creadas exitosamente' 
    })
  } catch (error) {
    console.error('Error creating tables:', error)
    return NextResponse.json(
      { error: 'Error creando tablas: ' + (error instanceof Error ? error.message : 'Error desconocido') },
      { status: 500 }
    )
  }
}

async function populateData(supabase: any) {
  try {
    // Insertar categorías
    const { error: catError } = await supabase
      .from('lista_chequeo_categorias')
      .upsert([
        { nombre: 'SAMC', descripcion: 'Selección Abreviada de Menor Cuantía', hoja_excel: 'SAMC', orden: 1 },
        { nombre: 'MINIMA CUANTÍA', descripcion: 'Contrato de Mínima Cuantía', hoja_excel: 'MINIMA CUANTÍA', orden: 2 },
        { nombre: 'CONTRATO INTERADMINISTRATIVO', descripcion: 'Contrato Interadministrativo', hoja_excel: 'CONTRATO INTERADMINISTRATIVO', orden: 3 },
        { nombre: 'PRESTACIÓN DE SERVICIOS', descripcion: 'Contrato de Prestación de Servicios', hoja_excel: 'PRESTACIÓN DE SERVICIOS', orden: 4 }
      ], { onConflict: 'nombre' })

    if (catError) throw catError

    // Insertar etapas
    const { error: etapasError } = await supabase
      .from('lista_chequeo_etapas')
      .upsert([
        { nombre: 'PRECONTRACTUAL', descripcion: 'Etapa previa a la firma del contrato', orden: 1 },
        { nombre: 'CONTRACTUAL', descripcion: 'Etapa de formalización del contrato', orden: 2 },
        { nombre: 'EJECUCION', descripcion: 'Etapa de ejecución y seguimiento del contrato', orden: 3 }
      ], { onConflict: 'nombre' })

    if (etapasError) throw etapasError

    return NextResponse.json({ 
      success: true, 
      message: 'Datos básicos insertados exitosamente' 
    })
  } catch (error) {
    console.error('Error populating data:', error)
    return NextResponse.json(
      { error: 'Error poblando datos: ' + (error instanceof Error ? error.message : 'Error desconocido') },
      { status: 500 }
    )
  }
}

async function resetAll(supabase: any) {
  try {
    // Eliminar datos en orden
    await supabase.from('lista_chequeo_respuestas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('lista_chequeo_item_categorias').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('lista_chequeo_items_maestros').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('lista_chequeo_etapas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('lista_chequeo_categorias').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    return NextResponse.json({ 
      success: true, 
      message: 'Datos eliminados exitosamente' 
    })
  } catch (error) {
    console.error('Error resetting data:', error)
    return NextResponse.json(
      { error: 'Error eliminando datos: ' + (error instanceof Error ? error.message : 'Error desconocido') },
      { status: 500 }
    )
  }
}
