// app/api/lista-chequeo/export/diagnostics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  console.log('🔍 DIAGNÓSTICO DE EXPORTACIÓN EXCEL');
  
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
      workingDirectory: process.cwd(),
      templateChecks: {},
      moduleChecks: {},
      pathChecks: {}
    };

    // 1. Verificar la plantilla Excel
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx'),
      path.join(process.cwd(), 'public/document/lista-chequeo.xlsx'),
      './public/document/lista-chequeo.xlsx',
      '/tmp/lista-chequeo.xlsx'
    ];

    for (const templatePath of possiblePaths) {
      try {
        const exists = fs.existsSync(templatePath);
        if (exists) {
          const stats = fs.statSync(templatePath);
          diagnostics.templateChecks[templatePath] = {
            exists: true,
            size: stats.size,
            modified: stats.mtime,
            readable: true
          };
        } else {
          diagnostics.templateChecks[templatePath] = {
            exists: false
          };
        }
      } catch (error) {
        diagnostics.templateChecks[templatePath] = {
          error: error instanceof Error ? error.message : 'Error checking path'
        };
      }
    }

    // 2. Verificar módulos de Node.js
    const moduleChecks: Record<string, any> = {};
    
    // Verificar exceljs
    try {
      await import('exceljs');
      moduleChecks['exceljs'] = { available: true };
    } catch (error) {
      moduleChecks['exceljs'] = {
        available: false,
        error: error instanceof Error ? error.message : 'Import error'
      };
    }
    
    // Verificar @supabase/supabase-js
    try {
      await import('@supabase/supabase-js');
      moduleChecks['@supabase/supabase-js'] = { available: true };
    } catch (error) {
      moduleChecks['@supabase/supabase-js'] = {
        available: false,
        error: error instanceof Error ? error.message : 'Import error'
      };
    }
    
    // Módulos nativos siempre disponibles
    moduleChecks['path'] = { available: true, native: true };
    moduleChecks['fs'] = { available: true, native: true };
    
    diagnostics.moduleChecks = moduleChecks;

    // 3. Verificar servicios propios
    try {
      await import('@/lib/excel-export-service');
      diagnostics.moduleChecks['@/lib/excel-export-service'] = { available: true };
    } catch (error) {
      diagnostics.moduleChecks['@/lib/excel-export-service'] = {
        available: false,
        error: error instanceof Error ? error.message : 'Import error'
      };
    }
    
    try {
      await import('@/lib/supabase-client');
      diagnostics.moduleChecks['@/lib/supabase-client'] = { available: true };
    } catch (error) {
      diagnostics.moduleChecks['@/lib/supabase-client'] = {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 4. Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const nodeEnv = process.env.NODE_ENV;

    diagnostics.environment = {
      'NEXT_PUBLIC_SUPABASE_URL': supabaseUrl ? {
        exists: true,
        length: supabaseUrl.length,
        preview: supabaseUrl.substring(0, 20) + '...'
      } : { exists: false },
      'SUPABASE_SERVICE_ROLE_KEY': serviceKey ? {
        exists: true,
        length: serviceKey.length,
        preview: serviceKey.substring(0, 20) + '...'
      } : { exists: false },
      'SUPABASE_ANON_KEY': anonKey ? {
        exists: true,
        length: anonKey.length,
        preview: anonKey.substring(0, 20) + '...'
      } : { exists: false },
      'NODE_ENV': nodeEnv ? {
        exists: true,
        value: nodeEnv
      } : { exists: false }
    };

    // 5. Verificar estructura de directorios
    const checkDirectory = (dir: string) => {
      const fullPath = path.join(process.cwd(), dir);
      try {
        const exists = fs.existsSync(fullPath);
        if (exists) {
          const stats = fs.statSync(fullPath);
          return {
            exists: true,
            isDirectory: stats.isDirectory(),
            fullPath
          };
        } else {
          return {
            exists: false,
            fullPath
          };
        }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Error checking directory',
          fullPath
        };
      }
    };

    diagnostics.pathChecks = {
      'public': checkDirectory('public'),
      'public/document': checkDirectory('public/document'),
      'lib': checkDirectory('lib'),
      'app/api': checkDirectory('app/api'),
      'app/api/lista-chequeo': checkDirectory('app/api/lista-chequeo'),
      'app/api/lista-chequeo/export': checkDirectory('app/api/lista-chequeo/export')
    };

    // 6. Intentar cargar ExcelJS y verificar la plantilla
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      
      // Intentar cargar la plantilla
      const templatePath = path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx');
      await workbook.xlsx.readFile(templatePath);
      
      const worksheetNames = workbook.worksheets.map(ws => ws.name);
      
      diagnostics.templateTest = {
        success: true,
        worksheets: worksheetNames,
        templatePath
      };
    } catch (templateError) {
      diagnostics.templateTest = {
        success: false,
        error: templateError instanceof Error ? templateError.message : 'Template test failed'
      };
    }

    return NextResponse.json({
      status: 'success',
      message: 'Diagnóstico completado',
      diagnostics
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Error en diagnóstico',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
