// app/api/lista-chequeo/registros-validos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClientForProduction } from '@/lib/supabase-client-production';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClientForProduction();
    
    const { data: registros, error } = await supabase
      .from('lista_chequeo_registros')
      .select(`
        id,
        numero_contrato,
        contratista,
        valor_contrato,
        objeto,
        created_at,
        categoria:lista_chequeo_categorias(nombre)
      `)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (error) {
      console.error('❌ Error obteniendo registros:', error);
      return NextResponse.json({ 
        error: 'Error obteniendo registros',
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      count: registros?.length || 0,
      registros: registros?.map(reg => ({
        id: reg.id,
        numero_contrato: reg.numero_contrato,
        contratista: reg.contratista,
        valor_contrato: reg.valor_contrato,
        categoria: (reg.categoria as any)?.nombre || 'Sin categoría',
        exportUrl: `/api/lista-chequeo/export/${reg.id}`
      })) || []
    });
    
  } catch (error) {
    console.error('❌ Error crítico:', error);
    return NextResponse.json({
      error: 'Error crítico del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
