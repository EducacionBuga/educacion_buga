"use client"

import { useState, useEffect } from "react"

export interface RegistroFotografico {
  id: string
  title: string
  description?: string
  file_url: string
  file_type: string
  file_size: number
  file_path: string
  thumbnail_url?: string
  area_id: string
  date: string
  location?: string
  tags?: string[]
  status: string
  created_at: string
  updated_at: string
  areas?: {
    codigo: string
    nombre: string
  }
}

export function useRegistrosManager(areaId?: string) {
  const [registros, setRegistros] = useState<RegistroFotografico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRegistros = async () => {
    setLoading(true)
    try {
      const url = areaId ? `/api/registros?areaId=${areaId}` : "/api/registros"
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error fetching registros: ${response.status}`)
      }

      const data = await response.json()
      setRegistros(data)
    } catch (error) {
      console.error("Error fetching registros:", error)
      setError("Error al cargar los registros. Intente de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [areaId])

  const addRegistro = async (registroData: {
    title: string
    description: string
    areaId: string
    date: string
    location?: string
    file: File
  }): Promise<RegistroFotografico | null> => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", registroData.file)
      formData.append("title", registroData.title)
      formData.append("description", registroData.description || "")
      formData.append("areaId", registroData.areaId)
      formData.append("date", registroData.date)
      formData.append("location", registroData.location || "")

      const response = await fetch("/api/registros/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Upload error:", errorData)
        throw new Error(`Error uploading registro: ${response.status}`)
      }

      const newRegistro = await response.json()
      setRegistros((prev) => [newRegistro, ...prev])
      return newRegistro
    } catch (error) {
      console.error("Error uploading registro:", error)
      setError("Error al subir el registro. Intente de nuevo.")
      return null
    } finally {
      // Use setTimeout to prevent UI freeze
      setTimeout(() => setLoading(false), 100)
    }
  }

  const deleteRegistro = async (registroId: string): Promise<boolean> => {
    setLoading(true)
    try {
      const registro = registros.find((reg) => reg.id === registroId)
      if (!registro) {
        return false
      }

      const params = new URLSearchParams({
        path: registro.file_path,
      })

      if (registro.thumbnail_url) {
        // Extraer el path del thumbnail de la URL
        const thumbnailPath = registro.thumbnail_url.split("path=")[1]
        if (thumbnailPath) {
          params.append("thumbnailPath", decodeURIComponent(thumbnailPath))
        }
      }

      const response = await fetch(`/api/registros/${registroId}?${params.toString()}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting registro: ${response.status}`)
      }

      setRegistros((prev) => prev.filter((reg) => reg.id !== registroId))
      return true
    } catch (error) {
      console.error("Error deleting registro:", error)
      setError("Error al eliminar el registro. Intente de nuevo.")
      return false
    } finally {
      // Use setTimeout to prevent UI freeze
      setTimeout(() => setLoading(false), 100)
    }
  }

  return {
    registros,
    loading,
    error,
    addRegistro,
    deleteRegistro,
    refetch: fetchRegistros,
  }
}
