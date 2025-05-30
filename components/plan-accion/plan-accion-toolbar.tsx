"use client"

import type React from "react"

// components/plan-accion/plan-accion-toolbar.tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Plus } from "lucide-react"

interface PlanAccionToolbarProps {
  searchTerm: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddClick: () => void
  onExportClick: () => void
}

export function PlanAccionToolbar({ searchTerm, onSearchChange, onAddClick, onExportClick }: PlanAccionToolbarProps) {
  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center space-x-2 w-full">
        <Button variant="outline" size="sm" aria-label="Filtrar elementos">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Buscar programa..."
            className="w-full"
            value={searchTerm}
            onChange={onSearchChange}
            aria-label="Buscar programa"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onAddClick} aria-label="Añadir nuevo elemento">
          <Plus className="mr-2 h-4 w-4" />
          Añadir
        </Button>
        <Button size="sm" variant="outline" onClick={onExportClick} aria-label="Exportar a CSV">
          Exportar
        </Button>
      </div>
    </div>
  )
}
