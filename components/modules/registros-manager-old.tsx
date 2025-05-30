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
import { Camera, Search, Calendar, Upload, Trash2, MapPin, Download, Eye, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AREAS } from "@/constants/areas"
import { PHOTO_CATEGORIES } from "@/constants/photo-categories"
import { useRegistrosManager } from "@/hooks/use-registros-manager"

interface RegistrosManagerProps {
  title: string
  description: string
  areaId?: string
}

export function RegistrosManager({ title, description, areaId }: RegistrosManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    areaId: areaId || "",
    date: format(new Date(), "yyyy-MM-dd"),
    location: "",
    category: "",
  })
  const { toast } = useToast()

  const { registros, loading, error, addRegistro, deleteRegistro, refetch } = useRegistrosManager(areaId)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Crear URL de vista previa
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
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
        description: "Por favor seleccione una imagen",
        variant: "destructive",
      })
      return
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Tipo de archivo no permitido",
        description: "Solo se permiten imágenes (JPG, PNG, GIF, WEBP)",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (10MB máximo)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 10MB",
        variant: "destructive",
      })
      return
    }

    const result = await addRegistro({
      ...formData,
      file: selectedFile,
      file_url: previewUrl, // Simulación para la demo
    })

    if (result) {
      setShowForm(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      setFormData({
        title: "",
        description: "",
        areaId: areaId || "",
        date: format(new Date(), "yyyy-MM-dd"),
        location: "",
        category: "",
      })

      toast({
        title: "Registro fotográfico subido correctamente",
        description: `El registro "${formData.title}" ha sido subido con éxito.`,
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este registro fotográfico? Esta acción no se puede deshacer.")) {
      const success = await deleteRegistro(id)

      if (success) {
        toast({
          title: "Registro eliminado",
          description: "El registro fotográfico ha sido eliminado correctamente.",
        })
      }
    }
  }

  // Filtrar registros por término de búsqueda
  const filteredRegistros = registros.filter(
    (registro) =>
      registro.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (registro.description && registro.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (registro.location && registro.location.toLowerCase().includes(searchTerm.toLowerCase())),
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
                placeholder="Buscar registros fotográficos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Subir Fotografía
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          ) : filteredRegistros.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay registros fotográficos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "No se encontraron registros con ese término de búsqueda."
                  : "Comience subiendo su primera fotografía."}
              </p>
              {searchTerm && (
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setSearchTerm("")}>
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRegistros.map((registro) => (
                <div
                  key={registro.id}
                  className="group relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={registro.file_url || "/placeholder.svg?height=300&width=300"}
                      alt={registro.title}
                      className="h-full w-full object-cover transition-all group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium truncate">{registro.title}</h3>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>{format(new Date(registro.date), "dd/MM/yyyy")}</span>
                    </div>
                    {registro.location && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="truncate">{registro.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/80 shadow-sm"
                      onClick={() => handleDelete(registro.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
            <DialogTitle>Subir Registro Fotográfico</DialogTitle>
            <DialogDescription>Complete la información para subir una fotografía al sistema.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
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

              {!areaId && (
                <div className="grid gap-2">
                  <Label htmlFor="areaId">Área</Label>
                  <Select
                    value={formData.areaId}
                    onValueChange={(value) => handleSelectChange("areaId", value)}
                    required
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
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHOTO_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ej: Institución Educativa San Vicente"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file">Fotografía</Label>
                <Input id="file" type="file" onChange={handleFileChange} required accept="image/*" />
                <p className="text-xs text-gray-500">Formatos permitidos: JPG, PNG, GIF, WEBP. Tamaño máximo: 10MB</p>
              </div>

              {previewUrl && (
                <div className="mt-2">
                  <Label>Vista previa</Label>
                  <div className="mt-1 rounded-md overflow-hidden border">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Vista previa"
                      className="max-h-40 object-contain mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">Subir Fotografía</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
