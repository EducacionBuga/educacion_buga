"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Calendar, MapPin, Tag, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PHOTO_CATEGORIES } from "@/constants/photo-categories"
import { useState } from "react"

interface PhotoUploadFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (formData: FormData) => Promise<boolean>
  isUploading: boolean
}

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  location: z.string().optional(),
  category: z.enum(["eventos", "infraestructura", "actividades"]),
  tags: z.string().optional(),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "La imagen es requerida")
    .transform((files) => files[0]),
})

export function PhotoUploadForm({ isOpen, onOpenChange, onSubmit, isUploading }: PhotoUploadFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "eventos",
    },
  })

  // Observar cambios en el campo de imagen para generar vista previa
  const imageFile = watch("image")
  if (imageFile && imageFile[0] && !previewUrl) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(imageFile[0])
  }

  const onFormSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData()
    formData.append("title", data.title)
    if (data.description) formData.append("description", data.description)
    formData.append("date", data.date)
    if (data.location) formData.append("location", data.location)
    formData.append("category", data.category)
    if (data.tags) formData.append("tags", data.tags)
    formData.append("image", data.image)

    const success = await onSubmit(formData)
    if (success) {
      reset()
      setPreviewUrl(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          reset()
          setPreviewUrl(null)
        }
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir Nuevo Registro Fotográfico</DialogTitle>
          <DialogDescription>Complete los detalles del registro y suba la imagen correspondiente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo-title" className="text-right">
                Título
              </Label>
              <div className="col-span-3">
                <Input id="photo-title" {...register("title")} className={errors.title ? "border-red-500" : ""} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo-description" className="text-right">
                Descripción
              </Label>
              <div className="col-span-3">
                <Input id="photo-description" {...register("description")} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo-date" className="text-right">
                Fecha
              </Label>
              <div className="col-span-3">
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="photo-date"
                    type="date"
                    {...register("date")}
                    className={`pl-8 ${errors.date ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo-location" className="text-right">
                Ubicación
              </Label>
              <div className="col-span-3">
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input id="photo-location" {...register("location")} className="pl-8" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo-category" className="text-right">
                Categoría
              </Label>
              <div className="col-span-3">
                <select
                  id="photo-category"
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {PHOTO_CATEGORIES.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo-tags" className="text-right">
                Etiquetas
              </Label>
              <div className="col-span-3">
                <div className="relative">
                  <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input id="photo-tags" {...register("tags")} placeholder="Separadas por comas" className="pl-8" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="photo-file" className="text-right pt-2">
                Imagen
              </Label>
              <div className="col-span-3">
                <Input
                  id="photo-file"
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  className={errors.image ? "border-red-500" : ""}
                />
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}

                {previewUrl && (
                  <div className="mt-3 relative aspect-video w-full max-w-[300px] overflow-hidden rounded-md border">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Vista previa"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Subiendo..." : "Subir Registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
