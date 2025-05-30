"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Eye,
  FileIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  File,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import type { Document, Folder } from "@/types/documents"

interface DocumentListProps {
  documents: Document[]
  onDeleteDocument: (documentId: string, documentName: string) => void
  onAddDocument: () => void
  folder: Folder
}

export function DocumentList({ documents, onDeleteDocument, onAddDocument, folder }: DocumentListProps) {
  const [viewDocument, setViewDocument] = useState<Document | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isBrave, setIsBrave] = useState(false)
  const { toast } = useToast()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const objectRef = useRef<HTMLObjectElement>(null)

  // Detectar navegador Brave
  useEffect(() => {
    const detectBrave = async () => {
      // @ts-ignore - navigator.brave existe en Brave but not in TypeScript types
      if (navigator.brave && (await navigator.brave.isBrave())) {
        setIsBrave(true)
      } else if (
        // Alternative detection based on Brave features
        navigator.userAgent.includes("Chrome") &&
        !navigator.userAgent.includes("Edg") &&
        !navigator.userAgent.includes("OPR") &&
        // Brave blocks certain fingerprinting APIs
        !window.navigator.plugins.length &&
        !window.navigator.mimeTypes.length
      ) {
        setIsBrave(true)
      }
    }

    detectBrave().catch(() => {
      // If detection fails, assume it's not Brave
      setIsBrave(false)
    })
  }, [])

  const handleDownload = async (doc: Document) => {
    if (!doc.filePath) {
      toast({
        title: "Error",
        description: "No se puede descargar el documento.",
        variant: "destructive",
      })
      return
    }

    try {
      // Obtener URL firmada para descarga
      const response = await fetch(`/api/documents/download?path=${encodeURIComponent(doc.filePath)}`)

      if (!response.ok) {
        throw new Error("Error generating download URL")
      }

      const { fileUrl } = await response.json()

      // Crear un enlace para descargar el archivo
      const a = window.document.createElement("a")
      a.href = fileUrl
      a.download = doc.name || "documento"
      a.target = "_blank"
      a.rel = "noopener noreferrer"
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)

      toast({
        title: "Descarga iniciada",
        description: `El documento "${doc.name}" se está descargando.`,
      })
    } catch (error) {
      console.error("Error al descargar:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al descargar el documento.",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes("pdf")) return <FileIcon className="h-5 w-5 text-red-500" />
    if (fileType?.includes("word") || fileType?.includes("document"))
      return <FileIcon className="h-5 w-5 text-blue-500" />
    if (fileType?.includes("sheet") || fileType?.includes("excel") || fileType?.includes("spreadsheet"))
      return <FileIcon className="h-5 w-5 text-green-500" />
    if (
      fileType?.includes("image") ||
      fileType?.includes("png") ||
      fileType?.includes("jpg") ||
      fileType?.includes("jpeg")
    )
      return <FileIcon className="h-5 w-5 text-purple-500" />
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return "Desconocido"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleResetView = () => {
    setZoomLevel(1)
    setRotation(0)
  }

  const isImageFile = (fileType: string) => {
    if (!fileType) return false
    return (
      fileType.includes("image") ||
      fileType.includes("png") ||
      fileType.includes("jpg") ||
      fileType.includes("jpeg") ||
      fileType.includes("gif") ||
      fileType.includes("webp") ||
      fileType.includes("svg")
    )
  }

  const isPdfFile = (fileType: string) => {
    if (!fileType) return false
    return fileType.includes("pdf")
  }

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const getDocumentPreview = () => {
    if (!viewDocument || !viewDocument.fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <File className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No se puede mostrar el documento</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            No se encontró la URL del documento o el documento no está disponible.
          </p>
        </div>
      )
    }

    // Resetear error de previsualización
    if (previewError && !isImageFile(viewDocument.fileType)) {
      setPreviewError(null)
    }

    // Para imágenes
    if (isImageFile(viewDocument.fileType)) {
      return (
        <div className="relative flex items-center justify-center h-full p-4">
          <img
            src={viewDocument.fileUrl || "/placeholder.svg"}
            alt={viewDocument.name}
            className="max-w-full max-h-[60vh] object-contain transition-all duration-300"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
            }}
            onError={() => {
              setPreviewError("No se pudo cargar la imagen. Puede que el formato no sea compatible con su navegador.")
            }}
            crossOrigin="anonymous"
          />
          {previewError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="bg-card p-4 rounded-md shadow-lg max-w-md text-center">
                <h3 className="text-lg font-medium mb-2">Error de visualización</h3>
                <p className="text-sm text-muted-foreground mb-4">{previewError}</p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" onClick={() => handleDownload(viewDocument)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                  {viewDocument.fileUrl && (
                    <Button variant="default" onClick={() => openInNewTab(viewDocument.fileUrl || "")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir en nueva pestaña
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Para PDFs - Usando diferentes métodos según el navegador
    if (isPdfFile(viewDocument.fileType)) {
      // En Brave, usamos  en lugar de  para mejor compatibilidad
      if (isBrave) {
        return (
          <div className="relative w-full h-full flex-1">
            <object
              ref={objectRef}
              data={viewDocument.fileUrl}
              type="application/pdf"
              className="w-full h-full min-h-[60vh]"
              onError={() => {
                setPreviewError("No se pudo cargar el PDF en este navegador.")
              }}
            >
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Su navegador no puede mostrar PDFs integrados.
                </p>
                <div className="flex mt-4 space-x-2">
                  <Button variant="outline" onClick={() => handleDownload(viewDocument)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                  <Button variant="default" onClick={() => openInNewTab(viewDocument.fileUrl || "")}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir en nueva pestaña
                  </Button>
                </div>
              </div>
            </object>
          </div>
        )
      }

      // Para otros navegadores, usamos iframe con sandbox limitado
      return (
        <div className="relative w-full h-full flex-1">
          <iframe
            ref={iframeRef}
            src={viewDocument.fileUrl}
            className="w-full h-full min-h-[60vh] border-0"
            title={viewDocument.name}
            sandbox="allow-same-origin allow-scripts"
            onError={() => {
              setPreviewError("No se pudo cargar el PDF en este navegador.")
            }}
          />
          {previewError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="bg-card p-4 rounded-md shadow-lg max-w-md text-center">
                <h3 className="text-lg font-medium mb-2">Error de visualización</h3>
                <p className="text-sm text-muted-foreground mb-4">{previewError}</p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" onClick={() => handleDownload(viewDocument)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                  {viewDocument.fileUrl && (
                    <Button variant="default" onClick={() => openInNewTab(viewDocument.fileUrl || "")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir en nueva pestaña
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Fallback para otros tipos de documentos
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <File className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Vista previa no disponible</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Este tipo de documento ({viewDocument.fileType || "desconocido"}) no puede visualizarse directamente en el
          navegador.
        </p>
        <div className="flex mt-4 space-x-2">
          <Button variant="outline" onClick={() => handleDownload(viewDocument)}>
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
          {viewDocument.fileUrl && (
            <Button variant="default" onClick={() => openInNewTab(viewDocument.fileUrl || "")}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir en nueva pestaña
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Documentos en {folder.name}</h3>
          <Button onClick={onAddDocument} size="sm" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Agregar Documento
          </Button>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((document) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-md border bg-card"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(document.fileType)}
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(document.fileSize)}</span>
                      {document.createdAt && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    {document.description && (
                      <p className="text-xs text-muted-foreground mt-1">{document.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (document && document.fileUrl) {
                        setViewDocument({ ...document })
                        setPreviewError(null)
                      } else {
                        toast({
                          title: "Error",
                          description: "No se puede visualizar este documento.",
                          variant: "destructive",
                        })
                      }
                    }}
                    title="Ver documento"
                    disabled={!document.fileUrl}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDownload(document)}
                    title="Descargar documento"
                    disabled={!document.fileUrl}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteDocument(document.id, document.name)}
                    title="Eliminar documento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center border rounded-md">
            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hay documentos</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              No se encontraron documentos en esta carpeta. Agregue un documento para comenzar.
            </p>
            <Button onClick={onAddDocument} className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Agregar Documento
            </Button>
          </div>
        )}
      </div>

      {/* Diálogo mejorado para visualizar documentos */}
      <Dialog
        open={viewDocument !== null}
        onOpenChange={(open) => {
          if (!open) {
            setViewDocument(null)
            setZoomLevel(1)
            setRotation(0)
            setPreviewError(null)
          }
        }}
      >
        <DialogContent className="max-w-5xl w-[90vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="truncate max-w-[400px]">{viewDocument?.name || "Documento"}</DialogTitle>
              <div className="flex items-center space-x-2">
                {viewDocument && viewDocument.fileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInNewTab(viewDocument.fileUrl || "")}
                    title="Abrir en nueva pestaña"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col m-0 p-0">
              <ScrollArea className="flex-1">{getDocumentPreview()}</ScrollArea>

              {viewDocument &&
                (isImageFile(viewDocument.fileType) || isPdfFile(viewDocument.fileType)) &&
                !previewError && (
                  <div className="border-t p-2 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center space-x-2">
                      {isImageFile(viewDocument.fileType) && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 0.5}
                            title="Reducir zoom"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <span className="text-xs">{Math.round(zoomLevel * 100)}%</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= 3}
                            title="Aumentar zoom"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={handleRotate} title="Rotar imagen">
                            <RotateCw className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={handleResetView} title="Restablecer vista">
                            <Maximize className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDocument && handleDownload(viewDocument)}
                      className="ml-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
