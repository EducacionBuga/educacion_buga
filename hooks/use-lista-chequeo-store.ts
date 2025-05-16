"use client"

import { useState, useEffect } from "react"

export type ChecklistItem = {
  id: string
  category: string
  description: string
  completed: boolean
}

export type AreaId = "calidad-educativa" | "inspeccion-vigilancia" | "cobertura-infraestructura" | "talento-humano"

export function useListaChequeoStore(areaId: AreaId) {
  const [items, setItems] = useState<ChecklistItem[]>([])

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const storedItems = localStorage.getItem(`${areaId}-lista-chequeo`)
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems)
        // Verificar que parsedItems sea un array
        if (Array.isArray(parsedItems)) {
          setItems(parsedItems)
        } else {
          console.error("Stored items is not an array, using empty array")
          setItems([])
        }
      } catch (error) {
        console.error("Error parsing stored checklist items:", error)
        setItems([])
      }
    } else {
      // Cargar datos iniciales si no hay datos guardados
      import("@/data/lista-chequeo-data.json")
        .then((data) => {
          // Asegurarse de que data.default sea un array
          if (Array.isArray(data.default)) {
            setItems(data.default)
          } else {
            console.error("Data from JSON is not an array, using empty array")
            setItems([])
          }
        })
        .catch((error) => {
          console.error("Error loading checklist data:", error)
          setItems([])
        })
    }
  }, [areaId])

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(`${areaId}-lista-chequeo`, JSON.stringify(items))
  }, [items, areaId])

  const toggleItem = (id: string) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  return {
    items,
    toggleItem,
    setItems,
  }
}
