"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"

export function useDebouncedSearch<T>(items: T[], searchPredicate: (item: T, term: string) => boolean, delay = 300) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedTerm, setDebouncedTerm] = useState("")
  const [filteredItems, setFilteredItems] = useState<T[]>(items)

  // Actualizar el término de búsqueda con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, delay])

  // Filtrar los elementos cuando cambia el término debounced o los items
  useEffect(() => {
    if (debouncedTerm === "") {
      setFilteredItems(items)
    } else {
      const filtered = items.filter((item) => searchPredicate(item, debouncedTerm.toLowerCase()))
      setFilteredItems(filtered)
    }
  }, [debouncedTerm, items, searchPredicate])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  return {
    searchTerm,
    filteredItems,
    handleSearchChange,
  }
}
