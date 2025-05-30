"use client"

import { useMemo } from "react"
import type { MatrizSeguimientoItem } from "@/types/plan-accion"

interface UseMatrizFiltersProps {
  matrizData: MatrizSeguimientoItem[]
  searchTerm: string
  areaFilter: string
  estadoFilter: string
}

export function useMatrizFilters({ matrizData, searchTerm, areaFilter, estadoFilter }: UseMatrizFiltersProps) {
  // Filtrar datos según los criterios
  const filteredData = useMemo(() => {
    return matrizData.filter((item) => {
      // Filtro de búsqueda con comprobaciones de null/undefined
      const matchesSearch =
        searchTerm === "" ||
        (item.acciones?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.meta?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.responsable?.toLowerCase() || "").includes(searchTerm.toLowerCase())

      // Filtro de área
      const matchesArea = areaFilter === "todas" || item.areaId === areaFilter

      // Filtro de estado
      const matchesEstado = estadoFilter === "todos" || item.estado === estadoFilter

      return matchesSearch && matchesArea && matchesEstado
    })
  }, [matrizData, searchTerm, areaFilter, estadoFilter])

  // Agrupar datos por área para la vista de áreas
  const dataByArea = useMemo(() => {
    return matrizData.reduce(
      (acc, item) => {
        if (!acc[item.areaId]) {
          acc[item.areaId] = {
            id: item.areaId,
            name: item.area,
            color: item.color,
            items: [],
            totalPresupuesto: 0,
            avancePromedio: 0,
          }
        }

        acc[item.areaId].items.push(item)
        // Asegurarse de que el presupuesto es un número válido antes de sumarlo
        const presupuestoNum = Number.parseFloat(item.presupuesto?.replace(/[^0-9.-]+/g, "") || "0") || 0
        acc[item.areaId].totalPresupuesto += presupuestoNum

        return acc
      },
      {} as Record<
        string,
        {
          id: string
          name: string
          color: string
          items: typeof matrizData
          totalPresupuesto: number
          avancePromedio: number
        }
      >,
    )
  }, [matrizData])

  // Calcular avance promedio para cada área
  const dataByAreaWithAverage = useMemo(() => {
    const result = { ...dataByArea }
    Object.values(result).forEach((area) => {
      area.avancePromedio =
        area.items.length > 0 ? area.items.reduce((sum, item) => sum + item.avance, 0) / area.items.length : 0
    })
    return result
  }, [dataByArea])

  return {
    filteredData,
    dataByArea: dataByAreaWithAverage,
  }
}
