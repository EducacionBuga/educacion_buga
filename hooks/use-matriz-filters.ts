"use client"

import { useMemo } from "react"
import type { MatrizSeguimientoItem } from "@/hooks/use-matriz-seguimiento"

interface UseMatrizFiltersProps {
  matrizData: MatrizSeguimientoItem[]
  searchTerm: string
  areaFilter: string
  estadoFilter: string
  fechaDesdeFilter: string
  fechaHastaFilter: string
}

export function useMatrizFilters({ matrizData, searchTerm, areaFilter, estadoFilter, fechaDesdeFilter, fechaHastaFilter }: UseMatrizFiltersProps) {
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
      const matchesArea = areaFilter === "todas" || item.area === areaFilter

      // Filtro de estado
      const matchesEstado = estadoFilter === "todos" || item.estado === estadoFilter

      // Filtro de rango de fechas (considera tanto fecha de inicio como de fin)
      const matchesFecha = (() => {
        // Si no hay filtros de fecha, mostrar todo
        if (!fechaDesdeFilter && !fechaHastaFilter) return true
        
        // Si solo hay una fecha seleccionada, mostrar todo (rango incompleto)
        if (!fechaDesdeFilter || !fechaHastaFilter) return true
        
        // Si el item no tiene ninguna fecha, no mostrarlo cuando hay filtros activos
        if (!item.fechaInicio && !item.fechaFin) return false
        
        try {
          // Convertir fechas de filtro a objetos Date
          const fechaDesde = new Date(fechaDesdeFilter)
          const fechaHasta = new Date(fechaHastaFilter)
          
          // Función para verificar si una fecha está en el rango
          const estaEnRango = (fechaString) => {
            if (!fechaString) return false
            
            // Convertir fecha del item (formato dd/mm/yyyy a Date)
            let fechaObj
            if (fechaString.includes('/')) {
              // Formato dd/mm/yyyy
              const [dia, mes, año] = fechaString.split('/')
              fechaObj = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia))
            } else {
              // Formato ISO o yyyy-mm-dd
              fechaObj = new Date(fechaString)
            }
            
            if (isNaN(fechaObj.getTime())) return false
            
            // Verificar si está dentro del rango
            return fechaObj >= fechaDesde && fechaObj <= fechaHasta
          }
          
          // Verificar si alguna de las fechas del plan está en el rango
          const fechaInicioEnRango = estaEnRango(item.fechaInicio)
          const fechaFinEnRango = estaEnRango(item.fechaFin)
          
          // Mostrar si cualquiera de las fechas está en el rango
          return fechaInicioEnRango || fechaFinEnRango
          
        } catch (error) {
          console.warn('Error al procesar fechas:', error)
          return false
        }
      })()

      return matchesSearch && matchesArea && matchesEstado && matchesFecha
    })
  }, [matrizData, searchTerm, areaFilter, estadoFilter, fechaDesdeFilter, fechaHastaFilter])

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
