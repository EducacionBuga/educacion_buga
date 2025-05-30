"use client"

import { useState } from "react"
import { Folder, FolderOpen, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Folder as FolderType } from "@/types/documents"

interface FolderListProps {
  folders: FolderType[]
  selectedFolderId?: string
  onSelectFolder: (folderId: string) => void
  onEditFolder: (folder: FolderType) => void
}

const colorClasses = {
  blue: "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200",
  green: "bg-green-100 border-green-300 text-green-800 hover:bg-green-200",
  yellow: "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200",
  red: "bg-red-100 border-red-300 text-red-800 hover:bg-red-200",
  purple: "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200",
  pink: "bg-pink-100 border-pink-300 text-pink-800 hover:bg-pink-200",
  indigo: "bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200",
  gray: "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200",
}

export function FolderList({ folders, selectedFolderId, onSelectFolder, onEditFolder }: FolderListProps) {
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null)

  if (folders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay carpetas creadas. Crea una nueva carpeta para comenzar.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {folders.map((folder) => {
        const isSelected = selectedFolderId === folder.id
        const isHovered = hoveredFolder === folder.id
        const colorClass = colorClasses[folder.color as keyof typeof colorClasses] || colorClasses.gray

        return (
          <div
            key={folder.id}
            className={cn(
              "relative group cursor-pointer rounded-lg border-2 p-4 transition-all duration-200",
              colorClass,
              isSelected && "ring-2 ring-blue-500 ring-offset-2 shadow-lg transform scale-105",
              "hover:shadow-md hover:transform hover:scale-102",
            )}
            onClick={() => onSelectFolder(folder.id)}
            onMouseEnter={() => setHoveredFolder(folder.id)}
            onMouseLeave={() => setHoveredFolder(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={cn("transition-transform duration-200", isSelected && "transform rotate-12")}>
                  {isSelected ? (
                    <FolderOpen className="h-8 w-8 flex-shrink-0" />
                  ) : (
                    <Folder className="h-8 w-8 flex-shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{folder.name}</h3>
                  <p className="text-sm opacity-75">{folder.date}</p>
                </div>
              </div>

              {(isHovered || isSelected) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditFolder(folder)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-2">
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-white/50">{folder.category}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
