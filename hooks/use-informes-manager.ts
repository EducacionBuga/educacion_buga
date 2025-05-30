"use client"

import { useState, useEffect } from "react"

export interface Informe {
  id: string
  name: string
  description?: string
  file_url: string
  file_type: string
  file_size: number
  file_path: string
  area_id: string
  date: string
  status: string
  created_at: string
  updated_at: string
  areas?: {
    codigo: string
    nombre: string
  }
}

export function useInformesManager(areaId?: string) {
  const [informes, setInformes] = useState<Informe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInformes = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = areaId ? `/api/informes?areaId=${areaId}` : "/api/informes"
      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error response from server: ${errorText}`)
        throw new Error(`Error fetching informes: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setInformes(data)
    } catch (error) {
      console.error("Error fetching informes:", error)
      setError(error instanceof Error ? error.message : "Error al cargar los informes. Intente de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInformes()
  }, [areaId])

  const addInforme = async (informeData: {
    name: string
    description: string
    areaId: string
    date: string
    file: File
  }): Promise<Informe | null> => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", informeData.file)
      formData.append("name", informeData.name)
      formData.append("description", informeData.description || "")
      formData.append("areaId", informeData.areaId)
      formData.append("date", informeData.date)

      const response = await fetch("/api/informes/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Upload error:", errorData)
        throw new Error(`Error uploading informe: ${response.status}`)
      }

      const newInforme = await response.json()
      setInformes((prev) => [newInforme, ...prev])
      return newInforme
    } catch (error) {
      console.error("Error uploading informe:", error)
      setError("Error al subir el informe. Intente de nuevo.")
      return null
    } finally {
      // Use setTimeout to prevent UI freeze
      setTimeout(() => setLoading(false), 100)
    }
  }

  const deleteInforme = async (informeId: string): Promise<boolean> => {
    setLoading(true)
    try {
      const informe = informes.find((inf) => inf.id === informeId)
      if (!informe) {
        return false
      }

      const response = await fetch(`/api/informes/${informeId}?path=${encodeURIComponent(informe.file_path)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting informe: ${response.status}`)
      }

      setInformes((prev) => prev.filter((inf) => inf.id !== informeId))
      return true
    } catch (error) {
      console.error("Error deleting informe:", error)
      setError("Error al eliminar el informe. Intente de nuevo.")
      return false
    } finally {
      // Use setTimeout to prevent UI freeze
      setTimeout(() => setLoading(false), 100)
    }
  }

  return {
    informes,
    loading,
    error,
    addInforme,
    deleteInforme,
    refetch: fetchInformes,
  }
}
