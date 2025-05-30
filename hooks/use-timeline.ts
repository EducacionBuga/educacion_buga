"use client"

// hooks/use-timeline.ts
import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { TimelineEvent, MatrizSeguimientoItem } from "@/types/plan-accion"

export function useTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const supabase = createClientComponentClient()

  const fetchTimelineData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Obtener datos de la vista matriz_seguimiento
      const { data, error } = await supabase.from("matriz_seguimiento").select("*")

      if (error) throw error

      // Convertir los datos a eventos de línea de tiempo
      const timelineEvents: TimelineEvent[] = []

      if (data) {
        data.forEach((item: MatrizSeguimientoItem) => {
          // Solo incluir si coincide con el filtro o si el filtro es 'all'
          if (filter === "all" || item.area_id === filter) {
            // Evento de inicio
            timelineEvents.push({
              id: `${item.id}-start`,
              title: item.actividad || "Sin título",
              description: item.meta || "Sin descripción",
              date: new Date(item.fecha_inicio),
              type: "start",
              status: item.estado || "Pendiente",
              areaId: item.area_id,
              areaName: item.area_nombre || "Área desconocida",
              color: getColorForArea(item.area_id),
              progress: item.porcentaje_avance || 0,
            })

            // Evento de fin
            timelineEvents.push({
              id: `${item.id}-end`,
              title: `Finalización: ${item.actividad || "Sin título"}`,
              description: `Meta: ${item.meta || "Sin descripción"}`,
              date: new Date(item.fecha_fin),
              type: "end",
              status: item.estado || "Pendiente",
              areaId: item.area_id,
              areaName: item.area_nombre || "Área desconocida",
              color: getColorForArea(item.area_id),
              progress: item.porcentaje_avance || 0,
            })
          }
        })
      }

      // Ordenar eventos por fecha
      timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime())

      setEvents(timelineEvents)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"))
      console.error("Error fetching timeline data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [filter, supabase])

  // Función para obtener color según el área
  function getColorForArea(areaId: string): string {
    // Mapeo de áreas a colores
    const areaColors: Record<string, string> = {
      "e28654eb-216c-49cd-9a96-42366c097f12": "orange", // CALIDAD_EDUCATIVA
      "502d6c5d-0a1e-43fa-85b7-ae91f7743f0d": "blue", // INSPECCION_VIGILANCIA
      "2d8bf8a1-0557-4974-8212-a2f4a93a4fb2": "green", // COBERTURA_INFRAESTRUCTURA
      "15bb34b0-25eb-407f-9ce7-f781fcd04ecc": "purple", // TALENTO_HUMANO
      "05f3dac0-933e-46f8-aa80-f7c7c0a906c1": "gray", // PLANEACION
      "9850c4bd-119a-444d-831f-21410bbbaf8b": "red", // DESPACHO
      default: "gray",
    }

    return areaColors[areaId] || areaColors["default"]
  }

  // Cargar datos cuando cambia el filtro
  useEffect(() => {
    fetchTimelineData()

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("timeline_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "plan_accion",
        },
        () => {
          fetchTimelineData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTimelineData, supabase])

  return {
    events,
    isLoading,
    error,
    setFilter,
    activeFilter: filter,
  }
}
