'use client'

import { useState } from 'react'
import { ChecklistRegistro, ChecklistRespuesta } from './use-checklist-data-multiple'

interface ExcelExportMultiple {
  exportToExcel: (registro: ChecklistRegistro, respuestasPorApartado: Record<string, Map<string, ChecklistRespuesta>>) => Promise<void>
  isExporting: boolean
}

export function useExcelExportMultiple(): ExcelExportMultiple {
  const [isExporting, setIsExporting] = useState(false)

  const exportToExcel = async (
    registro: ChecklistRegistro, 
    respuestasPorApartado: Record<string, Map<string, ChecklistRespuesta>>
  ) => {
    console.log('🚀🚀🚀 INICIANDO EXPORTACIÓN MÚLTIPLE - HOOK CORRECTO 🚀🚀🚀')
    console.log('�🚀🚀 STACK TRACE:', new Error().stack?.split('\n')[1])
    console.log('�📋 Registro:', registro.contrato)
    console.log('📊 Respuestas por apartado:', Object.keys(respuestasPorApartado))
    
    setIsExporting(true)
    
    try {
      // Preparar datos para la exportación
      const exportData: {
        contrato: string
        contratista: string
        valor: number
        objeto: string
        apartados: Record<string, any[]>
      } = {
        contrato: registro.contrato,
        contratista: registro.contratista,
        valor: registro.valor,
        objeto: registro.objeto,
        apartados: {}
      }

      // Convertir respuestas de cada apartado a formato serializable
      const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS']
      
      apartados.forEach(apartado => {
        const respuestasMap = respuestasPorApartado[apartado] || new Map()
        const respuestasArray = Array.from(respuestasMap.values())
        
        exportData.apartados[apartado] = respuestasArray.map(resp => ({
          item_id: resp.item_id,
          respuesta: resp.respuesta,
          observaciones: resp.observaciones
        }))
      })

      // Llamar al endpoint de exportación
      const response = await fetch('/api/lista-chequeo/export-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
      })

      if (!response.ok) {
        throw new Error('Error al exportar datos')
      }

      // Descargar el archivo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `Lista-Chequeo-${registro.contrato}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Error en exportación:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportToExcel,
    isExporting
  }
}
