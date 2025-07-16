// app/api/lista-chequeo/export/prod-url-simple/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint simplificado que usa plantilla URL - versión más directa para producción
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  const startTime = Date.now();
  console.log('🔄 EXPORTACIÓN SIMPLE CON URL - INICIANDO');
  
  try {
    const { registroId } = await params;
    console.log('📋 Registro ID:', registroId);

    if (!registroId || registroId.length < 10) {
      return NextResponse.json({
        error: 'ID de registro inválido',
        details: 'El ID debe tener al menos 10 caracteres'
      }, { status: 400 });
    }

    // 1. Descargar plantilla
    const templateUrl = 'https://pub-491aa945377d4d289c0042529c4f0267.r2.dev/lista-chequeo.xlsx';
    console.log('📥 Descargando plantilla desde:', templateUrl);
    
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      throw new Error(`Error descargando plantilla: ${templateResponse.status}`);
    }
    
    const templateBuffer = await templateResponse.arrayBuffer();
    console.log(`✅ Plantilla descargada (${templateBuffer.byteLength} bytes)`);

    // 2. Cargar plantilla en ExcelJS
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    console.log(`✅ Plantilla cargada en Excel (${workbook.worksheets.length} hojas)`);

    // 3. Configurar Supabase
    const createClient = (await import('@supabase/supabase-js')).createClient;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de Supabase no configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Obtener datos del registro
    const { data: registro, error: registroError } = await supabase
      .from('lista_chequeo_registros')
      .select('*')
      .eq('id', registroId)
      .single();

    if (registroError || !registro) {
      throw new Error(`Registro no encontrado: ${registroError?.message}`);
    }

    console.log('✅ Registro encontrado:', {
      contrato: registro.numero_contrato,
      contratista: registro.contratista
    });

    // 5. Obtener respuestas del checklist
    const { data: respuestas, error: respuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select('*')
      .eq('registro_id', registroId);

    if (respuestasError) {
      console.warn('⚠️ Error obteniendo respuestas:', respuestasError.message);
    }

    console.log(`📝 Respuestas encontradas: ${respuestas?.length || 0}`);

    // 6. Obtener items para mapear con las respuestas
    const { data: items, error: itemsError } = await supabase
      .from('lista_chequeo_items_maestros')
      .select('*')
      .eq('categoria_id', registro.categoria_id);

    if (itemsError) {
      console.warn('⚠️ Error obteniendo items:', itemsError.message);
    }

    console.log(`📋 Items encontrados: ${items?.length || 0}`);

    // 7. Crear mapa de respuestas por item_id
    const respuestasMap = new Map();
    respuestas?.forEach((respuesta: any) => {
      respuestasMap.set(respuesta.item_id, respuesta);
    });

    // 8. Modificar todas las hojas con información del contrato y respuestas
    workbook.worksheets.forEach((worksheet, index) => {
      console.log(`🔄 Procesando hoja ${index + 1}: ${worksheet.name}`);

      // Llenar información del contrato
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          if (cell.value && typeof cell.value === 'string') {
            if (cell.value.includes('NUMERO DE CONTRATO')) {
              cell.value = `NUMERO DE CONTRATO: ${registro.numero_contrato}`;
            } else if (cell.value.includes('CONTRATISTA')) {
              cell.value = `CONTRATISTA: ${registro.contratista}`;
            } else if (cell.value.includes('VALOR')) {
              cell.value = `VALOR: $${registro.valor_contrato?.toLocaleString() || 0}`;
            }
          }
        });
      });

      // Llenar respuestas de los ítems
      items?.forEach((item: any) => {
        const respuesta = respuestasMap.get(item.id);
        if (respuesta && item.fila_excel) {
          const fila = item.fila_excel;
          
          // Buscar las columnas donde van las respuestas
          // Típicamente están en las columnas F, G, H para Cumple, No Cumple, No Aplica
          try {
            // Limpiar respuestas anteriores
            worksheet.getCell(`F${fila}`).value = '';
            worksheet.getCell(`G${fila}`).value = '';
            worksheet.getCell(`H${fila}`).value = '';
            
            // Marcar la respuesta correspondiente
            if (respuesta.respuesta === 'CUMPLE') {
              worksheet.getCell(`F${fila}`).value = 'X';
            } else if (respuesta.respuesta === 'NO_CUMPLE') {
              worksheet.getCell(`G${fila}`).value = 'X';
            } else if (respuesta.respuesta === 'NO_APLICA') {
              worksheet.getCell(`H${fila}`).value = 'X';
            }
            
            // Agregar observaciones si existen
            if (respuesta.observaciones) {
              // Buscar la columna de observaciones (típicamente I o J)
              const observacionesCell = worksheet.getCell(`I${fila}`);
              observacionesCell.value = respuesta.observaciones;
            }
          } catch (cellError) {
            console.warn(`⚠️ Error llenando fila ${fila} del item ${item.numero_item}:`, cellError instanceof Error ? cellError.message : 'Error desconocido');
          }
        }
      });

      console.log(`✅ Hoja ${worksheet.name} procesada`);
    });

    console.log('✅ Información del contrato y respuestas aplicadas');

    // 9. Generar archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const excelBuffer = Buffer.from(buffer);
    console.log(`✅ Excel generado (${excelBuffer.length} bytes)`);

    // 10. Retornar archivo
    const fileName = `lista-chequeo-${registro.numero_contrato}-${registroId}.xlsx`;
    const elapsedTime = Date.now() - startTime;
    
    console.log(`✅ EXPORTACIÓN SIMPLE COMPLETADA: ${fileName} (${elapsedTime}ms)`);

    return new NextResponse(excelBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': excelBuffer.length.toString(),
        'X-Template-Source': 'url-externa-simple',
        'X-Template-Url': templateUrl,
        'X-Processing-Time': `${elapsedTime}ms`
      }
    });

  } catch (error) {
    console.error('❌ ERROR EN EXPORTACIÓN SIMPLE URL:', error);
    return NextResponse.json({
      error: 'Error en exportación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
