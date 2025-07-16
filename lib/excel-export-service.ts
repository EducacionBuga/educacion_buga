// lib/excel-export-service.ts
import ExcelJS from 'exceljs';
import path from 'path';

interface ContratoData {
  id: string;
  numeroContrato: string;
  contratista: string;
  valor: number;
  categoria: string;
  dependencia: string;
}

interface RespuestaData {
  itemId: string;
  numero: string;
  respuesta: 'CUMPLE' | 'NO_CUMPLE' | 'NO_APLICA' | null;
  observaciones: string;
  orden: number;
}

interface ExportData {
  contrato: ContratoData;
  respuestas: RespuestaData[];
}

// Mapeo de categorías a nombres de hojas en Excel
const CATEGORIA_TO_SHEET: Record<string, string> = {
  'SAMC': 'SAMC',
  'MINIMA CUANTÍA': 'MINIMA CUANTÍA', 
  'CONTRATO INTERADMINISTRATIVO': 'CONTRATO INTERADMINISTRATIVO',
  'PRESTACIÓN DE SERVICIOS': 'PRESTACIÓN DE SERVICIOS'
};

// Mapeo de fila base para cada categoría (donde empiezan los ítems)
const FILA_BASE_ITEMS = 12; // Fila donde empieza el primer ítem en Excel

export class ExcelExportService {
  
  /**
   * Exporta datos específicos por apartado a sus hojas correspondientes
   */
  static async exportarContratoMultiple(
    contratoInfo: any,
    datosPorApartado: Record<string, any>
  ): Promise<Buffer> {
    try {
      console.log('🔄 Iniciando exportación múltiple...');
      
      // Intentar cargar la plantilla Excel con múltiples rutas
      const possiblePaths = [
        path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx'),
        path.join(process.cwd(), 'public/document/lista-chequeo.xlsx'),
        './public/document/lista-chequeo.xlsx',
        '/tmp/lista-chequeo.xlsx' // Para entornos serverless
      ];
      
      const workbook = new ExcelJS.Workbook();
      let templateLoaded = false;
      let usedPath = '';
      
      for (const templatePath of possiblePaths) {
        try {
          console.log(`📁 Intentando cargar plantilla desde: ${templatePath}`);
          await workbook.xlsx.readFile(templatePath);
          templateLoaded = true;
          usedPath = templatePath;
          console.log(`✅ Plantilla cargada exitosamente desde: ${templatePath}`);
          break;
        } catch (error) {
          console.log(`❌ No se pudo cargar desde: ${templatePath}`, error);
          continue;
        }
      }
      
      if (!templateLoaded) {
        console.warn('⚠️ No se pudo cargar la plantilla Excel, creando archivo básico...');
        return await this.crearExcelBasico(contratoInfo, datosPorApartado);
      }

      console.log(`📊 Plantilla cargada exitosamente. Procesando datos por apartado...`);

      // Lista de apartados a procesar
      const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS'];
      
      // Procesar cada apartado
      for (const apartado of apartados) {
        let worksheet = workbook.getWorksheet(apartado);
        
        // Si la hoja no existe, crearla copiando desde SAMC
        if (!worksheet) {
          const samcSheet = workbook.getWorksheet('SAMC');
          if (samcSheet) {
            worksheet = workbook.addWorksheet(apartado);
            // Copiar estructura desde SAMC
            samcSheet.eachRow((row, rowNumber) => {
              const newRow = worksheet!.getRow(rowNumber);
              row.eachCell((cell, colNumber) => {
                newRow.getCell(colNumber).value = cell.value;
                newRow.getCell(colNumber).style = cell.style;
              });
            });
            console.log(`📄 Hoja ${apartado} creada desde plantilla SAMC`);
          } else {
            console.warn(`⚠️ No se pudo crear la hoja ${apartado}, SAMC no existe`);
            continue;
          }
        }

        console.log(`🔄 Procesando hoja: ${apartado}`);

        // Llenar datos del contrato (mismo para todas las hojas)
        this.llenarEncabezadoContrato(worksheet, contratoInfo);

        // Obtener datos específicos de este apartado
        const datosApartado = datosPorApartado[apartado];
        
        if (datosApartado && datosApartado.items && datosApartado.respuestas) {
          console.log(`🔄 Procesando hoja: ${apartado}`);
          console.log(`📊 Items: ${datosApartado.items.length}, Respuestas: ${datosApartado.respuestas.length}`);
          
          // Crear mapa de respuestas por item_id
          const respuestasMap = new Map();
          datosApartado.respuestas.forEach((resp: any) => {
            respuestasMap.set(resp.item_id, resp);
          });

          console.log(`🗺️ Mapa de respuestas creado con ${respuestasMap.size} entradas`);

          // Procesar ítems específicos del apartado
          const respuestasCompletas = datosApartado.items.map((item: any) => {
            const respuesta = respuestasMap.get(item.id);
            return {
              item_id: item.id,
              numero: item.numero,
              orden: item.orden,
              respuesta: respuesta?.respuesta || null,
              observaciones: respuesta?.observaciones || ''
            };
          });

          // Contar respuestas reales (no null)
          const respuestasConDatos = respuestasCompletas.filter((r: any) => r.respuesta !== null);
          console.log(`📝 Items con respuesta: ${respuestasConDatos.length} de ${respuestasCompletas.length}`);

          // Llenar SOLO esta hoja con SUS datos específicos
          this.llenarRespuestasItems(worksheet, respuestasCompletas);
          console.log(`✅ ${apartado}: ${respuestasCompletas.length} ítems procesados`);
        } else {
          console.log(`⚠️ ${apartado}: Sin datos registrados`);
        }
      }

      // Generar buffer del archivo
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);

    } catch (error) {
      console.error('🚨 Error detallado en exportación múltiple:', {
        error: error,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Intentar determinar el tipo de error específico
      if (error instanceof Error) {
        if (error.message.includes('ENOENT') || error.message.includes('no such file')) {
          throw new Error('No se pudo encontrar la plantilla Excel. Archivo lista-chequeo.xlsx no existe.');
        } else if (error.message.includes('EACCES') || error.message.includes('permission')) {
          throw new Error('Sin permisos para acceder a la plantilla Excel.');
        } else if (error.message.includes('corrupted') || error.message.includes('invalid')) {
          throw new Error('La plantilla Excel está corrupta o es inválida.');
        }
      }
      
      throw new Error(`Error al exportar Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Exporta los datos de un contrato con DATOS ESPECÍFICOS por apartado
   */
  /**
   * Llena los datos del contrato en el encabezado
   */
  private static llenarEncabezadoContrato(worksheet: ExcelJS.Worksheet, contratoInfo: any) {
    console.log('� [EXCEL-SERVICE] Aplicando datos del contrato:', {
      contrato: contratoInfo.contrato,
      contratista: contratoInfo.contratista,
      valor: contratoInfo.valor
    });
    
    // Obtener el texto actual de la celda de número de contrato y concatenar
    const celdaNumeroContrato = worksheet.getCell('A7');
    let textoActualContrato = celdaNumeroContrato.value?.toString() || 'NUMERO DE CONTRATO:';
    
    // Limpiar el texto actual si ya contiene datos previos
    if (textoActualContrato.includes(' ') && textoActualContrato !== 'NUMERO DE CONTRATO:') {
      textoActualContrato = 'NUMERO DE CONTRATO:';
    }
    
    // Verificar si el contrato no es 'SIN_CONTRATO' y si no está ya incluido
    if (contratoInfo.contrato && 
        contratoInfo.contrato !== 'SIN_CONTRATO' && 
        contratoInfo.contrato.trim() !== '' &&
        !textoActualContrato.includes(contratoInfo.contrato)) {
      const nuevoTexto = `${textoActualContrato} ${contratoInfo.contrato}`;
      celdaNumeroContrato.value = nuevoTexto;
      console.log('✅ [EXCEL-SERVICE] Número de contrato aplicado:', nuevoTexto);
    } else {
      console.log('⚠️ [EXCEL-SERVICE] No se aplicó número de contrato - valor recibido:', contratoInfo.contrato);
      celdaNumeroContrato.value = 'NUMERO DE CONTRATO: Sin contrato';
    }
    
    // Obtener el texto actual de la celda de contratista y concatenar
    const celdaContratista = worksheet.getCell('A8');
    const textoActualContratista = celdaContratista.value?.toString() || 'CONTRATISTA:';
    if (!textoActualContratista.includes(contratoInfo.contratista)) {
      celdaContratista.value = `${textoActualContratista} ${contratoInfo.contratista}`;
    }
    
    // Valor en la celda al lado de VALOR (mantener formato de moneda)
    const celdaValor = worksheet.getCell('D7');
    console.log('🔍 [EXCEL-SERVICE] Valor a escribir:', contratoInfo.valor);
    console.log('🔍 [EXCEL-SERVICE] Tipo del valor:', typeof contratoInfo.valor);
    
    celdaValor.value = contratoInfo.valor;
    celdaValor.numFmt = '"$"#,##0.00'; // Formato de moneda
    
    console.log('🔍 [EXCEL-SERVICE] Valor después de escribir:', celdaValor.value);
  }

  /**
   * Llena las respuestas de los ítems en sus respectivas filas
   */
  private static llenarRespuestasItems(worksheet: ExcelJS.Worksheet, respuestas: RespuestaData[]) {
    // Ordenar respuestas por número de ítem
    const respuestasOrdenadas = respuestas.sort((a, b) => a.orden - b.orden);

    respuestasOrdenadas.forEach((respuesta) => {
      // Calcular la fila Excel basada en el orden del ítem
      const filaExcel = FILA_BASE_ITEMS + respuesta.orden - 1;

      // Limpiar las celdas primero
      worksheet.getCell(`C${filaExcel}`).value = '';
      worksheet.getCell(`D${filaExcel}`).value = '';
      worksheet.getCell(`E${filaExcel}`).value = '';

      // Marcar la columna correspondiente según la respuesta
      switch (respuesta.respuesta) {
        case 'CUMPLE':
          worksheet.getCell(`C${filaExcel}`).value = 'X';
          break;
        case 'NO_CUMPLE':
          worksheet.getCell(`D${filaExcel}`).value = 'X';
          break;
        case 'NO_APLICA':
          worksheet.getCell(`E${filaExcel}`).value = 'X';
          break;
        default:
          // No marcar nada si no hay respuesta
          break;
      }

      // Las observaciones se mantienen solo en la base de datos, no se exportan al Excel
    });
  }

  /**
   * Convierte los datos de la base de datos al formato esperado
   */
  static convertirDatosDB(registro: any, respuestas: any[]): ExportData {
    const contrato: ContratoData = {
      id: registro.id,
      numeroContrato: registro.numero_contrato,
      contratista: registro.contratista,
      valor: registro.valor_contrato || 0,
      categoria: registro.categoria_nombre,
      dependencia: registro.dependencia
    };

    const respuestasFormateadas: RespuestaData[] = respuestas.map(resp => ({
      itemId: resp.item_id,
      numero: resp.numero,
      respuesta: resp.respuesta,
      observaciones: resp.observaciones || '',
      orden: resp.orden
    }));

    return {
      contrato,
      respuestas: respuestasFormateadas
    };
  }

  /**
   * Genera el nombre del archivo
   */
  static generarNombreArchivo(numeroContrato: string, categoria: string): string {
    const fecha = new Date().toISOString().split('T')[0];
    const categoriaLimpia = categoria.replace(/\s+/g, '_').toUpperCase();
    return `Lista_Chequeo_${categoriaLimpia}_${numeroContrato}_${fecha}.xlsx`;
  }

  /**
   * Crea un Excel básico cuando no se encuentra la plantilla
   */
  private static async crearExcelBasico(
    contratoInfo: any,
    datosPorApartado: Record<string, any>
  ): Promise<Buffer> {
    console.log('📄 Creando Excel básico sin plantilla...');
    
    const workbook = new ExcelJS.Workbook();
    
    // Crear hojas básicas para cada apartado
    const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS'];
    
    for (const apartado of apartados) {
      const worksheet = workbook.addWorksheet(apartado);
      
      // Encabezados básicos
      worksheet.getCell('A1').value = 'LISTA DE CHEQUEO CONTRACTUAL';
      worksheet.getCell('A1').font = { bold: true, size: 16 };
      
      worksheet.getCell('A3').value = `MODALIDAD: ${apartado}`;
      worksheet.getCell('A3').font = { bold: true };
      
      worksheet.getCell('A5').value = `Número de Contrato: ${contratoInfo.contrato || 'N/A'}`;
      worksheet.getCell('A6').value = `Contratista: ${contratoInfo.contratista || 'N/A'}`;
      worksheet.getCell('A7').value = `Valor: ${contratoInfo.valor || 'N/A'}`;
      
      // Encabezados de tabla
      worksheet.getCell('A10').value = 'Ítem';
      worksheet.getCell('B10').value = 'Descripción';
      worksheet.getCell('C10').value = 'Respuesta';
      worksheet.getCell('D10').value = 'Observaciones';
      
      // Aplicar estilo a encabezados
      ['A10', 'B10', 'C10', 'D10'].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
        worksheet.getCell(cell).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      });
      
      // Ajustar anchos de columna
      worksheet.getColumn('A').width = 10;
      worksheet.getColumn('B').width = 50;
      worksheet.getColumn('C').width = 15;
      worksheet.getColumn('D').width = 30;
      
      // Llenar datos si existen
      const datosApartado = datosPorApartado[apartado];
      if (datosApartado?.items) {
        let fila = 11;
        datosApartado.items.forEach((item: any) => {
          const respuesta = datosApartado.respuestas?.find((r: any) => r.item_id === item.id);
          
          worksheet.getCell(`A${fila}`).value = item.numero || fila - 10;
          worksheet.getCell(`B${fila}`).value = item.titulo || item.texto || 'Sin descripción';
          worksheet.getCell(`C${fila}`).value = respuesta?.respuesta || 'SIN RESPUESTA';
          worksheet.getCell(`D${fila}`).value = respuesta?.observaciones || '';
          
          fila++;
        });
      }
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

export default ExcelExportService;
