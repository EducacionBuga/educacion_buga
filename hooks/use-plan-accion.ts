"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import type { PlanAccionItem, DocumentoBase } from "@/types/plan-accion"
import planAccionData from "@/data/plan-accion-data.json"

// Documento base predeterminado
const documentoBaseDefault: DocumentoBase = {
  id: "plan-accion-2025",
  nombre: "Plan de Acción 2025",
  fecha: "15/04/2025",
  tipo: "PDF",
  tamaño: "1.2 MB",
  estado: "Activo",
  url: "/plan-accion-2025.pdf", // URL simulada
}

export function usePlanAccion() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [documento, setDocumento] = useState<DocumentoBase>(documentoBaseDefault)
  const [isUploading, setIsUploading] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [items] = useState<PlanAccionItem[]>(planAccionData as PlanAccionItem[])

  // Crear el blob del PDF al cargar el componente
  useEffect(() => {
    const htmlContent = createPlanAccionPDF()
    const blob = new Blob([htmlContent], { type: "text/html" })
    setPdfBlob(blob)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validar tamaño máximo (1MB)
      if (file.size > 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo excede el tamaño máximo permitido (1MB)",
          variant: "destructive",
        })
        return
      }

      // Validar tipo de archivo
      if (!file.type.includes("pdf") && !file.type.includes("excel") && !file.type.includes("spreadsheet")) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF o Excel",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return

    setIsUploading(true)

    // Simulación de carga
    setTimeout(() => {
      // Actualizar el documento con la nueva información
      setDocumento({
        ...documento,
        nombre: selectedFile.name,
        fecha: new Date().toLocaleDateString(),
        tamaño: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        tipo: selectedFile.type.includes("pdf") ? "PDF" : "Excel",
      })

      setSelectedFile(null)
      setIsUploading(false)

      toast({
        title: "Éxito",
        description: "El Plan de Acción ha sido actualizado correctamente",
      })
    }, 1500)
  }

  const openDocumentViewer = () => {
    setIsViewerOpen(true)
  }

  const handleDownload = () => {
    if (!pdfBlob) {
      toast({
        title: "Error",
        description: "No se pudo generar el documento para descargar",
        variant: "destructive",
      })
      return
    }

    try {
      // Crear URL para el blob
      const url = URL.createObjectURL(pdfBlob)

      // Crear un enlace para descargar
      const a = document.createElement("a")
      a.href = url
      a.download = `Plan_de_Accion_${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()

      // Limpiar
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      toast({
        title: "Descarga iniciada",
        description: "El Plan de Acción se está descargando",
      })
    } catch (error) {
      console.error("Error al descargar:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al descargar el documento",
        variant: "destructive",
      })
    }
  }

  // Crear el contenido del PDF para descargar
  const createPlanAccionPDF = () => {
    // Crear el contenido HTML
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Plan de Acción - Secretaría de Educación</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #1e40af; }
          .header { margin-bottom: 20px; }
          .date { text-align: right; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th { background-color: #e5e7eb; color: #1e40af; text-align: left; padding: 8px; border: 1px solid #d1d5db; }
          td { padding: 6px; border: 1px solid #d1d5db; vertical-align: top; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Plan de Acción 2025</h1>
          <h2 style="text-align: center; color: #4b5563;">Secretaría de Educación de Guadalajara de Buga</h2>
        </div>
        <div class="date">Fecha de generación: ${new Date().toLocaleDateString()}</div>
        
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Meta de Producto PDM 2024-2027</th>
              <th>Actividad a Realizar</th>
              <th>Proceso / Estrategia</th>
              <th>Presupuesto Disponible</th>
              <th>Presupuesto Ejecutado</th>
              <th>Porcentaje de Avance</th>
              <th>Recursos Necesarios</th>
              <th>Indicador de Gestión</th>
              <th>Unidad de Medida</th>
              <th>Fórmula del Indicador</th>
              <th>Período Propuesto</th>
              <th>Fecha de Inicio</th>
              <th>Fecha de Finalización</th>
              <th>Responsable</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
    `

    // Agregar filas para cada elemento del plan de acción
    items.forEach((item) => {
      htmlContent += `
        <tr>
          <td>${item.numero}</td>
          <td>${item.meta}</td>
          <td>${item.actividad}</td>
          <td>${item.proceso}</td>
          <td>${item.presupuestoDisponible}</td>
          <td>${item.presupuestoEjecutado}</td>
          <td>${item.porcentajeAvance}</td>
          <td>${item.recursosNecesarios}</td>
          <td>${item.indicador}</td>
          <td>${item.unidadMedida}</td>
          <td>${item.formula}</td>
          <td>${item.periodo}</td>
          <td>${item.fechaInicio}</td>
          <td>${item.fechaFin}</td>
          <td>${item.responsable}</td>
          <td>${item.estado}</td>
        </tr>
      `
    })

    // Cerrar la tabla y el documento HTML
    htmlContent += `
          </tbody>
        </table>
        
        <div class="footer">
          <p>Este documento es parte del Plan de Acción oficial de la Secretaría de Educación de Guadalajara de Buga.</p>
        </div>
      </body>
      </html>
    `

    return htmlContent
  }

  return {
    items,
    documento,
    selectedFile,
    isViewerOpen,
    isUploading,
    handleFileChange,
    handleUpload,
    openDocumentViewer,
    setIsViewerOpen,
    handleDownload,
  }
}
