"use client"

import { useState, useCallback } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { toast } from "@/components/ui/use-toast"
import type { PlanAccionItem } from "@/types/plan-accion"

export interface ImportResult {
  success: boolean
  data?: PlanAccionItem[]
  errors?: string[]
}

export function usePlanAccionImportExport() {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Mapeo de nombres de columnas para la importación
  const columnMapping = {
    "numero": "id",
    "n°": "id",
    "meta_de_producto_pdm": "programa",
    "meta de producto pdm 2024-2027": "programa",
    "actividad_a_realizar": "objetivo",
    "actividad a realizar": "objetivo",
    "proceso_estrategia": "meta",
    "proceso / estrategia": "meta",
    "presupuesto_disponible": "presupuesto",
    "presupuesto disponible": "presupuesto",
    "presupuesto_ejecutado": "acciones",
    "presupuesto ejecutado": "acciones",
    "porcentaje_de_avance": "porcentajeAvance",
    "porcentaje de avance": "porcentajeAvance",
    "recursos_necesarios": "indicadores",
    "recursos necesarios": "indicadores",
    "indicador_de_gestion": "indicadores",
    "indicador de gestión": "indicadores",
    "unidad_de_medida": "metaDecenal",
    "unidad de medida": "metaDecenal",
    "formula_del_indicador": "macroobjetivoDecenal",
    "fórmula del indicador": "macroobjetivoDecenal",
    "periodo_propuesto": "objetivoDecenal",
    "período propuesto": "objetivoDecenal",
    "fecha_de_inicio": "fechaInicio",
    "fecha de inicio": "fechaInicio",
    "fecha_de_finalizacion": "fechaFin",
    "fecha de finalización": "fechaFin",
    "responsable": "responsable",
    "estado": "estado"
  }

  // Función para normalizar nombres de columnas
  const normalizeColumnName = (name: string): string => {
    const normalized = name.toLowerCase().trim()
    return columnMapping[normalized as keyof typeof columnMapping] || normalized
  }

  // Función para validar datos importados
  const validateImportData = (data: any[]): { valid: PlanAccionItem[], errors: string[] } => {
    const valid: PlanAccionItem[] = []
    const errors: string[] = []

    data.forEach((row, index) => {
      const rowNumber = index + 2 // +2 porque empezamos en fila 1 y hay encabezados
      
      // Validaciones básicas
      if (!row.programa || typeof row.programa !== 'string') {
        errors.push(`Fila ${rowNumber}: El campo 'programa' es requerido`)
        return
      }

      if (!row.objetivo || typeof row.objetivo !== 'string') {
        errors.push(`Fila ${rowNumber}: El campo 'objetivo' es requerido`)
        return
      }

      // Validar y convertir porcentaje de avance
      let porcentajeAvance = 0
      if (row.porcentajeAvance) {
        const parsed = parseFloat(String(row.porcentajeAvance).replace('%', ''))
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
          errors.push(`Fila ${rowNumber}: El porcentaje de avance debe ser un número entre 0 y 100`)
          return
        }
        porcentajeAvance = parsed
      }

      // Validar fechas
      const validateDate = (dateStr: string, fieldName: string): string => {
        if (!dateStr) return ""
        
        // Intentar parsear diferentes formatos de fecha
        const formats = [
          /^\d{1,2}\/\d{1,2}\/\d{4}$/, // DD/MM/YYYY o D/M/YYYY
          /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
          /^\d{1,2}-\d{1,2}-\d{4}$/, // DD-MM-YYYY
        ]

        const dateString = String(dateStr).trim()
        const isValidFormat = formats.some(format => format.test(dateString))
        
        if (!isValidFormat) {
          errors.push(`Fila ${rowNumber}: Formato de fecha inválido en '${fieldName}'. Use DD/MM/YYYY`)
          return ""
        }

        return dateString
      }

      const fechaInicio = validateDate(row.fechaInicio, "fechaInicio")
      const fechaFin = validateDate(row.fechaFin, "fechaFin")

      // Crear el objeto PlanAccionItem
      const planAccionItem: PlanAccionItem = {
        id: row.id || `imported-${Date.now()}-${index}`,
        programa: row.programa,
        objetivo: row.objetivo,
        meta: row.meta || "",
        presupuesto: row.presupuesto || "",
        acciones: row.acciones || "",
        indicadores: row.indicadores || "",
        porcentajeAvance,
        fechaInicio,
        fechaFin,
        responsable: row.responsable || "",
        estado: row.estado || "Sin iniciar",
        prioridad: row.prioridad || "Media",
        comentarios: row.comentarios || "",
        metaDecenal: row.metaDecenal || "",
        macroobjetivoDecenal: row.macroobjetivoDecenal || "",
        objetivoDecenal: row.objetivoDecenal || "",
      }

      valid.push(planAccionItem)
    })

    return { valid, errors }
  }

  // Importar desde CSV
  const importFromCSV = useCallback(async (file: File): Promise<ImportResult> => {
    setIsImporting(true)
      return new Promise((resolve) => {
      Papa.parse<any>(file, {
        header: true,
        skipEmptyLines: true,
        encoding: "UTF-8",
        transformHeader: (header: string) => {
          return normalizeColumnName(header)
        },complete: (results: Papa.ParseResult<any>) => {
          const { valid, errors } = validateImportData(results.data)
          
          setIsImporting(false)
          
          if (errors.length > 0) {
            toast({
              title: "Errores en la importación",
              description: `Se encontraron ${errors.length} errores. Revise el archivo.`,
              variant: "destructive",
            })
            resolve({ success: false, errors })
          } else {
            toast({
              title: "Importación exitosa",
              description: `Se importaron ${valid.length} registros correctamente.`,
            })
            resolve({ success: true, data: valid })
          }
        },        error: (error: Error) => {
          setIsImporting(false)
          toast({
            title: "Error al importar CSV",
            description: error.message,
            variant: "destructive",
          })
          resolve({ success: false, errors: [error.message] })
        }
      })
    })
  }, [])
  // Importar desde Excel
  const importFromExcel = useCallback(async (file: File): Promise<ImportResult> => {
    setIsImporting(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      if (!worksheet) {
        throw new Error("El archivo Excel está vacío")
      }

      // Convertir la hoja a array de arrays
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
      if (data.length < 2) {
        throw new Error("El archivo debe tener al menos una fila de encabezados y una fila de datos")
      }

      // Convertir a formato de objeto usando los encabezados
      const headers = data[0].map((header: any) => normalizeColumnName(String(header)))
      const rows = data.slice(1).map(row => {
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = row[index] || ""
        })
        return obj
      })

      const { valid, errors } = validateImportData(rows)
      
      setIsImporting(false)
      
      if (errors.length > 0) {
        toast({
          title: "Errores en la importación",
          description: `Se encontraron ${errors.length} errores. Revise el archivo.`,
          variant: "destructive",
        })
        return { success: false, errors }
      } else {
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${valid.length} registros correctamente.`,
        })
        return { success: true, data: valid }
      }
    } catch (error: any) {
      setIsImporting(false)
      toast({
        title: "Error al importar Excel",
        description: error.message,
        variant: "destructive",
      })
      return { success: false, errors: [error.message] }
    }
  }, [])

  // Exportar a CSV
  const exportToCSV = useCallback((data: PlanAccionItem[], filename?: string) => {
    setIsExporting(true)

    try {
      // Mapear los datos al formato de exportación
      const exportData = data.map((item, index) => ({
        "N°": index + 1,
        "Meta de Producto PDM 2024-2027": item.programa,
        "Actividad a Realizar": item.objetivo,
        "Proceso / Estrategia": item.meta,
        "Presupuesto Disponible": item.presupuesto,
        "Presupuesto Ejecutado": item.acciones,
        "Porcentaje de Avance": `${item.porcentajeAvance}%`,
        "Recursos Necesarios": item.indicadores,
        "Indicador de Gestión": item.indicadores,
        "Unidad de Medida": item.metaDecenal,
        "Fórmula del Indicador": item.macroobjetivoDecenal,
        "Período Propuesto": item.objetivoDecenal,
        "Fecha de Inicio": item.fechaInicio,
        "Fecha de Finalización": item.fechaFin,
        "Responsable": item.responsable,
        "Estado": item.estado,
      }))

      const csv = Papa.unparse(exportData, {
        delimiter: ",",
        header: true,
      })

      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", filename || `plan-accion-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Exportación exitosa",
        description: "El archivo CSV se ha descargado correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error al exportar CSV",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }, [])
  // Exportar a Excel
  const exportToExcel = useCallback(async (data: PlanAccionItem[], filename?: string) => {
    setIsExporting(true)

    try {
      // Preparar los datos para Excel
      const exportData = data.map((item, index) => ({
        "N°": index + 1,
        "Meta de Producto PDM 2024-2027": item.programa,
        "Actividad a Realizar": item.objetivo,
        "Proceso / Estrategia": item.meta,
        "Presupuesto Disponible": item.presupuesto,
        "Presupuesto Ejecutado": item.acciones,
        "Porcentaje de Avance": `${item.porcentajeAvance}%`,
        "Recursos Necesarios": item.indicadores,
        "Indicador de Gestión": item.indicadores,
        "Unidad de Medida": item.metaDecenal,
        "Fórmula del Indicador": item.macroobjetivoDecenal,
        "Período Propuesto": item.objetivoDecenal,
        "Fecha de Inicio": item.fechaInicio,
        "Fecha de Finalización": item.fechaFin,
        "Responsable": item.responsable,
        "Estado": item.estado,
      }))

      // Crear el workbook y worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Plan de Acción")

      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 5 },   // N°
        { wch: 30 },  // Meta de Producto
        { wch: 25 },  // Actividad
        { wch: 20 },  // Proceso
        { wch: 15 },  // Presupuesto Disponible
        { wch: 15 },  // Presupuesto Ejecutado
        { wch: 12 },  // Porcentaje
        { wch: 20 },  // Recursos
        { wch: 20 },  // Indicador
        { wch: 15 },  // Unidad
        { wch: 20 },  // Fórmula
        { wch: 15 },  // Período
        { wch: 12 },  // Fecha Inicio
        { wch: 12 },  // Fecha Fin
        { wch: 15 },  // Responsable
        { wch: 12 },  // Estado
      ]
      worksheet['!cols'] = columnWidths

      // Generar el archivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", filename || `plan-accion-${new Date().toISOString().split("T")[0]}.xlsx`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Exportación exitosa",
        description: "El archivo Excel se ha descargado correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error al exportar Excel",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }, [])

  // Descargar plantilla CSV
  const downloadTemplate = useCallback(() => {
    const templateData = [
      {
        "N°": 1,
        "Meta de Producto PDM 2024-2027": "Ejemplo de meta de producto",
        "Actividad a Realizar": "Ejemplo de actividad a realizar",
        "Proceso / Estrategia": "Ejemplo de proceso o estrategia",
        "Presupuesto Disponible": "100000000",
        "Presupuesto Ejecutado": "50000000",
        "Porcentaje de Avance": "50%",
        "Recursos Necesarios": "Ejemplo de recursos necesarios",
        "Indicador de Gestión": "Ejemplo de indicador",
        "Unidad de Medida": "Ejemplo de unidad",
        "Fórmula del Indicador": "Ejemplo de fórmula",
        "Período Propuesto": "2024-2027",
        "Fecha de Inicio": "01/01/2024",
        "Fecha de Finalización": "31/12/2027",
        "Responsable": "Ejemplo de responsable",
        "Estado": "En progreso",
      }
    ]

    const csv = Papa.unparse(templateData, {
      delimiter: ",",
      header: true,
    })

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "plantilla-plan-accion.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Plantilla descargada",
      description: "La plantilla CSV se ha descargado correctamente.",
    })
  }, [])

  return {
    isImporting,
    isExporting,
    importFromCSV,
    importFromExcel,
    exportToCSV,
    exportToExcel,
    downloadTemplate,
  }
}
