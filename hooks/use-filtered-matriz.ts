"use client"

// hooks/use-filtered-matriz.ts
import { useState, useEffect, useCallback, useMemo } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { MatrizSeguimientoItem, MatrizFilters, MatrizStats } from "@/types/plan-accion"

export function useFilteredMatriz() {
  const [allData, setAllData] = useState<MatrizSeguimientoItem[]>([])
  const [filteredData, setFilteredData] = useState<MatrizSeguimientoItem[]>([])
  const [filters, setFilters] = useState<MatrizFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  // Función para cargar todos los datos
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.from("matriz_seguimiento").select("*")

      if (error) throw error

      setAllData(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"))
      console.error("Error fetching matriz data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Aplicar filtros a los datos
  const applyFilters = useCallback(() => {
    let result = [...allData]

    // Filtrar por término de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      result = result.filter(
        (item) =>
          item.actividad?.toLowerCase().includes(searchLower) ||
          false ||
          item.meta?.toLowerCase().includes(searchLower) ||
          false ||
          item.responsable?.toLowerCase().includes(searchLower) ||
          false ||
          item.area_nombre?.toLowerCase().includes(searchLower) ||
          false,
      )
    }

    // Filtrar por área
    if (filters.areaId) {
      result = result.filter((item) => item.area_id === filters.areaId)
    }

    // Filtrar por estado
    if (filters.estado) {
      result = result.filter((item) => item.estado === filters.estado)
    }

    // Filtrar por responsable
    if (filters.responsable) {
      result = result.filter((item) => item.responsable?.toLowerCase() === filters.responsable?.toLowerCase())
    }

    // Filtrar por rango de avance
    if (filters.avanceMin !== undefined) {
      result = result.filter((item) => (item.porcentaje_avance || 0) >= (filters.avanceMin || 0))
    }

    if (filters.avanceMax !== undefined) {
      result = result.filter((item) => (item.porcentaje_avance || 0) <= (filters.avanceMax || 0))
    }

    // Filtrar por fecha de inicio
    if (filters.fechaInicioDesde) {
      result = result.filter((item) => new Date(item.fecha_inicio) >= filters.fechaInicioDesde!)
    }

    if (filters.fechaInicioHasta) {
      result = result.filter((item) => new Date(item.fecha_inicio) <= filters.fechaInicioHasta!)
    }

    // Filtrar por fecha de fin
    if (filters.fechaFinDesde) {
      result = result.filter((item) => new Date(item.fecha_fin) >= filters.fechaFinDesde!)
    }

    if (filters.fechaFinHasta) {
      result = result.filter((item) => new Date(item.fecha_fin) <= filters.fechaFinHasta!)
    }

    setFilteredData(result)
  }, [allData, filters])

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<MatrizFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Calcular estadísticas de los datos filtrados
  const stats = useMemo<MatrizStats>(() => {
    const totalItems = filteredData.length

    // Calcular avance promedio
    const avancePromedio =
      totalItems > 0 ? filteredData.reduce((sum, item) => sum + (item.porcentaje_avance || 0), 0) / totalItems : 0

    // Contar por estado
    const porEstado: Record<string, number> = {}
    filteredData.forEach((item) => {
      const estado = item.estado || "Desconocido"
      porEstado[estado] = (porEstado[estado] || 0) + 1
    })

    // Contar por área
    const porArea: Record<string, number> = {}
    filteredData.forEach((item) => {
      const area = item.area_nombre || item.area_id || "Desconocida"
      porArea[area] = (porArea[area] || 0) + 1
    })

    return {
      totalItems,
      avancePromedio,
      porEstado,
      porArea,
    }
  }, [filteredData])

  // Cargar datos y aplicar filtros cuando cambian
  useEffect(() => {
    fetchAllData()

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("matriz_filtered_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "plan_accion",
        },
        () => {
          fetchAllData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAllData, supabase])

  // Aplicar filtros cuando cambian los datos o los filtros
  useEffect(() => {
    applyFilters()
  }, [allData, filters, applyFilters])

  return {
    data: filteredData,
    allData,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    stats,
    refreshData: fetchAllData,
  }
}
