"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import { ErrorState } from "@/components/matriz/error-state"
import { EmptyState } from "@/components/matriz/empty-state"
import { MatrizMejorada } from "@/components/matriz/matriz-mejorada"
import type { MatrizSeguimientoItem } from "@/hooks/use-matriz-seguimiento"
import { useValidaciones } from "@/hooks/use-plan-validaciones"

interface MatrizGeneralTabProps {
  data: MatrizSeguimientoItem[]
  isLoading: boolean
  isError: boolean
  error: any
  refetch: () => void
  updatePlanEstado: (planId: string, nuevoEstado: string) => Promise<void>
  searchTerm: string
  setSearchTerm: (value: string) => void
  areaFilter: string
  setAreaFilter: (value: string) => void
  estadoFilter: string
  setEstadoFilter: (value: string) => void
  fechaDesdeFilter: string
  setFechaDesdeFilter: (value: string) => void
  fechaHastaFilter: string
  setFechaHastaFilter: (value: string) => void
  handleClearFilters: () => void
}

export function MatrizGeneralTab({
  data,
  isLoading,
  isError,
  error,
  refetch,
  updatePlanEstado,
  searchTerm,
  setSearchTerm,
  areaFilter,
  setAreaFilter,
  estadoFilter,
  setEstadoFilter,
  fechaDesdeFilter,
  setFechaDesdeFilter,
  fechaHastaFilter,
  setFechaHastaFilter,
  handleClearFilters,
}: MatrizGeneralTabProps) {
  
  // Hook para manejar las validaciones
  const { 
    isAdmin, 
    validarPlan, 
    loading: validacionLoading 
  } = useValidaciones({ refetchMatriz: refetch })

  console.log("🎨 Renderizando matriz de seguimiento con datos:", data.length, "elementos")
  console.log("📊 Estado de carga:", { isLoading, isError })
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Matriz de Seguimiento</h2>
      </div>
      <MatrizMejorada
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={refetch}
        updatePlanEstado={updatePlanEstado}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        areaFilter={areaFilter}
        setAreaFilter={setAreaFilter}
        estadoFilter={estadoFilter}
        setEstadoFilter={setEstadoFilter}
        fechaDesdeFilter={fechaDesdeFilter}
        setFechaDesdeFilter={setFechaDesdeFilter}
        fechaHastaFilter={fechaHastaFilter}
        setFechaHastaFilter={setFechaHastaFilter}
        handleClearFilters={handleClearFilters}
      />
    </div>
  )
}
