"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface PlanAccionUploadProps {
  selectedFile: File | null
  isUploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
}

export function PlanAccionUpload({ selectedFile, isUploading, onFileChange, onUpload }: PlanAccionUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
      <h3 className="font-medium mb-4 text-center">Actualizar Plan de Acción</h3>
      <div className="text-center">
        <Input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
          onChange={onFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600 mb-2">
            {selectedFile ? selectedFile.name : "Haga clic para seleccionar un archivo"}
          </span>
          <span className="text-xs text-gray-500">Formatos permitidos: PDF, Excel (máx. 1MB)</span>
        </label>
        {selectedFile && (
          <Button className="mt-4" onClick={onUpload} disabled={isUploading}>
            {isUploading ? (
              <>Subiendo...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Actualizar Plan de Acción
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
