// app/api/lista-chequeo/export/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ExcelExportService from '@/lib/excel-export-service';

// Crear cliente Supabase
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { registroId } = await params;

    // Obtener datos del registro con información de categoría
    const { data: registro, error: registroError } = await supabase
      .from('lista_chequeo_registros')
      .select(`
        *,
        categoria:lista_chequeo_categorias(nombre)
      `)
      .eq('id', registroId)
      .single();

    if (registroError || !registro) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todas las respuestas del registro con información de ítems
    const { data: respuestas, error: respuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select(`
        *,
        item:lista_chequeo_items_maestros(
          numero,
          texto,
          orden
        )
      `)
      .eq('registro_id', registroId);

    if (respuestasError) {
      return NextResponse.json(
        { error: 'Error al obtener respuestas' },
        { status: 500 }
      );
    }

    // Obtener todos los ítems de la categoría para incluir los no respondidos
    const { data: todosLosItems, error: itemsError } = await supabase
      .from('lista_chequeo_items_maestros')
      .select('*')
      .eq('categoria_id', registro.categoria_id)
      .order('orden');

    if (itemsError) {
      return NextResponse.json(
        { error: 'Error al obtener ítems' },
        { status: 500 }
      );
    }

    // Crear mapa de respuestas por item_id
    const respuestasMap = new Map();
    respuestas?.forEach((resp: any) => {
      respuestasMap.set(resp.item_id, resp);
    });

    // Combinar todos los ítems con sus respuestas (o null si no hay respuesta)
    const respuestasCompletas = todosLosItems.map((item: any) => {
      const respuesta = respuestasMap.get(item.id);
      return {
        item_id: item.id,
        numero: item.numero,
        orden: item.orden,
        respuesta: respuesta?.respuesta || null,
        observaciones: respuesta?.observaciones || ''
      };
    });

    // Preparar datos para exportación
    const datosExport = ExcelExportService.convertirDatosDB(
      {
        ...registro,
        categoria_nombre: (registro as any).categoria?.nombre
      },
      respuestasCompletas
    );

    // Generar Excel
    const buffer = await ExcelExportService.exportarContrato(datosExport);

    // Generar nombre del archivo
    const nombreArchivo = ExcelExportService.generarNombreArchivo(
      registro.numero_contrato,
      (registro as any).categoria?.nombre || 'CONTRATO'
    );

    // Retornar archivo
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error en exportación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
