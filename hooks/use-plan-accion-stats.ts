"use client"

// hooks/use-plan-accion-stats.ts
import { useState, useEffect, useMemo } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { AreaStats, GlobalStats, MatrizSeguimientoItem } from "@/types/plan-accion"
import { useAreas } from "./use-areas"

export function usePlanAccionStats() {
  const [data, setData] = useState<MatrizSeguimientoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { areas } = useAreas()
  const supabase = createClientComponentClient()

  // Cargar datos
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        const { data, error } = await supabase.from("matriz_seguimiento").select("*")

        if (error) throw error

        setData(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
        console.error("Error fetching stats data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("stats_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "plan_accion",
        },
        () => {
          fetchData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Calcular estadísticas por área
  const areaStats = useMemo<AreaStats[]>(() => {
    const statsByArea: Record<string, AreaStats> = {}

    // Inicializar estadísticas para cada área
    areas.forEach((area) => {
      statsByArea[area.id] = {
        id: area.id,
        nombre: area.nombre,
        totalPlanes: 0,
        planesCompletados: 0,
        planesEnProgreso: 0,
        planesPendientes: 0,
        planesRetrasados: 0,
        avancePromedio: 0,
        presupuestoTotal: "0",
      }
    })

    // Calcular estadísticas para cada área
    data.forEach((item) => {
      const areaId = item.area_id

      if (!statsByArea[areaId]) {
        // Si el área no está en la lista, la inicializamos
        statsByArea[areaId] = {
          id: areaId,
          nombre: item.area_nombre || "Área desconocida",
          totalPlanes: 0,
          planesCompletados: 0,
          planesEnProgreso: 0,
          planesPendientes: 0,
          planesRetrasados: 0,
          avancePromedio: 0,
          presupuestoTotal: "0",
        }
      }

      // Incrementar contador total
      statsByArea[areaId].totalPlanes++

      // Incrementar contador por estado
      switch (item.estado) {
        case "Completado":
          statsByArea[areaId].planesCompletados++
          break
        case "En progreso":
          statsByArea[areaId].planesEnProgreso++
          break
        case "Pendiente":
          statsByArea[areaId].planesPendientes++
          break
        case "Retrasado":
          statsByArea[areaId].planesRetrasados++
          break
      }

      // Sumar avance
      statsByArea[areaId].avancePromedio += item.porcentaje_avance || 0

      // Sumar presupuesto (convertir a número y sumar)
      const presupuesto = Number.parseFloat(item.presupuesto_disponible.replace(/[^0-9.-]+/g, "") || "0")
      const presupuestoActual = Number.parseFloat(statsByArea[areaId].presupuestoTotal.replace(/[^0-9.-]+/g, "") || "0")
      statsByArea[areaId].presupuestoTotal = `$${(presupuestoActual + presupuesto).toLocaleString("es-CO")}`
    })

    // Calcular promedios
    Object.values(statsByArea).forEach((stats) => {
      if (stats.totalPlanes > 0) {
        stats.avancePromedio = stats.avancePromedio / stats.totalPlanes
      }
    })

    return Object.values(statsByArea)
  }, [data, areas])

  // Calcular estadísticas globales
  const globalStats = useMemo<GlobalStats>(() => {
    if (areaStats.length === 0) {
      return {
        totalPlanes: 0,
        planesCompletados: 0,
        planesEnProgreso: 0,
        planesPendientes: 0,
        planesRetrasados: 0,
        avancePromedio: 0,
        presupuestoTotal: "$0",
        areaConMasPlanes: "",
        areaConMayorAvance: "",
      }
    }

    // Sumar todos los valores
    const totals = areaStats.reduce(
      (acc, stats) => {
        return {
          totalPlanes: acc.totalPlanes + stats.totalPlanes,
          planesCompletados: acc.planesCompletados + stats.planesCompletados,
          planesEnProgreso: acc.planesEnProgreso + stats.planesEnProgreso,
          planesPendientes: acc.planesPendientes + stats.planesPendientes,
          planesRetrasados: acc.planesRetrasados + stats.planesRetrasados,
          avancePromedio: acc.avancePromedio + stats.avancePromedio * stats.totalPlanes,
          presupuestoTotal:
            Number.parseFloat(acc.presupuestoTotal.replace(/[^0-9.-]+/g, "") || "0") +
            Number.parseFloat(stats.presupuestoTotal.replace(/[^0-9.-]+/g, "") || "0"),
        }
      },
      {
        totalPlanes: 0,
        planesCompletados: 0,
        planesEnProgreso: 0,
        planesPendientes: 0,
        planesRetrasados: 0,
        avancePromedio: 0,
        presupuestoTotal: 0,
      },
    )

    // Calcular promedio global
    const avancePromedio = totals.totalPlanes > 0 ? totals.avancePromedio / totals.totalPlanes : 0

    // Encontrar área con más planes
    const areaConMasPlanes = areaStats.reduce(
      (max, stats) => (stats.totalPlanes > max.totalPlanes ? stats : max),
      areaStats[0],
    )

    // Encontrar área con mayor avance
    const areaConMayorAvance = areaStats.reduce(
      (max, stats) => (stats.avancePromedio > max.avancePromedio ? stats : max),
      areaStats[0],
    )

    return {
      totalPlanes: totals.totalPlanes,
      planesCompletados: totals.planesCompletados,
      planesEnProgreso: totals.planesEnProgreso,
      planesPendientes: totals.planesPendientes,
      planesRetrasados: totals.planesRetrasados,
      avancePromedio,
      presupuestoTotal: `$${totals.presupuestoTotal.toLocaleString("es-CO")}`,
      areaConMasPlanes: areaConMasPlanes.nombre,
      areaConMayorAvance: areaConMayorAvance.nombre,
    }
  }, [areaStats])

  return {
    areaStats,
    globalStats,
    isLoading,
    error,
  }
}
