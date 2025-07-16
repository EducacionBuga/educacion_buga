// app/api/lista-chequeo/export/diagnostics/template/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

/**
 * Endpoint de diagnóstico para verificar la disponibilidad de la plantilla
 */
export async function GET(request: NextRequest) {
  console.log('🔍 DIAGNÓSTICO DE PLANTILLA - INICIANDO');

  try {
    // 1. Verificar rutas posibles para la plantilla
    const templatePaths = [
      path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx'),
      path.join(process.cwd(), 'public/document/lista-chequeo.xlsx'),
      path.resolve('./public/document/lista-chequeo.xlsx'),
      path.resolve('public/document/lista-chequeo.xlsx')
    ];

    const diagnostics: any = {
      environment: process.env.NODE_ENV,
      currentWorkingDirectory: process.cwd(),
      timestamp: new Date().toISOString(),
      templatePaths: [],
      directoryStructure: {},
      templateFound: false,
      templatePath: null,
      templateSize: null,
      templateModified: null,
      recommendations: []
    };

    // 2. Verificar cada ruta
    for (const templatePath of templatePaths) {
      const pathInfo: any = {
        path: templatePath,
        exists: false,
        accessible: false,
        size: null,
        modified: null,
        error: null
      };

      try {
        if (fs.existsSync(templatePath)) {
          pathInfo.exists = true;
          const stats = fs.statSync(templatePath);
          pathInfo.accessible = true;
          pathInfo.size = stats.size;
          pathInfo.modified = stats.mtime.toISOString();
          
          if (!diagnostics.templateFound) {
            diagnostics.templateFound = true;
            diagnostics.templatePath = templatePath;
            diagnostics.templateSize = stats.size;
            diagnostics.templateModified = stats.mtime.toISOString();
          }
        }
      } catch (error) {
        pathInfo.error = error instanceof Error ? error.message : 'Error desconocido';
      }

      diagnostics.templatePaths.push(pathInfo);
    }

    // 3. Verificar estructura de directorios
    try {
      diagnostics.directoryStructure = {
        publicExists: fs.existsSync('public'),
        publicDocumentExists: fs.existsSync('public/document'),
        publicFiles: fs.existsSync('public') ? fs.readdirSync('public') : [],
        documentFiles: fs.existsSync('public/document') ? fs.readdirSync('public/document') : []
      };
    } catch (error) {
      diagnostics.directoryStructure = {
        error: error instanceof Error ? error.message : 'Error leyendo directorios'
      };
    }

    // 4. Generar recomendaciones
    if (!diagnostics.templateFound) {
      diagnostics.recommendations.push('La plantilla lista-chequeo.xlsx no se encuentra en ninguna ubicación');
      diagnostics.recommendations.push('Verificar que el archivo esté en public/document/lista-chequeo.xlsx');
      diagnostics.recommendations.push('En producción, verificar que los archivos estáticos se estén desplegando correctamente');
    } else {
      diagnostics.recommendations.push(`Plantilla encontrada en: ${diagnostics.templatePath}`);
      diagnostics.recommendations.push(`Tamaño: ${diagnostics.templateSize} bytes`);
      
      if (diagnostics.templateSize && diagnostics.templateSize < 10000) {
        diagnostics.recommendations.push('⚠️ El archivo parece muy pequeño, verificar si está corrupto');
      } else if (diagnostics.templateSize && diagnostics.templateSize > 100000) {
        diagnostics.recommendations.push('⚠️ El archivo parece muy grande, verificar contenido');
      } else {
        diagnostics.recommendations.push('✅ Tamaño del archivo parece correcto');
      }
    }

    // 5. Verificar dependencias
    const dependenciesInfo: any = {};
    try {
      const ExcelJS = (await import('exceljs')).default;
      dependenciesInfo.exceljs = 'disponible';
    } catch (error) {
      dependenciesInfo.exceljs = 'error: ' + (error instanceof Error ? error.message : 'desconocido');
    }

    // 6. Prueba de carga de plantilla si se encuentra
    let loadTest = null;
    if (diagnostics.templateFound && diagnostics.templatePath) {
      try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(diagnostics.templatePath);
        
        const worksheetNames = workbook.worksheets.map(ws => ws.name);
        loadTest = {
          success: true,
          worksheetCount: workbook.worksheets.length,
          worksheetNames: worksheetNames,
          message: 'Plantilla cargada exitosamente'
        };
      } catch (error) {
        loadTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          message: 'Error al cargar la plantilla'
        };
      }
    }

    const result = {
      ...diagnostics,
      dependencies: dependenciesInfo,
      loadTest: loadTest
    };

    console.log('✅ DIAGNÓSTICO COMPLETADO:', JSON.stringify(result, null, 2));

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Diagnostic-Version': '1.0',
        'X-Timestamp': new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ ERROR EN DIAGNÓSTICO:', error);
    return NextResponse.json({
      error: 'Error en diagnóstico',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
