// app/api/lista-chequeo/export/production-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClientForProduction } from '@/lib/supabase-client-production';

export async function GET(request: NextRequest) {
  console.log('🚀 PRUEBA ESPECÍFICA PARA PRODUCCIÓN');
  
  try {
    // 1. Crear cliente usando la función optimizada
    const supabase = createSupabaseClientForProduction();
    
    // 2. Hacer una consulta simple
    const { data: test, error } = await supabase
      .from('lista_chequeo_categorias')
      .select('id, nombre')
      .limit(1);
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Error de conexión a la base de datos',
        error: error.message,
        code: error.code,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // 3. Buscar cualquier registro
    const { data: registro, error: regError } = await supabase
      .from('lista_chequeo_registros')
      .select('id, numero_contrato')
      .limit(1);
      
    if (regError) {
      return NextResponse.json({
        status: 'partial_success',
        message: 'Conectado a BD pero error con registros',
        categorias: test,
        error: regError.message,
        environment: process.env.NODE_ENV
      });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Conexión exitosa a Supabase en producción',
      data: {
        categorias: test?.length || 0,
        registros: registro?.length || 0,
        primerRegistro: registro?.[0]?.id || 'ninguno'
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error crítico en prueba de producción:', error);
    
    return NextResponse.json({
      status: 'critical_error',
      message: 'Error crítico al conectar con la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      variables: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
