"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"
import { 
  TipoContrato, 
  EtapaContrato, 
  RespuestaItem, 
  ChecklistItemResponse,
  areaCodeToId 
} from "@/constants/checklist"
import type { Database } from "@/types/supabase-types"

// Interfaces para los datos de la base de datos
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

export interface ChecklistItemMaestro {
  id: string
  numero_item: number
  titulo: string
  descripcion: string
  etapa_id: string
  etapa?: ChecklistEtapa
}

export interface ChecklistItemWithCategoria extends ChecklistItemMaestro {
  categoria_id: string
  fila_excel: number
}

export interface ChecklistRespuesta {
  id: string
  area_id: string
  categoria_id: string
  item_id: string
  respuesta: RespuestaItem | null
  observaciones: string | null
}

export function useChecklistDataNew(areaCode: string) {
  const [categorias, setCategorias] = useState<ChecklistCategoria[]>([])
  const [etapas, setEtapas] = useState<ChecklistEtapa[]>([])
  const [items, setItems] = useState<ChecklistItemWithCategoria[]>([])
  const [respuestas, setRespuestas] = useState<Map<string, ChecklistRespuesta>>(new Map())
  const [selectedTipoContrato, setSelectedTipoContrato] = useState<TipoContrato>(TipoContrato.SAMC)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [areaId, setAreaId] = useState<string>("")

  const supabase = createClientComponentClient<Database>()

  // Obtener el área ID desde el código
  const getAreaId = useCallback(async (areaCode: string) => {
    try {
      const areaId = areaCodeToId[areaCode]
      if (!areaId) {
        console.error(`No se encontró un ID de área para el código: ${areaCode}`)
        return null
      }

      // Verificar que el área existe en la base de datos
      const { data: area, error } = await supabase
        .from('areas')
        .select('id')
        .eq('id', areaId)
        .single()

      if (error) {
        console.error('Error al verificar área:', error)
        return null
      }

      return area?.id || null
    } catch (error) {
      console.error('Error en getAreaId:', error)
      return null
    }
  }, [supabase])

  // Cargar categorías
  const loadCategorias = useCallback(async () => {
    try {
      console.log('Cargando categorías...')
      const { data, error } = await supabase
        .from('lista_chequeo_categorias')
        .select('*')
        .order('orden')

      if (error) {
        console.error('Error al cargar categorías:', error)
        return
      }

      console.log('Categorías cargadas:', data?.length || 0)
      setCategorias(data || [])
    } catch (error) {
      console.error('Error en loadCategorias:', error)
    }
  }, [supabase])

  // Cargar etapas
  const loadEtapas = useCallback(async () => {
    try {
      console.log('Cargando etapas...')
      const { data, error } = await supabase
        .from('lista_chequeo_etapas')
        .select('*')
        .order('orden')

      if (error) {
        console.error('Error al cargar etapas:', error)
        return
      }

      console.log('Etapas cargadas:', data?.length || 0)
      setEtapas(data || [])
    } catch (error) {
      console.error('Error en loadEtapas:', error)
    }
  }, [supabase])

  // Cargar items por tipo de contrato
  const loadItemsByTipoContrato = useCallback(async (tipoContrato: TipoContrato) => {
    try {
      console.log('Cargando items para tipo contrato:', tipoContrato)
      
      // Encontrar la categoría correspondiente
      const categoria = categorias.find(c => c.nombre === tipoContrato)
      if (!categoria) {
        console.error(`No se encontró categoría para ${tipoContrato}`)
        console.log('Categorías disponibles:', categorias.map(c => c.nombre))
        return
      }

      console.log('Categoría encontrada:', categoria.id)

      const { data, error } = await supabase
        .from('lista_chequeo_item_categorias')
        .select(`
          *,
          lista_chequeo_items_maestros (
            *,
            lista_chequeo_etapas (*)
          )
        `)
        .eq('categoria_id', categoria.id)
        .order('lista_chequeo_items_maestros.numero_item')

      if (error) {
        console.error('Error al cargar items:', error)
        return
      }

      console.log('Items raw data:', data?.length || 0)

      // Transformar los datos
      const itemsTransformed: ChecklistItemWithCategoria[] = data?.map(item => ({
        ...item.lista_chequeo_items_maestros,
        categoria_id: item.categoria_id,
        fila_excel: item.fila_excel,
        etapa: item.lista_chequeo_items_maestros.lista_chequeo_etapas
      })) || []

      console.log('Items transformados:', itemsTransformed.length)
      setItems(itemsTransformed)
    } catch (error) {
      console.error('Error en loadItemsByTipoContrato:', error)
    }
  }, [supabase, categorias])

  // Cargar respuestas existentes
  const loadRespuestas = useCallback(async (areaId: string, tipoContrato: TipoContrato) => {
    try {
      const categoria = categorias.find(c => c.nombre === tipoContrato)
      if (!categoria || !areaId) {
        return
      }

      const { data, error } = await supabase
        .from('lista_chequeo_respuestas')
        .select('*')
        .eq('area_id', areaId)
        .eq('categoria_id', categoria.id)

      if (error) {
        console.error('Error al cargar respuestas:', error)
        return
      }

      const respuestasMap = new Map<string, ChecklistRespuesta>()
      data?.forEach(respuesta => {
        respuestasMap.set(respuesta.item_id, respuesta)
      })

      setRespuestas(respuestasMap)
    } catch (error) {
      console.error('Error en loadRespuestas:', error)
    }
  }, [supabase, categorias])

  // Inicializar datos
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      
      // Cargar datos básicos
      await Promise.all([loadCategorias(), loadEtapas()])
      
      // Obtener área ID
      const id = await getAreaId(areaCode)
      if (id) {
        setAreaId(id)
      }
      
      setIsLoading(false)
    }

    initializeData()
  }, [areaCode, getAreaId, loadCategorias, loadEtapas])

  // Cargar items cuando cambie el tipo de contrato o las categorías
  useEffect(() => {
    if (categorias.length > 0) {
      loadItemsByTipoContrato(selectedTipoContrato)
    }
  }, [selectedTipoContrato, categorias, loadItemsByTipoContrato])

  // Cargar respuestas cuando cambie el área o tipo de contrato
  useEffect(() => {
    if (areaId && categorias.length > 0) {
      loadRespuestas(areaId, selectedTipoContrato)
    }
  }, [areaId, selectedTipoContrato, categorias, loadRespuestas])

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
        const categoria = categorias.find(c => c.nombre === selectedTipoContrato)
        if (categoria && areaId) {
          newMap.set(itemId, {
            id: uuidv4(),
            area_id: areaId,
            categoria_id: categoria.id,
            item_id: itemId,
            respuesta,
            observaciones
          })
        }
      }
      
      return newMap
    })
  }, [categorias, selectedTipoContrato, areaId])

  // Guardar respuestas
  const saveRespuestas = useCallback(async () => {
    if (!areaId) {
      toast({
        title: "Error",
        description: "No se pudo identificar el área",
        variant: "destructive"
      })
      return false
    }

    setIsSaving(true)
    try {
      const respuestasArray = Array.from(respuestas.values())
      
      for (const respuesta of respuestasArray) {
        const { error } = await supabase
          .from('lista_chequeo_respuestas')
          .upsert(respuesta)

        if (error) {
          console.error('Error al guardar respuesta:', error)
          throw error
        }
      }

      toast({
        title: "Éxito",
        description: "Las respuestas se han guardado correctamente"
      })
      
      return true
    } catch (error) {
      console.error('Error al guardar respuestas:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar las respuestas",
        variant: "destructive"
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }, [areaId, respuestas, supabase])

  // Obtener respuesta para un item específico
  const getRespuestaForItem = useCallback((itemId: string): ChecklistRespuesta | null => {
    return respuestas.get(itemId) || null
  }, [respuestas])

  // Obtener items por etapa
  const getItemsByEtapa = useCallback((etapaName: string): ChecklistItemWithCategoria[] => {
    return items.filter(item => item.etapa?.nombre === etapaName)
  }, [items])

  // Obtener progreso por etapa
  const getProgresoByEtapa = useCallback((etapaName: string) => {
    const itemsEtapa = getItemsByEtapa(etapaName)
    const respondidos = itemsEtapa.filter(item => {
      const respuesta = getRespuestaForItem(item.id)
      return respuesta?.respuesta !== null
    })
    
    return {
      total: itemsEtapa.length,
      respondidos: respondidos.length,
      porcentaje: itemsEtapa.length > 0 ? Math.round((respondidos.length / itemsEtapa.length) * 100) : 0
    }
  }, [getItemsByEtapa, getRespuestaForItem])

  return {
    // Datos
    categorias,
    etapas,
    items,
    respuestas,
    areaId,
    selectedTipoContrato,
    
    // Estados
    isLoading,
    isSaving,
    
    // Funciones
    setSelectedTipoContrato,
    updateRespuesta,
    saveRespuestas,
    getRespuestaForItem,
    getItemsByEtapa,
    getProgresoByEtapa,
    
    // Refresh functions
    refreshItems: () => loadItemsByTipoContrato(selectedTipoContrato),
    refreshRespuestas: () => loadRespuestas(areaId, selectedTipoContrato)
  }
}
