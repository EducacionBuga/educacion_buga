// app/api/lista-chequeo/export/production/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint específico para producción con máxima compatibilidad
 * Maneja todas las diferencias entre desarrollo y producción
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  console.log('🚀 EXPORTACIÓN EXCEL PRODUCCIÓN - INICIANDO');
  
  try {
    const { registroId } = await params;
    console.log('📋 Registro ID:', registroId);

    // 1. Importaciones dinámicas específicas para producción
    let createClient, ExcelJS;
    
    try {
      const supabaseModule = await import('@supabase/supabase-js');
      createClient = supabaseModule.createClient;
      console.log('✅ Supabase importado');
    } catch (importError) {
      console.error('❌ Error importando Supabase:', importError);
      return NextResponse.json({
        error: 'Error de dependencias - Supabase',
        details: importError instanceof Error ? importError.message : 'Import error',
        step: 'import_supabase'
      }, { status: 500 });
    }

    try {
      ExcelJS = (await import('exceljs')).default;
      console.log('✅ ExcelJS importado');
    } catch (importError) {
      console.error('❌ Error importando ExcelJS:', importError);
      return NextResponse.json({
        error: 'Error de dependencias - ExcelJS',
        details: importError instanceof Error ? importError.message : 'Import error',
        step: 'import_exceljs'
      }, { status: 500 });
    }

    // 2. Configuración de Supabase para producción
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables de entorno faltantes');
      return NextResponse.json({
        error: 'Configuración de base de datos incompleta',
        details: 'Variables de entorno de Supabase no encontradas',
        step: 'env_check',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }, { status: 500 });
    }

    // 3. Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    console.log('✅ Cliente Supabase creado');

    // 4. Obtener datos del registro
    let registroData;
    try {
      const { data: registro, error: registroError } = await supabase
        .from('lista_chequeo_registros')
        .select(`
          id,
          numero_contrato,
          contratista,
          valor_contrato,
          objeto
        `)
        .eq('id', registroId)
        .single();
        
      if (registroError || !registro) {
        console.error('❌ Registro no encontrado:', registroError);
        return NextResponse.json({
          error: 'Registro no encontrado',
          details: registroError?.message || 'El registro no existe',
          registroId,
          step: 'fetch_registro'
        }, { status: 404 });
      }
      
      registroData = registro;
      console.log('✅ Registro encontrado:', registroData.numero_contrato);
    } catch (queryError) {
      console.error('❌ Error consultando registro:', queryError);
      return NextResponse.json({
        error: 'Error consultando datos',
        details: queryError instanceof Error ? queryError.message : 'Query error',
        step: 'query_registro'
      }, { status: 500 });
    }

    // 5. Obtener respuestas del registro
    let todasLasRespuestas = [];
    try {
      const { data: respuestas, error: respuestasError } = await supabase
        .from('lista_chequeo_respuestas')
        .select(`
          *,
          item:lista_chequeo_items_maestros(
            id,
            numero,
            orden,
            titulo,
            texto,
            categoria_id
          )
        `)
        .eq('registro_id', registroId);

      if (!respuestasError && respuestas) {
        todasLasRespuestas = respuestas;
      }
      console.log(`✅ Respuestas obtenidas: ${todasLasRespuestas.length}`);
    } catch (respuestasError) {
      console.warn('⚠️ Error obteniendo respuestas, continuando:', respuestasError);
    }

    // 6. Obtener datos por apartado
    const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS'];
    const datosPorApartado: Record<string, any> = {};

    for (const apartado of apartados) {
      try {
        // Buscar categoría
        const { data: categoria } = await supabase
          .from('lista_chequeo_categorias')
          .select('id, nombre')
          .eq('nombre', apartado)
          .single();

        if (categoria) {
          // Obtener ítems
          const { data: items } = await supabase
            .from('lista_chequeo_items_maestros')
            .select('id, numero, orden, titulo, texto, categoria_id')
            .eq('categoria_id', categoria.id)
            .order('orden');

          // Filtrar respuestas
          const respuestasApartado = todasLasRespuestas.filter((resp: any) => 
            resp.item?.categoria_id === categoria.id
          );

          datosPorApartado[apartado] = {
            items: items || [],
            respuestas: respuestasApartado
          };
        } else {
          datosPorApartado[apartado] = { items: [], respuestas: [] };
        }
      } catch (apartadoError) {
        console.warn(`⚠️ Error en apartado ${apartado}:`, apartadoError);
        datosPorApartado[apartado] = { items: [], respuestas: [] };
      }
    }

    console.log('📊 Datos por apartado preparados');

    // 7. Generar Excel (versión simplificada para producción)
    try {
      console.log('📊 Generando Excel para producción...');
      
      // Intentar usar el servicio original primero
      try {
        const ExcelExportService = (await import('@/lib/excel-export-service')).default;
        
        const contratoInfo = {
          contrato: registroData.numero_contrato || 'SIN_CONTRATO',
          contratista: registroData.contratista || 'SIN_CONTRATISTA', 
          valor: registroData.valor_contrato || 0,
          objeto: registroData.objeto || 'SIN_OBJETO'
        };

        const buffer = await ExcelExportService.exportarContratoMultiple(contratoInfo, datosPorApartado);
        const nombreArchivo = ExcelExportService.generarNombreArchivo(contratoInfo.contrato, 'MÚLTIPLE');

        console.log('✅ Excel generado con plantilla:', nombreArchivo);
        
        return new NextResponse(buffer as any, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
            'Content-Length': buffer.length.toString(),
          },
        });
        
      } catch (serviceError) {
        console.warn('⚠️ Servicio Excel falló, generando versión básica:', serviceError);
        
        // Fallback: Excel básico pero funcional
        const workbook = new ExcelJS.Workbook();
        
        // Crear hojas para cada apartado con datos reales
        for (const [apartado, datos] of Object.entries(datosPorApartado)) {
          const worksheet = workbook.addWorksheet(apartado);
          
          // Encabezados del contrato
          worksheet.getCell('A1').value = `LISTA DE CHEQUEO - ${apartado}`;
          worksheet.getCell('A1').font = { bold: true, size: 16 };
          worksheet.mergeCells('A1:E1');
          
          worksheet.getCell('A3').value = `Contrato: ${registroData.numero_contrato || 'N/A'}`;
          worksheet.getCell('A4').value = `Contratista: ${registroData.contratista || 'N/A'}`;
          worksheet.getCell('A5').value = `Valor: $${registroData.valor_contrato || 0}`;
          
          // Encabezados de tabla
          worksheet.getCell('A7').value = 'No.';
          worksheet.getCell('B7').value = 'Descripción';
          worksheet.getCell('C7').value = 'Estado';
          worksheet.getCell('D7').value = 'Observaciones';
          
          // Estilo de encabezados
          ['A7', 'B7', 'C7', 'D7'].forEach(cell => {
            worksheet.getCell(cell).font = { bold: true };
            worksheet.getCell(cell).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE0E0E0' }
            };
          });
          
          // Llenar datos
          let fila = 8;
          if (datos.items && datos.items.length > 0) {
            datos.items.forEach((item: any) => {
              const respuesta = datos.respuestas?.find((r: any) => r.item_id === item.id);
              
              worksheet.getCell(`A${fila}`).value = item.numero || fila - 7;
              worksheet.getCell(`B${fila}`).value = item.titulo || item.texto || 'Sin descripción';
              worksheet.getCell(`C${fila}`).value = respuesta?.respuesta || 'SIN RESPUESTA';
              worksheet.getCell(`D${fila}`).value = respuesta?.observaciones || '';
              
              fila++;
            });
          } else {
            worksheet.getCell('A8').value = 'Sin datos disponibles';
            worksheet.mergeCells('A8:D8');
          }
          
          // Ajustar columnas
          worksheet.getColumn('A').width = 10;
          worksheet.getColumn('B').width = 50;
          worksheet.getColumn('C').width = 15;
          worksheet.getColumn('D').width = 30;
        }
        
        const buffer = await workbook.xlsx.writeBuffer();
        const bufferArray = Buffer.from(buffer);
        
        const filename = `Lista_Chequeo_Produccion_${registroData.numero_contrato || 'Contrato'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        console.log('✅ Excel básico generado para producción');
        
        return new NextResponse(bufferArray, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': bufferArray.length.toString(),
          },
        });
      }
      
    } catch (excelError) {
      console.error('❌ Error generando Excel:', excelError);
      return NextResponse.json({
        error: 'Error generando archivo Excel',
        details: excelError instanceof Error ? excelError.message : 'Excel generation error',
        step: 'generate_excel'
      }, { status: 500 });
    }

  } catch (globalError) {
    console.error('🚨 Error crítico en producción:', globalError);
    
    return NextResponse.json({
      error: 'Error crítico del servidor en producción',
      details: globalError instanceof Error ? globalError.message : 'Error desconocido',
      step: 'global_error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
