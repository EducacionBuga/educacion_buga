// app/api/lista-chequeo/inspect-template/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para inspeccionar la plantilla y encontrar las filas donde están los documentos
 */
export async function GET(request: NextRequest) {
  try {
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

    const result: any = {};

    // 3. Inspeccionar cada hoja
    workbook.worksheets.forEach((worksheet, index) => {
      console.log(`🔍 Inspeccionando hoja ${index + 1}: ${worksheet.name}`);
      const sheetData: any[] = [];
      
      // Buscar filas que contienen documentos (típicamente en columna B)
      for (let row = 1; row <= 400; row++) {
        const cellB = worksheet.getCell(`B${row}`);
        const cellA = worksheet.getCell(`A${row}`);
        const cellC = worksheet.getCell(`C${row}`);
        const cellD = worksheet.getCell(`D${row}`);
        const cellE = worksheet.getCell(`E${row}`);
        
        // Si la columna B tiene contenido que parece un documento
        if (cellB.value && typeof cellB.value === 'string') {
          const texto = cellB.value.toString().toLowerCase();
          if (texto.includes('ficha') || 
              texto.includes('certificado') || 
              texto.includes('documento') ||
              texto.includes('formulario') ||
              texto.includes('declaración') ||
              texto.includes('rut') ||
              texto.includes('hoja') ||
              texto.includes('fotocopia') ||
              texto.includes('propuesta') ||
              texto.includes('estudio') ||
              texto.includes('invitación') ||
              texto.includes('tarjeta') ||
              texto.includes('rethus')) {
            sheetData.push({
              fila: row,
              numero: cellA.value,
              documento: cellB.value,
              cumple: cellC.value,
              no_cumple: cellD.value,
              no_aplica: cellE.value
            });
          }
        }
      }
      
      result[worksheet.name] = sheetData;
    });

    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ ERROR INSPECCIONANDO PLANTILLA:', error);
    return NextResponse.json({
      error: 'Error inspeccionando plantilla',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
