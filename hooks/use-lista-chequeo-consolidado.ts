"use client"

import { useState, useEffect } from "react"
import type { AreaId } from "./use-lista-chequeo-store"

// Tipos para la estructura de datos consolidada
export type EtapaConsolidada = {
  nombre: string
  documentos: DocumentoConsolidado[]
}

export type DocumentoConsolidado = {
  nombre: string
  descripcion: string
  respuestas: {
    si: number
    no: number
    noAplica: number
  }
  observaciones: string[]
  area: string
  areaId: AreaId
}

export type DatosConsolidados = {
  titulo: string
  etapas: EtapaConsolidada[]
  isLoading: boolean
}

// Hook para consolidar datos de listas de chequeo de todas las áreas
export function useListaChequeoConsolidado() {
  const [datosConsolidados, setDatosConsolidados] = useState<DatosConsolidados>({
    titulo: "Lista de Chequeo Consolidada",
    etapas: [],
    isLoading: true,
  })

  // Áreas disponibles
  const areas: AreaId[] = ["calidad-educativa", "inspeccion-vigilancia", "cobertura-infraestructura", "talento-humano"]

  // Nombres de las áreas para mostrar
  const areaNombres: Record<AreaId, string> = {
    "calidad-educativa": "Calidad Educativa",
    "inspeccion-vigilancia": "Inspección y Vigilancia",
    "cobertura-infraestructura": "Cobertura e Infraestructura",
    "talento-humano": "Talento Humano",
  }

  useEffect(() => {
    const cargarDatosConsolidados = async () => {
      try {
        // Estructura para almacenar datos consolidados
        const etapasMap = new Map<string, EtapaConsolidada>()

        // Cargar datos de cada área
        for (const areaId of areas) {
          const datosArea = await cargarDatosArea(areaId)

          // Si no hay datos para esta área, continuar con la siguiente
          if (!datosArea || !Array.isArray(datosArea.etapas)) continue

          // Procesar cada etapa del área
          datosArea.etapas.forEach((etapa: any) => {
            const nombreEtapa = etapa.nombre || "Sin nombre"

            // Obtener o crear la etapa en el mapa consolidado
            if (!etapasMap.has(nombreEtapa)) {
              etapasMap.set(nombreEtapa, {
                nombre: nombreEtapa,
                documentos: [],
              })
            }

            // Añadir documentos de esta área a la etapa consolidada
            if (Array.isArray(etapa.documentos)) {
              const etapaConsolidada = etapasMap.get(nombreEtapa)!

              etapa.documentos.forEach((doc: any) => {
                // Añadir información del área al documento
                etapaConsolidada.documentos.push({
                  ...doc,
                  area: areaNombres[areaId],
                  areaId: areaId,
                })
              })
            }
          })
        }

        // Convertir el mapa a un array para el estado
        const etapasConsolidadas = Array.from(etapasMap.values())

        setDatosConsolidados({
          titulo: "Lista de Chequeo Consolidada",
          etapas: etapasConsolidadas,
          isLoading: false,
        })
      } catch (error) {
        console.error("Error al consolidar datos de listas de chequeo:", error)
        setDatosConsolidados((prev) => ({ ...prev, isLoading: false }))
      }
    }

    cargarDatosConsolidados()
  }, [])

  // Función para cargar datos de una área específica
  const cargarDatosArea = async (areaId: AreaId): Promise<any> => {
    try {
      // Intentar cargar desde localStorage primero
      const storedData = localStorage.getItem(`${areaId}-lista-chequeo-data`)
      if (storedData) {
        return JSON.parse(storedData)
      }

      // Si no hay datos en localStorage, cargar datos por defecto
      // Esto simula la carga desde una API o base de datos
      const defaultData = await import("@/data/lista-chequeo-data.json")
      return defaultData.default
    } catch (error) {
      console.error(`Error al cargar datos para ${areaId}:`, error)
      return null
    }
  }

  return datosConsolidados
}
