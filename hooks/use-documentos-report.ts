"use client"

import { useState, useEffect } from "react"
import type { Folder, Document } from "@/types/documents"
import type { AreaId, ModuleType } from "@/hooks/use-document-store-generic"

export interface DocumentStats {
  areaId: AreaId
  areaName: string
  moduleType: ModuleType
  moduleName: string
  totalFolders: number
  totalDocuments: number
  documentsByCategory: Record<string, number>
  foldersByCategory: Record<string, number>
  totalSize: number
  lastUpdated: string | null
}

export interface DocumentsReport {
  stats: DocumentStats[]
  totalDocuments: number
  totalFolders: number
  totalSize: number
  byArea: Record<
    AreaId,
    {
      totalDocuments: number
      totalFolders: number
      totalSize: number
    }
  >
  byModule: Record<
    ModuleType,
    {
      totalDocuments: number
      totalFolders: number
      totalSize: number
    }
  >
}

const areaMapping: Record<AreaId, string> = {
  "calidad-educativa": "Calidad Educativa",
  "inspeccion-vigilancia": "Inspección y Vigilancia",
  "cobertura-infraestructura": "Cobertura e Infraestructura",
  "talento-humano": "Talento Humano",
}

const moduleMapping: Record<ModuleType, string> = {
  proveedores: "Proveedores",
  "prestacion-servicio": "Prestación de Servicio",
}

export function useDocumentosReport() {
  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState<DocumentsReport>({
    stats: [],
    totalDocuments: 0,
    totalFolders: 0,
    totalSize: 0,
    byArea: {
      "calidad-educativa": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
      "inspeccion-vigilancia": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
      "cobertura-infraestructura": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
      "talento-humano": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
    },
    byModule: {
      proveedores: { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
      "prestacion-servicio": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
    },
  })

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)

      try {
        const areas: AreaId[] = [
          "calidad-educativa",
          "inspeccion-vigilancia",
          "cobertura-infraestructura",
          "talento-humano",
        ]

        const modules: ModuleType[] = ["proveedores", "prestacion-servicio"]

        const stats: DocumentStats[] = []
        let totalDocuments = 0
        let totalFolders = 0
        let totalSize = 0

        const byArea: Record<AreaId, { totalDocuments: number; totalFolders: number; totalSize: number }> = {
          "calidad-educativa": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
          "inspeccion-vigilancia": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
          "cobertura-infraestructura": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
          "talento-humano": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
        }

        const byModule: Record<ModuleType, { totalDocuments: number; totalFolders: number; totalSize: number }> = {
          proveedores: { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
          "prestacion-servicio": { totalDocuments: 0, totalFolders: 0, totalSize: 0 },
        }

        // Recopilar datos para cada combinación de área y módulo
        areas.forEach((areaId) => {
          modules.forEach((moduleType) => {
            const foldersKey = `${areaId}-${moduleType}-folders`
            const documentsKey = `${areaId}-${moduleType}-documents`

            let folders: Folder[] = []
            let documents: Document[] = []

            // Obtener carpetas
            const storedFolders = localStorage.getItem(foldersKey)
            if (storedFolders) {
              try {
                folders = JSON.parse(storedFolders)
              } catch (error) {
                console.error(`Error parsing folders for ${areaId}-${moduleType}:`, error)
              }
            }

            // Obtener documentos
            const storedDocuments = localStorage.getItem(documentsKey)
            if (storedDocuments) {
              try {
                documents = JSON.parse(storedDocuments)
              } catch (error) {
                console.error(`Error parsing documents for ${areaId}-${moduleType}:`, error)
              }
            }

            // Calcular estadísticas
            const documentsByCategory: Record<string, number> = {}
            const foldersByCategory: Record<string, number> = {}

            folders.forEach((folder) => {
              foldersByCategory[folder.category] = (foldersByCategory[folder.category] || 0) + 1
            })

            let moduleSize = 0
            documents.forEach((doc) => {
              const folder = folders.find((f) => f.id === doc.folderId)
              if (folder) {
                documentsByCategory[folder.category] = (documentsByCategory[folder.category] || 0) + 1
              }
              moduleSize += doc.fileSize || 0
            })

            // Encontrar la fecha de última actualización
            let lastUpdated: string | null = null
            if (documents.length > 0) {
              const dates = documents
                .map((doc) => doc.uploadDate || doc.createdAt || doc.updatedAt)
                .filter(Boolean) as string[]

              if (dates.length > 0) {
                lastUpdated = new Date(Math.max(...dates.map((date) => new Date(date).getTime()))).toISOString()
              }
            }

            // Agregar estadísticas para esta combinación
            stats.push({
              areaId,
              areaName: areaMapping[areaId],
              moduleType,
              moduleName: moduleMapping[moduleType],
              totalFolders: folders.length,
              totalDocuments: documents.length,
              documentsByCategory,
              foldersByCategory,
              totalSize: moduleSize,
              lastUpdated,
            })

            // Actualizar totales
            totalDocuments += documents.length
            totalFolders += folders.length
            totalSize += moduleSize

            // Actualizar totales por área
            byArea[areaId].totalDocuments += documents.length
            byArea[areaId].totalFolders += folders.length
            byArea[areaId].totalSize += moduleSize

            // Actualizar totales por módulo
            byModule[moduleType].totalDocuments += documents.length
            byModule[moduleType].totalFolders += folders.length
            byModule[moduleType].totalSize += moduleSize
          })
        })

        setReport({
          stats,
          totalDocuments,
          totalFolders,
          totalSize,
          byArea,
          byModule,
        })
      } catch (error) {
        console.error("Error loading document report data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Actualizar cuando cambie el localStorage
    const handleStorageChange = () => {
      loadData()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return {
    report,
    isLoading,
  }
}
