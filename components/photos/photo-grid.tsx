"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Download, Eye, MapPin, MoreHorizontal, Trash2 } from "lucide-react"
import type { PhotoRecord } from "@/types/photo-records"

interface PhotoGridProps {
  photos: PhotoRecord[]
  onView: (photo: PhotoRecord) => void
  onDownload: (photo: PhotoRecord) => void
  onDelete: (id: string) => void
}

export function PhotoGrid({ photos, onView, onDownload, onDelete }: PhotoGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (photos.length === 0) {
    return (
      <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground">
        <div className="mb-2 h-16 w-16 opacity-50 flex items-center justify-center">
          <Image src="/placeholder.svg?key=a7ksp" alt="No hay registros" width={64} height={64} />
        </div>
        <p className="text-lg font-medium">No hay registros fotográficos disponibles</p>
        <p className="text-sm">Suba registros para visualizarlos aquí.</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {photos.map((photo) => (
        <motion.div
          key={photo.id}
          variants={item}
          className="relative group overflow-hidden rounded-lg border bg-card shadow-sm"
        >
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={photo.thumbnail || "/placeholder.svg"}
              alt={photo.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button variant="secondary" size="sm" className="mr-2" onClick={() => onView(photo)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onDownload(photo)}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{photo.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(photo)}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Ver imagen</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(photo)}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Descargar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(photo.id)} className="text-red-500 focus:text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{photo.description}</p>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(photo.date).toLocaleDateString()}
              {photo.location && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin className="h-3 w-3 mr-1" />
                  {photo.location}
                </>
              )}
            </div>
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {photo.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
