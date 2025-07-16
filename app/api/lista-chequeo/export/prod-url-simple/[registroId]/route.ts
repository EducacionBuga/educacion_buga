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

    let registroFinal;
    let respuestas;
    let items;
    let categoria: any = null; // Declarar categoria fuera para accesibilidad

    if (registroError || !registro) {
      console.log('⚠️ Registro no encontrado, usando datos de prueba');
      // Usar datos de prueba para debug
      registroFinal = {
        id: registroId,
        numero_contrato: 'CONTRATO-TEST-001',
        contratista: 'CONTRATISTA DE PRUEBA SAS',
        valor_contrato: 50000000,
        categoria_id: 1
      };
      
      // Crear algunas respuestas de prueba
      respuestas = [
        { item_id: 1, respuesta: 'CUMPLE', observaciones: 'Observación de prueba 1' },
        { item_id: 2, respuesta: 'NO_CUMPLE', observaciones: 'Observación de prueba 2' },
        { item_id: 3, respuesta: 'NO_APLICA', observaciones: 'Observación de prueba 3' }
      ];
      
      // Items de prueba con filas excel que coincidan con la plantilla real
      items = [
        { id: 1, numero_item: '1', fila_excel: 12 }, // FICHA MGA
        { id: 2, numero_item: '2', fila_excel: 13 }, // CERTIFICADO DE VIABILIDAD
        { id: 3, numero_item: '3', fila_excel: 14 }, // CERTIFICADO DE DISPONIBILIDAD / ESTUDIOS PREVIOS
        { id: 4, numero_item: '4', fila_excel: 15 }, // CERTIFICADO PERSONAL NO SUFICIENTE
        { id: 5, numero_item: '5', fila_excel: 16 }  // ESTUDIOS PREVIOS Y ANÁLISIS DEL SECTOR
      ];
      
      console.log('✅ Usando datos de prueba:', registroFinal);
    } else {
      registroFinal = registro;
      
      console.log('✅ Registro encontrado:', {
        contrato: registroFinal.numero_contrato,
        contratista: registroFinal.contratista,
        categoria_id: registroFinal.categoria_id
      });

      // Obtener información de la categoría para saber qué hoja procesar
      const { data: categoriaData, error: categoriaError } = await supabase
        .from('lista_chequeo_categorias')
        .select('*')
        .eq('id', registroFinal.categoria_id)
        .single();

      if (categoriaError || !categoriaData) {
        console.warn('⚠️ Error obteniendo categoría:', categoriaError?.message);
        throw new Error(`Categoría no encontrada: ${categoriaError?.message}`);
      }

      categoria = categoriaData;
      console.log('📂 Categoría encontrada:', categoria.nombre, '→', categoria.hoja_excel);

      // 5. Obtener respuestas del checklist
      const { data: respuestasDB, error: respuestasError } = await supabase
        .from('lista_chequeo_respuestas')
        .select('*')
        .eq('registro_id', registroId);

      if (respuestasError) {
        console.warn('⚠️ Error obteniendo respuestas:', respuestasError.message);
      }

      respuestas = respuestasDB;
      console.log(`📝 Respuestas encontradas: ${respuestas?.length || 0}`);

      // 6. Obtener items para mapear con las respuestas
      // Como los items no tienen categoria_id, obtenemos todos y los filtramos después
      const { data: itemsDB, error: itemsError } = await supabase
        .from('lista_chequeo_items_maestros')
        .select('*');

      if (itemsError) {
        console.warn('⚠️ Error obteniendo items:', itemsError.message);
      }

      items = itemsDB;
      console.log(`📋 Items encontrados: ${items?.length || 0}`);
      
      // MAPEO AUTOMÁTICO: Agregar fila_excel basado en numero_item y la inspección de la plantilla
      if (items && items.length > 0) {
        items = items.map((item: any) => {
          let fila_excel = null;
          
          // Mapeo basado en numero_item - usar los datos de la inspección
          switch (item.numero_item) {
            case 1: fila_excel = 12; break; // FICHA MGA
            case 2: fila_excel = 13; break; // CERTIFICADO DE VIABILIDAD
            case 3: fila_excel = 14; break; // ESTUDIOS PREVIOS / CERTIFICADO DISPONIBILIDAD
            case 4: fila_excel = 15; break; // CERTIFICADO PERSONAL NO SUFICIENTE
            case 5: fila_excel = 16; break; // ESTUDIOS PREVIOS Y ANÁLISIS
            case 6: fila_excel = 17; break; // INVITACIÓN A PRESENTAR PROPUESTA
            case 7: fila_excel = 18; break; // PROPUESTA CONTRACTUAL
            case 8: fila_excel = 19; break; // HOJA DE VIDA SIGEP
            case 9: fila_excel = 20; break; // FOTOCOPIA CÉDULA
            case 10: fila_excel = 21; break; // FOTOCOPIA LIBRETA MILITAR
            // Agregar más mapeos según los items que tengamos
            default:
              // Para items sin mapeo específico, usar fila base + numero
              fila_excel = 11 + item.numero_item;
          }
          
          return {
            ...item,
            fila_excel
          };
        });
        
        console.log(`🗺️ Mapeo automático aplicado - Items con fila_excel: ${items.filter((i: any) => i.fila_excel).length}`);
      }
    }

    // 8. Obtener todas las categorías para mapear respuestas por hoja
    const { data: todasCategorias, error: categoriasError } = await supabase
      .from('lista_chequeo_categorias')
      .select('*')
      .eq('activo', true)
      .order('orden');

    if (categoriasError) {
      console.warn('⚠️ Error obteniendo categorías:', categoriasError.message);
    }

    const categoriasPorHoja = new Map();
    todasCategorias?.forEach((cat: any) => {
      categoriasPorHoja.set(cat.hoja_excel, cat);
      console.log(`📂 Categoría mapeada: ${cat.hoja_excel} → ${cat.nombre} (ID: ${cat.id})`);
    });

    // 9. Obtener todas las respuestas para este registro (sin JOIN problemático)
    const { data: todasRespuestas, error: todasRespuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select('*')
      .eq('registro_id', registroId);

    if (todasRespuestasError) {
      console.warn('⚠️ Error obteniendo todas las respuestas:', todasRespuestasError.message);
    }

    console.log(`📝 Total respuestas encontradas: ${todasRespuestas?.length || 0}`);

    // Crear mapa general de respuestas por item_id
    const respuestasGeneralMap = new Map();
    todasRespuestas?.forEach((respuesta: any) => {
      respuestasGeneralMap.set(respuesta.item_id, respuesta);
      console.log(`📝 Respuesta mapeada: Item ${respuesta.item_id} = ${respuesta.respuesta}`);
    });

    // 10. Modificar todas las hojas con información del contrato y respuestas específicas
    let totalRespuestasAplicadas = 0;
    
    workbook.worksheets.forEach((worksheet, index) => {
      const nombreHoja = worksheet.name;
      console.log(`🔄 Procesando hoja ${index + 1}: ${nombreHoja}`);

      // Obtener la categoría correspondiente a esta hoja
      const categoriaHoja = categoriasPorHoja.get(nombreHoja);
      console.log(`� Categoría para hoja ${nombreHoja}:`, categoriaHoja?.nombre || 'No encontrada');

      // Llenar información del contrato en TODAS las hojas
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          if (cell.value && typeof cell.value === 'string') {
            if (cell.value.includes('NUMERO DE CONTRATO')) {
              cell.value = `NUMERO DE CONTRATO: ${registroFinal.numero_contrato}`;
              console.log(`✅ Actualizado contrato en ${nombreHoja} fila ${rowNumber}`);
            } else if (cell.value.includes('CONTRATISTA')) {
              cell.value = `CONTRATISTA: ${registroFinal.contratista}`;
              console.log(`✅ Actualizado contratista en ${nombreHoja} fila ${rowNumber}`);
            } else if (cell.value.includes('VALOR')) {
              cell.value = `VALOR: $${registroFinal.valor_contrato?.toLocaleString() || 0}`;
              console.log(`✅ Actualizado valor en ${nombreHoja} fila ${rowNumber}`);
            }
          }
        });
      });

      // Filtrar respuestas específicas para esta categoría/hoja
      // Primero obtenemos los IDs de los items de esta categoría
      const idsItemsDeEstaCategoria = items?.filter(item => item.categoria_id === categoriaHoja?.id).map(item => item.id) || [];
      
      const respuestasParaHoja = todasRespuestas?.filter((resp: any) => {
        return idsItemsDeEstaCategoria.includes(resp.item_id);
      }) || [];

      console.log(`🎯 Respuestas para hoja ${nombreHoja}: ${respuestasParaHoja.length}`);

      // Crear mapa de respuestas para esta hoja específica
      const respuestasMapHoja = new Map();
      respuestasParaHoja.forEach((respuesta: any) => {
        respuestasMapHoja.set(respuesta.item_id, respuesta);
      });

      // Aplicar respuestas solo para los items de esta categoría
      const itemsDeEstaCategoria = items?.filter(item => item.categoria_id === categoriaHoja?.id) || [];
      
      itemsDeEstaCategoria.forEach((item: any) => {
        const respuesta = respuestasMapHoja.get(item.id);
        if (respuesta && item.fila_excel) {
          const fila = item.fila_excel;
          const row = worksheet.getRow(fila);
          
          console.log(`🔍 Procesando item ${item.numero}: ${respuesta.respuesta} en fila ${fila} de ${nombreHoja}`);
          
          // Limpiar las celdas C, D, E primero
          row.getCell('C').value = null;
          row.getCell('D').value = null;
          row.getCell('E').value = null;

          // Marcar la respuesta correspondiente
          if (respuesta.respuesta === 'CUMPLE') {
            row.getCell('C').value = 'X';
            console.log(`✅ Marcado CUMPLE en ${nombreHoja} fila ${fila} columna C`);
          } else if (respuesta.respuesta === 'NO_CUMPLE') {
            row.getCell('D').value = 'X';
            console.log(`✅ Marcado NO_CUMPLE en ${nombreHoja} fila ${fila} columna D`);
          } else if (respuesta.respuesta === 'NO_APLICA') {
            row.getCell('E').value = 'X';
            console.log(`✅ Marcado NO_APLICA en ${nombreHoja} fila ${fila} columna E`);
          }
          
          totalRespuestasAplicadas++;
        }
      });
      respuestasParaHoja.forEach((respuesta: any) => {
        respuestasMapHoja.set(respuesta.item_id, respuesta);
        console.log(`� Respuesta para ${nombreHoja}: Item ${respuesta.item_id} = ${respuesta.respuesta}`);
      });

      // Llenar respuestas de los ítems para esta hoja específica
      let respuestasEnHoja = 0;
      items?.forEach((item: any) => {
        const respuesta = respuestasMapHoja.get(item.id);
        if (respuesta && item.fila_excel) {
          const fila = item.fila_excel;
          
          console.log(`🔍 Procesando item ${item.numero || item.numero_item}: ${respuesta.respuesta} en fila ${fila} de ${nombreHoja}`);
          
          // Buscar las columnas donde van las respuestas (C=CUMPLE, D=NO_CUMPLE, E=NO_APLICA)
          try {
            // Limpiar respuestas anteriores
            worksheet.getCell(`C${fila}`).value = '';
            worksheet.getCell(`D${fila}`).value = '';
            worksheet.getCell(`E${fila}`).value = '';
            
            // Marcar la respuesta correspondiente
            if (respuesta.respuesta === 'CUMPLE') {
              worksheet.getCell(`C${fila}`).value = 'X';
              console.log(`✅ Marcado CUMPLE en ${nombreHoja} fila ${fila} columna C`);
            } else if (respuesta.respuesta === 'NO_CUMPLE') {
              worksheet.getCell(`D${fila}`).value = 'X';
              console.log(`✅ Marcado NO_CUMPLE en ${nombreHoja} fila ${fila} columna D`);
            } else if (respuesta.respuesta === 'NO_APLICA') {
              worksheet.getCell(`E${fila}`).value = 'X';
              console.log(`✅ Marcado NO_APLICA en ${nombreHoja} fila ${fila} columna E`);
            }
            
            // Agregar observaciones si existen (columna F)
            if (respuesta.observaciones) {
              const observacionesCell = worksheet.getCell(`F${fila}`);
              observacionesCell.value = respuesta.observaciones;
              console.log(`✅ Agregadas observaciones en ${nombreHoja} fila ${fila} columna F: "${respuesta.observaciones}"`);
            }
            
            respuestasEnHoja++;
            totalRespuestasAplicadas++;
          } catch (cellError) {
            console.warn(`⚠️ Error llenando fila ${fila} del item ${item.numero_item}:`, cellError instanceof Error ? cellError.message : 'Error desconocido');
          }
        }
      });

      console.log(`✅ Hoja ${nombreHoja} procesada - ${respuestasEnHoja} respuestas aplicadas`);
    });

    console.log(`✅ Información del contrato y respuestas aplicadas - Total: ${totalRespuestasAplicadas} respuestas`);

    // 9. Generar archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const excelBuffer = Buffer.from(buffer);
    console.log(`✅ Excel generado (${excelBuffer.length} bytes)`);

    // 10. Retornar archivo
    const fileName = `lista-chequeo-${registroFinal.numero_contrato}-${registroId}.xlsx`;
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
