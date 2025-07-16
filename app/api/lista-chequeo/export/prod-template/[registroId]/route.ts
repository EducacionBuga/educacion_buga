// app/api/lista-chequeo/export/prod-template/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

/**
 * Endpoint específico para producción que garantiza el uso de la plantilla
 * Maneja mejor los archivos estáticos en entornos de producción
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  const startTime = Date.now();
  console.log('🔄 EXPORTACIÓN EXCEL PRODUCCIÓN CON PLANTILLA - INICIANDO');
  
  try {
    const { registroId } = await params;
    console.log('📋 Registro ID:', registroId);

    if (!registroId || registroId.length < 10) {
      return NextResponse.json({
        error: 'ID de registro inválido',
        details: 'El ID debe tener al menos 10 caracteres'
      }, { status: 400 });
    }

    // 1. Verificar que la plantilla existe antes de proceder
    const templatePaths = [
      path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx'),
      path.join(process.cwd(), 'public/document/lista-chequeo.xlsx'),
      path.resolve('./public/document/lista-chequeo.xlsx'),
      path.resolve('public/document/lista-chequeo.xlsx')
    ];

    let templatePath = '';
    let templateExists = false;

    for (const pathToTry of templatePaths) {
      try {
        console.log(`📁 Verificando plantilla en: ${pathToTry}`);
        if (fs.existsSync(pathToTry)) {
          const stats = fs.statSync(pathToTry);
          console.log(`✅ Plantilla encontrada: ${pathToTry} (${stats.size} bytes)`);
          templatePath = pathToTry;
          templateExists = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Error verificando ruta: ${pathToTry}`, error);
      }
    }

    if (!templateExists) {
      console.error('❌ PLANTILLA NO ENCONTRADA en ninguna ubicación');
      console.log('📁 Rutas verificadas:', templatePaths);
      console.log('📁 Directorio actual:', process.cwd());
      console.log('📁 Contenido de public:', fs.existsSync('public') ? fs.readdirSync('public') : 'No existe');
      
      return NextResponse.json({
        error: 'Plantilla Excel no encontrada',
        details: 'La plantilla lista-chequeo.xlsx no se encuentra en el servidor',
        checkedPaths: templatePaths,
        currentDir: process.cwd()
      }, { status: 500 });
    }

    // 2. Importar dependencias
    let createClient, ExcelJS, ExcelExportService;
    
    try {
      const supabaseModule = await import('@supabase/supabase-js');
      createClient = supabaseModule.createClient;
      console.log('✅ Supabase importado');
    } catch (error) {
      console.error('❌ Error importando Supabase:', error);
      return NextResponse.json({
        error: 'Error importando Supabase',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, { status: 500 });
    }

    try {
      ExcelJS = (await import('exceljs')).default;
      console.log('✅ ExcelJS importado');
    } catch (error) {
      console.error('❌ Error importando ExcelJS:', error);
      return NextResponse.json({
        error: 'Error importando ExcelJS',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, { status: 500 });
    }

    try {
      const excelModule = await import('@/lib/excel-export-service');
      ExcelExportService = excelModule.default;
      console.log('✅ Servicio Excel importado');
    } catch (error) {
      console.error('❌ Error importando servicio Excel:', error);
      return NextResponse.json({
        error: 'Error importando servicio Excel',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, { status: 500 });
    }

    // 3. Configurar cliente Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Configuración de base de datos incompleta',
        details: 'Variables de entorno de Supabase no configuradas'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Obtener datos del registro
    console.log('📊 Obteniendo datos del registro...');
    const { data: registro, error: registroError } = await supabase
      .from('checklist_registros')
      .select('*')
      .eq('id', registroId)
      .single();

    if (registroError || !registro) {
      console.error('❌ Error obteniendo registro:', registroError);
      return NextResponse.json({
        error: 'Registro no encontrado',
        details: registroError?.message || 'El registro no existe'
      }, { status: 404 });
    }

    // 5. Obtener categoría
    const { data: categoria, error: categoriaError } = await supabase
      .from('checklist_categorias')
      .select('*')
      .eq('id', registro.categoria_id)
      .single();

    if (categoriaError || !categoria) {
      console.error('❌ Error obteniendo categoría:', categoriaError);
      return NextResponse.json({
        error: 'Categoría no encontrada',
        details: categoriaError?.message || 'La categoría no existe'
      }, { status: 404 });
    }

    // 6. Obtener items y respuestas
    const { data: items, error: itemsError } = await supabase
      .from('checklist_items')
      .select(`
        *,
        checklist_etapas(nombre)
      `)
      .eq('categoria_id', categoria.id)
      .order('numero_item');

    if (itemsError) {
      console.error('❌ Error obteniendo items:', itemsError);
      return NextResponse.json({
        error: 'Error obteniendo items',
        details: itemsError.message
      }, { status: 500 });
    }

    const { data: respuestas, error: respuestasError } = await supabase
      .from('checklist_respuestas')
      .select('*')
      .eq('registro_id', registroId);

    if (respuestasError) {
      console.error('❌ Error obteniendo respuestas:', respuestasError);
      return NextResponse.json({
        error: 'Error obteniendo respuestas',
        details: respuestasError.message
      }, { status: 500 });
    }

    // 7. Preparar datos por apartado
    console.log('📝 Preparando datos...');
    const respuestasMap = new Map(respuestas?.map(r => [r.item_id, r]) || []);
    
    const datosPorApartado: Record<string, any> = {};
    const etapasUnicas = [...new Set(items?.map(item => item.checklist_etapas?.nombre).filter(Boolean) || [])];

    for (const etapaNombre of etapasUnicas) {
      const itemsEtapa = items?.filter(item => item.checklist_etapas?.nombre === etapaNombre) || [];
      datosPorApartado[etapaNombre] = itemsEtapa.map(item => {
        const respuesta = respuestasMap.get(item.id);
        return {
          numero: item.numero_item,
          titulo: item.titulo,
          descripcion: item.descripcion,
          respuesta: respuesta?.respuesta || null,
          observaciones: respuesta?.observaciones || '',
          filaExcel: item.fila_excel
        };
      });
    }

    // 8. Información del contrato
    const contratoInfo = {
      numeroContrato: registro.numero_contrato,
      valorContrato: registro.valor_contrato,
      contratista: registro.contratista,
      dependencia: registro.dependencia,
      tipoContrato: categoria.nombre,
      fechaCreacion: registro.fecha_creacion
    };

    console.log('📊 Datos preparados:', {
      etapas: etapasUnicas.length,
      items: items?.length || 0,
      respuestas: respuestas?.length || 0,
      templatePath: templatePath
    });

    // 9. Generar Excel con plantilla
    console.log('🎨 Generando Excel con plantilla...');
    let excelBuffer: Buffer;
    
    try {
      excelBuffer = await ExcelExportService.exportarContratoMultiple(contratoInfo, datosPorApartado);
      console.log(`✅ Excel generado exitosamente (${excelBuffer.length} bytes)`);
    } catch (excelError) {
      console.error('❌ Error generando Excel:', excelError);
      return NextResponse.json({
        error: 'Error generando archivo Excel',
        details: excelError instanceof Error ? excelError.message : 'Error desconocido',
        templateUsed: templatePath
      }, { status: 500 });
    }

    // 10. Retornar archivo
    const fileName = `lista-chequeo-${registro.numero_contrato}-${registroId}.xlsx`;
    const elapsedTime = Date.now() - startTime;
    
    console.log(`✅ EXPORTACIÓN COMPLETADA CON PLANTILLA: ${fileName} (${elapsedTime}ms)`);

    return new NextResponse(excelBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': excelBuffer.length.toString(),
        'X-Template-Used': 'lista-chequeo.xlsx',
        'X-Generated-With': 'plantilla-produccion',
        'X-Processing-Time': `${elapsedTime}ms`
      }
    });

  } catch (error) {
    console.error('❌ ERROR GENERAL EN EXPORTACIÓN PRODUCCIÓN:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      step: 'general_error'
    }, { status: 500 });
  }
}
