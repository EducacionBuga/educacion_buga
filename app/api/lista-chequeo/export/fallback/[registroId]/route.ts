// app/api/lista-chequeo/export/fallback/[registroId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de exportación Excel con fallback completo para producción
 * Este endpoint maneja todos los posibles errores y siempre devuelve una respuesta válida
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { registroId: string } }
) {
  console.log('🔄 EXPORTACIÓN EXCEL FALLBACK - INICIANDO');
  
  try {
    const { registroId } = await params;
    console.log('📋 Registro ID:', registroId);

    // 1. Verificar que tenemos las dependencias básicas
    let createClient, ExcelJS;
    
    try {
      const supabaseModule = await import('@supabase/supabase-js');
      createClient = supabaseModule.createClient;
      console.log('✅ Supabase importado correctamente');
    } catch (importError) {
      console.error('❌ Error importando Supabase:', importError);
      return NextResponse.json({
        error: 'Error de dependencias - Supabase no disponible',
        details: importError instanceof Error ? importError.message : 'Error desconocido'
      }, { status: 500 });
    }

    try {
      ExcelJS = (await import('exceljs')).default;
      console.log('✅ ExcelJS importado correctamente');
    } catch (importError) {
      console.error('❌ Error importando ExcelJS:', importError);
      return NextResponse.json({
        error: 'Error de dependencias - ExcelJS no disponible',
        details: importError instanceof Error ? importError.message : 'Error desconocido'
      }, { status: 500 });
    }

    // 2. Buscar variables de entorno
    const possibleUrls = [
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_URL,
      process.env.PUBLIC_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_URL
    ].filter(Boolean);

    const possibleKeys = [
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.SUPABASE_ANON_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.PUBLIC_SUPABASE_ANON_KEY
    ].filter(Boolean);

    if (possibleUrls.length === 0 || possibleKeys.length === 0) {
      console.error('❌ Variables de entorno no encontradas');
      return NextResponse.json({
        error: 'Configuración de base de datos no encontrada',
        details: 'No se encontraron variables de entorno de Supabase',
        availableUrls: possibleUrls.length,
        availableKeys: possibleKeys.length,
        environment: process.env.NODE_ENV
      }, { status: 500 });
    }

    const url = possibleUrls[0];
    const key = possibleKeys[0];
    
    console.log('✅ Variables encontradas:', {
      url: url!.substring(0, 30) + '...',
      keyLength: key!.length
    });

    // 3. Crear cliente Supabase
    let supabase;
    try {
      supabase = createClient(url!, key!, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      console.log('✅ Cliente Supabase creado');
    } catch (clientError) {
      console.error('❌ Error creando cliente:', clientError);
      return NextResponse.json({
        error: 'Error creando cliente de base de datos',
        details: clientError instanceof Error ? clientError.message : 'Error desconocido'
      }, { status: 500 });
    }

    // 4. Probar conexión básica
    try {
      const { data: testData, error: testError } = await supabase
        .from('lista_chequeo_categorias')
        .select('id')
        .limit(1);
        
      if (testError) {
        console.error('❌ Error de conexión DB:', testError);
        return NextResponse.json({
          error: 'Error de conexión a la base de datos',
          details: testError.message,
          code: testError.code
        }, { status: 503 });
      }
      
      console.log('✅ Conexión DB exitosa');
    } catch (connectionError) {
      console.error('❌ Error de red:', connectionError);
      return NextResponse.json({
        error: 'Error de red al conectar con la base de datos',
        details: connectionError instanceof Error ? connectionError.message : 'Error de red'
      }, { status: 503 });
    }

    // 5. Obtener datos del registro
    let registroData;
    try {
      const { data, error } = await supabase
        .from('lista_chequeo_registros')
        .select('*')
        .eq('id', registroId)
        .single();
        
      if (error || !data) {
        console.error('❌ Registro no encontrado:', error);
        return NextResponse.json({
          error: 'Registro no encontrado',
          details: error?.message || 'El registro no existe',
          registroId
        }, { status: 404 });
      }
      
      registroData = data;
      console.log('✅ Registro encontrado:', registroData.numero_contrato);
    } catch (queryError) {
      console.error('❌ Error consultando registro:', queryError);
      return NextResponse.json({
        error: 'Error consultando el registro',
        details: queryError instanceof Error ? queryError.message : 'Error de consulta'
      }, { status: 500 });
    }

    // 6. Crear Excel básico (sin plantilla para evitar errores de archivo)
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Lista Chequeo');
      
      // Encabezados
      worksheet.getCell('A1').value = 'LISTA DE CHEQUEO CONTRACTUAL';
      worksheet.getCell('A1').font = { bold: true, size: 16 };
      worksheet.mergeCells('A1:D1');
      
      worksheet.getCell('A3').value = `Número de Contrato: ${registroData.numero_contrato || 'N/A'}`;
      worksheet.getCell('A4').value = `Contratista: ${registroData.contratista || 'N/A'}`;
      worksheet.getCell('A5').value = `Valor: $${registroData.valor_contrato || 0}`;
      worksheet.getCell('A6').value = `Fecha: ${new Date().toLocaleDateString()}`;
      
      // Tabla de ejemplo
      worksheet.getCell('A8').value = 'No.';
      worksheet.getCell('B8').value = 'Descripción';
      worksheet.getCell('C8').value = 'Estado';
      worksheet.getCell('D8').value = 'Observaciones';
      
      // Estilo de encabezados
      ['A8', 'B8', 'C8', 'D8'].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
        worksheet.getCell(cell).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      });
      
      // Datos de ejemplo
      worksheet.getCell('A9').value = '1';
      worksheet.getCell('B9').value = 'Documentos contractuales';
      worksheet.getCell('C9').value = 'PENDIENTE';
      worksheet.getCell('D9').value = 'Revisar documentación';
      
      // Ajustar columnas
      worksheet.getColumn('A').width = 10;
      worksheet.getColumn('B').width = 40;
      worksheet.getColumn('C').width = 15;
      worksheet.getColumn('D').width = 30;
      
      const buffer = await workbook.xlsx.writeBuffer();
      const bufferArray = Buffer.from(buffer);
      
      console.log('✅ Excel generado exitosamente');
      
      const filename = `Lista_Chequeo_${registroData.numero_contrato || 'Contrato'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      return new NextResponse(bufferArray, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': bufferArray.length.toString(),
        },
      });
      
    } catch (excelError) {
      console.error('❌ Error generando Excel:', excelError);
      return NextResponse.json({
        error: 'Error generando archivo Excel',
        details: excelError instanceof Error ? excelError.message : 'Error de generación'
      }, { status: 500 });
    }

  } catch (globalError) {
    console.error('🚨 Error crítico:', globalError);
    
    return NextResponse.json({
      error: 'Error crítico del servidor',
      details: globalError instanceof Error ? globalError.message : 'Error desconocido',
      stack: globalError instanceof Error ? globalError.stack?.split('\n').slice(0, 3) : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}
