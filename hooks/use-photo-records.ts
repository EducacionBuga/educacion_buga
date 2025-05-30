"use client"

import { useState, useCallback, useMemo } from "react"
import type { PhotoRecord } from "@/types/photo-records"
import { useToast } from "@/components/ui/use-toast"

interface UsePhotoRecordsProps {
  initialRecords?: PhotoRecord[]
}

export function usePhotoRecords({ initialRecords = [] }: UsePhotoRecordsProps = {}) {
  const [photoRecords, setPhotoRecords] = useState<PhotoRecord[]>(initialRecords)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("eventos")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<PhotoRecord | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const { toast } = useToast()

  // Filtrar fotos por categoría y término de búsqueda
  const filteredPhotos = useMemo(() => {
    if (!searchTerm) return photoRecords.filter((photo) => photo.category === selectedCategory)

    return photoRecords
      .filter((photo) => photo.category === selectedCategory)
      .filter(
        (photo) =>
          photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          photo.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          photo.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
  }, [photoRecords, searchTerm, selectedCategory])

  // Añadir un nuevo registro fotográfico
  const addPhotoRecord = useCallback(
    async (formData: FormData): Promise<boolean> => {
      try {
        setIsUploading(true)
        // Simulación de carga
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // En una implementación real, aquí se subiría la imagen a un servicio como Cloudinary
        // y se guardarían los datos en una base de datos

        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const date = formData.get("date") as string
        const location = formData.get("location") as string
        const category = formData.get("category") as "eventos" | "infraestructura" | "actividades"
        const tagsString = formData.get("tags") as string
        const tags = tagsString ? tagsString.split(",").map((tag) => tag.trim()) : []
        const image = formData.get("image") as File

        // Generar URLs para las imágenes (en una implementación real, estas vendrían del servicio de almacenamiento)
        const thumbnailUrl = `/placeholder.svg?height=150&width=250&query=${encodeURIComponent(title)}`
        const fullImageUrl = `/placeholder.svg?height=800&width=1200&query=${encodeURIComponent(title)}`

        const newRecord: PhotoRecord = {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          title,
          description,
          date,
          location,
          category,
          tags,
          thumbnail: thumbnailUrl,
          fullImage: fullImageUrl,
        }

        setPhotoRecords((prev) => [newRecord, ...prev])
        toast({
          title: "Registro fotográfico subido",
          description: "El registro ha sido añadido correctamente.",
        })
        return true
      } catch (error) {
        console.error("Error al subir el registro:", error)
        toast({
          title: "Error al subir el registro",
          description: "Ha ocurrido un error al subir el registro fotográfico.",
          variant: "destructive",
        })
        return false
      } finally {
        setIsUploading(false)
      }
    },
    [toast],
  )

  // Eliminar un registro fotográfico
  const deletePhotoRecord = useCallback(
    (id: string) => {
      setPhotoRecords((prev) => prev.filter((photo) => photo.id !== id))
      setViewerOpen(false)
      toast({
        title: "Registro eliminado",
        description: "El registro fotográfico ha sido eliminado correctamente.",
      })
    },
    [toast],
  )

  // Ver una imagen en el visor
  const viewImage = useCallback((photo: PhotoRecord) => {
    setSelectedImage(photo)
    setViewerOpen(true)
  }, [])

  // Descargar una imagen
  const downloadImage = useCallback(
    (photo: PhotoRecord) => {
      // En una implementación real, esto descargaría la imagen
      console.log("Descargando imagen:", photo.title)
      toast({
        title: "Descargando imagen",
        description: `Descargando "${photo.title}"`,
      })
    },
    [toast],
  )

  return {
    photoRecords,
    filteredPhotos,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    isUploading,
    selectedImage,
    viewerOpen,
    setViewerOpen,
    addPhotoRecord,
    deletePhotoRecord,
    viewImage,
    downloadImage,
  }
}
