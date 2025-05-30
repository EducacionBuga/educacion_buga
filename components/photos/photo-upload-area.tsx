"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface PhotoUploadAreaProps {
  onFileSelect: (file: File) => void
}

export function PhotoUploadArea({ onFileSelect }: PhotoUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const validateFile = (file: File) => {
    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato no soportado",
        description: "Por favor, suba una imagen en formato JPG, PNG, GIF o WEBP.",
        variant: "destructive",
      })
      return false
    }

    // Validar tamaño (3MB máximo)
    const maxSize = 3 * 1024 * 1024 // 3MB
    if (file.size > maxSize) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 3MB.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const processFile = (file: File) => {
    if (!validateFile(file)) return

    // Generar vista previa
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Notificar al componente padre
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragging
          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
          : "border-gray-300 hover:border-green-400 dark:border-gray-600 dark:hover:border-green-600",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
      role="button"
      aria-label="Arrastra y suelta una imagen o haz clic para seleccionar"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleButtonClick()
        }
      }}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
      />

      {preview ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md mx-auto mb-4 aspect-video overflow-hidden rounded-md">
            <img src={preview || "/placeholder.svg"} alt="Vista previa" className="object-cover w-full h-full" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Imagen seleccionada. Haz clic para cambiar.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={(e) => {
              e.stopPropagation()
              setPreview(null)
              if (fileInputRef.current) fileInputRef.current.value = ""
            }}
          >
            Eliminar selección
          </Button>
        </div>
      ) : (
        <>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <Camera className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Arrastra y suelta tu imagen aquí</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">O haz clic para seleccionar</p>
          <Button type="button" variant="outline" className="mx-auto">
            <Upload className="mr-2 h-4 w-4" />
            Seleccionar imagen
          </Button>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Formatos soportados: JPG, PNG, GIF, WEBP (máx. 3MB)
          </p>
        </>
      )}
    </div>
  )
}
