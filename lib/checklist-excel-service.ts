// Servicio para exportar lista de chequeo a Excel usando la plantilla

// Mapa de filas para cada hoja según los ítems exactos de la plantilla
const ROW_MAP = {
  "SAMC": {
    // Items 1-24 (PRECONTRACTUALES) - filas 12-35
    1: 12, 2: 13, 3: 14, 4: 15, 5: 16, 6: 17, 7: 18, 8: 19, 9: 20, 10: 21,
    11: 22, 12: 23, 13: 24, 14: 25, 15: 26, 16: 27, 17: 28, 18: 29, 19: 30,
    20: 31, 21: 32, 22: 33, 23: 34, 24: 35,
    // Item 52 (RESOLUCIÓN DE ADJUDICACIÓN) - fila 36
    52: 36,
    // Item 53,54 (CERTIFICADOS) - filas 37-38
    53: 37, 54: 38,
    // Items 25-42 (CONTRACTUALES) - filas 39-56
    25: 39, 26: 40, 27: 41, 28: 42, 29: 43, 30: 44, 31: 45, 32: 46, 33: 47,
    34: 48, 35: 49, 36: 50, 37: 51, 38: 52, 39: 53, 40: 54, 41: 55, 42: 56,
    // Items 43-51 (EJECUCIÓN) - filas 57-65
    43: 57, 44: 58, 45: 59, 46: 60, 47: 61, 48: 62, 49: 63, 50: 64, 51: 65,
    // Items 82-93 (ADICIÓN) - filas 66-77
    82: 66, 83: 67, 84: 68, 85: 69, 86: 70, 87: 71, 88: 72, 89: 73, 90: 74,
    91: 75, 92: 76, 93: 77
  },
  "MINIMA CUANTÍA": {
    // Items 53-60 (PRECONTRACTUALES) - filas 12-19
    53: 12, 54: 13, 55: 14, 56: 15, 57: 16, 58: 17, 59: 18, 60: 19,
    // Items 25-42 (CONTRACTUALES) - filas 20-37
    25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: 25, 31: 26, 32: 27, 33: 28,
    34: 29, 35: 30, 36: 31, 37: 32, 38: 33, 39: 34, 40: 35, 41: 36, 42: 37,
    // Items 43-51 (EJECUCIÓN) - filas 38-46
    43: 38, 44: 39, 45: 40, 46: 41, 47: 42, 48: 43, 49: 44, 50: 45, 51: 46,
    // Items 82-93 (ADICIÓN) - filas 47-58
    82: 47, 83: 48, 84: 49, 85: 50, 86: 51, 87: 52, 88: 53, 89: 54, 90: 55,
    91: 56, 92: 57, 93: 58
  },
  "CONTRATO INTERADMINISTRATIVO": {
    // Items específicos para convenios interadministrativos
    53: 12, 54: 13, 3: 14, 61: 15, 62: 16, 63: 17, 75: 18, 76: 19, 77: 20,
    78: 21, 79: 22, 80: 23, 43: 24, 45: 25, 81: 26, 46: 27, 47: 28, 48: 29,
    49: 30, 50: 31, 51: 32, 82: 33, 83: 34, 84: 35, 85: 36, 86: 37, 87: 38,
    88: 39, 89: 40, 90: 41, 91: 42, 92: 43, 93: 44
  },
  "PRESTACIÓN DE SERVICIOS": {
    // Items específicos para prestación de servicios
    64: 12, 65: 13, 66: 14, 67: 15, 68: 16, 69: 17, 70: 18, 71: 19, 72: 20,
    73: 21, 74: 22, 75: 23, 76: 24, 77: 25, 78: 26, 79: 27, 80: 28, 43: 29,
    45: 30, 81: 31, 46: 32, 47: 33, 48: 34, 49: 35, 50: 36, 51: 37, 82: 38,
    83: 39, 84: 40, 85: 41, 86: 42, 87: 43, 88: 44, 89: 45, 90: 46, 91: 47,
    92: 48, 93: 49
  }
}

// Mapeo de categorías numéricas a hojas de Excel
const CATEGORIA_TO_SHEET_MAP: Record<number, string> = {
  1: "SAMC",
  2: "MINIMA CUANTÍA", 
  3: "CONTRATO INTERADMINISTRATIVO",
  4: "PRESTACIÓN DE SERVICIOS"
}

export interface ChecklistExportData {
  id: string
  category: string | number
  description: string
  completed: boolean
}

export class ChecklistExcelService {
  
  /**
   * Obtiene los datos de lista de chequeo para un área específica
   */
  static async getChecklistData(areaId: string): Promise<ChecklistExportData[]> {
    try {
      console.log('Consultando datos para área:', areaId)
      
      // En lugar de hacer la consulta aquí, enviaremos la consulta al servidor
      // Esto evita problemas de autenticación en el cliente
      console.log('Enviando consulta al servidor para obtener datos')
      return []

    } catch (error) {
      console.error('Error en getChecklistData:', error)
      // En lugar de lanzar error, devolver datos vacíos
      return []
    }
  }

  /**
   * Genera la estructura de datos para llenar el Excel
   */
  static generateExcelData(checklistData: ChecklistExportData[]) {
    const excelData: Record<string, any[]> = {}

    // Inicializar arrays para cada hoja
    Object.values(CATEGORIA_TO_SHEET_MAP).forEach(sheetName => {
      excelData[sheetName] = []
    })

    // Agrupar items por categoría
    const itemsByCategory = checklistData.reduce((acc, item) => {
      const categoryKey = String(item.category)
      if (!acc[categoryKey]) {
        acc[categoryKey] = []
      }
      acc[categoryKey].push(item)
      return acc
    }, {} as Record<string, ChecklistExportData[]>)

    // Procesar cada categoría
    Object.entries(itemsByCategory).forEach(([categoryId, items]) => {
      const categoryNum = parseInt(categoryId)
      const sheetName = CATEGORIA_TO_SHEET_MAP[categoryNum]
      
      if (!sheetName) {
        console.warn(`No se encontró hoja para categoría ${categoryNum}`)
        return
      }

      const rowMap = ROW_MAP[sheetName as keyof typeof ROW_MAP]
      if (!rowMap) {
        console.warn(`No se encontró mapeo de filas para hoja ${sheetName}`)
        return
      }

      items.forEach((item, index) => {
        const itemNumber = index + 1
        const excelRow = rowMap[itemNumber as keyof typeof rowMap]
        
        if (!excelRow) {
          console.warn(`No se encontró fila Excel para item ${itemNumber} en hoja ${sheetName}`)
          return
        }

        // Si está completado, marcamos en la columna C (SÍ)
        if (item.completed) {
          excelData[sheetName].push({
            row: excelRow,
            column: "C",
            value: "✔"
          })
        } else {
          // Si no está completado, marcamos en la columna D (NO)
          excelData[sheetName].push({
            row: excelRow,
            column: "D",
            value: "✔"
          })
        }
      })
    })

    console.log('Datos generados para Excel:', excelData)
    return excelData
  }

  /**
   * Crea un archivo Excel personalizado con los datos
   */
  static async exportToExcel(areaId: string, areaName: string): Promise<Blob> {
    try {
      console.log('Iniciando exportación Excel para:', areaId, areaName)
      
      // El servidor se encargará de obtener los datos y generar el Excel
      const response = await fetch('/api/checklist/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          areaId,
          areaName
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response from server:', errorText)
        throw new Error(`Error en la exportación: ${response.statusText} - ${errorText}`)
      }

      console.log('Excel generado exitosamente en el servidor')
      return await response.blob()

    } catch (error) {
      console.error('Error exportando a Excel:', error)
      throw error
    }
  }

  /**
   * Descarga el archivo Excel
   */
  static downloadExcel(blob: Blob, areaName: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Lista_Chequeo_${areaName}_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}
