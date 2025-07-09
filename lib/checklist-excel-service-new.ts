// Servicio para exportar lista de chequeo a Excel usando la plantilla
import supabaseClient from '@/lib/supabase-client'

// Mapa de filas para cada hoja según los ítems
const ROW_MAP = {
  "SAMC": {
    1: 12, 2: 13, 3: 14, 4: 15, 5: 16, 6: 17, 7: 18, 8: 19, 9: 20,
    10: 21, 11: 22, 12: 23, 13: 24, 14: 25, 15: 26, 16: 27, 17: 28, 18: 29,
    19: 30, 20: 31, 21: 32, 22: 33, 23: 34, 24: 35, 25: 36, 26: 37, 27: 38,
    28: 39, 29: 40, 30: 41, 31: 42, 32: 43, 33: 44, 34: 45, 35: 46, 36: 48,
    37: 49, 38: 50, 39: 51, 40: 52, 41: 53, 42: 54, 43: 56, 44: 57, 45: 58,
    46: 59, 47: 60, 48: 61, 49: 62, 50: 63, 51: 64
  },
  "MINIMA CUANTÍA": {
    1: 12, 2: 13, 3: 14, 4: 15, 5: 16, 6: 17, 7: 18, 8: 19, 9: 20,
    10: 21, 11: 22, 12: 23, 13: 24, 14: 25, 15: 26, 16: 27, 17: 28, 18: 29,
    19: 30, 20: 31, 21: 32, 22: 33, 23: 34, 24: 35, 25: 36, 26: 37, 27: 38,
    28: 39, 29: 40, 30: 41, 31: 42, 32: 43, 33: 44, 34: 45, 35: 46, 36: 48,
    37: 49, 38: 50, 39: 51, 40: 52, 41: 53, 42: 54, 43: 56, 44: 57, 45: 58,
    46: 59, 47: 60, 48: 61, 49: 62, 50: 63, 51: 64
  },
  "CONTRATO INTERADMINISTRATIVO": {
    1: 12, 2: 13, 3: 14, 4: 15, 5: 16, 6: 17, 7: 18, 8: 19, 9: 20, 10: 21,
    11: 22, 12: 23, 13: 25, 14: 26, 15: 27, 16: 28, 17: 29, 18: 30, 19: 31,
    20: 32, 21: 33, 22: 35, 23: 36, 24: 37, 25: 38, 26: 39, 27: 40, 28: 41,
    29: 42
  },
  "PRESTACIÓN DE SERVICIOS": {
    1: 12, 2: 13, 3: 14, 4: 15, 5: 16, 6: 17, 7: 18, 8: 19, 9: 20,
    10: 21, 11: 22, 12: 23, 13: 24, 14: 25, 15: 26, 16: 27, 17: 28, 18: 29,
    19: 30, 20: 31, 21: 32, 22: 33, 23: 34, 24: 35, 25: 36, 26: 37, 27: 38,
    28: 39, 29: 40, 30: 41, 31: 42, 32: 43, 33: 44, 34: 45, 35: 46, 36: 48,
    37: 49, 38: 50, 39: 51, 40: 52, 41: 53, 42: 54, 43: 56, 44: 57, 45: 58,
    46: 59, 47: 60, 48: 61, 49: 62, 50: 63, 51: 64
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
  category: number
  description: string
  completed: boolean
}

export class ChecklistExcelService {
  
  /**
   * Obtiene los datos de lista de chequeo para un área específica
   */
  static async getChecklistData(areaId: string): Promise<ChecklistExportData[]> {
    try {
      const { data, error } = await supabaseClient
        .from('lista_chequeo')
        .select('id, category, description, completed')
        .eq('area_id', areaId)

      if (error) {
        console.error('Error obteniendo datos de checklist:', error)
        throw error
      }

      return data || []

    } catch (error) {
      console.error('Error en getChecklistData:', error)
      throw error
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
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<number, ChecklistExportData[]>)

    // Procesar cada categoría
    Object.entries(itemsByCategory).forEach(([categoryId, items]) => {
      const categoryNum = parseInt(categoryId)
      const sheetName = CATEGORIA_TO_SHEET_MAP[categoryNum]
      
      if (!sheetName) return

      const rowMap = ROW_MAP[sheetName as keyof typeof ROW_MAP]
      if (!rowMap) return

      items.forEach((item, index) => {
        const itemNumber = index + 1
        const excelRow = rowMap[itemNumber as keyof typeof rowMap]
        
        if (!excelRow) return

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

    return excelData
  }

  /**
   * Crea un archivo Excel personalizado con los datos
   */
  static async exportToExcel(areaId: string, areaName: string): Promise<Blob> {
    try {
      // Obtener datos de la base de datos
      const checklistData = await this.getChecklistData(areaId)
      
      // Generar estructura para Excel
      const excelData = this.generateExcelData(checklistData)

      // Crear el Excel usando la API del servidor
      const response = await fetch('/api/checklist/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          areaId,
          areaName,
          excelData
        }),
      })

      if (!response.ok) {
        throw new Error(`Error en la exportación: ${response.statusText}`)
      }

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
