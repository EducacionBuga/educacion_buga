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
      // Cargar la plantilla Excel
      const templatePath = path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templatePath);

      console.log('📊 Procesando datos por apartado...');

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
      console.error('Error exportando Excel múltiple:', error);
      throw new Error(`Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Exporta los datos de un contrato con DATOS ESPECÍFICOS por apartado
   */
  /**
   * Llena los datos del contrato en el encabezado
   */
  private static llenarEncabezadoContrato(worksheet: ExcelJS.Worksheet, contratoInfo: any) {
    // Obtener el texto actual de la celda de número de contrato y concatenar
    const celdaNumeroContrato = worksheet.getCell('A7');
    const textoActualContrato = celdaNumeroContrato.value?.toString() || 'NUMERO DE CONTRATO:';
    if (!textoActualContrato.includes(contratoInfo.contrato)) {
      celdaNumeroContrato.value = `${textoActualContrato} ${contratoInfo.contrato}`;
    }
    
    // Obtener el texto actual de la celda de contratista y concatenar
    const celdaContratista = worksheet.getCell('A8');
    const textoActualContratista = celdaContratista.value?.toString() || 'CONTRATISTA:';
    if (!textoActualContratista.includes(contratoInfo.contratista)) {
      celdaContratista.value = `${textoActualContratista} ${contratoInfo.contratista}`;
    }
    
    // Valor en la celda al lado de VALOR (mantener formato de moneda)
    const celdaValor = worksheet.getCell('D7');
    celdaValor.value = contratoInfo.valor;
    celdaValor.numFmt = '"$"#,##0.00'; // Formato de moneda
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

      // Agregar observaciones si existe una columna para ello (ajustar según plantilla)
      if (respuesta.observaciones) {
        // Asumiendo que las observaciones van en la columna F
        worksheet.getCell(`F${filaExcel}`).value = respuesta.observaciones;
      }
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
}

export default ExcelExportService;
