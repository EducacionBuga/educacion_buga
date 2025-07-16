// app/api/lista-chequeo/export/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ExcelExportService from '@/lib/excel-export-service';

// Crear cliente Supabase
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  console.log('🔄🔄🔄 EXPORTACIÓN MÚLTIPLE MEJORADA - DATOS POR APARTADO 🔄🔄🔄')
  console.log('📋 Registro ID:', (await params).registroId)
  
  try {
    const supabase = getSupabaseClient();
    const { registroId } = await params;

    // 1. Obtener información del registro inicial para sacar el contrato
    const { data: registroInicial, error: registroError } = await supabase
      .from('lista_chequeo_registros')
      .select(`
        *,
        categoria:lista_chequeo_categorias(nombre)
      `)
      .eq('id', registroId)
      .single();

    if (registroError || !registroInicial) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    // 2. Obtener información del contrato (si existe) o usar datos del registro
    console.log('🔍 [DEBUG] Estructura del registro:', JSON.stringify(registroInicial, null, 2));
    console.log('🔍 [DEBUG] Campos disponibles en registro:', Object.keys(registroInicial));
    
    // Intentar múltiples campos para el número de contrato - PRIORIZAR numero_contrato
    console.log('🔍 [DEBUG] Valores por campo:');
    console.log('  - numero_contrato:', registroInicial.numero_contrato);
    console.log('  - contrato:', registroInicial.contrato);
    console.log('  - numeroContrato:', registroInicial.numeroContrato);
    console.log('  - contract_number:', registroInicial.contract_number);
    
    const contrato = registroInicial.numero_contrato ||  // PRIORIZAR ESTE CAMPO
                    registroInicial.contrato || 
                    registroInicial.numeroContrato ||
                    registroInicial.contract_number ||
                    'SIN_CONTRATO';
                    
    const contratista = registroInicial.contratista || registroInicial.contractor || 'SIN_CONTRATISTA';
    const valor = registroInicial.valor || registroInicial.valor_contrato || registroInicial.contract_value || 0;
    const objeto = registroInicial.objeto || registroInicial.contract_object || 'SIN_OBJETO';

    console.log('📋 Datos extraídos FINALES:');
    console.log('📋 - Contrato final:', contrato);
    console.log('📋 - Contratista final:', contratista);
    console.log('📋 - Valor final:', valor);
    console.log('📋 - Objeto final:', objeto);

    // 3. Obtener todas las respuestas del registro original
    const { data: todasLasRespuestas, error: respuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select(`
        *,
        item:lista_chequeo_items_maestros(
          id,
          numero,
          orden,
          categoria_id,
          categoria:lista_chequeo_categorias(nombre)
        )
      `)
      .eq('registro_id', registroId);

    if (respuestasError) {
      console.error('Error obteniendo respuestas:', respuestasError);
      return NextResponse.json(
        { error: 'Error obteniendo respuestas' },
        { status: 500 }
      );
    }

    console.log(`📋 Total respuestas encontradas: ${todasLasRespuestas?.length || 0}`);
    
    // Debug: ver estructura de las respuestas
    if (todasLasRespuestas && todasLasRespuestas.length > 0) {
      console.log('🔍 Primera respuesta:', JSON.stringify(todasLasRespuestas[0], null, 2));
    }

    // 4. Obtener TODOS los apartados y sus datos
    const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS'];
    const datosPorApartado: Record<string, any> = {};

    for (const apartado of apartados) {
      // Buscar categoría del apartado
      const { data: categoria, error: categoriaError } = await supabase
        .from('lista_chequeo_categorias')
        .select('id, nombre')
        .eq('nombre', apartado)
        .single();

      if (categoriaError || !categoria) {
        console.log(`⚠️ Categoría ${apartado} no encontrada, creando hoja vacía`);
        datosPorApartado[apartado] = {
          items: [],
          respuestas: []
        };
        continue;
      }

      // Obtener ítems del apartado
      const { data: items, error: itemsError } = await supabase
        .from('lista_chequeo_items_maestros')
        .select('*')
        .eq('categoria_id', categoria.id)
        .order('orden');

      // Filtrar respuestas que corresponden a este apartado
      const respuestasApartado = todasLasRespuestas?.filter(resp => 
        resp.item?.categoria_id === categoria.id
      ) || [];

      datosPorApartado[apartado] = {
        items: items || [],
        respuestas: respuestasApartado,
        categoria: categoria
      };

      console.log(`📊 Apartado ${apartado}: ${items?.length || 0} ítems, ${respuestasApartado.length} respuestas`);
    }
    
    console.log('📊 Procesando datos por apartado...');

    // 5. Crear estructura de información del contrato
    const contratoInfo = {
      contrato,
      contratista,
      valor,
      objeto
    };

    // 6. Generar Excel usando la nueva función múltiple
    const buffer = await ExcelExportService.exportarContratoMultiple(contratoInfo, datosPorApartado);

    // 6. Generar nombre del archivo
    const nombreArchivo = ExcelExportService.generarNombreArchivo(
      contrato,
      'MÚLTIPLE'
    );

    // 7. Retornar archivo
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error en exportación múltiple:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
