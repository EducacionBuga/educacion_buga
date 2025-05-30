"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "@/types/supabase-types"

export type ChecklistItem = {
  id: string
  category: string
  description: string
  completed: boolean
}

export type AreaId = "calidad-educativa" | "inspeccion-vigilancia" | "cobertura-infraestructura" | "talento-humano"

export function useListaChequeoStore(areaId: AreaId) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  // Cargar datos de Supabase al iniciar
  useEffect(() => {
    async function loadItems() {
      setLoading(true)

      try {
        // Intentamos cargar desde Supabase
        const { data: supabaseItems, error } = await supabase
          .from("lista_chequeo")
          .select("*")
          .eq("area_id", areaId)
          .order("category")

        if (error) {
          console.error("Error cargando items desde Supabase:", error)

          // Fallback a localStorage si hay error
          const storedItems = localStorage.getItem(`${areaId}-lista-chequeo`)
          if (storedItems) {
            try {
              const parsedItems = JSON.parse(storedItems)
              if (Array.isArray(parsedItems)) {
                setItems(parsedItems)
              } else {
                setItems([])
              }
            } catch (e) {
              console.error("Error parsing stored items:", e)
              setItems([])
            }
          } else {
            // Si no hay datos en localStorage, cargamos los datos iniciales
            await loadInitialData()
          }
        } else if (supabaseItems && supabaseItems.length > 0) {
          // Transformamos los datos de Supabase al formato que espera nuestra aplicación
          const formattedItems: ChecklistItem[] = supabaseItems.map((item) => ({
            id: item.id,
            category: item.category,
            description: item.description,
            completed: item.completed,
          }))
          setItems(formattedItems)
        } else {
          // Si no hay datos en Supabase, cargamos los datos iniciales
          await loadInitialData()
        }
      } catch (error) {
        console.error("Error en loadItems:", error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    async function loadInitialData() {
      try {
        // Cargar datos iniciales desde el archivo JSON
        const response = await fetch("/data/lista-chequeo-data.json")
        const initialData = await response.json()

        if (Array.isArray(initialData)) {
          // Crear un array para almacenar los items con IDs generados
          const itemsWithIds: ChecklistItem[] = initialData.map((item) => ({
            ...item,
            id: uuidv4(), // Generar un ID único para cada item
          }))

          setItems(itemsWithIds)

          // Guardar los datos iniciales en Supabase
          const { error: userError } = await supabase.auth.getUser()
          if (!userError) {
            const { data: userData } = await supabase.auth.getUser()

            if (userData && userData.user) {
              const userId = userData.user.id

              // Insertar cada item en Supabase
              for (const item of itemsWithIds) {
                await supabase.from("lista_chequeo").insert({
                  id: item.id,
                  area_id: areaId,
                  category: item.category,
                  description: item.description,
                  completed: item.completed,
                  user_id: userId,
                })
              }
            }
          }
        } else {
          console.error("Data from JSON is not an array")
          setItems([])
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
        setItems([])
      }
    }

    loadItems()
  }, [areaId, supabase])

  // Actualizar un item en Supabase
  const toggleItem = async (id: string) => {
    // Encontrar el item a actualizar
    const itemToUpdate = items.find((item) => item.id === id)
    if (!itemToUpdate) return

    // Actualizar estado local inmediatamente para UI responsiva
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))

    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from("lista_chequeo")
        .update({ completed: !itemToUpdate.completed, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) {
        console.error("Error actualizando item en Supabase:", error)

        // Guardar en localStorage como fallback
        localStorage.setItem(`${areaId}-lista-chequeo`, JSON.stringify(items))
      }
    } catch (error) {
      console.error("Error en toggleItem:", error)

      // Guardar en localStorage como fallback
      localStorage.setItem(`${areaId}-lista-chequeo`, JSON.stringify(items))
    }
  }

  return {
    items,
    toggleItem,
    setItems,
    loading,
  }
}
