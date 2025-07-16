// app/api/lista-chequeo/export/prod-hybrid/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint híbrido para producción que detecta automáticamente si la plantilla está disponible
 * y usa la mejor estrategia disponible
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  const startTime = Date.now();
  console.log('🔄 EXPORTACIÓN HÍBRIDA PRODUCCIÓN - INICIANDO');
  
  try {
    const { registroId } = await params;
    console.log('📋 Registro ID:', registroId);

    if (!registroId || registroId.length < 10) {
      return NextResponse.json({
        error: 'ID de registro inválido',
        details: 'El ID debe tener al menos 10 caracteres'
      }, { status: 400 });
    }

    // 1. Detectar disponibilidad de plantilla
    let templateAvailable = false;
    let templatePath = '';
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const possiblePaths = [
        path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx'),
        path.join(process.cwd(), 'public/document/lista-chequeo.xlsx'),
        './public/document/lista-chequeo.xlsx',
        'public/document/lista-chequeo.xlsx'
      ];

      for (const pathToCheck of possiblePaths) {
        if (fs.existsSync(pathToCheck)) {
          templatePath = pathToCheck;
          templateAvailable = true;
          console.log(`✅ Plantilla encontrada en: ${pathToCheck}`);
          break;
        }
      }
    } catch (error) {
      console.log('⚠️ Error verificando plantilla:', error);
      templateAvailable = false;
    }

    // 2. Importar dependencias
    let createClient, ExcelJS;
    
    try {
      const supabaseModule = await import('@supabase/supabase-js');
      createClient = supabaseModule.createClient;
      ExcelJS = (await import('exceljs')).default;
    } catch (error) {
      console.error('❌ Error importando dependencias:', error);
      return NextResponse.json({
        error: 'Error importando dependencias',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, { status: 500 });
    }

    // 3. Configurar Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Configuración de base de datos incompleta'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Obtener datos del registro
    const { data: registro, error: registroError } = await supabase
      .from('checklist_registros')
      .select(`
        *,
        checklist_categorias(nombre)
      `)
      .eq('id', registroId)
      .single();

    if (registroError || !registro) {
      return NextResponse.json({
        error: 'Registro no encontrado',
        details: registroError?.message || 'El registro no existe'
      }, { status: 404 });
    }

    // 5. Estrategia de generación basada en disponibilidad de plantilla
    let excelBuffer: Buffer;
    let strategy = '';

    if (templateAvailable) {
      // ESTRATEGIA A: Usar plantilla (como en local)
      strategy = 'CON_PLANTILLA';
      console.log('🎨 Usando estrategia CON PLANTILLA');
      
      try {
        const ExcelExportService = (await import('@/lib/excel-export-service')).default;
        
        // Obtener datos adicionales necesarios
        const { data: items } = await supabase
          .from('checklist_items')
          .select(`
            *,
            checklist_etapas(nombre)
          `)
          .eq('categoria_id', registro.categoria_id)
          .order('numero_item');

        const { data: respuestas } = await supabase
          .from('checklist_respuestas')
          .select('*')
          .eq('registro_id', registroId);

        // Preparar datos por apartado
        const respuestasMap = new Map(respuestas?.map(r => [r.item_id, r]) || []);
        const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS'];
        const datosPorApartado: Record<string, any> = {};

        for (const apartado of apartados) {
          const itemsApartado = items?.filter(item => {
            // Lógica para asignar ítems a apartados
            return true; // Simplificado para este ejemplo
          }) || [];

          datosPorApartado[apartado] = {
            items: itemsApartado,
            respuestas: respuestas?.filter(r => itemsApartado.some(i => i.id === r.item_id)) || []
          };
        }

        const contratoInfo = {
          numeroContrato: registro.numero_contrato,
          valorContrato: registro.valor_contrato,
          contratista: registro.contratista,
          dependencia: registro.dependencia,
          tipoContrato: registro.checklist_categorias?.nombre || 'SAMC'
        };

        excelBuffer = await ExcelExportService.exportarContratoMultiple(contratoInfo, datosPorApartado);

      } catch (templateError) {
        console.warn('⚠️ Error con plantilla, cambiando a estrategia básica:', templateError);
        strategy = 'SIN_PLANTILLA_FALLBACK';
        excelBuffer = await generateBasicExcel(registro, supabase, ExcelJS);
      }

    } else {
      // ESTRATEGIA B: Excel básico sin plantilla
      strategy = 'SIN_PLANTILLA';
      console.log('📄 Usando estrategia SIN PLANTILLA');
      excelBuffer = await generateBasicExcel(registro, supabase, ExcelJS);
    }

    // 6. Retornar archivo
    const fileName = `lista-chequeo-${registro.numero_contrato}-${registroId}.xlsx`;
    const elapsedTime = Date.now() - startTime;
    
    console.log(`✅ EXPORTACIÓN HÍBRIDA COMPLETADA: ${fileName} (${strategy}, ${elapsedTime}ms)`);

    return new NextResponse(excelBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': excelBuffer.length.toString(),
        'X-Strategy-Used': strategy,
        'X-Template-Available': templateAvailable.toString(),
        'X-Processing-Time': `${elapsedTime}ms`
      }
    });

  } catch (error) {
    console.error('❌ ERROR EN EXPORTACIÓN HÍBRIDA:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Genera un Excel básico sin plantilla pero con estructura completa
 */
async function generateBasicExcel(registro: any, supabase: any, ExcelJS: any): Promise<Buffer> {
  console.log('📝 Generando Excel básico optimizado');
  
  const workbook = new ExcelJS.Workbook();
  
  // Obtener datos
  const { data: items } = await supabase
    .from('checklist_items')
    .select(`
      *,
      checklist_etapas(nombre)
    `)
    .eq('categoria_id', registro.categoria_id)
    .order('numero_item');

  const { data: respuestas } = await supabase
    .from('checklist_respuestas')
    .select('*')
    .eq('registro_id', registro.id);

  const respuestasMap = new Map(respuestas?.map((r: any) => [r.item_id, r]) || []);

  // Crear hoja principal
  const worksheet = workbook.addWorksheet('Lista de Chequeo');
  
  // Encabezados del contrato
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'LISTA DE CHEQUEO - SEGUIMIENTO CONTRACTUAL';
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.getCell('A3').value = 'Número de Contrato:';
  worksheet.getCell('B3').value = registro.numero_contrato;
  worksheet.getCell('A4').value = 'Contratista:';
  worksheet.getCell('B4').value = registro.contratista;
  worksheet.getCell('A5').value = 'Valor:';
  worksheet.getCell('B5').value = registro.valor_contrato;

  // Encabezados de la tabla
  const headerRow = 7;
  worksheet.getCell(`A${headerRow}`).value = 'No.';
  worksheet.getCell(`B${headerRow}`).value = 'Descripción';
  worksheet.getCell(`C${headerRow}`).value = 'Etapa';
  worksheet.getCell(`D${headerRow}`).value = 'Cumple';
  worksheet.getCell(`E${headerRow}`).value = 'Observaciones';

  // Estilo para encabezados
  for (let col = 1; col <= 5; col++) {
    const cell = worksheet.getCell(headerRow, col);
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
  }

  // Llenar datos
  let currentRow = headerRow + 1;
  items?.forEach((item: any) => {
    const respuesta = respuestasMap.get(item.id) as any;
    
    worksheet.getCell(`A${currentRow}`).value = item.numero_item;
    worksheet.getCell(`B${currentRow}`).value = item.titulo;
    worksheet.getCell(`C${currentRow}`).value = item.checklist_etapas?.nombre || '';
    worksheet.getCell(`D${currentRow}`).value = respuesta?.respuesta || '';
    worksheet.getCell(`E${currentRow}`).value = respuesta?.observaciones || '';
    
    currentRow++;
  });

  // Ajustar ancho de columnas
  worksheet.getColumn('A').width = 8;
  worksheet.getColumn('B').width = 50;
  worksheet.getColumn('C').width = 20;
  worksheet.getColumn('D').width = 12;
  worksheet.getColumn('E').width = 30;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
