"use client"

// hooks/use-areas.ts
import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { AreaInfo } from "@/types/plan-accion"

export function useAreas() {
  const [areas, setAreas] = useState<AreaInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  const fetchAreas = useCallback(async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.from("areas").select("id, codigo, nombre, descripcion").order("nombre")

      if (error) throw error

      // Asignar colores a las áreas
      const areasWithColors = (data || []).map((area) => ({
        ...area,
        color: getColorForArea(area.id),
      }))

      setAreas(areasWithColors)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"))
      console.error("Error fetching areas:", err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

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

  // Función para obtener un área por su ID
  const getAreaById = useCallback(
    (id: string): AreaInfo | undefined => {
      return areas.find((area) => area.id === id)
    },
    [areas],
  )

  // Función para obtener un área por su código
  const getAreaByCodigo = useCallback(
    (codigo: string): AreaInfo | undefined => {
      return areas.find((area) => area.codigo === codigo)
    },
    [areas],
  )

  // Cargar áreas al inicializar
  useEffect(() => {
    fetchAreas()

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("areas_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "areas",
        },
        () => {
          fetchAreas()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAreas, supabase])

  return {
    areas,
    isLoading,
    error,
    getAreaById,
    getAreaByCodigo,
    refreshAreas: fetchAreas,
  }
}
