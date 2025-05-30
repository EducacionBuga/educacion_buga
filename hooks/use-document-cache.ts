"use client"

import { useState, useEffect } from "react"

export function useDocumentCache<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Verificar si localStorage está disponible (solo en el lado del cliente)
  const isClient = typeof window !== "undefined"

  // Estado inicial
  const [value, setValue] = useState<T>(defaultValue)

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    if (!isClient) return

    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setValue(JSON.parse(stored))
      } catch (error) {
        console.error(`Error parsing cached value for ${key}:`, error)
      }
    }
  }, [key, isClient])

  // Función para actualizar el valor y guardarlo en localStorage
  const updateValue = (newValue: T) => {
    setValue(newValue)

    if (isClient) {
      localStorage.setItem(key, JSON.stringify(newValue))
    }
  }

  return [value, updateValue]
}
