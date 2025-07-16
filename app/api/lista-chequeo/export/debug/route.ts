// app/api/lista-chequeo/export/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getSupabaseClient from '@/lib/supabase-client';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  console.log('🔍 DIAGNÓSTICO DE EXPORTACIÓN EXCEL');
  
  try {
    const diagnostics: {
      timestamp: string;
      environment: string | undefined;
      platform: string;
      nodeVersion: string;
      cwd: string;
      supabaseConnection: boolean;
      excelJSVersion: string;
      templatePaths: string[];
      templateExists: Record<string, boolean | string>;
      permissions: Record<string, any>;
      error: string | null;
    } = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      cwd: process.cwd(),
      supabaseConnection: false,
      excelJSVersion: '',
      templatePaths: [],
      templateExists: {},
      permissions: {},
      error: null
    };

    // 1. Verificar conexión a Supabase
    try {
      const supabase = getSupabaseClient;
      const { data, error } = await supabase
        .from('lista_chequeo_categorias')
        .select('id, nombre')
        .limit(1);
      
      diagnostics.supabaseConnection = !error && data !== null;
      if (error && !diagnostics.error) {
        diagnostics.error = `Supabase Error: ${error.message}`;
      }
    } catch (error) {
      if (!diagnostics.error) {
        diagnostics.error = `Supabase Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    // 2. Verificar ExcelJS
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.addWorksheet('Test');
      const buffer = await workbook.xlsx.writeBuffer();
      diagnostics.excelJSVersion = 'Working - ' + Buffer.from(buffer).length + ' bytes';
    } catch (error) {
      if (!diagnostics.error) {
        diagnostics.error = `ExcelJS Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    // 3. Verificar rutas de plantillas
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx'),
      path.join(process.cwd(), 'public/document/lista-chequeo.xlsx'),
      './public/document/lista-chequeo.xlsx',
      '/tmp/lista-chequeo.xlsx'
    ];

    diagnostics.templatePaths = possiblePaths;

    for (const templatePath of possiblePaths) {
      try {
        const exists = fs.existsSync(templatePath);
        diagnostics.templateExists[templatePath] = exists;
        
        if (exists) {
          const stats = fs.statSync(templatePath);
          diagnostics.permissions[templatePath] = {
            size: stats.size,
            readable: fs.constants.R_OK,
            modified: stats.mtime
          };
        }
      } catch (error) {
        diagnostics.templateExists[templatePath] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    // 4. Verificar variables de entorno importantes
    const envVars = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      NETLIFY: !!process.env.NETLIFY
    };

    return NextResponse.json({
      status: 'success',
      diagnostics,
      envVars,
      message: 'Diagnóstico completado'
    }, { status: 200 });

  } catch (error) {
    console.error('🚨 Error en diagnóstico:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      message: 'Error durante el diagnóstico'
    }, { status: 500 });
  }
}
