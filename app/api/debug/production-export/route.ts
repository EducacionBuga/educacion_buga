// app/api/debug/production-export/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de diagnóstico específico para problemas de exportación en producción
 */
export async function GET(request: NextRequest) {
  console.log('🔍 DIAGNÓSTICO DE EXPORTACIÓN EN PRODUCCIÓN');
  
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hostname: 'server-side',
    checks: {}
  };

  // 1. Verificar variables de entorno
  console.log('🔧 Verificando variables de entorno...');
  const envVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NODE_ENV'
  ];

  diagnostics.checks.environment = {};
  for (const envVar of envVars) {
    const value = process.env[envVar];
    diagnostics.checks.environment[envVar] = {
      exists: !!value,
      length: value?.length || 0,
      preview: value ? value.substring(0, 20) + '...' : null
    };
  }

  // 2. Verificar importaciones
  console.log('📦 Verificando importaciones...');
  diagnostics.checks.imports = {};
  
  try {
    await import('@supabase/supabase-js');
    diagnostics.checks.imports.supabase = { success: true };
  } catch (error) {
    diagnostics.checks.imports.supabase = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Import error' 
    };
  }

  try {
    await import('exceljs');
    diagnostics.checks.imports.exceljs = { success: true };
  } catch (error) {
    diagnostics.checks.imports.exceljs = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Import error' 
    };
  }

  // 3. Verificar conexión a Supabase
  console.log('🔗 Verificando conexión a Supabase...');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data, error } = await supabase
        .from('lista_chequeo_categorias')
        .select('id')
        .limit(1);

      diagnostics.checks.supabase = {
        connection: !error,
        error: error?.message,
        dataReceived: !!data
      };
    } else {
      diagnostics.checks.supabase = {
        connection: false,
        error: 'Variables de entorno faltantes'
      };
    }
  } catch (supabaseError) {
    diagnostics.checks.supabase = {
      connection: false,
      error: supabaseError instanceof Error ? supabaseError.message : 'Connection error'
    };
  }

  // 4. Verificar generación de Excel básico
  console.log('📊 Verificando generación de Excel...');
  try {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test');
    worksheet.getCell('A1').value = 'Test de funcionalidad';
    const buffer = await workbook.xlsx.writeBuffer();
    
    diagnostics.checks.excel = {
      generation: true,
      bufferSize: Buffer.byteLength(buffer)
    };
  } catch (excelError) {
    diagnostics.checks.excel = {
      generation: false,
      error: excelError instanceof Error ? excelError.message : 'Excel error'
    };
  }

  // 5. Verificar registros disponibles
  console.log('📋 Verificando registros...');
  try {
    if (diagnostics.checks.supabase?.connection) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl!, supabaseKey!);

      const { data: registros, error } = await supabase
        .from('lista_chequeo_registros')
        .select('id, numero_contrato')
        .limit(3);

      diagnostics.checks.registros = {
        available: !error && !!registros,
        count: registros?.length || 0,
        sample: registros?.map(r => ({ id: r.id, contrato: r.numero_contrato })) || [],
        error: error?.message
      };
    } else {
      diagnostics.checks.registros = {
        available: false,
        error: 'No hay conexión a Supabase'
      };
    }
  } catch (registrosError) {
    diagnostics.checks.registros = {
      available: false,
      error: registrosError instanceof Error ? registrosError.message : 'Registros error'
    };
  }

  // 6. Resumen de problemas
  const problems = [];
  if (!diagnostics.checks.environment.NEXT_PUBLIC_SUPABASE_URL?.exists) {
    problems.push('Variable NEXT_PUBLIC_SUPABASE_URL faltante');
  }
  if (!diagnostics.checks.environment.SUPABASE_SERVICE_ROLE_KEY?.exists && 
      !diagnostics.checks.environment.SUPABASE_ANON_KEY?.exists) {
    problems.push('Variables de clave Supabase faltantes');
  }
  if (!diagnostics.checks.imports.supabase?.success) {
    problems.push('Error importando Supabase');
  }
  if (!diagnostics.checks.imports.exceljs?.success) {
    problems.push('Error importando ExcelJS');
  }
  if (!diagnostics.checks.supabase?.connection) {
    problems.push('Sin conexión a Supabase');
  }
  if (!diagnostics.checks.excel?.generation) {
    problems.push('Error generando Excel');
  }

  diagnostics.summary = {
    allGood: problems.length === 0,
    problemCount: problems.length,
    problems,
    recommendation: problems.length === 0 ? 
      'Todo funciona correctamente' : 
      'Revisar problemas listados arriba'
  };

  console.log('📋 Diagnóstico completado:', diagnostics.summary);

  return NextResponse.json({
    status: 'completed',
    diagnostics
  }, { status: 200 });
}
