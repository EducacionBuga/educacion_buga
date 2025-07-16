// app/api/lista-chequeo/export/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ExcelExportService from '@/lib/excel-export-service';

// Crear cliente Supabase
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Variables de entorno de Supabase no configuradas. Verifique NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(url, key);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  console.log('🔄 INICIANDO EXPORTACIÓN EXCEL - API');
  
  try {
    // Verificar conexión a Supabase antes de continuar
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (configError) {
      console.error('❌ Error de configuración de Supabase:', configError);
      return NextResponse.json(
        { 
          error: 'Error de configuración del servidor',
          details: configError instanceof Error ? configError.message : 'Error de configuración desconocido',
          fix: 'Configure las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY'
        },
        { status: 500 }
      );
    }

    const { registroId } = await params;
    
    console.log('📋 Registro ID recibido:', registroId);

    // 1. Verificar que el registro existe
    const { data: registroInicial, error: registroError } = await supabase
      .from('lista_chequeo_registros')
      .select(`
        id,
        numero_contrato,
        contratista,
        valor_contrato,
        objeto,
        categoria:lista_chequeo_categorias(nombre)
      `)
      .eq('id', registroId)
      .single();

    if (registroError || !registroInicial) {
      console.error('❌ Error al obtener registro:', registroError);
      
      // Manejar diferentes tipos de errores de base de datos
      if (registroError) {
        // Error de conexión a la base de datos
        if (registroError.code === 'PGRST301' || registroError.message?.includes('connection')) {
          return NextResponse.json(
            { 
              error: 'Error de conexión a la base de datos',
              details: registroError.message,
              code: registroError.code,
              registroId,
              suggestion: 'Verifique la configuración de la base de datos y la conectividad de red'
            },
            { status: 503 }
          );
        }
        
        // Error de autenticación
        if (registroError.code === '401' || registroError.message?.includes('authentication')) {
          return NextResponse.json(
            { 
              error: 'Error de autenticación con la base de datos',
              details: registroError.message,
              registroId,
              suggestion: 'Verifique las credenciales de la base de datos (SUPABASE_SERVICE_ROLE_KEY)'
            },
            { status: 401 }
          );
        }
      }
      
      // Error genérico - registro no encontrado
      return NextResponse.json(
        { 
          error: 'Registro no encontrado',
          details: registroError?.message || 'El registro especificado no existe en la base de datos',
          registroId
        },
        { status: 404 }
      );
    }
    
    console.log('✅ Registro encontrado:', registroInicial);

    // 2. Extraer información del contrato
    const contratoInfo = {
      contrato: registroInicial.numero_contrato || 'SIN_CONTRATO',
      contratista: registroInicial.contratista || 'SIN_CONTRATISTA', 
      valor: registroInicial.valor_contrato || 0,
      objeto: registroInicial.objeto || 'SIN_OBJETO'
    };
    
    console.log('📋 Información del contrato extraída:', contratoInfo);

    // 3. Obtener todas las respuestas del registro
    const { data: todasLasRespuestas, error: respuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select(`
        *,
        item:lista_chequeo_items_maestros(
          id,
          numero,
          orden,
          titulo,
          texto,
          categoria_id,
          categoria:lista_chequeo_categorias(nombre)
        )
      `)
      .eq('registro_id', registroId);

    if (respuestasError) {
      console.error('❌ Error obteniendo respuestas:', respuestasError);
      return NextResponse.json(
        { error: 'Error obteniendo respuestas' },
        { status: 500 }
      );
    }

    console.log(`📋 Total respuestas encontradas: ${todasLasRespuestas?.length || 0}`);

    // 4. Obtener datos por apartado
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
        .select('id, numero, orden, titulo, texto, categoria_id')
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

    // 5. Generar Excel
    console.log('📊 Generando archivo Excel...');
    const buffer = await ExcelExportService.exportarContratoMultiple(contratoInfo, datosPorApartado);

    // 6. Generar nombre del archivo
    const nombreArchivo = ExcelExportService.generarNombreArchivo(
      contratoInfo.contrato,
      'MÚLTIPLE'
    );

    console.log(`✅ Excel generado exitosamente: ${nombreArchivo}`);

    // 7. Retornar archivo
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('🚨 Error detallado en exportación:', {
      error,
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al exportar Excel',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
