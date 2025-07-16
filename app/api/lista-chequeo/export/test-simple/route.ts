// app/api/lista-chequeo/export/test-simple/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de prueba simple para verificar que la exportación básica funciona
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 TEST SIMPLE - Verificando funcionalidad básica');
    
    // Verificar que podemos crear un Excel básico
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test');
    
    worksheet.getCell('A1').value = 'PRUEBA DE FUNCIONALIDAD EXCEL';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    
    worksheet.getCell('A3').value = 'Sistema: Funcional ✅';
    worksheet.getCell('A4').value = 'Plantilla: Disponible ✅';
    worksheet.getCell('A5').value = 'Fecha: ' + new Date().toLocaleDateString();
    
    const buffer = await workbook.xlsx.writeBuffer();
    const bufferArray = Buffer.from(buffer);
    
    console.log('✅ Test simple completado exitosamente');
    
    return new NextResponse(bufferArray, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Test_Sistema_Excel.xlsx"',
        'Content-Length': bufferArray.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('❌ Error en test simple:', error);
    return NextResponse.json({
      error: 'Error en test simple',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
