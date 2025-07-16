"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  TipoContrato, 
  EtapaContrato, 
  RespuestaItem,
  areaCodeToId 
} from "@/constants/checklist"

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
  categoria_id: string
  numero_contrato: string
  valor_contrato: number
  contratista: string
  estado: 'EN_PROGRESO' | 'COMPLETADO' | 'REVISADO'
  porcentaje_completado: number
  fecha_creacion: string
  fecha_actualizacion?: string
}

export function useChecklistData(areaCode: string) {
  const [categorias, setCategorias] = useState<ChecklistCategoria[]>([])
  const [etapas, setEtapas] = useState<ChecklistEtapa[]>([])
  const [items, setItems] = useState<ChecklistItemWithCategoria[]>([])
  const [respuestas, setRespuestas] = useState<Map<string, ChecklistRespuesta>>(new Map())
  const [registros, setRegistros] = useState<ChecklistRegistro[]>([])
  const [selectedTipoContrato, setSelectedTipoContrato] = useState<TipoContrato>(TipoContrato.SAMC)
  const [selectedRegistro, setSelectedRegistro] = useState<ChecklistRegistro | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener ID del área
  const areaId = areaCodeToId[areaCode] || areaCode

  // Cargar categorías
  const loadCategorias = useCallback(async () => {
    try {
      const response = await fetch('/api/lista-chequeo/categorias')
      if (!response.ok) {
        throw new Error('Error al cargar categorías')
      }
      const data = await response.json()
      setCategorias(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      setError('Error al cargar categorías')
    }
  }, [])

  // Cargar etapas
  const loadEtapas = useCallback(async () => {
    try {
      const response = await fetch('/api/lista-chequeo/etapas')
      if (!response.ok) {
        throw new Error('Error al cargar etapas')
      }
      const data = await response.json()
      setEtapas(data)
    } catch (error) {
      console.error('Error al cargar etapas:', error)
      setError('Error al cargar etapas')
    }
  }, [])

  // Cargar items por categoría
  const loadItems = useCallback(async (categoriaId: string) => {
    try {
      const response = await fetch(`/api/lista-chequeo/items?categoria_id=${categoriaId}`)
      if (!response.ok) {
        throw new Error('Error al cargar items')
      }
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Error al cargar items:', error)
      setError('Error al cargar items')
    }
  }, [])

  // Cargar respuestas
  const loadRespuestas = useCallback(async (categoriaId: string, registroId?: string) => {
    try {
      let url = `/api/lista-chequeo/respuestas?area_id=${areaId}&categoria_id=${categoriaId}`
      if (registroId) {
        // Cuando hay registro_id, solo usar ese filtro ya que es más específico
        url = `/api/lista-chequeo/respuestas?registro_id=${registroId}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Error al cargar respuestas')
      }
      const data = await response.json()
      
      // Convertir array a Map
      const respuestasMap = new Map<string, ChecklistRespuesta>()
      data.forEach((respuesta: ChecklistRespuesta) => {
        respuestasMap.set(respuesta.item_id, respuesta)
      })
      setRespuestas(respuestasMap)
    } catch (error) {
      console.error('Error al cargar respuestas:', error)
      setError('Error al cargar respuestas')
    }
  }, [areaId])

  // Cargar registros
  const loadRegistros = useCallback(async (categoriaId: string) => {
    try {
      const response = await fetch(`/api/lista-chequeo/registros?area_id=${areaId}&categoria_id=${categoriaId}`)
      if (!response.ok) {
        throw new Error('Error al cargar registros')
      }
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

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Cargar categorías y etapas en paralelo
        await Promise.all([loadCategorias(), loadEtapas()])
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
        setError('Error al cargar datos iniciales')
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [loadCategorias, loadEtapas])

  // Cargar items y respuestas cuando cambie el tipo de contrato
  useEffect(() => {
    if (categorias.length === 0) return

    const categoria = categorias.find(c => c.nombre === selectedTipoContrato)
    if (!categoria) return

    const loadCategoriaData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          loadItems(categoria.id),
          loadRegistros(categoria.id)
        ])
      } catch (error) {
        console.error('Error al cargar datos de categoría:', error)
        setError('Error al cargar datos de categoría')
      } finally {
        setIsLoading(false)
      }
    }

    loadCategoriaData()
  }, [selectedTipoContrato, categorias, loadItems, loadRegistros])

  // Cargar respuestas cuando cambie el registro seleccionado
  useEffect(() => {
    if (!selectedRegistro || categorias.length === 0) return

    const categoria = categorias.find(c => c.nombre === selectedTipoContrato)
    if (!categoria) return

    loadRespuestas(categoria.id, selectedRegistro.id)
  }, [selectedRegistro, selectedTipoContrato, categorias, loadRespuestas])

  // Obtener respuesta para un item
  const getRespuestaForItem = useCallback((itemId: string) => {
    return respuestas.get(itemId) || null
  }, [respuestas])

  // Actualizar respuesta localmente
  const updateRespuesta = useCallback((itemId: string, respuesta: RespuestaItem | null, observaciones: string = "") => {
    if (!selectedRegistro) return

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
          id: `temp-${itemId}`, // ID temporal
          registro_id: selectedRegistro.id,
          item_id: itemId,
          respuesta,
          observaciones
        })
      }
      
      return newMap
    })
  }, [selectedRegistro])

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

  // Guardar respuestas en la base de datos
  const saveRespuestas = useCallback(async () => {
    if (!selectedRegistro) {
      setError('Debe seleccionar un contrato para guardar respuestas')
      return false
    }

    setIsSaving(true)
    setError(null)
    
    try {
      // Preparar datos para enviar con registro_id
      const respuestasArray = Array.from(respuestas.values())
        .filter(r => r.respuesta !== null || r.observaciones)
        .map(r => ({
          registro_id: selectedRegistro.id,
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

      const result = await response.json()
      
      // Recargar respuestas para obtener IDs actualizados
      const categoria = categorias.find(c => c.nombre === selectedTipoContrato)
      if (categoria && selectedRegistro) {
        await loadRespuestas(categoria.id, selectedRegistro.id)
      }

      return true
    } catch (error) {
      console.error('Error al guardar respuestas:', error)
      setError(error instanceof Error ? error.message : 'Error al guardar respuestas')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [respuestas, categorias, selectedTipoContrato, selectedRegistro, loadRespuestas])

  // Exportar a Excel
  const exportToExcel = useCallback(async (registroId?: string) => {
    if (!registroId && !selectedRegistro?.id) {
      console.error('❌ No hay registro seleccionado para exportar');
      setError('Seleccione un registro para exportar');
      return false;
    }

    const targetRegistroId = registroId || selectedRegistro?.id;
    
    try {
      console.log('📤 Iniciando exportación Excel para registro:', targetRegistroId);
      
      // Intentar primero con el endpoint principal
      let response = await fetch(`/api/lista-chequeo/export/${targetRegistroId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      let usedFallback = false;
      
      // Si el endpoint principal falla, intentar con el fallback
      if (!response.ok) {
        console.warn(`⚠️ Endpoint principal falló (${response.status}), intentando con fallback...`);
        
        // Obtener detalles del error principal
        try {
          const errorText = await response.text();
          console.warn('📋 Detalles del error principal:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText.substring(0, 200) + '...'
          });
        } catch (e) {
          console.warn('No se pudo leer el error del endpoint principal');
        }
        
        // Intentar fallback
        response = await fetch(`/api/lista-chequeo/export/fallback/${targetRegistroId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        usedFallback = true;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en ambos endpoints:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 500) + '...',
          usedFallback
        });
        throw new Error(`Error del servidor (${response.status}): ${errorText.substring(0, 200)}...`);
      }

      // Verificar que la respuesta sea un archivo Excel
      const contentType = response.headers.get('content-type');
      const contentDisposition = response.headers.get('content-disposition');
      
      console.log('📋 Detalles de la respuesta:', {
        contentType,
        contentDisposition,
        usedFallback: usedFallback ? '⚠️ SÍ (falló el principal)' : '✅ NO (principal exitoso)'
      });
      
      if (!contentType?.includes('spreadsheetml') && !contentType?.includes('excel')) {
        console.warn('⚠️ Tipo de contenido inesperado:', contentType);
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `lista-chequeo-${targetRegistroId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('✅ Exportación Excel completada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error detallado al exportar a Excel:', {
        error,
        message: error instanceof Error ? error.message : 'Error desconocido',
        registroId: targetRegistroId
      });
      setError(`Error al exportar a Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return false;
    }
  }, [selectedRegistro])

  // Crear nuevo registro
  const createRegistro = useCallback(async (numeroContrato: string, valorContrato: number, contratista: string) => {
    try {
      const categoria = categorias.find(c => c.nombre === selectedTipoContrato)
      if (!categoria) {
        throw new Error('No se encontró la categoría seleccionada')
      }

      const response = await fetch('/api/lista-chequeo/registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area_id: areaId, // Se convertirá a 'dependencia' en el backend
          categoria_id: categoria.id,
          numero_contrato: numeroContrato,
          valor_contrato: valorContrato,
          contratista: contratista
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el registro')
      }

      const nuevoRegistro = await response.json()
      
      // Actualizar la lista de registros
      setRegistros(prev => [nuevoRegistro, ...prev])
      setSelectedRegistro(nuevoRegistro)
      
      return nuevoRegistro
    } catch (error) {
      console.error('Error al crear registro:', error)
      setError(error instanceof Error ? error.message : 'Error al crear el registro')
      return null
    }
  }, [areaId, categorias, selectedTipoContrato])

  return {
    categorias,
    etapas,
    items,
    registros,
    selectedTipoContrato,
    selectedRegistro,
    isLoading,
    isSaving,
    error,
    areaId,
    setSelectedTipoContrato,
    setSelectedRegistro,
    updateRespuesta,
    saveRespuestas,
    exportToExcel,
    createRegistro,
    getRespuestaForItem,
    getItemsByEtapa,
    getProgresoByEtapa,
    // Funciones adicionales para recarga manual
    reload: () => {
      const categoria = categorias.find(c => c.nombre === selectedTipoContrato)
      if (categoria) {
        loadItems(categoria.id)
        loadRegistros(categoria.id)
        if (selectedRegistro) {
          loadRespuestas(categoria.id, selectedRegistro.id)
        }
      }
    }
  }
}
