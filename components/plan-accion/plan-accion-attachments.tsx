"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { File, Upload, Download, Trash2, Eye } from "lucide-react"

interface PlanAccionAttachmentsProps {
  activityId: string
  areaId: string
  readOnly?: boolean
}

// Tipos de adjuntos
const ATTACHMENT_TYPES = [
  { id: "soporte", name: "Documento de Soporte" },
  { id: "evidencia", name: "Evidencia de Cumplimiento" },
  { id: "otro", name: "Otro" },
]

export function PlanAccionAttachments({ activityId, areaId, readOnly = false }: PlanAccionAttachmentsProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
  })
  const [attachments, setAttachments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor seleccione un archivo",
        variant: "destructive",
      })
      return
    }

    // Validar tipo de archivo
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Tipo de archivo no permitido",
        description: "Solo se permiten archivos PDF, Word, Excel e imágenes",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (15MB máximo)
    if (selectedFile.size > 15 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 15MB",
        variant: "destructive",
      })
      return
    }

    // Simulación de subida
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newAttachment = {
      id: Math.random().toString(36).substring(2, 9),
      ...formData,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      createdAt: new Date().toISOString(),
    }

    setAttachments((prev) => [...prev, newAttachment])
    setLoading(false)
    setShowForm(false)
    setSelectedFile(null)
    setFormData({
      name: "",
      description: "",
      type: "",
    })

    toast({
      title: "Documento adjuntado correctamente",
      description: `El documento "${formData.name}" ha sido adjuntado con éxito.`,
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este documento? Esta acción no se puede deshacer.")) {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setAttachments((prev) => prev.filter((a) => a.id !== id))
      setLoading(false)

      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente.",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("word")) return "📝"
    if (fileType.includes("excel")) return "📊"
    if (fileType.includes("image")) return "🖼️"
    return "📎"
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Documentos Adjuntos</CardTitle>
          {!readOnly && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Adjuntar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-md">
            <File className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos adjuntos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {readOnly
                ? "Esta actividad no tiene documentos adjuntos."
                : "Adjunte documentos de soporte o evidencias para esta actividad."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getFileIcon(attachment.fileType)}</div>
                  <div>
                    <h4 className="text-sm font-medium">{attachment.name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500">
                      <span>{attachment.fileName}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="capitalize">
                        {ATTACHMENT_TYPES.find((t) => t.id === attachment.type)?.name || attachment.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" title="Ver documento">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Descargar documento">
                    <Download className="h-4 w-4" />
                  </Button>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(attachment.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar documento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjuntar Documento</DialogTitle>
            <DialogDescription>Adjunte un documento de soporte o evidencia para esta actividad.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del Documento</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Documento</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTACHMENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file">Archivo</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500">
                  Formatos permitidos: PDF, Word, Excel, JPG, PNG. Tamaño máximo: 15MB
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Subiendo..." : "Adjuntar Documento"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
