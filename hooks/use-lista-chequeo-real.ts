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

// Hook para consolidar datos reales de listas de chequeo de todas las áreas
export function useListaChequeoReal() {
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

  // Efecto para cargar y consolidar datos de todas las áreas
  useEffect(() => {
    const cargarDatosConsolidados = () => {
      try {
        // Estructura para almacenar datos consolidados por etapa
        const etapasMap = new Map<string, EtapaConsolidada>()

        // Definir las etapas estándar
        const etapasEstandar = ["Precontractual", "Ejecución", "Cierre"]

        // Inicializar el mapa con las etapas estándar
        etapasEstandar.forEach((etapa) => {
          etapasMap.set(etapa, {
            nombre: etapa,
            documentos: [],
          })
        })

        // Procesar cada área
        areas.forEach((areaId) => {
          // Intentar obtener datos del localStorage
          const storedItems = localStorage.getItem(`${areaId}-lista-chequeo-items`)
          if (!storedItems) return // Si no hay datos, continuar con la siguiente área

          try {
            const items = JSON.parse(storedItems)
            if (!Array.isArray(items)) return // Verificar que sea un array

            // Procesar cada item de la lista de chequeo
            items.forEach((item) => {
              // Verificar que el item tenga la estructura esperada
              if (!item.id || !item.etapa || !item.documento || !item.descripcion) return

              // Obtener o crear la etapa en el mapa
              const etapaNombre = item.etapa
              if (!etapasMap.has(etapaNombre)) {
                etapasMap.set(etapaNombre, {
                  nombre: etapaNombre,
                  documentos: [],
                })
              }

              // Calcular porcentajes basados en los checkboxes
              const si = item.si === true ? 100 : 0
              const no = item.no === true ? 100 : 0
              const noAplica = item.noAplica === true ? 100 : 0

              // Añadir el documento a la etapa correspondiente
              etapasMap.get(etapaNombre)!.documentos.push({
                nombre: item.documento,
                descripcion: item.descripcion,
                respuestas: {
                  si,
                  no,
                  noAplica,
                },
                observaciones: item.observaciones ? [item.observaciones] : [],
                area: areaNombres[areaId],
                areaId,
              })
            })
          } catch (error) {
            console.error(`Error al procesar datos de ${areaId}:`, error)
          }
        })

        // Convertir el mapa a un array para el estado
        const etapasConsolidadas = Array.from(etapasMap.values())

        // Filtrar etapas sin documentos
        const etapasFiltradas = etapasConsolidadas.filter((etapa) => etapa.documentos.length > 0)

        setDatosConsolidados({
          titulo: "Lista de Chequeo Consolidada",
          etapas: etapasFiltradas,
          isLoading: false,
        })
      } catch (error) {
        console.error("Error al consolidar datos de listas de chequeo:", error)
        setDatosConsolidados((prev) => ({ ...prev, isLoading: false }))
      }
    }

    // Cargar datos iniciales
    cargarDatosConsolidados()

    // Configurar un intervalo para actualizar los datos periódicamente
    const intervalId = setInterval(cargarDatosConsolidados, 5000) // Actualizar cada 5 segundos

    // Limpiar el intervalo al desmontar
    return () => clearInterval(intervalId)
  }, [])

  return datosConsolidados
}
