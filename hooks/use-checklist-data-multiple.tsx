'use client'

import { useState, useEffect, useCallback } from 'react'

// Tipos
export type RespuestaItem = 'SI' | 'NO' | 'NO_APLICA'

export interface ChecklistItem {
  id: string
  numero_item: number
  titulo: string
  descripcion: string
  etapa_id: string
  categoria_id: string
  fila_excel: number
  etapa?: ChecklistEtapa
}

export interface ChecklistEtapa {
  id: string
  nombre: string
  descripcion: string
  orden: number
}

export interface ChecklistCategoria {
  id: string
  nombre: string
  descripcion: string
}

export interface ChecklistRespuesta {
  id: string
  registro_id: string
  item_id: string
  respuesta: RespuestaItem | null
  observaciones: string | null
  created_at?: string
  updated_at?: string
}

export interface ChecklistRegistro {
  id: string
  dependencia: string
  contrato: string
  contratista: string
  valor: number
  objeto: string
  created_at?: string
  updated_at?: string
}

// Estados del hook
interface ChecklistDataMultiple {
  registros: ChecklistRegistro[]
  selectedRegistro: ChecklistRegistro | null
  setSelectedRegistro: (registro: ChecklistRegistro | null) => void
  itemsPorApartado: Record<string, ChecklistItem[]>
  respuestasPorApartado: Record<string, Map<string, ChecklistRespuesta>>
  etapas: ChecklistEtapa[]
  categorias: ChecklistCategoria[]
  isLoading: boolean
  error: string | null
  isSaving: boolean
  saveRespuestas: (registroId: string, apartadoId: string) => Promise<boolean>
  updateRespuesta: (apartadoId: string, itemId: string, respuesta: RespuestaItem | null, observaciones?: string) => void
  getRespuestaForItem: (apartadoId: string, itemId: string) => ChecklistRespuesta | null
  refreshData: () => Promise<void>
}

export function useChecklistDataMultiple(areaId: string): ChecklistDataMultiple {
  // Estados
  const [registros, setRegistros] = useState<ChecklistRegistro[]>([])
  const [selectedRegistro, setSelectedRegistro] = useState<ChecklistRegistro | null>(null)
  const [itemsPorApartado, setItemsPorApartado] = useState<Record<string, ChecklistItem[]>>({})
  const [respuestasPorApartado, setRespuestasPorApartado] = useState<Record<string, Map<string, ChecklistRespuesta>>>({})
  const [etapas, setEtapas] = useState<ChecklistEtapa[]>([])
  const [categorias, setCategorias] = useState<ChecklistCategoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar categorías
  const loadCategorias = useCallback(async () => {
    try {
      const response = await fetch('/api/lista-chequeo/categorias')
      if (!response.ok) throw new Error('Error al cargar categorías')
      const data = await response.json()
      setCategorias(data || [])
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      setError('Error al cargar categorías')
    }
  }, [])

  // Cargar etapas
  const loadEtapas = useCallback(async () => {
    try {
      const response = await fetch('/api/lista-chequeo/etapas')
      if (!response.ok) throw new Error('Error al cargar etapas')
      const data = await response.json()
      setEtapas(data || [])
    } catch (error) {
      console.error('Error al cargar etapas:', error)
      setError('Error al cargar etapas')
    }
  }, [])

  // Cargar registros de contratos
  const loadRegistros = useCallback(async () => {
    try {
      const response = await fetch(`/api/lista-chequeo/registros-multiple?area_id=${areaId}`)
      if (!response.ok) throw new Error('Error al cargar registros')
      const data = await response.json()
      setRegistros(data || [])
      
      // Si hay registros y no hay uno seleccionado, seleccionar el primero
      if (data && data.length > 0 && !selectedRegistro) {
        setSelectedRegistro(data[0])
      }
    } catch (error) {
      console.error('Error al cargar registros:', error)
      setError('Error al cargar registros')
    }
  }, [areaId, selectedRegistro])

  // Cargar items para todos los apartados
  const loadItemsPorApartado = useCallback(async () => {
    try {
      if (categorias.length === 0) return

      const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS']
      const itemsData: Record<string, ChecklistItem[]> = {}

      for (const apartado of apartados) {
        const categoria = categorias.find(c => c.nombre === apartado)
        if (categoria) {
          const response = await fetch(`/api/lista-chequeo/items?categoria_id=${categoria.id}`)
          if (response.ok) {
            const items = await response.json()
            itemsData[apartado] = items || []
          }
        }
      }

      setItemsPorApartado(itemsData)
    } catch (error) {
      console.error('Error al cargar items por apartado:', error)
      setError('Error al cargar items')
    }
  }, [categorias])

  // Cargar respuestas para todos los apartados del registro seleccionado
  const loadRespuestasPorApartado = useCallback(async () => {
    try {
      if (!selectedRegistro) return

      const respuestasData: Record<string, Map<string, ChecklistRespuesta>> = {}
      
      // Cargar respuestas para el registro
      const response = await fetch(`/api/lista-chequeo/respuestas?registro_id=${selectedRegistro.id}`)
      if (response.ok) {
        const respuestas: ChecklistRespuesta[] = await response.json()
        
        // Agrupar respuestas por apartado basado en los items
        const apartados = ['SAMC', 'MINIMA CUANTÍA', 'CONTRATO INTERADMINISTRATIVO', 'PRESTACIÓN DE SERVICIOS']
        
        apartados.forEach(apartado => {
          const itemsApartado = itemsPorApartado[apartado] || []
          const respuestasMap = new Map<string, ChecklistRespuesta>()
          
          respuestas.forEach(respuesta => {
            const itemPertenece = itemsApartado.find(item => item.id === respuesta.item_id)
            if (itemPertenece) {
              respuestasMap.set(respuesta.item_id, respuesta)
            }
          })
          
          respuestasData[apartado] = respuestasMap
        })
      }

      setRespuestasPorApartado(respuestasData)
    } catch (error) {
      console.error('Error al cargar respuestas por apartado:', error)
      setError('Error al cargar respuestas')
    }
  }, [selectedRegistro, itemsPorApartado])

  // Actualizar respuesta localmente
  const updateRespuesta = useCallback((apartadoId: string, itemId: string, respuesta: RespuestaItem | null, observaciones: string = "") => {
    if (!selectedRegistro) return

    setRespuestasPorApartado(prev => {
      const newData = { ...prev }
      if (!newData[apartadoId]) {
        newData[apartadoId] = new Map()
      }
      
      const apartadoMap = new Map(newData[apartadoId])
      const existing = apartadoMap.get(itemId)
      
      if (existing) {
        apartadoMap.set(itemId, {
          ...existing,
          respuesta,
          observaciones
        })
      } else {
        apartadoMap.set(itemId, {
          id: `temp-${itemId}`,
          registro_id: selectedRegistro.id,
          item_id: itemId,
          respuesta,
          observaciones
        })
      }
      
      newData[apartadoId] = apartadoMap
      return newData
    })
  }, [selectedRegistro])

  // Obtener respuesta para un item específico
  const getRespuestaForItem = useCallback((apartadoId: string, itemId: string) => {
    const apartadoRespuestas = respuestasPorApartado[apartadoId]
    return apartadoRespuestas?.get(itemId) || null
  }, [respuestasPorApartado])

  // Guardar respuestas de un apartado específico
  const saveRespuestas = useCallback(async (registroId: string, apartadoId: string) => {
    if (!selectedRegistro) {
      setError('Debe seleccionar un contrato para guardar respuestas')
      return false
    }

    setIsSaving(true)
    setError(null)
    
    try {
      const apartadoRespuestas = respuestasPorApartado[apartadoId] || new Map()
      
      // Preparar datos para enviar
      const respuestasArray = Array.from(apartadoRespuestas.values())
        .filter(r => r.respuesta !== null || r.observaciones)
        .map(r => ({
          registro_id: registroId,
          item_id: r.item_id,
          respuesta: r.respuesta,
          observaciones: r.observaciones || null
        }))

      const response = await fetch('/api/lista-chequeo/respuestas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ respuestas: respuestasArray })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar respuestas')
      }

      // Recargar respuestas para obtener IDs actualizados
      await loadRespuestasPorApartado()
      
      return true
    } catch (error) {
      console.error('Error al guardar respuestas:', error)
      setError('Error al guardar respuestas')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [selectedRegistro, respuestasPorApartado, loadRespuestasPorApartado])

  // Refrescar todos los datos
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        loadCategorias(),
        loadEtapas(),
        loadRegistros()
      ])
    } catch (error) {
      console.error('Error al refrescar datos:', error)
      setError('Error al refrescar datos')
    } finally {
      setIsLoading(false)
    }
  }, [loadCategorias, loadEtapas, loadRegistros])

  // Efectos
  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    if (categorias.length > 0) {
      loadItemsPorApartado()
    }
  }, [categorias, loadItemsPorApartado])

  useEffect(() => {
    if (selectedRegistro && Object.keys(itemsPorApartado).length > 0) {
      loadRespuestasPorApartado()
    }
  }, [selectedRegistro, itemsPorApartado, loadRespuestasPorApartado])

  return {
    registros,
    selectedRegistro,
    setSelectedRegistro,
    itemsPorApartado,
    respuestasPorApartado,
    etapas,
    categorias,
    isLoading,
    error,
    isSaving,
    saveRespuestas,
    updateRespuesta,
    getRespuestaForItem,
    refreshData
  }
}
