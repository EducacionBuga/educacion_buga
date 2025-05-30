"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { FileUp, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ALLOWED_FILE_TYPES } from "@/constants/areas"
import { cn } from "@/lib/utils"

interface UploadAreaProps {
  onFileSelected: (file: File) => void
  isUploading?: boolean
}

export function UploadArea({ onFileSelected, isUploading = false }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelected(e.dataTransfer.files[0])
      }
    },
    [onFileSelected],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFileSelected(e.target.files[0])
      }
    },
    [onFileSelected],
  )

  const openFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  // Obtener extensiones de los tipos MIME para mostrar al usuario
  const allowedExtensions = ALLOWED_FILE_TYPES.map((type) => {
    switch (type) {
      case "application/pdf":
        return "PDF"
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "DOCX"
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return "XLSX"
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return "PPTX"
      default:
        return ""
    }
  })
    .filter(Boolean)
    .join(", ")

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200",
        isDragging
          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
          : "border-gray-300 hover:border-orange-400 dark:border-gray-700",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label="Arrastra y suelta tus archivos aquí o haz clic para seleccionar"
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
          <FileUp className="h-8 w-8 text-orange-500" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Arrastra y suelta tus archivos aquí</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">O haz clic para seleccionar archivos</p>
        </div>
        <Button variant="outline" onClick={openFileSelector} className="mt-2" disabled={isUploading}>
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
          {isUploading ? "Subiendo..." : "Seleccionar archivo"}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept={ALLOWED_FILE_TYPES.join(",")}
          aria-label="Seleccionar archivo"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Formatos soportados: {allowedExtensions} | Tamaño máximo: 15MB
        </p>
      </div>
    </div>
  )
}
