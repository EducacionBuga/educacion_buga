// hooks/use-excel-export.ts
import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface ExportOptions {
  registroId: string
  numeroContrato: string
  categoria: string
}

export function useExcelExport() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportarExcel = useCallback(async (options: ExportOptions) => {
    setIsExporting(true)
    
    try {
      // Llamar a la API de exportación
      const response = await fetch(`/api/lista-chequeo/export/${options.registroId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Obtener el nombre del archivo desde el header
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `Lista_Chequeo_${options.categoria}_${options.numeroContrato}.xlsx`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Convertir a blob y descargar
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "📄 Exportación exitosa",
        description: `El archivo ${filename} se ha descargado correctamente`,
      })

      return true

    } catch (error) {
      console.error('Error al exportar Excel:', error)
      
      toast({
        title: "❌ Error en la exportación",
        description: error instanceof Error ? error.message : "No se pudo exportar el archivo Excel",
        variant: "destructive"
      })

      return false

    } finally {
      setIsExporting(false)
    }
  }, [toast])

  return {
    exportarExcel,
    isExporting
  }
}

export default useExcelExport
