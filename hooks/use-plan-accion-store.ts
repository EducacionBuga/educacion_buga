"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

export type PlanAccionItem = {
  id: string
  numero: string
  meta: string
  actividad: string
  proceso: string
  presupuestoDisponible: string
  presupuestoEjecutado: string
  indicador: string
  fechaInicio: string
  fechaFin: string
  responsable: string
  estado: "Pendiente" | "En progreso" | "Completado" | "Retrasado"
  avance: number
}

export type AreaId = "calidad-educativa" | "inspeccion-vigilancia" | "cobertura-infraestructura" | "talento-humano"

export function usePlanAccionStore(areaId: AreaId) {
  const [items, setItems] = useState<PlanAccionItem[]>([])

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const storedItems = localStorage.getItem(`${areaId}-plan-accion`)
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems))
      } catch (error) {
        console.error("Error parsing stored items:", error)
      }
    }
  }, [areaId])

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(`${areaId}-plan-accion`, JSON.stringify(items))
  }, [items, areaId])

  const addItem = (item: Omit<PlanAccionItem, "id">) => {
    const newItem = {
      ...item,
      id: uuidv4(),
    }
    setItems((prevItems) => [...prevItems, newItem])
    return newItem
  }

  const updateItem = (id: string, updatedItem: Partial<PlanAccionItem>) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)))
  }

  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    setItems,
  }
}
