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
            readable: fs.constants.R_OK
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
    const modules = ['exceljs', '@supabase/supabase-js', 'path', 'fs'];
    for (const moduleName of modules) {
      try {
        await import(moduleName);
        diagnostics.moduleChecks[moduleName] = { available: true };
      } catch (error) {
        diagnostics.moduleChecks[moduleName] = {
          available: false,
          error: error instanceof Error ? error.message : 'Import error'
        };
      }
    }

    // 3. Verificar servicios propios
    const services = [
      '@/lib/excel-export-service',
      '@/lib/supabase-client-production'
    ];
    
    for (const serviceName of services) {
      try {
        await import(serviceName);
        diagnostics.moduleChecks[serviceName] = { available: true };
      } catch (error) {
        diagnostics.moduleChecks[serviceName] = {
          available: false,
          error: error instanceof Error ? error.message : 'Import error'
        };
      }
    }

    // 4. Verificar variables de entorno
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_ANON_KEY',
      'NODE_ENV'
    ];

    diagnostics.environment = {};
    for (const envVar of envVars) {
      const value = process.env[envVar];
      if (value) {
        diagnostics.environment[envVar] = {
          exists: true,
          length: value.length,
          preview: value.substring(0, 20) + '...'
        };
      } else {
        diagnostics.environment[envVar] = { exists: false };
      }
    }

    // 5. Verificar estructura de directorios
    const directories = [
      'public',
      'public/document',
      'lib',
      'app/api',
      'app/api/lista-chequeo',
      'app/api/lista-chequeo/export'
    ];

    for (const dir of directories) {
      const fullPath = path.join(process.cwd(), dir);
      try {
        const exists = fs.existsSync(fullPath);
        if (exists) {
          const stats = fs.statSync(fullPath);
          diagnostics.pathChecks[dir] = {
            exists: true,
            isDirectory: stats.isDirectory(),
            fullPath
          };
        } else {
          diagnostics.pathChecks[dir] = {
            exists: false,
            fullPath
          };
        }
      } catch (error) {
        diagnostics.pathChecks[dir] = {
          error: error instanceof Error ? error.message : 'Error checking directory',
          fullPath
        };
      }
    }

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
