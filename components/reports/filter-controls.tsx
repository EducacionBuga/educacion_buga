"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AreaOption } from "@/types/reports"

interface FilterControlsProps {
  areas: AreaOption[]
  selectedAreas: string[]
  onToggleArea: (area: string) => void
  onClearFilters: () => void
}

export function FilterControls({ areas, selectedAreas, onToggleArea, onClearFilters }: FilterControlsProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <div className="flex items-center mb-3">
        <Filter className="h-4 w-4 text-orange-500 mr-2" aria-hidden="true" />
        <span className="text-sm font-medium">Filtrar por área:</span>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros de área">
        {areas.map((area) => (
          <Badge
            key={area.key}
            className={`cursor-pointer ${area.color} hover:opacity-90 px-3 py-1.5 ${
              selectedAreas.includes(area.key) ? "ring-2 ring-offset-1 ring-orange-400" : ""
            }`}
            onClick={() => onToggleArea(area.key)}
            role="checkbox"
            aria-checked={selectedAreas.includes(area.key)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onToggleArea(area.key)
              }
            }}
          >
            {area.label}
          </Badge>
        ))}
        {selectedAreas.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-orange-600 hover:text-orange-700"
            aria-label="Limpiar todos los filtros"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
