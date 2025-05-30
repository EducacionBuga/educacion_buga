"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { FileUp, Upload, Image, FileText, FolderOpen, Camera, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// Tipos de upload disponibles
export type UploadType = "document" | "informe" | "registro" | "plan-accion"

// Configuración para cada tipo de upload
export const UPLOAD_CONFIGS = {
  document: {
    icon: FileText,
    title: "Subir Documento",
    description: "Arrastra y suelta un documento aquí",
    acceptedTypes: [
      "application/pdf",
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif"
    ] as const,
    maxSize: 50 * 1024 * 1024, // 50MB
    extensions: "PDF, DOC, XLS, PPT, TXT, JPG, PNG",
    apiEndpoint: "/api/documents/upload"
  },
  informe: {
    icon: FileText,
    title: "Subir Informe de Ejecución",
    description: "Arrastra y suelta un informe aquí",
    acceptedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ] as const,
    maxSize: 50 * 1024 * 1024, // 50MB
    extensions: "PDF, DOC, XLS, PPT",
    apiEndpoint: "/api/informes/upload"
  },
  registro: {
    icon: Camera,
    title: "Subir Registro Fotográfico", 
    description: "Arrastra y suelta una imagen aquí",
    acceptedTypes: [
      "image/jpeg",
      "image/png", 
      "image/gif",
      "image/webp"
    ] as const,
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: "JPG, PNG, GIF, WEBP",
    apiEndpoint: "/api/registros/upload"
  },
  "plan-accion": {
    icon: FolderOpen,
    title: "Subir Adjunto Plan de Acción",
    description: "Arrastra y suelta un documento aquí",
    acceptedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint", 
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/csv"
    ] as const,
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: "PDF, DOC, XLS, PPT, CSV",
    apiEndpoint: "/api/plan-accion/upload"
  }
} as const

interface UniversalUploadProps {
  type: UploadType
  areaId: string
  onUploadSuccess?: (result: any) => void
  onUploadError?: (error: string) => void
  className?: string
  // Props específicos por tipo
  folderId?: string // Para documentos
  moduleType?: string // Para documentos  
  activityId?: string // Para plan de acción
}

interface UploadMetadata {
  name: string
  description?: string
  date?: string
  location?: string
  tags?: string[]
}

export function UniversalUpload({
  type,
  areaId,
  onUploadSuccess,
  onUploadError,
  className,
  folderId,
  moduleType,
  activityId
}: UniversalUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<UploadMetadata>({
    name: "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  const config = UPLOAD_CONFIGS[type]
  const IconComponent = config.icon
  // Validar archivo
  const validateFile = useCallback((file: File): boolean => {
    // Validar tipo
    if (!(config.acceptedTypes as readonly string[]).includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: `Solo se permiten archivos: ${config.extensions}`,
        variant: "destructive"
      })
      return false
    }

    // Validar tamaño
    if (file.size > config.maxSize) {
      const maxSizeMB = Math.round(config.maxSize / (1024 * 1024))
      toast({
        title: "Archivo demasiado grande",
        description: `El archivo debe ser menor a ${maxSizeMB}MB`,
        variant: "destructive"
      })
      return false
    }

    return true
  }, [config, toast])

  // Procesar archivo seleccionado
  const processFile = useCallback((file: File) => {
    if (!validateFile(file)) return

    setSelectedFile(file)
    setMetadata(prev => ({ ...prev, name: file.name.split('.')[0] }))

    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }, [validateFile])

  // Handlers de drag & drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }, [processFile])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }, [processFile])

  const openFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  // Subir archivo
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !metadata.name.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    
    try {      const formData = new FormData()
      formData.append("file", selectedFile)
      
      // Para registros (fotos), usar 'title' en lugar de 'name'
      if (type === "registro") {
        formData.append("title", metadata.name)
      } else {
        formData.append("name", metadata.name)
      }
      
      formData.append("areaId", areaId)
      
      if (metadata.description) {
        formData.append("description", metadata.description)
      }
      
      if (metadata.date) {
        formData.append("date", metadata.date)
      }

      if (metadata.location) {
        formData.append("location", metadata.location)
      }

      // Props específicos por tipo
      if (type === "document") {
        if (folderId) formData.append("folderId", folderId)
        if (moduleType) formData.append("moduleType", moduleType)
      } else if (type === "plan-accion") {
        if (activityId) formData.append("activityId", activityId)
      }

      const response = await fetch(config.apiEndpoint, {
        method: "POST",
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al subir archivo")
      }

      toast({
        title: "¡Archivo subido exitosamente!",
        description: `${metadata.name} se ha subido correctamente`,
      })

      // Reset form
      setSelectedFile(null)
      setPreview(null)
      setMetadata({
        name: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
      })

      onUploadSuccess?.(result)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast({
        title: "Error al subir archivo",
        description: errorMessage,
        variant: "destructive"
      })
      onUploadError?.(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, metadata, areaId, config, type, folderId, moduleType, activityId, toast, onUploadSuccess, onUploadError])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Área de upload */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 hover:border-blue-400 dark:border-gray-700",
          selectedFile && "border-green-500 bg-green-50 dark:bg-green-900/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
        role="button"
        tabIndex={0}
        aria-label={config.description}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            "rounded-full p-3",
            selectedFile 
              ? "bg-green-100 dark:bg-green-900/30" 
              : "bg-blue-100 dark:bg-blue-900/30"
          )}>
            {selectedFile ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <IconComponent className="h-8 w-8 text-blue-500" />
            )}
          </div>
          
          {preview && (
            <div className="relative">
              <img 
                src={preview} 
                alt="Vista previa" 
                className="max-h-32 max-w-32 object-cover rounded-lg border"
              />
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium">
              {selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : config.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedFile ? "Haz clic para cambiar archivo" : config.description}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-2" 
            disabled={isUploading}
            onClick={(e) => {
              e.stopPropagation()
              openFileSelector()
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            {selectedFile ? "Cambiar archivo" : "Seleccionar archivo"}
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
            accept={config.acceptedTypes.join(",")}
            aria-label="Seleccionar archivo"
          />
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formatos: {config.extensions} | Máximo: {Math.round(config.maxSize / (1024 * 1024))}MB
          </p>
        </div>
      </div>

      {/* Formulario de metadatos */}
      {selectedFile && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
          <h4 className="font-medium text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información del archivo
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={metadata.name}
                onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del archivo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={metadata.date}
                onChange={(e) => setMetadata(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción opcional del archivo"
              rows={3}
            />
          </div>

          {type === "registro" && (
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={metadata.location}
                onChange={(e) => setMetadata(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ubicación donde se tomó la foto"
              />
            </div>
          )}
          
          <Button 
            onClick={handleUpload}
            disabled={isUploading || !metadata.name.trim()}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir {config.title.split(' ').slice(1).join(' ')}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
