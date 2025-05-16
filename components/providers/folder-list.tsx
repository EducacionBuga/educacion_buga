"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { FolderIcon, ChevronRight, Calendar, PencilIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Folder } from "@/types/documents"

interface FolderListProps {
  folders: Folder[]
  onSelectFolder: (folderId: string | null) => void
  selectedFolderId: string | null
  onEditFolder?: (folder: Folder) => void
}

export function FolderList({ folders, onSelectFolder, selectedFolderId, onEditFolder }: FolderListProps) {
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null)

  const getFolderColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 border-blue-300 text-blue-700",
      lightBlue: "bg-sky-100 border-sky-300 text-sky-700",
      cyan: "bg-cyan-100 border-cyan-300 text-cyan-700",
      teal: "bg-teal-100 border-teal-300 text-teal-700",
      green: "bg-green-100 border-green-300 text-green-700",
      lime: "bg-lime-100 border-lime-300 text-lime-700",
      yellow: "bg-yellow-100 border-yellow-300 text-yellow-700",
      amber: "bg-amber-100 border-amber-300 text-amber-700",
      orange: "bg-orange-100 border-orange-300 text-orange-700",
      red: "bg-red-100 border-red-300 text-red-700",
      pink: "bg-pink-100 border-pink-300 text-pink-700",
      fuchsia: "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700",
      purple: "bg-purple-100 border-purple-300 text-purple-700",
      violet: "bg-violet-100 border-violet-300 text-violet-700",
      indigo: "bg-indigo-100 border-indigo-300 text-indigo-700",
      gray: "bg-gray-100 border-gray-300 text-gray-700",
    }

    return colorMap[color] || "bg-blue-100 border-blue-300 text-blue-700"
  }

  const getFolderIconColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "text-blue-500",
      lightBlue: "text-sky-500",
      cyan: "text-cyan-500",
      teal: "text-teal-500",
      green: "text-green-500",
      lime: "text-lime-500",
      yellow: "text-yellow-500",
      amber: "text-amber-500",
      orange: "text-orange-500",
      red: "text-red-500",
      pink: "text-pink-500",
      fuchsia: "text-fuchsia-500",
      purple: "text-purple-500",
      violet: "text-violet-500",
      indigo: "text-indigo-500",
      gray: "text-gray-500",
    }

    return colorMap[color] || "text-blue-500"
  }

  const handleEditClick = (e: React.MouseEvent, folder: Folder) => {
    e.stopPropagation()
    e.preventDefault()
    console.log("Edit button clicked for folder:", folder.name)
    if (onEditFolder) {
      onEditFolder(folder)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {folders.map((folder) => (
        <motion.div
          key={folder.id}
          whileHover={{ y: -5 }}
          onClick={() => onSelectFolder(folder.id)}
          onMouseEnter={() => setHoveredFolderId(folder.id)}
          onMouseLeave={() => setHoveredFolderId(null)}
          className={cn(
            "relative cursor-pointer rounded-lg border p-4 transition-all",
            getFolderColorClass(folder.color),
            folder.id === selectedFolderId
              ? "ring-2 ring-offset-2 shadow-lg shadow-primary/20 border-primary"
              : "hover:shadow-md",
          )}
        >
          {/* Botón de edición */}
          <div
            className={cn(
              "absolute bottom-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 hover:shadow-lg z-50",
              hoveredFolderId === folder.id || folder.id === selectedFolderId ? "opacity-100" : "opacity-0",
            )}
            onClick={(e) => handleEditClick(e, folder)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              position: "absolute",
              transform: "translateZ(0)",
            }}
            role="button"
            tabIndex={0}
            aria-label="Editar carpeta"
            data-testid="edit-folder-button"
          >
            <PencilIcon className="h-4 w-4 text-gray-600" />
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <FolderIcon className={cn("h-6 w-6", getFolderIconColor(folder.color))} />
              <div>
                <h3 className="font-medium">{folder.name}</h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{new Date(folder.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <ChevronRight
              className={cn(
                "h-5 w-5 transition-transform",
                folder.id === selectedFolderId ? "rotate-90 text-primary" : "",
              )}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
