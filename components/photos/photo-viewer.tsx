"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Calendar, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AREAS } from "@/constants/areas"
import { cn } from "@/lib/utils"
import type { PhotoRecord } from "@/types/photo-records"

interface PhotoViewerProps {
  photo: PhotoRecord | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDownload: () => void
  onDelete: () => void
}

export function PhotoViewer({ photo, isOpen, onOpenChange, onDownload, onDelete }: PhotoViewerProps) {
  if (!photo) return null

  const area = AREAS.find((a) => a.key === photo.area)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <div className="flex flex-col">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <img
              src={photo.fullImage || "/placeholder.svg"}
              alt={photo.title}
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{photo.title}</h2>
                {photo.description && <p className="mt-2 text-muted-foreground">{photo.description}</p>}
              </div>
              {area && <Badge className={cn("text-sm", area.color)}>{area.label}</Badge>}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {new Date(photo.date).toLocaleDateString()}
              </div>
              {photo.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {photo.location}
                </div>
              )}
            </div>

            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {photo.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
