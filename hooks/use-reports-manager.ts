"use client"

import { useState, useCallback, useMemo } from "react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"
import type { Report } from "@/types/reports"
import { AREAS, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/constants/areas"

interface UseReportsManagerProps {
  onSuccess?: (report: Report) => void
}

export function useReportsManager({ onSuccess }: UseReportsManagerProps = {}) {
  const [reports, setReports] = useState<Report[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Validar archivo
  const validateFile = useCallback((file: File): { valid: boolean; message?: string } => {
    if (!file) return { valid: false, message: "No se ha seleccionado ningún archivo" }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `El archivo excede el tamaño máximo permitido (${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB)`,
      }
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: "Formato de archivo no soportado. Por favor, sube un PDF, DOCX, XLSX o PPTX",
      }
    }

    return { valid: true }
  }, [])

  // Añadir un nuevo informe
  const addReport = useCallback(
    async (file: File, reportData: Omit<Report, "id" | "file" | "areaLabel">) => {
      try {
        setIsUploading(true)

        // Validar archivo
        const validation = validateFile(file)
        if (!validation.valid) {
          toast({
            title: "Error al subir el archivo",
            description: validation.message,
            variant: "destructive",
          })
          return false
        }

        // Simular carga (en producción, aquí iría la subida real al servidor)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Encontrar la etiqueta del área seleccionada
        const selectedArea = AREAS.find((area) => area.key === reportData.area)

        if (!selectedArea) {
          toast({
            title: "Error al subir el informe",
            description: "Área no válida",
            variant: "destructive",
          })
          return false
        }

        // Crear un nuevo informe
        const newReport: Report = {
          id: uuidv4(),
          file,
          areaLabel: selectedArea.label,
          ...reportData,
        }

        // Añadir el informe a la lista
        setReports((prev) => [...prev, newReport])

        toast({
          title: "Informe subido correctamente",
          description: `El informe "${reportData.name}" ha sido subido con éxito.`,
        })

        if (onSuccess) {
          onSuccess(newReport)
        }

        return true
      } catch (error) {
        console.error("Error al subir el informe:", error)
        toast({
          title: "Error al subir el informe",
          description: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
        return false
      } finally {
        setIsUploading(false)
      }
    },
    [validateFile, onSuccess],
  )

  // Eliminar un informe
  const removeReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((report) => report.id !== id))
    toast({
      title: "Informe eliminado",
      description: "El informe ha sido eliminado correctamente.",
    })
  }, [])

  // Manejar la selección de áreas para filtrar
  const toggleAreaFilter = useCallback((area: string) => {
    setSelectedAreas((prev) => {
      if (prev.includes(area)) {
        return prev.filter((a) => a !== area)
      } else {
        return [...prev, area]
      }
    })
  }, [])

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSelectedAreas([])
    setSearchTerm("")
  }, [])

  // Filtrar informes por área y término de búsqueda
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.areaLabel.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesArea = selectedAreas.length === 0 || selectedAreas.includes(report.area)
      return matchesSearch && matchesArea
    })
  }, [reports, searchTerm, selectedAreas])

  return {
    reports,
    filteredReports,
    searchTerm,
    setSearchTerm,
    selectedAreas,
    toggleAreaFilter,
    clearFilters,
    addReport,
    removeReport,
    isUploading,
  }
}
