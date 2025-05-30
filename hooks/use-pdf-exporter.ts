"use client"

import { useState, type RefObject } from "react"
import { toast } from "@/components/ui/use-toast"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export function usePdfExporter(tableRef: RefObject<HTMLDivElement>) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    if (!tableRef.current) return

    setIsExporting(true)
    try {
      // Mostrar mensaje de carga
      toast({
        title: "Generando PDF",
        description: "Por favor espere mientras se genera el documento...",
      })

      // Capturar la tabla como imagen
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      // Crear un nuevo documento PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Añadir título
      pdf.setFontSize(16)
      pdf.text("Lista de Chequeo - Gestión documental contractual", 14, 15)

      // Añadir fecha
      pdf.setFontSize(10)
      pdf.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 14, 22)

      // Añadir la imagen de la tabla
      const imgData = canvas.toDataURL("image/png")
      const imgWidth = 280
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 14, 30, imgWidth, imgHeight)

      // Guardar el PDF
      pdf.save(`Lista_de_Chequeo_${new Date().toISOString().split("T")[0]}.pdf`)

      // Mostrar mensaje de éxito
      toast({
        title: "PDF generado",
        description: "El documento PDF se ha generado correctamente.",
      })
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      toast({
        title: "Error",
        description: "Error al generar el PDF. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportToPDF,
    isExporting,
  }
}
