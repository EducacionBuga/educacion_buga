"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Save, Trash2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Folder, FolderColor } from "@/types/documents"

interface EditFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: Folder | null
  onUpdateFolder: (
    folderId: string,
    folderData: {
      name: string
      date: string
      color: FolderColor
    },
  ) => void
  onDeleteFolder?: (folderId: string) => void
}

export function EditFolderDialog({
  open,
  onOpenChange,
  folder,
  onUpdateFolder,
  onDeleteFolder,
}: EditFolderDialogProps) {
  const [folderName, setFolderName] = useState("")
  const [folderDate, setFolderDate] = useState("")
  const [folderColor, setFolderColor] = useState<FolderColor>("blue")

  // Cargar datos de la carpeta cuando cambia
  useEffect(() => {
    if (folder) {
      setFolderName(folder.name)
      setFolderDate(folder.date || new Date().toISOString().split("T")[0])
      setFolderColor((folder.color as FolderColor) || "blue")
    }
  }, [folder])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!folder || !folderName.trim()) {
      return
    }

    onUpdateFolder(folder.id, {
      name: folderName,
      date: folderDate,
      color: folderColor,
    })

    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!folder || !onDeleteFolder) return

    if (confirm(`¿Está seguro que desea eliminar la carpeta "${folder.name}"? Esta acción no se puede deshacer.`)) {
      onDeleteFolder(folder.id)
      onOpenChange(false)
    }
  }

  if (!folder) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Carpeta</DialogTitle>
            <DialogDescription>Modifique la información de la carpeta seleccionada.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-folder-name" className="text-right">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-3"
                placeholder="Nombre de la carpeta"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-folder-date" className="text-right">
                Fecha <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-folder-date"
                  type="date"
                  value={folderDate}
                  onChange={(e) => setFolderDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Color <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3">
                <RadioGroup
                  value={folderColor}
                  onValueChange={(value) => setFolderColor(value as FolderColor)}
                  className="grid grid-cols-4 gap-3"
                >
                  {/* Fila 1 */}
                  <div className="relative">
                    <RadioGroupItem value="blue" id="edit-color-blue" className="sr-only" />
                    <Label
                      htmlFor="edit-color-blue"
                      className="block w-8 h-8 rounded-full bg-blue-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "blue" ? "0 0 0 2px white, 0 0 0 4px rgb(59, 130, 246)" : "none",
                        transform: folderColor === "blue" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="lightBlue" id="edit-color-lightBlue" className="sr-only" />
                    <Label
                      htmlFor="edit-color-lightBlue"
                      className="block w-8 h-8 rounded-full bg-sky-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow:
                          folderColor === "lightBlue" ? "0 0 0 2px white, 0 0 0 4px rgb(14, 165, 233)" : "none",
                        transform: folderColor === "lightBlue" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="cyan" id="edit-color-cyan" className="sr-only" />
                    <Label
                      htmlFor="edit-color-cyan"
                      className="block w-8 h-8 rounded-full bg-cyan-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "cyan" ? "0 0 0 2px white, 0 0 0 4px rgb(6, 182, 212)" : "none",
                        transform: folderColor === "cyan" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="teal" id="edit-color-teal" className="sr-only" />
                    <Label
                      htmlFor="edit-color-teal"
                      className="block w-8 h-8 rounded-full bg-teal-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "teal" ? "0 0 0 2px white, 0 0 0 4px rgb(20, 184, 166)" : "none",
                        transform: folderColor === "teal" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  {/* Fila 2 */}
                  <div className="relative">
                    <RadioGroupItem value="green" id="edit-color-green" className="sr-only" />
                    <Label
                      htmlFor="edit-color-green"
                      className="block w-8 h-8 rounded-full bg-green-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "green" ? "0 0 0 2px white, 0 0 0 4px rgb(34, 197, 94)" : "none",
                        transform: folderColor === "green" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="lime" id="edit-color-lime" className="sr-only" />
                    <Label
                      htmlFor="edit-color-lime"
                      className="block w-8 h-8 rounded-full bg-lime-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "lime" ? "0 0 0 2px white, 0 0 0 4px rgb(132, 204, 22)" : "none",
                        transform: folderColor === "lime" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="yellow" id="edit-color-yellow" className="sr-only" />
                    <Label
                      htmlFor="edit-color-yellow"
                      className="block w-8 h-8 rounded-full bg-yellow-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "yellow" ? "0 0 0 2px white, 0 0 0 4px rgb(234, 179, 8)" : "none",
                        transform: folderColor === "yellow" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="amber" id="edit-color-amber" className="sr-only" />
                    <Label
                      htmlFor="edit-color-amber"
                      className="block w-8 h-8 rounded-full bg-amber-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "amber" ? "0 0 0 2px white, 0 0 0 4px rgb(245, 158, 11)" : "none",
                        transform: folderColor === "amber" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  {/* Fila 3 */}
                  <div className="relative">
                    <RadioGroupItem value="orange" id="edit-color-orange" className="sr-only" />
                    <Label
                      htmlFor="edit-color-orange"
                      className="block w-8 h-8 rounded-full bg-orange-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "orange" ? "0 0 0 2px white, 0 0 0 4px rgb(249, 115, 22)" : "none",
                        transform: folderColor === "orange" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="red" id="edit-color-red" className="sr-only" />
                    <Label
                      htmlFor="edit-color-red"
                      className="block w-8 h-8 rounded-full bg-red-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "red" ? "0 0 0 2px white, 0 0 0 4px rgb(239, 68, 68)" : "none",
                        transform: folderColor === "red" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="pink" id="edit-color-pink" className="sr-only" />
                    <Label
                      htmlFor="edit-color-pink"
                      className="block w-8 h-8 rounded-full bg-pink-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "pink" ? "0 0 0 2px white, 0 0 0 4px rgb(236, 72, 153)" : "none",
                        transform: folderColor === "pink" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="fuchsia" id="edit-color-fuchsia" className="sr-only" />
                    <Label
                      htmlFor="edit-color-fuchsia"
                      className="block w-8 h-8 rounded-full bg-fuchsia-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "fuchsia" ? "0 0 0 2px white, 0 0 0 4px rgb(217, 70, 239)" : "none",
                        transform: folderColor === "fuchsia" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  {/* Fila 4 */}
                  <div className="relative">
                    <RadioGroupItem value="purple" id="edit-color-purple" className="sr-only" />
                    <Label
                      htmlFor="edit-color-purple"
                      className="block w-8 h-8 rounded-full bg-purple-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "purple" ? "0 0 0 2px white, 0 0 0 4px rgb(168, 85, 247)" : "none",
                        transform: folderColor === "purple" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="violet" id="edit-color-violet" className="sr-only" />
                    <Label
                      htmlFor="edit-color-violet"
                      className="block w-8 h-8 rounded-full bg-violet-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "violet" ? "0 0 0 2px white, 0 0 0 4px rgb(139, 92, 246)" : "none",
                        transform: folderColor === "violet" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="indigo" id="edit-color-indigo" className="sr-only" />
                    <Label
                      htmlFor="edit-color-indigo"
                      className="block w-8 h-8 rounded-full bg-indigo-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "indigo" ? "0 0 0 2px white, 0 0 0 4px rgb(99, 102, 241)" : "none",
                        transform: folderColor === "indigo" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="gray" id="edit-color-gray" className="sr-only" />
                    <Label
                      htmlFor="edit-color-gray"
                      className="block w-8 h-8 rounded-full bg-gray-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "gray" ? "0 0 0 2px white, 0 0 0 4px rgb(107, 114, 128)" : "none",
                        transform: folderColor === "gray" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {onDeleteFolder && (
              <Button type="button" variant="destructive" onClick={handleDelete} className="mr-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            )}
            <Button type="submit" disabled={!folderName.trim()}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
