// app/api/lista-chequeo/debug-data/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para debugging - ver qué datos reales tenemos en la base de datos
 */
export async function GET(request: NextRequest) {
  try {
    // Configurar Supabase
    const createClient = (await import('@supabase/supabase-js')).createClient;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de Supabase no configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Ver registros disponibles
    const { data: registros, error: registrosError } = await supabase
      .from('lista_chequeo_registros')
      .select('*')
      .limit(5);

    console.log('📋 Registros encontrados:', registros?.length || 0);

    // 2. Ver respuestas disponibles
    const { data: respuestas, error: respuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select('*')
      .limit(10);

    console.log('📝 Respuestas encontradas:', respuestas?.length || 0);

    // 3. Ver items maestros disponibles
    const { data: items, error: itemsError } = await supabase
      .from('lista_chequeo_items_maestros')
      .select('*')
      .limit(10);

    console.log('📋 Items maestros encontrados:', items?.length || 0);

    // 4. Ver categorías disponibles
    const { data: categorias, error: categoriasError } = await supabase
      .from('lista_chequeo_categorias')
      .select('*');

    console.log('📂 Categorías encontradas:', categorias?.length || 0);

    // 5. Ver items con sus categorías
    const { data: itemsConCategoria, error: itemsCategoriaError } = await supabase
      .from('lista_chequeo_items_maestros')
      .select(`
        id,
        numero_item,
        nombre,
        categoria_id,
        lista_chequeo_categorias!inner(
          id,
          nombre
        )
      `)
      .limit(20);

    console.log('📋 Items con categoría encontrados:', itemsConCategoria?.length || 0);

    const result = {
      registros: {
        count: registros?.length || 0,
        data: registros || [],
        error: registrosError?.message
      },
      respuestas: {
        count: respuestas?.length || 0,
        data: respuestas || [],
        error: respuestasError?.message
      },
      items_maestros: {
        count: items?.length || 0,
        data: items || [],
        error: itemsError?.message
      },
      categorias: {
        count: categorias?.length || 0,
        data: categorias || [],
        error: categoriasError?.message
      },
      items_con_categoria: {
        count: itemsConCategoria?.length || 0,
        data: itemsConCategoria || [],
        error: itemsCategoriaError?.message
      }
    };

    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ ERROR EN DEBUG:', error);
    return NextResponse.json({
      error: 'Error en debug',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
