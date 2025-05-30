"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Folder, FolderColor } from "@/types/documents"

interface EditFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: Folder | null
  onUpdateFolder: (
    folderId: string,
    data: {
      name: string
      date: string
      color: FolderColor
    },
  ) => void
  onDeleteFolder: (folderId: string) => void
}

export function EditFolderDialog({
  open,
  onOpenChange,
  folder,
  onUpdateFolder,
  onDeleteFolder,
}: EditFolderDialogProps) {
  const [name, setName] = useState(folder?.name || "")
  const [date, setDate] = useState(folder?.createdAt || "")
  const [color, setColor] = useState<FolderColor>((folder?.color as FolderColor) || "blue")
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!name || !color) {
      toast({
        title: "Información incompleta",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    if (!folder) return

    onUpdateFolder(folder.id, {
      name,
      date,
      color,
    })

    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!folder) return

    onDeleteFolder(folder.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Carpeta</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folder-name" className="text-right">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Nombre de la carpeta"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folder-date" className="text-right">
              Fecha
            </Label>
            <Input
              id="folder-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
              placeholder="Fecha de creación"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folder-color" className="text-right">
              Color <span className="text-red-500">*</span>
            </Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger id="folder-color" className="col-span-3">
                <SelectValue placeholder="Seleccionar color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="lightBlue">Celeste</SelectItem>
                <SelectItem value="cyan">Cyan</SelectItem>
                <SelectItem value="teal">Verde Azulado</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="lime">Lima</SelectItem>
                <SelectItem value="yellow">Amarillo</SelectItem>
                <SelectItem value="amber">Ámbar</SelectItem>
                <SelectItem value="orange">Naranja</SelectItem>
                <SelectItem value="red">Rojo</SelectItem>
                <SelectItem value="pink">Rosa</SelectItem>
                <SelectItem value="fuchsia">Fucsia</SelectItem>
                <SelectItem value="purple">Morado</SelectItem>
                <SelectItem value="violet">Violeta</SelectItem>
                <SelectItem value="indigo">Índigo</SelectItem>
                <SelectItem value="gray">Gris</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" className="mr-2" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
          <div className="ml-auto flex items-center space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={!name || !color}>
              Guardar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
