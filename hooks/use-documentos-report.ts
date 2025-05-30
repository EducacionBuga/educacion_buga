"use client"

import { useState, useEffect } from "react"
import type { AreaId, ModuleType } from "@/hooks/use-document-store-generic"

interface DocumentoReporte {
  id: string
  name: string
  area: string
  moduleType: string
  folderName: string
  fileType: string
  fileSize: number
  createdAt: string
  updatedAt?: string
}

interface FolderReporte {
  id: string
  name: string
  area: string
  moduleType: string
  color: string
  category: string
  createdAt: string
  documentCount: number
}

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
  despacho: "Despacho",
}

const moduleMapping: Record<ModuleType, string> = {
  proveedores: "Proveedores",
  "prestacion-servicio": "Prestación de Servicio",
  "informes-de-ejecucion": "Informes de Ejecución",
  "registros-fotograficos": "Registros Fotográficos",
}

export function useDocumentosReport() {
  const [documentosData, setDocumentosData] = useState<DocumentoReporte[]>([])
  const [foldersData, setFoldersData] = useState<FolderReporte[]>([])
  const [isLoadingDocumentos, setIsLoadingDocumentos] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const areas = [
    { id: "calidad-educativa", name: "Calidad Educativa" },
    { id: "inspeccion-vigilancia", name: "Inspección y Vigilancia" },
    { id: "cobertura-infraestructura", name: "Cobertura e Infraestructura" },
    { id: "talento-humano", name: "Talento Humano" },
    { id: "despacho", name: "Despacho" },
  ]

  const modules = ["proveedores", "prestacion-servicio", "informes-de-ejecucion", "registros-fotograficos"]

  const fetchAllData = async () => {
    setIsLoadingDocumentos(true)
    setError(null)

    try {
      const allDocuments: DocumentoReporte[] = []
      const allFolders: FolderReporte[] = []

      // Obtener datos de todas las áreas y módulos
      for (const area of areas) {
        for (const moduleType of modules) {
          try {
            // Obtener carpetas
            const foldersResponse = await fetch(`/api/folders?areaId=${area.id}&moduleType=${moduleType}`)
            if (foldersResponse.ok) {
              const folders = await foldersResponse.json()

              for (const folder of folders) {
                // Obtener documentos de cada carpeta
                const documentsResponse = await fetch(
                  `/api/documents?areaId=${area.id}&moduleType=${moduleType}&folderId=${folder.id}`,
                )
                let documentCount = 0

                if (documentsResponse.ok) {
                  const documents = await documentsResponse.json()
                  documentCount = documents.length

                  // Añadir documentos al reporte
                  documents.forEach((doc: any) => {
                    allDocuments.push({
                      id: doc.id,
                      name: doc.name,
                      area: area.name,
                      moduleType: moduleMapping[moduleType as ModuleType],
                      folderName: folder.name,
                      fileType: doc.fileType || "Desconocido",
                      fileSize: doc.fileSize || 0,
                      createdAt: doc.createdAt,
                      updatedAt: doc.updatedAt,
                    })
                  })
                }

                // Añadir carpeta al reporte
                allFolders.push({
                  id: folder.id,
                  name: folder.name,
                  area: area.name,
                  moduleType: moduleMapping[moduleType as ModuleType],
                  color: folder.color,
                  category: folder.category,
                  createdAt: folder.createdAt,
                  documentCount,
                })
              }
            }
          } catch (error) {
            console.warn(`Error fetching data for ${area.id}/${moduleType}:`, error)
          }
        }
      }

      setDocumentosData(allDocuments)
      setFoldersData(allFolders)
    } catch (error) {
      console.error("Error fetching documentos report:", error)
      setError("Error al cargar el reporte de documentos")
    } finally {
      setIsLoadingDocumentos(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const refetchDocumentos = () => {
    fetchAllData()
  }

  const getStats = () => {
    const totalDocuments = documentosData.length
    const totalFolders = foldersData.length
    const totalSize = documentosData.reduce((sum, doc) => sum + doc.fileSize, 0)

    const documentsByArea = areas.map((area) => ({
      area: area.name,
      count: documentosData.filter((doc) => doc.area === area.name).length,
    }))

    const documentsByType = [
      { type: "PDF", count: documentosData.filter((doc) => doc.fileType.includes("pdf")).length },
      {
        type: "Word",
        count: documentosData.filter((doc) => doc.fileType.includes("word") || doc.fileType.includes("document"))
          .length,
      },
      {
        type: "Excel",
        count: documentosData.filter((doc) => doc.fileType.includes("sheet") || doc.fileType.includes("excel")).length,
      },
      { type: "Imagen", count: documentosData.filter((doc) => doc.fileType.includes("image")).length },
      {
        type: "Otros",
        count: documentosData.filter(
          (doc) =>
            !doc.fileType.includes("pdf") &&
            !doc.fileType.includes("word") &&
            !doc.fileType.includes("document") &&
            !doc.fileType.includes("sheet") &&
            !doc.fileType.includes("excel") &&
            !doc.fileType.includes("image"),
        ).length,
      },
    ]

    return {
      totalDocuments,
      totalFolders,
      totalSize,
      documentsByArea,
      documentsByType,
    }
  }

  return {
    documentosData,
    foldersData,
    isLoadingDocumentos,
    error,
    refetchDocumentos,
    stats: getStats(),
  }
}
