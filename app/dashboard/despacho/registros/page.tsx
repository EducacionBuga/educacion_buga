"use client"

import { useState } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, File, Filter, X } from "lucide-react"
import { PhotoUploadArea } from "@/components/photos/photo-upload-area"
import { PhotoViewer } from "@/components/photos/photo-viewer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AREAS } from "@/constants/areas"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { PhotoRecord } from "@/types/photo-records"

export default function RegistrosFotograficosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoRecords, setPhotoRecords] = useState<PhotoRecord[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<PhotoRecord | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  // Esquema simplificado similar al de documentos
  const formSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    area: z.enum(["calidad-educativa", "inspeccion-vigilancia", "cobertura-infraestructura", "talento-humano"]),
    date: z.string().min(1, "La fecha es requerida"),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area: "calidad-educativa",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)

    // Generar vista previa para el formulario
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsDialogOpen(true)
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!selectedFile || !previewUrl) return

    try {
      setIsUploading(true)
      // Simulación de carga
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newRecord: PhotoRecord = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        title: data.title,
        date: data.date,
        area: data.area,
        thumbnail: previewUrl,
        fullImage: previewUrl,
      }

      setPhotoRecords((prev) => [newRecord, ...prev])
      toast({
        title: "Registro fotográfico subido",
        description: "El registro ha sido añadido correctamente.",
      })

      reset()
      setSelectedFile(null)
      setPreviewUrl(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error al subir el registro:", error)
      toast({
        title: "Error al subir el registro",
        description: "Ha ocurrido un error al subir el registro fotográfico.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Filtrar registros por áreas seleccionadas
  const filteredRecords =
    selectedAreas.length > 0 ? photoRecords.filter((record) => selectedAreas.includes(record.area)) : photoRecords

  // Manejar selección de área para filtrado
  const toggleAreaFilter = (area: string) => {
    setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSelectedAreas([])
  }

  // Ver imagen
  const viewImage = (photo: PhotoRecord) => {
    setSelectedImage(photo)
    setViewerOpen(true)
  }

  // Descargar imagen
  const downloadImage = (photo: PhotoRecord) => {
    // En una implementación real, esto descargaría la imagen
    console.log("Descargando imagen:", photo.title)

    // Crear un enlace temporal para descargar la imagen
    const link = document.createElement("a")
    link.href = photo.fullImage
    link.download = `${photo.title.replace(/\s+/g, "-").toLowerCase()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Descargando imagen",
      description: `Descargando "${photo.title}"`,
    })
  }

  // Eliminar registro
  const deletePhotoRecord = (id: string) => {
    setPhotoRecords((prev) => prev.filter((photo) => photo.id !== id))
    setViewerOpen(false)
    toast({
      title: "Registro eliminado",
      description: "El registro fotográfico ha sido eliminado correctamente.",
    })
  }

  return (
    <RoleGuard allowedRoles={["ADMIN", "DESPACHO"]}>
      <main className="min-h-screen">
        <ModuleHeader title="REGISTROS FOTOGRÁFICOS" />
        <div className="container mx-auto p-4 md:p-8">
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="pb-3 bg-green-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="rounded-lg p-2 bg-green-500/10 text-green-500 border-green-500/20">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Subir Registros Fotográficos</CardTitle>
                    <CardDescription className="text-foreground/70">
                      Suba y administre los registros fotográficos de las actividades e infraestructura educativa
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <PhotoUploadArea onFileSelect={handleFileSelect} />
            </CardContent>
          </Card>

          {photoRecords.length > 0 && (
            <Card className="mt-8 overflow-hidden border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Registros Fotográficos</CardTitle>
                <CardDescription>Visualice y administre los registros fotográficos subidos</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Filtros de área - Siempre visibles */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center mb-3">
                    <Filter className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-sm font-medium">Filtrar por área:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AREAS.map((area) => (
                      <Badge
                        key={area.key}
                        variant="outline"
                        className={cn(
                          "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                          selectedAreas.includes(area.key) && area.color,
                        )}
                        onClick={() => toggleAreaFilter(area.key)}
                      >
                        {area.label}
                      </Badge>
                    ))}
                    {selectedAreas.length > 0 && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={clearFilters}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar filtros
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group overflow-hidden rounded-lg border bg-card shadow-sm"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={photo.thumbnail || "/placeholder.svg"}
                            alt={photo.title}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button variant="secondary" size="sm" className="mr-2" onClick={() => viewImage(photo)}>
                              Ver
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => downloadImage(photo)}>
                              Descargar
                            </Button>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium truncate">{photo.title}</h3>
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <span>{new Date(photo.date).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-2">
                            {AREAS.find((a) => a.key === photo.area) && (
                              <Badge className={cn(AREAS.find((a) => a.key === photo.area)?.color)}>
                                {AREAS.find((a) => a.key === photo.area)?.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-lg font-medium">No hay registros fotográficos disponibles</p>
                      <p className="text-sm">Suba registros para visualizarlos aquí.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-start border-t bg-muted/30 px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  {filteredRecords.length} registros fotográficos en total
                </div>
              </CardFooter>
            </Card>
          )}

          {/* Formulario simplificado con las 4 áreas */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                reset()
                setSelectedFile(null)
                setPreviewUrl(null)
              }
              setIsDialogOpen(open)
            }}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Subir Registro Fotográfico</DialogTitle>
                <DialogDescription>Complete la información básica del registro fotográfico.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4 py-4">
                  {/* Vista previa de la imagen */}
                  {previewUrl && (
                    <div className="mb-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Vista previa"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Registro</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      defaultValue={selectedFile?.name.split(".")[0] || ""}
                      aria-invalid={errors.title ? "true" : "false"}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Área</Label>
                    <select
                      id="area"
                      {...register("area")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-invalid={errors.area ? "true" : "false"}
                    >
                      {AREAS.map((area) => (
                        <option key={area.key} value={area.key}>
                          {area.label}
                        </option>
                      ))}
                    </select>
                    {errors.area && <p className="text-sm text-red-500">{errors.area.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input type="date" id="date" {...register("date")} aria-invalid={errors.date ? "true" : "false"} />
                    {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file-info">Archivo</Label>
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <File className="h-5 w-5 text-green-500" aria-hidden="true" />
                      <div>
                        <p className="font-medium">{selectedFile?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedFile && (selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isUploading}>
                    {isUploading ? "Subiendo..." : "Subir Registro"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Visor de imágenes */}
          <PhotoViewer
            photo={selectedImage}
            isOpen={viewerOpen}
            onOpenChange={setViewerOpen}
            onDownload={() => selectedImage && downloadImage(selectedImage)}
            onDelete={() => selectedImage && deletePhotoRecord(selectedImage.id)}
          />
        </div>
      </main>
    </RoleGuard>
  )
}
