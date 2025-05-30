"use client"

import { File, Download, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Report } from "@/types/reports"
import { AREAS } from "@/constants/areas"

// Primero, importemos el Dialog para mostrar la previsualización
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

// Modificar la interfaz ReportItemProps para incluir la URL del archivo si existe
interface ReportItemProps {
  report: Report
  onDelete: (id: string) => void
  onView?: (report: Report) => void
  onDownload?: (report: Report) => void
  fileUrl?: string // URL opcional para previsualización
}

// Reemplazar la función ReportItem con esta versión actualizada que incluye previsualización
export function ReportItem({ report, onDelete, onView, onDownload, fileUrl }: ReportItemProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const areaColor = AREAS.find((a) => a.key === report.area)?.color || "bg-gray-100 text-gray-800"

  // Actualizar la función getFileType para mejor detección de tipos de archivo
  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""
    if (["pdf"].includes(extension)) return "pdf"
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image"
    if (["doc", "docx"].includes(extension)) return "word"
    if (["xls", "xlsx"].includes(extension)) return "excel"
    if (["ppt", "pptx"].includes(extension)) return "powerpoint"
    return "other"
  }

  const fileType = getFileType(report.name)

  // Función para manejar la vista previa
  const handlePreview = () => {
    if (onView) onView(report)
    setPreviewOpen(true)
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg gap-3">
        <div className="flex items-center space-x-3">
          <File className="h-5 w-5 text-orange-500 flex-shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-medium truncate">{report.name}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {report.area && <Badge className={areaColor}>{report.areaLabel}</Badge>}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(report.date).toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {(report.file.size / 1024).toFixed(2)} KB
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <Button variant="ghost" size="icon" title="Ver informe" aria-label="Ver informe" onClick={handlePreview}>
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Descargar informe"
            aria-label="Descargar informe"
            onClick={() => onDownload && onDownload(report)}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            title="Eliminar informe"
            aria-label="Eliminar informe"
            onClick={() => onDelete(report.id)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Diálogo de previsualización */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{report.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto h-full">
            {fileUrl ? (
              fileType === "pdf" ? (
                <iframe src={`${fileUrl}#toolbar=1`} className="w-full h-full border-0" title={report.name} />
              ) : fileType === "word" ? (
                <div className="flex flex-col h-full">
                  <div className="bg-blue-50 p-3 mb-2 rounded-md">
                    <p className="text-sm text-blue-700">
                      Visualizando documento Word. Para una mejor experiencia, puede usar el botón de descarga.
                    </p>
                  </div>
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + "/api/proxy-document?url=" + encodeURIComponent(fileUrl))}`}
                    className="w-full flex-1 border-0"
                    title={report.name}
                  />
                </div>
              ) : fileType === "image" ? (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={fileUrl || "/placeholder.svg"}
                    alt={report.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <File className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">Vista previa no disponible</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Este tipo de archivo no puede previsualizarse directamente. Por favor, descargue el archivo para
                    verlo.
                  </p>
                  <Button className="mt-4" onClick={() => onDownload && onDownload(report)}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar archivo
                  </Button>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <File className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium">Vista previa no disponible</p>
                <p className="text-sm text-gray-500 mt-2">No se ha proporcionado una URL para este archivo.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
