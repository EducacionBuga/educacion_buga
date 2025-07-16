// app/api/lista-chequeo/export/prod-simple/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint ultra-simplificado para producción
 * Garantiza que funcione en cualquier entorno
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  console.log('🚀 EXPORTACIÓN EXCEL SIMPLE PRODUCCIÓN');
  
  try {
    const { registroId } = await params;
    console.log('📋 Registro ID:', registroId);

    // Importar ExcelJS dinámicamente
    const ExcelJS = (await import('exceljs')).default;
    
    // Importar Supabase dinámicamente
    const { createClient } = await import('@supabase/supabase-js');
    
    // Variables de entorno (múltiples opciones para máxima compatibilidad)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                       process.env.SUPABASE_URL ||
                       process.env.PUBLIC_SUPABASE_URL;
                       
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.SUPABASE_ANON_KEY ||
                       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                       process.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables de entorno faltantes');
      return NextResponse.json({
        error: 'Configuración de base de datos incompleta',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        env: process.env.NODE_ENV
      }, { status: 500 });
    }

    // Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Obtener datos básicos del registro
    const { data: registro, error: registroError } = await supabase
      .from('lista_chequeo_registros')
      .select('id, numero_contrato, contratista, valor_contrato, objeto')
      .eq('id', registroId)
      .single();
      
    if (registroError || !registro) {
      console.error('❌ Registro no encontrado:', registroError);
      return NextResponse.json({
        error: 'Registro no encontrado',
        registroId,
        details: registroError?.message
      }, { status: 404 });
    }

    console.log('✅ Registro encontrado:', registro.numero_contrato);

    // Crear Excel básico pero completo
    const workbook = new ExcelJS.Workbook();
    
    // Hoja principal con información del contrato
    const mainSheet = workbook.addWorksheet('Lista de Chequeo');
    
    // Encabezado principal
    mainSheet.getCell('A1').value = 'LISTA DE CHEQUEO CONTRACTUAL';
    mainSheet.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FF000080' } };
    mainSheet.getCell('A1').alignment = { horizontal: 'center' };
    mainSheet.mergeCells('A1:F1');
    
    // Información del contrato
    mainSheet.getCell('A3').value = 'INFORMACIÓN DEL CONTRATO:';
    mainSheet.getCell('A3').font = { bold: true, size: 14 };
    
    mainSheet.getCell('A5').value = 'Número de Contrato:';
    mainSheet.getCell('B5').value = registro.numero_contrato || 'N/A';
    mainSheet.getCell('A6').value = 'Contratista:';
    mainSheet.getCell('B6').value = registro.contratista || 'N/A';
    mainSheet.getCell('A7').value = 'Valor del Contrato:';
    mainSheet.getCell('B7').value = `$${registro.valor_contrato || 0}`;
    mainSheet.getCell('A8').value = 'Objeto:';
    mainSheet.getCell('B8').value = registro.objeto || 'Sin especificar';
    mainSheet.getCell('A9').value = 'Fecha de Exportación:';
    mainSheet.getCell('B9').value = new Date().toLocaleDateString();
    
    // Estilo para las etiquetas
    ['A5', 'A6', 'A7', 'A8', 'A9'].forEach(cell => {
      mainSheet.getCell(cell).font = { bold: true };
      mainSheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Obtener y mostrar respuestas si existen
    try {
      const { data: respuestas } = await supabase
        .from('lista_chequeo_respuestas')
        .select(`
          *,
          item:lista_chequeo_items_maestros(titulo, texto, numero)
        `)
        .eq('registro_id', registroId);

      if (respuestas && respuestas.length > 0) {
        // Tabla de respuestas
        mainSheet.getCell('A11').value = 'RESPUESTAS REGISTRADAS:';
        mainSheet.getCell('A11').font = { bold: true, size: 14 };
        
        // Encabezados de tabla
        mainSheet.getCell('A13').value = 'No.';
        mainSheet.getCell('B13').value = 'Pregunta';
        mainSheet.getCell('C13').value = 'Respuesta';
        mainSheet.getCell('D13').value = 'Observaciones';
        
        ['A13', 'B13', 'C13', 'D13'].forEach(cell => {
          mainSheet.getCell(cell).font = { bold: true };
          mainSheet.getCell(cell).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
          };
          mainSheet.getCell(cell).font.color = { argb: 'FFFFFFFF' };
        });
        
        // Llenar respuestas
        respuestas.forEach((resp: any, index: number) => {
          const fila = 14 + index;
          mainSheet.getCell(`A${fila}`).value = index + 1;
          mainSheet.getCell(`B${fila}`).value = resp.item?.titulo || resp.item?.texto || 'Sin pregunta';
          mainSheet.getCell(`C${fila}`).value = resp.respuesta || 'Sin respuesta';
          mainSheet.getCell(`D${fila}`).value = resp.observaciones || '';
        });
        
        console.log(`✅ ${respuestas.length} respuestas incluidas`);
      } else {
        mainSheet.getCell('A11').value = 'No hay respuestas registradas para este contrato.';
        mainSheet.getCell('A11').font = { italic: true, color: { argb: 'FF666666' } };
      }
    } catch (respError) {
      console.warn('⚠️ Error obteniendo respuestas:', respError);
      mainSheet.getCell('A11').value = 'Error al cargar respuestas.';
    }
    
    // Ajustar columnas
    mainSheet.getColumn('A').width = 20;
    mainSheet.getColumn('B').width = 40;
    mainSheet.getColumn('C').width = 15;
    mainSheet.getColumn('D').width = 30;
    
    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const bufferArray = Buffer.from(buffer);
    
    const filename = `Lista_Chequeo_${registro.numero_contrato || 'Contrato'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    console.log('✅ Excel generado exitosamente para producción:', filename);
    
    return new NextResponse(bufferArray, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': bufferArray.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('🚨 Error crítico en exportación simple:', error);
    
    return NextResponse.json({
      error: 'Error crítico en exportación',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
