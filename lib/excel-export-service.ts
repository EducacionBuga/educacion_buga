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
   * Exporta los datos de un contrato a la plantilla Excel
   */
  static async exportarContrato(data: ExportData): Promise<Buffer> {
    try {
      // Cargar la plantilla Excel
      const templatePath = path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templatePath);

      // Obtener el nombre de la hoja según la categoría
      const sheetName = CATEGORIA_TO_SHEET[data.contrato.categoria];
      if (!sheetName) {
        throw new Error(`Categoría no válida: ${data.contrato.categoria}`);
      }

      const worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        throw new Error(`Hoja no encontrada: ${sheetName}`);
      }

      // Llenar datos del contrato en el encabezado
      this.llenarEncabezadoContrato(worksheet, data.contrato);

      // Llenar respuestas de los ítems
      this.llenarRespuestasItems(worksheet, data.respuestas);

      // Generar buffer del archivo
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);

    } catch (error) {
      console.error('Error exportando Excel:', error);
      throw new Error(`Error al exportar Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Llena los datos del contrato en el encabezado
   */
  private static llenarEncabezadoContrato(worksheet: ExcelJS.Worksheet, contrato: ContratoData) {
    // Número de contrato en B7
    worksheet.getCell('B7').value = contrato.numeroContrato;
    
    // Contratista en B8  
    worksheet.getCell('B8').value = contrato.contratista;
    
    // Valor en D7
    worksheet.getCell('D7').value = contrato.valor;
    
    // Dependencia (si existe una celda específica, ajustar)
    // worksheet.getCell('B9').value = contrato.dependencia;
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
