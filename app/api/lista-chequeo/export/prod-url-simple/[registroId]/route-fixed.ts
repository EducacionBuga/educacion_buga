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
      throw new Error(`Registro no encontrado: ${registroError?.message || 'ID no válido'}`);
    }

    const registroFinal = registro;
    console.log('✅ Registro encontrado:', {
      contrato: registroFinal.numero_contrato,
      contratista: registroFinal.contratista,
      categoria_id: registroFinal.categoria_id
    });

    // 5. Obtener información de la categoría
    const { data: categoria, error: categoriaError } = await supabase
      .from('lista_chequeo_categorias')
      .select('*')
      .eq('id', registroFinal.categoria_id)
      .single();

    if (categoriaError || !categoria) {
      throw new Error(`Categoría no encontrada: ${categoriaError?.message || 'ID de categoría no válido'}`);
    }

    console.log(`📂 Categoría encontrada: ${categoria.nombre} → ${categoria.hoja_excel}`);

    // 6. Obtener todas las respuestas para este registro (sin JOIN problemático)
    const { data: todasRespuestas, error: todasRespuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select('*')
      .eq('registro_id', registroId);

    if (todasRespuestasError) {
      console.warn('⚠️ Error obteniendo respuestas:', todasRespuestasError.message);
    }

    console.log(`📝 Respuestas encontradas: ${todasRespuestas?.length || 0}`);

    // 7. Obtener items maestros
    const { data: items, error: itemsError } = await supabase
      .from('lista_chequeo_items_maestros')
      .select('*')
      .eq('activo', true)
      .order('numero');

    if (itemsError) {
      console.warn('⚠️ Error obteniendo items:', itemsError.message);
    }

    console.log(`📋 Items encontrados: ${items?.length || 0}`);

    // 8. Aplicar mapeo automático de filas si es necesario
    if (items && items.length > 0) {
      let filaInicial = 12; // Fila inicial para items
      const itemsSinFila = items.filter((item: any) => !item.fila_excel);
      
      if (itemsSinFila.length > 0) {
        console.log(`🗺️ Aplicando mapeo automático para ${itemsSinFila.length} items sin fila_excel`);
        
        items.forEach((item: any, index: number) => {
          if (!item.fila_excel) {
            const fila_excel = filaInicial + index;
            item.fila_excel = fila_excel;
          }
        });
        
        console.log(`🗺️ Mapeo automático aplicado - Items con fila_excel: ${items.filter((i: any) => i.fila_excel).length}`);
      }
    }

    // 9. Obtener todas las categorías para mapear hojas
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

    // 10. Crear mapa general de respuestas por item_id
    const respuestasGeneralMap = new Map();
    todasRespuestas?.forEach((respuesta: any) => {
      respuestasGeneralMap.set(respuesta.item_id, respuesta);
      console.log(`📝 Respuesta mapeada: Item ${respuesta.item_id} = ${respuesta.respuesta}`);
    });

    // 11. Modificar todas las hojas con información del contrato y respuestas específicas
    let totalRespuestasAplicadas = 0;
    
    workbook.worksheets.forEach((worksheet, index) => {
      const nombreHoja = worksheet.name;
      console.log(`🔄 Procesando hoja ${index + 1}: ${nombreHoja}`);

      // Obtener la categoría correspondiente a esta hoja
      const categoriaHoja = categoriasPorHoja.get(nombreHoja);
      console.log(`📂 Categoría para hoja ${nombreHoja}:`, categoriaHoja?.nombre || 'No encontrada');

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

      // Filtrar respuestas específicas para esta categoría/hoja usando los items de la categoría
      const itemsDeEstaCategoria = items?.filter(item => item.categoria_id === categoriaHoja?.id) || [];
      const idsItemsDeEstaCategoria = itemsDeEstaCategoria.map(item => item.id);
      
      const respuestasParaHoja = todasRespuestas?.filter((resp: any) => {
        return idsItemsDeEstaCategoria.includes(resp.item_id);
      }) || [];

      console.log(`🎯 Respuestas para hoja ${nombreHoja}: ${respuestasParaHoja.length}`);

      // Aplicar respuestas solo para los items de esta categoría
      itemsDeEstaCategoria.forEach((item: any) => {
        const respuesta = respuestasGeneralMap.get(item.id);
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

          // Agregar observaciones si existen (columna F)
          if (respuesta.observaciones) {
            row.getCell('F').value = respuesta.observaciones;
            console.log(`✅ Agregadas observaciones en ${nombreHoja} fila ${fila} columna F: "${respuesta.observaciones}"`);
          }
          
          totalRespuestasAplicadas++;
        }
      });

      console.log(`✅ Hoja ${nombreHoja} procesada - ${respuestasParaHoja.length} respuestas aplicadas`);
    });

    console.log(`✅ Información del contrato y respuestas aplicadas - Total: ${totalRespuestasAplicadas} respuestas`);

    // 12. Generar archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const excelBuffer = Buffer.from(buffer);
    console.log(`✅ Excel generado (${excelBuffer.length} bytes)`);

    // 13. Retornar archivo
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
