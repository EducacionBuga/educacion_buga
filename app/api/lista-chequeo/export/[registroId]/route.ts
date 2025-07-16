// app/api/lista-chequeo/export/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  const startTime = Date.now();
  console.log('🔄 INICIANDO EXPORTACIÓN EXCEL - API (PRODUCCIÓN) - VERSIÓN ROBUSTA');
  
  // Importaciones dinámicas para mejor manejo de errores
  let createSupabaseClientForProduction, ExcelExportService;
  
  try {
    console.log('📦 Importando dependencias...');
    
    // Importar cliente Supabase
    try {
      const supabaseModule = await import('@/lib/supabase-client-production');
      createSupabaseClientForProduction = supabaseModule.createSupabaseClientForProduction;
      console.log('✅ Cliente Supabase importado');
    } catch (importError) {
      console.error('❌ Error importando cliente Supabase:', importError);
      return NextResponse.json({
        error: 'Error importando cliente de base de datos',
        details: importError instanceof Error ? importError.message : 'Error de importación',
        step: 'import_supabase_client'
      }, { status: 500 });
    }
    
    // Importar servicio Excel
    try {
      const excelModule = await import('@/lib/excel-export-service');
      ExcelExportService = excelModule.default;
      console.log('✅ Servicio Excel importado');
    } catch (importError) {
      console.error('❌ Error importando servicio Excel:', importError);
      return NextResponse.json({
        error: 'Error importando servicio de Excel',
        details: importError instanceof Error ? importError.message : 'Error de importación',
        step: 'import_excel_service'
      }, { status: 500 });
    }
    
    console.log('✅ Todas las dependencias importadas correctamente');

    // 1. Obtener y validar registroId
    const { registroId } = await params;
    
    if (!registroId || registroId.length < 10) {
      console.error('❌ Registro ID inválido:', registroId);
      return NextResponse.json(
        { 
          error: 'ID de registro inválido',
          details: `El ID proporcionado '${registroId}' no es válido`,
          registroId
        },
        { status: 400 }
      );
    }
    
    console.log('📋 Registro ID válido recibido:', registroId);

    // 2. Crear cliente Supabase optimizado para producción
    let supabase;
    try {
      supabase = createSupabaseClientForProduction();
      console.log('✅ Cliente Supabase creado exitosamente para producción');
    } catch (clientError) {
      console.error('❌ Error creando cliente Supabase:', clientError);
      return NextResponse.json(
        { 
          error: 'Error de configuración de la base de datos',
          details: clientError instanceof Error ? clientError.message : 'Error desconocido al crear cliente',
          environment: process.env.NODE_ENV,
          step: 'create_supabase_client'
        },
        { status: 500 }
      );
    }

    // 4. Probar conexión a la base de datos
    console.log('🔗 Probando conexión a la base de datos...');
    
    try {
      const { data: testConnection, error: testError } = await supabase
        .from('lista_chequeo_categorias')
        .select('id')
        .limit(1);
        
      if (testError) {
        console.error('❌ Error de conexión a la base de datos:', testError);
        return NextResponse.json(
          { 
            error: 'Error de conexión a la base de datos',
            details: testError.message,
            code: testError.code,
            suggestion: 'Verifique las credenciales y la conectividad a Supabase'
          },
          { status: 503 }
        );
      }
      
      console.log('✅ Conexión a la base de datos exitosa');
    } catch (connectionError) {
      console.error('❌ Error de red o conexión:', connectionError);
      return NextResponse.json(
        { 
          error: 'Error de red al conectar con la base de datos',
          details: connectionError instanceof Error ? connectionError.message : 'Error de conexión desconocido'
        },
        { status: 503 }
      );
    }

    // 5. Verificar que el registro existe
    console.log('🔍 Buscando registro:', registroId);
    
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
      const respuestasApartado = todasLasRespuestas?.filter((resp: any) => 
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
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('🚨 Error crítico en exportación:', {
      error,
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      memoryUsage: process.memoryUsage()
    });
    
    // Determinar el tipo de error para dar una respuesta más específica
    let errorMessage = 'Error interno del servidor al exportar Excel';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
        errorMessage = 'Error de red al conectar con la base de datos';
        statusCode = 503;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout al procesar la exportación';
        statusCode = 504;
      } else if (error.message.includes('permission') || error.message.includes('auth')) {
        errorMessage = 'Error de permisos o autenticación';
        statusCode = 401;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        suggestion: 'Verifique los logs del servidor para más detalles'
      },
      { status: statusCode }
    );
  }
}
