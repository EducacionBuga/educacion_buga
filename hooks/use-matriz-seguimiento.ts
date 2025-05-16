"use client"

import { useState, useEffect } from "react"
import type { PlanAccionItem } from "@/hooks/use-plan-accion-store"

export type MatrizSeguimientoItem = PlanAccionItem & {
  area: string
  areaId: string
  color: string
}

export function useMatrizSeguimiento() {
  const [data, setData] = useState<MatrizSeguimientoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar datos de todas las áreas
    const loadData = () => {
      setIsLoading(true)

      try {
        // Definir las áreas y sus propiedades
        const areas = [
          { id: "calidad-educativa", name: "Calidad Educativa", color: "orange" },
          { id: "inspeccion-vigilancia", name: "Inspección y Vigilancia", color: "blue" },
          { id: "cobertura-infraestructura", name: "Cobertura e Infraestructura", color: "green" },
          { id: "talento-humano", name: "Talento Humano", color: "purple" },
        ]

        // Cargar y combinar datos de todas las áreas
        const combinedData: MatrizSeguimientoItem[] = []

        areas.forEach((area) => {
          const storageKey = `${area.id}-plan-accion`
          const storedItems = localStorage.getItem(storageKey)

          if (storedItems) {
            try {
              const areaItems = JSON.parse(storedItems) as PlanAccionItem[]
              const itemsWithArea = areaItems.map((item) => ({
                ...item,
                area: area.name,
                areaId: area.id,
                color: area.color,
              }))
              combinedData.push(...itemsWithArea)
            } catch (error) {
              console.error(`Error parsing stored items for ${area.name}:`, error)
            }
          }
        })

        setData(combinedData)
      } catch (error) {
        console.error("Error loading matriz de seguimiento data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Opcional: Actualizar datos cuando cambie el localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.endsWith("-plan-accion")) {
        loadData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return {
    data,
    isLoading,
  }
}
