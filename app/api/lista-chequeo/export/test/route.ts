// app/api/lista-chequeo/export/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  console.log('🧪 PRUEBA RÁPIDA DE EXPORTACIÓN EXCEL');
  
  try {
    // 1. Verificar variables de entorno
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      return NextResponse.json({
        success: false,
        error: 'Variables de entorno faltantes',
        details: {
          NEXT_PUBLIC_SUPABASE_URL: !!url,
          SUPABASE_SERVICE_ROLE_KEY: !!key
        }
      }, { status: 500 });
    }

    // 2. Probar cliente Supabase
    const supabase = createClient(url, key);
    
    // 3. Probar conexión a BD
    const { data: categorias, error: categoriaError } = await supabase
      .from('lista_chequeo_categorias')
      .select('id, nombre')
      .limit(2);
      
    if (categoriaError) {
      return NextResponse.json({
        success: false,
        error: 'Error de conexión a base de datos',
        details: categoriaError
      }, { status: 503 });
    }

    // 4. Buscar un registro existente
    const { data: registros, error: registroError } = await supabase
      .from('lista_chequeo_registros')
      .select('id, numero_contrato, contratista')
      .limit(1);
      
    if (registroError) {
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo registros',
        details: registroError
      }, { status: 500 });
    }

    // 5. Probar ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test');
    
    worksheet.getCell('A1').value = 'PRUEBA DE EXCEL';
    worksheet.getCell('A1').font = { bold: true };
    worksheet.getCell('A2').value = 'Fecha: ' + new Date().toISOString();
    worksheet.getCell('A3').value = 'Categorías encontradas: ' + (categorias?.length || 0);
    worksheet.getCell('A4').value = 'Registros encontrados: ' + (registros?.length || 0);
    
    if (registros && registros.length > 0) {
      worksheet.getCell('A5').value = 'Primer registro: ' + registros[0].numero_contrato;
      worksheet.getCell('A6').value = 'ID del registro: ' + registros[0].id;
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    const bufferArray = Buffer.from(buffer);

    // 6. Retornar archivo de prueba
    return new NextResponse(bufferArray, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="test-export.xlsx"',
        'Content-Length': bufferArray.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Error en prueba de exportación:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error crítico',
      details: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
