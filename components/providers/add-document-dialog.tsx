"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Folder, DocumentCategory } from "@/types/documents"

interface AddDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: Folder[]
  onAddDocument: (data: {
    name: string
    description: string
    folderId: string
    file: File
  }) => void
  defaultFolderId?: string
}

export function AddDocumentDialog({
  open,
  onOpenChange,
  folders,
  onAddDocument,
  defaultFolderId,
}: AddDocumentDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<DocumentCategory>("preContractual")
  const [folderId, setFolderId] = useState(defaultFolderId || "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño máximo (15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El archivo no debe superar 15MB",
        variant: "destructive",
      })
      return
    }

    // Detectar tipo de archivo de manera más precisa
    let fileType = file.type

    // Si el tipo está vacío, intentar detectarlo por la extensión
    const extension = file.name.split(".").pop()?.toLowerCase()
    if (extension === "pdf") fileType = "application/pdf"
    else if (["doc", "docx"].includes(extension || "")) fileType = "application/msword"
    else if (["xls", "xlsx"].includes(extension || "")) fileType = "application/vnd.ms-excel"
    else if (["jpg", "jpeg"].includes(extension || "")) fileType = "image/jpeg"
    else if (extension === "png") fileType = "image/png"
    else fileType = `unknown/${extension || "binary"}`

    setSelectedFile(file)
  }

  const handleSubmit = async () => {
    if (!name || !folderId || !selectedFile) {
      toast({
        title: "Información incompleta",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      await onAddDocument({
        name,
        description,
        folderId,
        file: selectedFile,
      })

      // Limpiar el formulario
      setName("")
      setDescription("")
      setFolderId(defaultFolderId || "")
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error al subir documento:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el documento. Intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Documento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document-name" className="text-right">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="document-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Nombre del documento"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document-description" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="document-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Descripción opcional del documento"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document-category" className="text-right">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value as DocumentCategory)
                setFolderId("") // Resetear la carpeta seleccionada al cambiar de categoría
              }}
            >
              <SelectTrigger id="document-category" className="col-span-3">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preContractual">Documentos Pre Contractuales</SelectItem>
                <SelectItem value="execution">Documentos de Ejecución Contractual</SelectItem>
                <SelectItem value="closure">Documentos de Cierre Contractual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document-folder" className="text-right">
              Carpeta <span className="text-red-500">*</span>
            </Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger id="document-folder" className="col-span-3">
                <SelectValue placeholder="Seleccionar carpeta" />
              </SelectTrigger>
              <SelectContent>
                {folders
                  .filter((folder) => folder.category === category)
                  .map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document-file" className="text-right">
              Archivo <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <input
                ref={fileInputRef}
                id="document-file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSelectFile}
                  className="w-full justify-start hover:bg-primary/10 active:bg-primary/20 active:scale-95 transition-all duration-200"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Seleccionar
                </Button>
                <p className="text-xs text-muted-foreground">
                  Tamaño máximo: 15MB. Formatos permitidos: PDF, DOCX, XLSX, JPG, PNG.
                </p>
              </div>
            </div>
          </div>

          {selectedFile && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">Archivo seleccionado:</div>
              <div className="col-span-3 text-sm">
                <div className="p-2 border rounded bg-muted/50">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedFile.type || "Tipo desconocido"} • {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={!name || !folderId || !selectedFile || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Función auxiliar para formatear el tamaño del archivo
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
