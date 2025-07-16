// app/api/lista-chequeo/test-registros/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClientForProduction } from '@/lib/supabase-client-production';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClientForProduction();
    
    const { data: registros, error } = await supabase
      .from('lista_chequeo_registros')
      .select('id, numero_contrato, contratista')
      .limit(5);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      count: registros?.length || 0,
      registros: registros || []
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
