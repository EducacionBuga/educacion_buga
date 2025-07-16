// app/api/lista-chequeo/export/prod-url-template/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint que usa la plantilla desde URL externa para garantizar disponibilidad en producción
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  const startTime = Date.now();
  console.log('🔄 EXPORTACIÓN CON PLANTILLA URL - INICIANDO');
  
  try {
    const { registroId } = await params;
    console.log('📋 Registro ID:', registroId);

    if (!registroId || registroId.length < 10) {
      return NextResponse.json({
        error: 'ID de registro inválido',
        details: 'El ID debe tener al menos 10 caracteres'
      }, { status: 400 });
    }

    // 1. Importar dependencias
    let createClient, ExcelJS;
    
    try {
      const supabaseModule = await import('@supabase/supabase-js');
      createClient = supabaseModule.createClient;
      ExcelJS = (await import('exceljs')).default;
      console.log('✅ Dependencias importadas correctamente');
    } catch (error) {
      console.error('❌ Error importando dependencias:', error);
      return NextResponse.json({
        error: 'Error importando dependencias',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, { status: 500 });
    }

    // 2. Configurar Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Configuración de base de datos incompleta'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Descargar plantilla desde URL
    const templateUrl = 'https://pub-491aa945377d4d289c0042529c4f0267.r2.dev/lista-chequeo.xlsx';
    let templateBuffer: ArrayBuffer;
    
    try {
      console.log('📥 Descargando plantilla desde URL:', templateUrl);
      const templateResponse = await fetch(templateUrl);
      
      if (!templateResponse.ok) {
        throw new Error(`Error descargando plantilla: ${templateResponse.status} ${templateResponse.statusText}`);
      }
      
      templateBuffer = await templateResponse.arrayBuffer();
      console.log(`✅ Plantilla descargada exitosamente (${templateBuffer.byteLength} bytes)`);
    } catch (templateError) {
      console.error('❌ Error descargando plantilla:', templateError);
      return NextResponse.json({
        error: 'Error descargando plantilla',
        details: templateError instanceof Error ? templateError.message : 'Error desconocido',
        templateUrl: templateUrl
      }, { status: 500 });
    }

    // 4. Cargar plantilla en ExcelJS
    let workbook;
    try {
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);
      console.log(`✅ Plantilla cargada en ExcelJS (${workbook.worksheets.length} hojas)`);
    } catch (loadError) {
      console.error('❌ Error cargando plantilla en ExcelJS:', loadError);
      return NextResponse.json({
        error: 'Error procesando plantilla',
        details: loadError instanceof Error ? loadError.message : 'Error desconocido'
      }, { status: 500 });
    }

    // 5. Obtener datos del registro
    const { data: registro, error: registroError } = await supabase
      .from('lista_chequeo_registros')
      .select(`
        *,
        categoria:lista_chequeo_categorias(nombre)
      `)
      .eq('id', registroId)
      .single();

    if (registroError || !registro) {
      console.error('❌ Error obteniendo registro:', registroError);
      return NextResponse.json({
        error: 'Registro no encontrado',
        details: registroError?.message || 'El registro no existe'
      }, { status: 404 });
    }

    // 6. Obtener items y respuestas
    const { data: items, error: itemsError } = await supabase
      .from('lista_chequeo_items')
      .select(`
        *,
        etapa:lista_chequeo_etapas(nombre)
      `)
      .eq('categoria_id', registro.categoria_id)
      .order('numero_item');

    if (itemsError) {
      console.error('❌ Error obteniendo items:', itemsError);
      return NextResponse.json({
        error: 'Error obteniendo items',
        details: itemsError.message
      }, { status: 500 });
    }

    const { data: respuestas, error: respuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select('*')
      .eq('registro_id', registroId);

    if (respuestasError) {
      console.error('❌ Error obteniendo respuestas:', respuestasError);
      return NextResponse.json({
        error: 'Error obteniendo respuestas',
        details: respuestasError.message
      }, { status: 500 });
    }

    // 7. Usar el servicio de exportación existente pero con plantilla URL
    console.log('📝 Preparando datos para Excel...');
    
    try {
      // Importar y usar el servicio de exportación con nuestra plantilla descargada
      const path = await import('path');
      const fs = await import('fs');
      
      // Guardar temporalmente la plantilla descargada
      const tempPath = path.join(process.cwd(), 'temp-template.xlsx');
      fs.writeFileSync(tempPath, Buffer.from(templateBuffer));
      
      // Usar el servicio de exportación existente
      const ExcelExportService = (await import('@/lib/excel-export-service')).default;
      
      // Preparar información del contrato
      const contratoInfo = {
        numeroContrato: registro.numero_contrato,
        valorContrato: registro.valor_contrato,
        contratista: registro.contratista,
        dependencia: registro.dependencia,
        tipoContrato: registro.categoria?.nombre || 'SAMC',
        fechaCreacion: registro.fecha_creacion
      };

      // Obtener datos organizados como en el endpoint principal
      const { data: allData } = await supabase
        .rpc('obtener_datos_contrato_multiple', { 
          registro_id_param: registroId 
        });

      let datosPorApartado: Record<string, any> = {};
      if (allData && allData.length > 0) {
        const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS'];
        
        apartados.forEach(apartado => {
          const apartadoData = allData.find((d: any) => d.apartado === apartado);
          if (apartadoData) {
            datosPorApartado[apartado] = apartadoData;
          }
        });
      }

      console.log('📊 Datos preparados:', {
        contrato: contratoInfo.numeroContrato,
        apartados: Object.keys(datosPorApartado).length
      });

      // Generar Excel usando el servicio existente
      const excelBuffer = await ExcelExportService.exportarContratoMultiple(contratoInfo, datosPorApartado);
      
      // Limpiar archivo temporal
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        console.warn('⚠️ Error limpiando archivo temporal:', cleanupError);
      }

      // 8. Retornar archivo
      const fileName = `lista-chequeo-${registro.numero_contrato}-${registroId}.xlsx`;
      const elapsedTime = Date.now() - startTime;
      
      console.log(`✅ EXPORTACIÓN CON URL COMPLETADA: ${fileName} (${elapsedTime}ms)`);

      return new NextResponse(excelBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': excelBuffer.length.toString(),
          'X-Template-Source': 'url-externa',
          'X-Template-Url': templateUrl,
          'X-Processing-Time': `${elapsedTime}ms`,
          'X-Generated-With': 'plantilla-url'
        }
      });

    } catch (processingError) {
      console.error('❌ Error procesando datos:', processingError);
      return NextResponse.json({
        error: 'Error procesando datos para Excel',
        details: processingError instanceof Error ? processingError.message : 'Error desconocido'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ ERROR GENERAL EN EXPORTACIÓN URL:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      step: 'general_error'
    }, { status: 500 });
  }
}
