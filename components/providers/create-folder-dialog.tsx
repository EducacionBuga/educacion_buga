"use client"

import React, { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DocumentCategory, FolderColor } from "@/types/documents"
import { FolderPlus, Calendar } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateFolder: (folder: {
    name: string
    date: string
    category: DocumentCategory
    color: FolderColor
  }) => void
  defaultCategory: DocumentCategory
}

export function CreateFolderDialog({ open, onOpenChange, onCreateFolder, defaultCategory }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("")
  const [folderDate, setFolderDate] = useState(new Date().toISOString().split("T")[0])
  const [folderCategory, setFolderCategory] = useState<DocumentCategory>(defaultCategory)
  const [folderColor, setFolderColor] = useState<FolderColor>("blue")

  // Actualizar la categoría cuando cambie la categoría por defecto
  React.useEffect(() => {
    setFolderCategory(defaultCategory)
  }, [defaultCategory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!folderName.trim()) {
      return
    }

    onCreateFolder({
      name: folderName,
      date: folderDate,
      category: folderCategory,
      color: folderColor,
    })

    // Reset form
    setFolderName("")
    setFolderDate(new Date().toISOString().split("T")[0])
    setFolderCategory(defaultCategory)
    setFolderColor("blue")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nueva Carpeta</DialogTitle>
            <DialogDescription>Complete la información para crear una nueva carpeta de documentos.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-3"
                placeholder="Ej: Contrato Papelería Escolar 2025"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-date" className="text-right">
                Fecha <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="folder-date"
                  type="date"
                  value={folderDate}
                  onChange={(e) => setFolderDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-category" className="text-right">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select value={folderCategory} onValueChange={(value) => setFolderCategory(value as DocumentCategory)}>
                <SelectTrigger id="folder-category" className="col-span-3">
                  <SelectValue placeholder="Seleccione una categoría de documentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preContractual">Documentos Pre Contractuales</SelectItem>
                  <SelectItem value="execution">Documentos de Ejecución Contractual</SelectItem>
                  <SelectItem value="closure">Documentos de Cierre Contractual</SelectItem>
                </SelectContent>
              </Select>
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
                    <RadioGroupItem value="blue" id="color-blue" className="sr-only" />
                    <Label
                      htmlFor="color-blue"
                      className="block w-8 h-8 rounded-full bg-blue-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "blue" ? "0 0 0 2px white, 0 0 0 4px rgb(59, 130, 246)" : "none",
                        transform: folderColor === "blue" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="lightBlue" id="color-lightBlue" className="sr-only" />
                    <Label
                      htmlFor="color-lightBlue"
                      className="block w-8 h-8 rounded-full bg-sky-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow:
                          folderColor === "lightBlue" ? "0 0 0 2px white, 0 0 0 4px rgb(14, 165, 233)" : "none",
                        transform: folderColor === "lightBlue" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="cyan" id="color-cyan" className="sr-only" />
                    <Label
                      htmlFor="color-cyan"
                      className="block w-8 h-8 rounded-full bg-cyan-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "cyan" ? "0 0 0 2px white, 0 0 0 4px rgb(6, 182, 212)" : "none",
                        transform: folderColor === "cyan" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="teal" id="color-teal" className="sr-only" />
                    <Label
                      htmlFor="color-teal"
                      className="block w-8 h-8 rounded-full bg-teal-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "teal" ? "0 0 0 2px white, 0 0 0 4px rgb(20, 184, 166)" : "none",
                        transform: folderColor === "teal" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  {/* Fila 2 */}
                  <div className="relative">
                    <RadioGroupItem value="green" id="color-green" className="sr-only" />
                    <Label
                      htmlFor="color-green"
                      className="block w-8 h-8 rounded-full bg-green-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "green" ? "0 0 0 2px white, 0 0 0 4px rgb(34, 197, 94)" : "none",
                        transform: folderColor === "green" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="lime" id="color-lime" className="sr-only" />
                    <Label
                      htmlFor="color-lime"
                      className="block w-8 h-8 rounded-full bg-lime-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "lime" ? "0 0 0 2px white, 0 0 0 4px rgb(132, 204, 22)" : "none",
                        transform: folderColor === "lime" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="yellow" id="color-yellow" className="sr-only" />
                    <Label
                      htmlFor="color-yellow"
                      className="block w-8 h-8 rounded-full bg-yellow-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "yellow" ? "0 0 0 2px white, 0 0 0 4px rgb(234, 179, 8)" : "none",
                        transform: folderColor === "yellow" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="amber" id="color-amber" className="sr-only" />
                    <Label
                      htmlFor="color-amber"
                      className="block w-8 h-8 rounded-full bg-amber-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "amber" ? "0 0 0 2px white, 0 0 0 4px rgb(245, 158, 11)" : "none",
                        transform: folderColor === "amber" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  {/* Fila 3 */}
                  <div className="relative">
                    <RadioGroupItem value="orange" id="color-orange" className="sr-only" />
                    <Label
                      htmlFor="color-orange"
                      className="block w-8 h-8 rounded-full bg-orange-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "orange" ? "0 0 0 2px white, 0 0 0 4px rgb(249, 115, 22)" : "none",
                        transform: folderColor === "orange" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="red" id="color-red" className="sr-only" />
                    <Label
                      htmlFor="color-red"
                      className="block w-8 h-8 rounded-full bg-red-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "red" ? "0 0 0 2px white, 0 0 0 4px rgb(239, 68, 68)" : "none",
                        transform: folderColor === "red" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="pink" id="color-pink" className="sr-only" />
                    <Label
                      htmlFor="color-pink"
                      className="block w-8 h-8 rounded-full bg-pink-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "pink" ? "0 0 0 2px white, 0 0 0 4px rgb(236, 72, 153)" : "none",
                        transform: folderColor === "pink" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="fuchsia" id="color-fuchsia" className="sr-only" />
                    <Label
                      htmlFor="color-fuchsia"
                      className="block w-8 h-8 rounded-full bg-fuchsia-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "fuchsia" ? "0 0 0 2px white, 0 0 0 4px rgb(217, 70, 239)" : "none",
                        transform: folderColor === "fuchsia" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  {/* Fila 4 */}
                  <div className="relative">
                    <RadioGroupItem value="purple" id="color-purple" className="sr-only" />
                    <Label
                      htmlFor="color-purple"
                      className="block w-8 h-8 rounded-full bg-purple-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "purple" ? "0 0 0 2px white, 0 0 0 4px rgb(168, 85, 247)" : "none",
                        transform: folderColor === "purple" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="violet" id="color-violet" className="sr-only" />
                    <Label
                      htmlFor="color-violet"
                      className="block w-8 h-8 rounded-full bg-violet-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "violet" ? "0 0 0 2px white, 0 0 0 4px rgb(139, 92, 246)" : "none",
                        transform: folderColor === "violet" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="indigo" id="color-indigo" className="sr-only" />
                    <Label
                      htmlFor="color-indigo"
                      className="block w-8 h-8 rounded-full bg-indigo-500 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        boxShadow: folderColor === "indigo" ? "0 0 0 2px white, 0 0 0 4px rgb(99, 102, 241)" : "none",
                        transform: folderColor === "indigo" ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <RadioGroupItem value="gray" id="color-gray" className="sr-only" />
                    <Label
                      htmlFor="color-gray"
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
          <DialogFooter>
            <Button type="submit" disabled={!folderName.trim()}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Crear Carpeta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
