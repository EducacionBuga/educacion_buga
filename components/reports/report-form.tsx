"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { File } from "lucide-react"
import { DialogFooter } from "@/components/ui/dialog"
import { AREAS } from "@/constants/areas"

// Esquema de validación con Zod
const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  area: z.string().min(1, "Debes seleccionar un área"),
  date: z.string().min(1, "Debes seleccionar una fecha"),
})

type FormValues = z.infer<typeof formSchema>

interface ReportFormProps {
  file: File
  onSubmit: (data: FormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ReportForm({ file, onSubmit, onCancel, isSubmitting = false }: ReportFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: file.name.split(".")[0],
      area: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Informe</Label>
          <Input id="name" {...register("name")} aria-invalid={errors.name ? "true" : "false"} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Área</Label>
          <select
            id="area"
            {...register("area")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={errors.area ? "true" : "false"}
          >
            <option value="">Seleccione un área</option>
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
            <File className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
          {isSubmitting ? "Subiendo..." : "Subir Informe"}
        </Button>
      </DialogFooter>
    </form>
  )
}
