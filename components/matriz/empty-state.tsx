"use client"

import { FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  message?: string
  onClearFilters?: () => void
}

export function EmptyState({ message = "No se encontraron datos", onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      {onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
