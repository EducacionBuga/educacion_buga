// app/api/lista-chequeo/export/fallback/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de exportación Excel con fallback completo para producción
 * Este endpoint maneja todos los posibles errores y siempre devuelve una respuesta válida
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  console.log('🔄 EXPORTACIÓN EXCEL FALLBACK - INICIANDO');
  
  try {
    const { registroId } = await params;
    console.log('📋 Registro ID:', registroId);

    // 1. Verificar que tenemos las dependencias básicas
    let createClient, ExcelJS;
    
    try {
      const supabaseModule = await import('@supabase/supabase-js');
      createClient = supabaseModule.createClient;
      console.log('✅ Supabase importado correctamente');
    } catch (importError) {
      console.error('❌ Error importando Supabase:', importError);
      return NextResponse.json({
        error: 'Error de dependencias - Supabase no disponible',
        details: importError instanceof Error ? importError.message : 'Error desconocido'
      }, { status: 500 });
    }

    try {
      ExcelJS = (await import('exceljs')).default;
      console.log('✅ ExcelJS importado correctamente');
    } catch (importError) {
      console.error('❌ Error importando ExcelJS:', importError);
      return NextResponse.json({
        error: 'Error de dependencias - ExcelJS no disponible',
        details: importError instanceof Error ? importError.message : 'Error desconocido'
      }, { status: 500 });
    }

    // 2. Buscar variables de entorno
    const possibleUrls = [
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_URL,
      process.env.PUBLIC_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_URL
    ].filter(Boolean);

    const possibleKeys = [
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.SUPABASE_ANON_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.PUBLIC_SUPABASE_ANON_KEY
    ].filter(Boolean);

    if (possibleUrls.length === 0 || possibleKeys.length === 0) {
      console.error('❌ Variables de entorno no encontradas');
      return NextResponse.json({
        error: 'Configuración de base de datos no encontrada',
        details: 'No se encontraron variables de entorno de Supabase',
        availableUrls: possibleUrls.length,
        availableKeys: possibleKeys.length,
        environment: process.env.NODE_ENV
      }, { status: 500 });
    }

    const url = possibleUrls[0];
    const key = possibleKeys[0];
    
    console.log('✅ Variables encontradas:', {
      url: url!.substring(0, 30) + '...',
      keyLength: key!.length
    });

    // 3. Crear cliente Supabase
    let supabase;
    try {
      supabase = createClient(url!, key!, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      console.log('✅ Cliente Supabase creado');
    } catch (clientError) {
      console.error('❌ Error creando cliente:', clientError);
      return NextResponse.json({
        error: 'Error creando cliente de base de datos',
        details: clientError instanceof Error ? clientError.message : 'Error desconocido'
      }, { status: 500 });
    }

    // 4. Probar conexión básica
    try {
      const { data: testData, error: testError } = await supabase
        .from('lista_chequeo_categorias')
        .select('id')
        .limit(1);
        
      if (testError) {
        console.error('❌ Error de conexión DB:', testError);
        return NextResponse.json({
          error: 'Error de conexión a la base de datos',
          details: testError.message,
          code: testError.code
        }, { status: 503 });
      }
      
      console.log('✅ Conexión DB exitosa');
    } catch (connectionError) {
      console.error('❌ Error de red:', connectionError);
      return NextResponse.json({
        error: 'Error de red al conectar con la base de datos',
        details: connectionError instanceof Error ? connectionError.message : 'Error de red'
      }, { status: 503 });
    }

    // 5. Obtener datos completos del registro
    let registroData, todasLasRespuestas;
    try {
      // Obtener registro con categoría
      const { data: registro, error: registroError } = await supabase
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
        
      if (registroError || !registro) {
        console.error('❌ Registro no encontrado:', registroError);
        return NextResponse.json({
          error: 'Registro no encontrado',
          details: registroError?.message || 'El registro no existe',
          registroId
        }, { status: 404 });
      }
      
      registroData = registro;
      console.log('✅ Registro encontrado:', registroData.numero_contrato);

      // Obtener todas las respuestas del registro
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
            categoria_id,
            categoria:lista_chequeo_categorias(nombre)
          )
        `)
        .eq('registro_id', registroId);

      if (respuestasError) {
        console.warn('⚠️ Error obteniendo respuestas, continuando sin ellas:', respuestasError);
        todasLasRespuestas = [];
      } else {
        todasLasRespuestas = respuestas || [];
      }

      console.log(`✅ Respuestas obtenidas: ${todasLasRespuestas.length}`);
      
    } catch (queryError) {
      console.error('❌ Error consultando datos:', queryError);
      return NextResponse.json({
        error: 'Error consultando datos del registro',
        details: queryError instanceof Error ? queryError.message : 'Error de consulta'
      }, { status: 500 });
    }

    // 6. Obtener datos por apartado
    let datosPorApartado: Record<string, any> = {};
    try {
      const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS'];
      
      for (const apartado of apartados) {
        try {
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
        } catch (apartadoError) {
          console.warn(`⚠️ Error procesando apartado ${apartado}:`, apartadoError);
          datosPorApartado[apartado] = {
            items: [],
            respuestas: []
          };
        }
      }
    } catch (apartadosError) {
      console.warn('⚠️ Error obteniendo apartados, usando estructura básica:', apartadosError);
      datosPorApartado = {
        'SAMC': { items: [], respuestas: [] },
        'MINIMA CUANTÍA': { items: [], respuestas: [] },
        'CONTRATO INTERADMINISTRATIVO': { items: [], respuestas: [] },
        'PRESTACIÓN DE SERVICIOS': { items: [], respuestas: [] }
      };
    }

    // 7. Generar Excel usando el servicio original
    try {
      console.log('📊 Generando Excel con plantilla...');
      
      // Intentar importar el servicio de Excel
      let ExcelExportService;
      try {
        ExcelExportService = (await import('@/lib/excel-export-service')).default;
        console.log('✅ Servicio Excel importado');
      } catch (serviceError) {
        console.warn('⚠️ No se pudo importar el servicio Excel, usando generación básica');
        throw new Error('Servicio Excel no disponible');
      }

      // Preparar información del contrato
      const contratoInfo = {
        contrato: registroData.numero_contrato || 'SIN_CONTRATO',
        contratista: registroData.contratista || 'SIN_CONTRATISTA', 
        valor: registroData.valor_contrato || 0,
        objeto: registroData.objeto || 'SIN_OBJETO'
      };

      // Usar el servicio de exportación original
      const buffer = await ExcelExportService.exportarContratoMultiple(contratoInfo, datosPorApartado);
      
      const nombreArchivo = ExcelExportService.generarNombreArchivo(
        contratoInfo.contrato,
        'MÚLTIPLE'
      );

      console.log('✅ Excel generado exitosamente con plantilla:', nombreArchivo);
      
      return new NextResponse(buffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
      
    } catch (excelError) {
      console.warn('⚠️ Error con servicio Excel, generando Excel básico como fallback final:', excelError);
      
      // Fallback final: Excel básico sin plantilla
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Lista Chequeo');
      
      // Encabezados
      worksheet.getCell('A1').value = 'LISTA DE CHEQUEO CONTRACTUAL';
      worksheet.getCell('A1').font = { bold: true, size: 16 };
      worksheet.mergeCells('A1:D1');
      
      worksheet.getCell('A3').value = `Número de Contrato: ${registroData.numero_contrato || 'N/A'}`;
      worksheet.getCell('A4').value = `Contratista: ${registroData.contratista || 'N/A'}`;
      worksheet.getCell('A5').value = `Valor: $${registroData.valor_contrato || 0}`;
      worksheet.getCell('A6').value = `Fecha: ${new Date().toLocaleDateString()}`;
      
      // Tabla básica con datos reales si los hay
      worksheet.getCell('A8').value = 'No.';
      worksheet.getCell('B8').value = 'Descripción';
      worksheet.getCell('C8').value = 'Estado';
      worksheet.getCell('D8').value = 'Observaciones';
      
      // Estilo de encabezados
      ['A8', 'B8', 'C8', 'D8'].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
        worksheet.getCell(cell).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      });
      
      // Llenar con datos reales si están disponibles
      let fila = 9;
      if (datosPorApartado && Object.keys(datosPorApartado).length > 0) {
        for (const [apartado, datos] of Object.entries(datosPorApartado)) {
          if (datos.items && datos.items.length > 0) {
            worksheet.getCell(`A${fila}`).value = apartado;
            worksheet.getCell(`A${fila}`).font = { bold: true };
            fila++;
            
            datos.items.forEach((item: any, index: number) => {
              const respuesta = datos.respuestas?.find((r: any) => r.item_id === item.id);
              
              worksheet.getCell(`A${fila}`).value = item.numero || (index + 1);
              worksheet.getCell(`B${fila}`).value = item.titulo || item.texto || 'Sin descripción';
              worksheet.getCell(`C${fila}`).value = respuesta?.respuesta || 'SIN RESPUESTA';
              worksheet.getCell(`D${fila}`).value = respuesta?.observaciones || '';
              
              fila++;
            });
            fila++; // Espacio entre apartados
          }
        }
      } else {
        // Datos de ejemplo si no hay datos reales
        worksheet.getCell('A9').value = '1';
        worksheet.getCell('B9').value = 'Lista de chequeo contractual';
        worksheet.getCell('C9').value = 'PENDIENTE';
        worksheet.getCell('D9').value = 'Datos no disponibles en este momento';
      }
      
      // Ajustar columnas
      worksheet.getColumn('A').width = 10;
      worksheet.getColumn('B').width = 40;
      worksheet.getColumn('C').width = 15;
      worksheet.getColumn('D').width = 30;
      
      const buffer = await workbook.xlsx.writeBuffer();
      const bufferArray = Buffer.from(buffer);
      
      console.log('✅ Excel básico generado exitosamente como fallback final');
      
      const filename = `Lista_Chequeo_Fallback_${registroData.numero_contrato || 'Contrato'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      return new NextResponse(bufferArray, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': bufferArray.length.toString(),
        },
      });
    }

  } catch (globalError) {
    console.error('🚨 Error crítico:', globalError);
    
    return NextResponse.json({
      error: 'Error crítico del servidor',
      details: globalError instanceof Error ? globalError.message : 'Error desconocido',
      stack: globalError instanceof Error ? globalError.stack?.split('\n').slice(0, 3) : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}
