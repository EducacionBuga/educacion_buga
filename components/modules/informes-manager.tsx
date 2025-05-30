"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { File, Search, Calendar, Upload, Trash2, Download, Eye, Loader2 } from "lucide-react"
import { useInformesManager } from "@/hooks/use-informes-manager"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AREAS } from "@/constants/areas"

interface InformesManagerProps {
  title: string
  description: string
  areaId?: string
}

export function InformesManager({ title, description, areaId }: InformesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    areaId: areaId || "",
    date: format(new Date(), "yyyy-MM-dd"),
  })
  const { toast } = useToast()

  const { informes, loading, error, addInforme, deleteInforme, refetch } = useInformesManager(areaId)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Tipo de archivo no permitido",
        description: "Solo se permiten archivos PDF, Word, Excel y PowerPoint",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (50MB máximo)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 50MB",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await addInforme({
        ...formData,
        file: selectedFile,
      })

      if (result) {
        setShowForm(false)
        setSelectedFile(null)
        setFormData({
          name: "",
          description: "",
          areaId: areaId || "",
          date: format(new Date(), "yyyy-MM-dd"),
        })

        toast({
          title: "Informe subido correctamente",
          description: `El informe "${formData.name}" ha sido subido con éxito.`,
        })
      } else {
        toast({
          title: "Error al subir el informe",
          description: "Por favor intente nuevamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al subir el informe.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este informe? Esta acción no se puede deshacer.")) {
      const success = await deleteInforme(id)

      if (success) {
        toast({
          title: "Informe eliminado",
          description: "El informe ha sido eliminado correctamente.",
        })
      }
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  // Filtrar informes por término de búsqueda
  const filteredInformes = informes.filter(
    (informe) =>
      informe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (informe.description && informe.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-gray-500">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar informes..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Subir Informe
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          ) : filteredInformes.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md">
              <File className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay informes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "No se encontraron informes con ese término de búsqueda."
                  : "Comience subiendo su primer informe."}
              </p>
              {searchTerm && (
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setSearchTerm("")}>
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInformes.map((informe) => (
                <div
                  key={informe.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-orange-500 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium truncate">{informe.name}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="truncate">{informe.description || "Sin descripción"}</span>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>{format(new Date(informe.date), "dd 'de' MMMM 'de' yyyy", { locale: es })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(informe.file_url)}
                      title="Ver informe"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(informe.file_url, informe.name)}
                      title="Descargar informe"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(informe.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar informe"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir Informe</DialogTitle>
            <DialogDescription>Complete la información del informe para subirlo al sistema.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del Informe</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              {!areaId && (
                <div className="grid gap-2">
                  <Label htmlFor="areaId">Área</Label>
                  <Select
                    value={formData.areaId}
                    onValueChange={(value) => handleSelectChange("areaId", value)}
                    required
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un área" />
                    </SelectTrigger>
                    <SelectContent>
                      {AREAS.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file">Archivo</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Formatos permitidos: PDF, Word, Excel, PowerPoint. Tamaño máximo: 50MB
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  "Subir Informe"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
