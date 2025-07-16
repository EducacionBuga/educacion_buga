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

    // 5. Modificar la primera hoja con información básica
    const firstWorksheet = workbook.worksheets[0];
    if (firstWorksheet) {
      // Buscar y reemplazar información del contrato
      firstWorksheet.eachRow((row, rowNumber) => {
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
      console.log('✅ Información del contrato aplicada');
    }

    // 6. Generar archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const excelBuffer = Buffer.from(buffer);
    console.log(`✅ Excel generado (${excelBuffer.length} bytes)`);

    // 7. Retornar archivo
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
