"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  TipoContrato, 
  EtapaContrato, 
  RespuestaItem 
} from "@/constants/checklist"

// Datos de prueba para mostrar la UI
const DEMO_CATEGORIAS = [
  { id: '1', nombre: 'SAMC', descripcion: 'Selección Abreviada de Menor Cuantía', hoja_excel: 'SAMC', orden: 1 },
  { id: '2', nombre: 'MINIMA CUANTÍA', descripcion: 'Mínima Cuantía', hoja_excel: 'MINIMA CUANTÍA', orden: 2 },
  { id: '3', nombre: 'CONTRATO INTERADMINISTRATIVO', descripcion: 'Contrato Interadministrativo', hoja_excel: 'CONTRATO INTERADMINISTRATIVO', orden: 3 },
  { id: '4', nombre: 'PRESTACIÓN DE SERVICIOS', descripcion: 'Prestación de Servicios', hoja_excel: 'PRESTACIÓN DE SERVICIOS', orden: 4 }
]

const DEMO_ETAPAS = [
  { id: '1', nombre: 'PRECONTRACTUAL', descripcion: 'Etapa precontractual', orden: 1 },
  { id: '2', nombre: 'CONTRACTUAL', descripcion: 'Etapa contractual', orden: 2 },
  { id: '3', nombre: 'EJECUCION', descripcion: 'Etapa de ejecución', orden: 3 }
]

const DEMO_ITEMS_SAMC = [
  { id: '1', numero_item: 1, titulo: 'FICHA MGA (PROCESOS DE INVERSIÓN)', descripcion: 'Ficha MGA para procesos de inversión', etapa_id: '1', categoria_id: '1', fila_excel: 12, etapa: DEMO_ETAPAS[0] },
  { id: '2', numero_item: 2, titulo: 'CERTIFICADO DE VIABILIDAD Y REGISTRO', descripcion: 'Certificado de viabilidad y registro', etapa_id: '1', categoria_id: '1', fila_excel: 13, etapa: DEMO_ETAPAS[0] },
  { id: '3', numero_item: 3, titulo: 'ESTUDIOS PREVIOS Y ANÁLISIS DEL SECTOR', descripcion: 'Estudios previos y análisis del sector', etapa_id: '1', categoria_id: '1', fila_excel: 14, etapa: DEMO_ETAPAS[0] },
  { id: '4', numero_item: 4, titulo: 'COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', descripcion: 'Cotizaciones para procesos de compraventas', etapa_id: '1', categoria_id: '1', fila_excel: 15, etapa: DEMO_ETAPAS[0] },
  { id: '5', numero_item: 5, titulo: 'CÁMARAS DE COMERCIO COTIZACIONES', descripcion: 'Cámaras de comercio cotizaciones', etapa_id: '1', categoria_id: '1', fila_excel: 16, etapa: DEMO_ETAPAS[0] },
  
  { id: '25', numero_item: 25, titulo: 'MINUTA DE CONTRATO', descripcion: 'Minuta de contrato', etapa_id: '2', categoria_id: '1', fila_excel: 39, etapa: DEMO_ETAPAS[1] },
  { id: '26', numero_item: 26, titulo: 'HOJA DE VIDA Y DOCUMENTOS REP. LEGAL', descripcion: 'Hoja de vida y documentos representante legal', etapa_id: '2', categoria_id: '1', fila_excel: 40, etapa: DEMO_ETAPAS[1] },
  { id: '27', numero_item: 27, titulo: 'CÁMARA DE COMERCIO (SI APLICA)', descripcion: 'Cámara de comercio', etapa_id: '2', categoria_id: '1', fila_excel: 41, etapa: DEMO_ETAPAS[1] },
  
  { id: '43', numero_item: 43, titulo: 'INFORMES DE EJECUCIÓN DEL CONTRATO', descripcion: 'Informes de ejecución del contrato', etapa_id: '3', categoria_id: '1', fila_excel: 57, etapa: DEMO_ETAPAS[2] },
  { id: '44', numero_item: 44, titulo: 'ENTRADA DE ALMACÉN (PROCESOS DE COMPRAVENTA)', descripcion: 'Entrada de almacén', etapa_id: '3', categoria_id: '1', fila_excel: 58, etapa: DEMO_ETAPAS[2] },
  { id: '45', numero_item: 45, titulo: 'INFORMES DE SUPERVISIÓN', descripcion: 'Informes de supervisión', etapa_id: '3', categoria_id: '1', fila_excel: 59, etapa: DEMO_ETAPAS[2] }
]

export interface ChecklistCategoria {
  id: string
  nombre: string
  descripcion: string | null
  hoja_excel: string
  orden: number
}

export interface ChecklistEtapa {
  id: string
  nombre: string
  descripcion: string | null
  orden: number
}

export interface ChecklistItemWithCategoria {
  id: string
  numero_item: number
  titulo: string
  descripcion: string
  etapa_id: string
  categoria_id: string
  fila_excel: number
  etapa?: ChecklistEtapa
}

export interface ChecklistRespuesta {
  id: string
  area_id: string
  categoria_id: string
  item_id: string
  respuesta: RespuestaItem | null
  observaciones: string | null
}

export function useChecklistDataDemo(areaCode: string) {
  const [categorias] = useState<ChecklistCategoria[]>(DEMO_CATEGORIAS)
  const [etapas] = useState<ChecklistEtapa[]>(DEMO_ETAPAS)
  const [items, setItems] = useState<ChecklistItemWithCategoria[]>([])
  const [respuestas, setRespuestas] = useState<Map<string, ChecklistRespuesta>>(new Map())
  const [selectedTipoContrato, setSelectedTipoContrato] = useState<TipoContrato>(TipoContrato.SAMC)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [areaId] = useState<string>("demo-area-id")

  // Cargar items cuando cambie el tipo de contrato
  useEffect(() => {
    setIsLoading(true)
    
    // Simular carga de datos
    setTimeout(() => {
      if (selectedTipoContrato === TipoContrato.SAMC) {
        setItems(DEMO_ITEMS_SAMC)
      } else {
        // Para otros tipos de contrato, usar algunos items de ejemplo
        setItems(DEMO_ITEMS_SAMC.slice(0, 5))
      }
      setIsLoading(false)
    }, 500)
  }, [selectedTipoContrato])

  // Obtener respuesta para un item
  const getRespuestaForItem = useCallback((itemId: string) => {
    return respuestas.get(itemId) || null
  }, [respuestas])

  // Actualizar respuesta
  const updateRespuesta = useCallback((itemId: string, respuesta: RespuestaItem | null, observaciones: string = "") => {
    setRespuestas(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(itemId)
      
      if (existing) {
        newMap.set(itemId, {
          ...existing,
          respuesta,
          observaciones
        })
      } else {
        newMap.set(itemId, {
          id: `resp-${itemId}`,
          area_id: areaId,
          categoria_id: categorias.find(c => c.nombre === selectedTipoContrato)?.id || '1',
          item_id: itemId,
          respuesta,
          observaciones
        })
      }
      
      return newMap
    })
  }, [areaId, selectedTipoContrato, categorias])

  // Obtener items por etapa
  const getItemsByEtapa = useCallback((etapaNombre: string) => {
    const etapa = etapas.find(e => e.nombre === etapaNombre)
    if (!etapa) return []
    
    return items.filter(item => item.etapa_id === etapa.id)
  }, [items, etapas])

  // Obtener progreso por etapa
  const getProgresoByEtapa = useCallback((etapaNombre: string) => {
    const itemsEtapa = getItemsByEtapa(etapaNombre)
    const total = itemsEtapa.length
    const respondidos = itemsEtapa.filter(item => {
      const respuesta = getRespuestaForItem(item.id)
      return respuesta && respuesta.respuesta !== null
    }).length
    
    return {
      total,
      respondidos,
      porcentaje: total > 0 ? Math.round((respondidos / total) * 100) : 0
    }
  }, [getItemsByEtapa, getRespuestaForItem])

  // Guardar respuestas (simulado)
  const saveRespuestas = useCallback(async () => {
    setIsSaving(true)
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSaving(false)
    return true
  }, [])

  return {
    categorias,
    etapas,
    items,
    selectedTipoContrato,
    isLoading,
    isSaving,
    areaId,
    setSelectedTipoContrato,
    updateRespuesta,
    saveRespuestas,
    getRespuestaForItem,
    getItemsByEtapa,
    getProgresoByEtapa
  }
}
