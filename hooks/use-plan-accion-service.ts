"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
import type { PlanAccionItem } from "@/types/plan-accion"
import { withRetry, RETRY_CONFIGS } from "@/lib/retry-manager"
import { useMultiStageLoading } from "@/hooks/use-loading-state"
import { queryPlanAccion, queryStats, FULL_FIELDS, STATS_FIELDS, clearTableCache } from "@/lib/optimized-queries"
import { handleError, withErrorHandling } from "@/lib/error-handler"

// Función para asegurar que las fechas sean válidas y estén en formato ISO
function ensureValidDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()

  try {
    // Verificar si ya está en formato ISO
    if (dateStr.includes("T")) {
      return dateStr
    }

    // Asumiendo formato dd/mm/yyyy
    const parts = dateStr.split("/")
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number)
      const date = new Date(year, month - 1, day)

      // Verificar si la fecha es válida
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }

    // Si no se pudo parsear, devolver la fecha actual
    console.warn(`No se pudo parsear la fecha: ${dateStr}, usando fecha actual como respaldo`)
    return new Date().toISOString() // Valor por defecto en caso de error
  } catch (error) {
    console.error("Error parsing date:", dateStr, error)
    return new Date().toISOString() // Valor por defecto en caso de error
  }
}

// Función auxiliar para formatear fechas desde ISO a formato local
function formatDate(dateString: string | null): string {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formateando fecha:", dateString, error)
    return dateString || ""
  }
}

export function usePlanAccionService(areaSlug: string) {
  const [items, setItems] = useState<PlanAccionItem[]>([])
  const [areaId, setAreaId] = useState<string | null>(null)
  const [areaName, setAreaName] = useState<string>("")
  const supabase = createClientComponentClient()
  
  // Estados de carga mejorados con múltiples etapas
  const loadingStages = [
    "Conectando a la base de datos...",
    "Verificando autenticación...",
    "Obteniendo información del área...",
    "Cargando planes de acción...",
    "Procesando datos..."
  ]
  
  const {
    isLoading,
    error,
    progress,
    stage,
    isLoadingTooLong,
    retryCount,
    startLoading,
    updateProgress,
    setError,
    finishLoading,
    nextStage,
    retry: retryLoading
  } = useMultiStageLoading(loadingStages, {
    slowLoadingThreshold: 8000,
    showProgressToast: true,
    slowLoadingMessage: "La carga de datos está tardando más de lo esperado. Esto puede deberse a una conexión lenta o alta carga del servidor."
  })

  // Obtener el ID del área desde Supabase
  useEffect(() => {
    async function fetchAreaId() {
      try {
        startLoading()

        // Si el areaSlug ya es un UUID, asumimos que es el ID directamente
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(areaSlug)) {
          console.log(`El área parece ser un UUID válido: ${areaSlug}`)

          // Verificar que el ID existe en la tabla areas
          const { data, error } = await supabase.from("areas").select("id, nombre, codigo").eq("id", areaSlug).single()

          if (error) {
            console.error("Error verificando ID de área:", error)
            throw new Error(`No se pudo verificar el ID del área: ${error.message}`)
          }

          if (data) {
            console.log(`ID de área confirmado: ${data.id}, Nombre: ${data.nombre}`)
            setAreaId(data.id)
            setAreaName(data.nombre || "Área")
            return
          }
        }

        // Mapeo de slugs a nombres de área
        const AREA_SLUGS: Record<string, string> = {
          "calidad-educativa": "Calidad Educativa",
          "inspeccion-vigilancia": "Inspección y Vigilancia",
          "cobertura-infraestructura": "Cobertura e Infraestructura",
          "talento-humano": "Talento Humano",
        }

        // Obtener el nombre del área a partir del slug
        const areaName = AREA_SLUGS[areaSlug] || areaSlug

        console.log(`Buscando ID para el área: ${areaName} (slug: ${areaSlug})`)

        // Buscar el ID del área en la tabla areas
        const { data, error } = await supabase
          .from("areas")
          .select("id, nombre")
          .ilike("nombre", `%${areaName}%`)
          .limit(1)

        if (error) {
          console.error("Error al buscar el ID del área:", error)
          throw error
        }

        if (data && data.length > 0) {
          console.log(`ID del área encontrado: ${data[0].id}, Nombre: ${data[0].nombre}`)
          setAreaId(data[0].id)
          setAreaName(data[0].nombre || areaName)
        } else {
          // Si no encontramos por nombre, intentamos buscar por slug/código
          const { data: dataBySlug, error: errorBySlug } = await supabase
            .from("areas")
            .select("id, nombre, codigo")
            .ilike("codigo", `%${areaSlug}%`)
            .limit(1)

          if (errorBySlug) {
            console.error("Error al buscar el ID del área por slug:", errorBySlug)
            throw errorBySlug
          }

          if (dataBySlug && dataBySlug.length > 0) {
            console.log(`ID del área encontrado por slug: ${dataBySlug[0].id}, Nombre: ${dataBySlug[0].nombre}`)
            setAreaId(dataBySlug[0].id)
            setAreaName(dataBySlug[0].nombre || areaName)
          } else {
            console.error(`No se encontró ID para el área: ${areaName} (slug: ${areaSlug})`)
            throw new Error(`No se encontró el área: ${areaName}`)
          }
        }
      } catch (err: any) {
        console.error("Error al obtener el ID del área:", err)
        
        const userFriendlyError = handleError(err, {
          operation: 'Obtener ID del área',
          module: 'Plan de Acción',
          metadata: { areaSlug }
        })
        
        setError(userFriendlyError.description)
      } finally {
        finishLoading()
      }
    }

    fetchAreaId()
  }, [areaSlug, supabase])

  // Cargar planes de acción con retry y progreso
  const loadPlanesAccion = useCallback(async () => {
    if (!areaId) {
      console.log("No se puede cargar planes de acción sin ID de área")
      return []
    }

    try {
      console.log(`Cargando planes de acción para área ID: ${areaId}`)
      
      // Consulta con campos específicos (sin campo 'numero' que no existe)
      const { data, error } = await supabase
        .from("plan_accion")
        .select(`
          id,
          area_id,
          usuario_id,
          programa,
          objetivo,
          meta,
          presupuesto,
          acciones,
          indicadores,
          porcentaje_avance,
          fecha_inicio,
          fecha_fin,
          responsable,
          estado,
          prioridad,
          comentarios,
          created_at,
          updated_at,
          meta_docenal,
          macroobjetivo_docenal,
          objetivo_docenal,
          programa_pdm,
          subprograma_pdm,
          proyecto_pdm,
          grupo_etareo,
          grupo_poblacion,
          zona,
          grupo_etnico,
          cantidad
        `)
        .eq("area_id", areaId)
        .order("created_at", { ascending: false })
      
      if (error) {
        console.error("Error cargando planes de acción:", error)
        throw error
      }
      
      if (!data) {
        console.log("No se encontraron datos")
        return []
      }
      
      // 🔍 DEBUG: Ver datos crudos de Supabase
      console.log("🔍 DATOS CRUDOS DE SUPABASE:", {
        count: data.length,
        firstItem: data[0],
        campos_docenal: data[0] ? {
          meta_docenal: data[0].meta_docenal,
          macroobjetivo_docenal: data[0].macroobjetivo_docenal,
          objetivo_docenal: data[0].objetivo_docenal
        } : null,
        campos_pdm: data[0] ? {
          programa_pdm: data[0].programa_pdm,
          subprograma_pdm: data[0].subprograma_pdm,
          proyecto_pdm: data[0].proyecto_pdm
        } : null
      })
      
      // Transformar datos al formato esperado por la aplicación
      const formattedItems: PlanAccionItem[] = (data || []).map((item) => ({
        id: item.id,
        programa: item.programa || "",
        objetivo: item.objetivo || "",
        meta: item.meta || "",
        presupuesto: item.presupuesto || "",
        acciones: item.acciones || "",
        indicadores: item.indicadores || "",
        porcentajeAvance: item.porcentaje_avance || 0,
        fechaInicio: formatDate(item.fecha_inicio) || "",
        fechaFin: formatDate(item.fecha_fin) || "",
        responsable: item.responsable || "",
        estado: item.estado || "Pendiente",
        prioridad: item.prioridad || "Media",
        comentarios: item.comentarios || "",
        // Mapear campos del Plan Decenal de snake_case a camelCase (docenal -> decenal)
        metaDecenal: item.meta_docenal || undefined,
        macroobjetivoDecenal: item.macroobjetivo_docenal || undefined,
        objetivoDecenal: item.objetivo_docenal || undefined,
        // Mapear campos del PDM de snake_case a camelCase
        programaPDM: item.programa_pdm || undefined,
        subprogramaPDM: item.subprograma_pdm || undefined,
        proyectoPDM: item.proyecto_pdm || undefined,
        // Mapear campos demográficos de snake_case a camelCase
        grupoEtareo: item.grupo_etareo || undefined,
        grupoPoblacion: item.grupo_poblacion || undefined,
        zona: item.zona || undefined,
        grupoEtnico: item.grupo_etnico || undefined,
        cantidad: item.cantidad !== null && item.cantidad !== undefined ? String(item.cantidad) : undefined,
      }))
      
      // 🔥 DEBUG: Ver items transformados
      console.log("🔥 ITEMS TRANSFORMADOS:", {
        count: formattedItems.length,
        firstItem: formattedItems[0],
        metaDecenal: formattedItems[0]?.metaDecenal,
        programaPDM: formattedItems[0]?.programaPDM
      })

      // 🔍 DEBUG: Ver datos después del mapeo
      console.log("🔍 DATOS DESPUÉS DEL MAPEO:", {
        count: formattedItems.length,
        firstItem: formattedItems[0],
        campos_decenal: formattedItems[0] ? {
          metaDecenal: formattedItems[0].metaDecenal,
          macroobjetivoDecenal: formattedItems[0].macroobjetivoDecenal,
          objetivoDecenal: formattedItems[0].objetivoDecenal
        } : null,
        campos_pdm: formattedItems[0] ? {
          programaPDM: formattedItems[0].programaPDM,
          subprogramaPDM: formattedItems[0].subprogramaPDM,
          proyectoPDM: formattedItems[0].proyectoPDM
        } : null
      })

      setItems(formattedItems)
      return formattedItems
    } catch (err: any) {
      console.error("Error cargando planes de acción:", err)
      setError(err.message || "Error cargando datos")
      throw err
    }
  }, [areaId, supabase, setError, setItems]) // Simplificado para funcionar como antes

  // Usar useRef para evitar dependencias circulares
  const loadPlanesAccionRef = useRef(loadPlanesAccion)
  loadPlanesAccionRef.current = loadPlanesAccion

  // Cargar datos cuando cambia el areaId
  useEffect(() => {
    if (areaId) {
      loadPlanesAccionRef.current()
    }
  }, [areaId])

  // Añadir un nuevo plan de acción
  const addPlanAccion = useCallback(
    async (newItem: PlanAccionItem) => {
      if (!areaId) {
        throw new Error("No se puede añadir un plan de acción sin ID de área")
      }

      try {
        console.log("Añadiendo nuevo plan de acción:", newItem)

        // Validar campos requeridos
        const requiredFields = [
          { field: "programa", label: "Programa" },
          { field: "objetivo", label: "Objetivo" },
          { field: "meta", label: "Meta" },
          { field: "presupuesto", label: "Presupuesto" },
          { field: "acciones", label: "Acciones" },
          { field: "indicadores", label: "Indicadores" },
          { field: "responsable", label: "Responsable" },
        ]

        for (const { field, label } of requiredFields) {
          if (!newItem[field as keyof typeof newItem]) {
            throw new Error(`El campo ${label} es requerido`)
          }
        }

        // Asegurar fechas válidas
        const fechaInicio = ensureValidDate(newItem.fechaInicio)
        const fechaFin = ensureValidDate(newItem.fechaFin)

        // Obtener usuario actual
        const { data: userData } = await supabase.auth.getUser()

        // Preparar datos para inserción
        const insertData = {
          area_id: areaId,
          programa: newItem.programa,
          objetivo: newItem.objetivo,
          meta: newItem.meta,
          presupuesto: newItem.presupuesto,
          acciones: newItem.acciones,
          indicadores: newItem.indicadores,
          porcentaje_avance: newItem.porcentajeAvance || 0,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          responsable: newItem.responsable,
          estado: newItem.estado || "Pendiente",
          prioridad: newItem.prioridad || "Media",
          comentarios: newItem.comentarios || "",
          usuario_id: userData.user?.id,
          // CAMPOS DEL PLAN DECENAL - Mapear de camelCase a snake_case
          meta_docenal: newItem.metaDecenal || null,
          macroobjetivo_docenal: newItem.macroobjetivoDecenal || null,
          objetivo_docenal: newItem.objetivoDecenal || null,
          // CAMPOS DEL PDM 2024-2027 - Mapear de camelCase a snake_case
          programa_pdm: newItem.programaPDM || null,
          subprograma_pdm: newItem.subprogramaPDM || null,
          proyecto_pdm: newItem.proyectoPDM || null,
          // CAMPOS DEMOGRÁFICOS - Mapear de camelCase a snake_case
          grupo_etareo: newItem.grupoEtareo || null,
          grupo_poblacion: newItem.grupoPoblacion || null,
          zona: newItem.zona || null,
          grupo_etnico: newItem.grupoEtnico || null,
          cantidad: newItem.cantidad ? Number(newItem.cantidad) : null,
        }

        console.log("🔍 DATOS PREPARADOS PARA INSERCIÓN EN SUPABASE:", insertData)
        console.log("🎯 VERIFICACIÓN CAMPOS PLAN DECENAL:")
        console.log("   meta_docenal:", insertData.meta_docenal)
        console.log("   macroobjetivo_docenal:", insertData.macroobjetivo_docenal)
        console.log("   objetivo_docenal:", insertData.objetivo_docenal)
        console.log("🏛️ VERIFICACIÓN CAMPOS PDM 2024-2027:")
        console.log("   programa_pdm:", insertData.programa_pdm)
        console.log("   subprograma_pdm:", insertData.subprograma_pdm)
        console.log("   proyecto_pdm:", insertData.proyecto_pdm)
        console.log("📊 VERIFICACIÓN CAMPOS DEMOGRÁFICOS:")
        console.log("   grupo_etareo:", insertData.grupo_etareo)
        console.log("   grupo_poblacion:", insertData.grupo_poblacion)
        console.log("   zona:", insertData.zona)
        console.log("   grupo_etnico:", insertData.grupo_etnico)
        console.log("   cantidad:", insertData.cantidad)
        console.log("   usuario_id:", insertData.usuario_id)

        // Insertar en Supabase
        const { data, error } = await supabase.from("plan_accion").insert(insertData).select().single()

        if (error) {
          console.error("Error al añadir plan de acción:", error)
          throw new Error(`Error al añadir plan de acción: ${error.message}`)
        }

        console.log("Plan de acción añadido con éxito:", data)

        // Actualizar estado local
        await loadPlanesAccionRef.current()

        return data
      } catch (err: any) {
        console.error("Error en addPlanAccion:", err)
        setError(err.message || "Error añadiendo plan de acción")
        throw err
      }
    },
    [areaId, supabase, setError],
  )

  // Actualizar un plan de acción existente
  const updatePlanAccion = useCallback(
    async (id: string, updatedItem: Partial<PlanAccionItem>) => {
      try {
        console.log("Actualizando plan de acción:", id, updatedItem)

        // Preparar datos para actualización
        const updateData: any = {}

        // Mapear campos de camelCase a snake_case
        if (updatedItem.programa !== undefined) updateData.programa = updatedItem.programa
        if (updatedItem.objetivo !== undefined) updateData.objetivo = updatedItem.objetivo
        if (updatedItem.meta !== undefined) updateData.meta = updatedItem.meta
        if (updatedItem.presupuesto !== undefined) updateData.presupuesto = updatedItem.presupuesto
        if (updatedItem.acciones !== undefined) updateData.acciones = updatedItem.acciones
        if (updatedItem.indicadores !== undefined) updateData.indicadores = updatedItem.indicadores
        if (updatedItem.porcentajeAvance !== undefined) updateData.porcentaje_avance = updatedItem.porcentajeAvance
        if (updatedItem.fechaInicio !== undefined) updateData.fecha_inicio = ensureValidDate(updatedItem.fechaInicio)
        if (updatedItem.fechaFin !== undefined) updateData.fecha_fin = ensureValidDate(updatedItem.fechaFin)
        if (updatedItem.responsable !== undefined) updateData.responsable = updatedItem.responsable
        if (updatedItem.estado !== undefined) updateData.estado = updatedItem.estado
        if (updatedItem.prioridad !== undefined) updateData.prioridad = updatedItem.prioridad
        if (updatedItem.comentarios !== undefined) updateData.comentarios = updatedItem.comentarios
        // Mapear campos del Plan Decenal de camelCase a snake_case - usar null para limpiar
        if (updatedItem.metaDecenal !== undefined) updateData.meta_docenal = updatedItem.metaDecenal || null
        if (updatedItem.macroobjetivoDecenal !== undefined) updateData.macroobjetivo_docenal = updatedItem.macroobjetivoDecenal || null
        if (updatedItem.objetivoDecenal !== undefined) updateData.objetivo_docenal = updatedItem.objetivoDecenal || null
        // Mapear campos del PDM de camelCase a snake_case - usar null para limpiar
        if (updatedItem.programaPDM !== undefined) updateData.programa_pdm = updatedItem.programaPDM || null
        if (updatedItem.subprogramaPDM !== undefined) updateData.subprograma_pdm = updatedItem.subprogramaPDM || null
        if (updatedItem.proyectoPDM !== undefined) updateData.proyecto_pdm = updatedItem.proyectoPDM || null
        // Mapear campos demográficos de camelCase a snake_case - usar null para limpiar
        if (updatedItem.grupoEtareo !== undefined) updateData.grupo_etareo = updatedItem.grupoEtareo || null
        if (updatedItem.grupoPoblacion !== undefined) updateData.grupo_poblacion = updatedItem.grupoPoblacion || null
        if (updatedItem.zona !== undefined) updateData.zona = updatedItem.zona || null
        if (updatedItem.grupoEtnico !== undefined) updateData.grupo_etnico = updatedItem.grupoEtnico || null
        if (updatedItem.cantidad !== undefined) updateData.cantidad = updatedItem.cantidad ? Number(updatedItem.cantidad) : null

        // Actualizar en Supabase
        const { data, error } = await supabase.from("plan_accion").update(updateData).eq("id", id).select().single()

        if (error) {
          console.error("Error al actualizar plan de acción:", error)
          throw new Error(`Error al actualizar plan de acción: ${error.message}`)
        }

        console.log("Plan de acción actualizado con éxito:", data)

        // Actualizar estado local
        await loadPlanesAccionRef.current()

        return data
      } catch (err: any) {
        console.error("Error en updatePlanAccion:", err)
        setError(err.message || "Error actualizando plan de acción")
        throw err
      }
    },
    [supabase, setError],
  )

  // Eliminar un plan de acción
  const deletePlanAccion = useCallback(
    async (id: string) => {
      try {
        console.log("Eliminando plan de acción:", id)

        // Eliminar de Supabase
        const { error } = await supabase.from("plan_accion").delete().eq("id", id)

        if (error) {
          console.error("Error al eliminar plan de acción:", error)
          throw new Error(`Error al eliminar plan de acción: ${error.message}`)
        }

        console.log("Plan de acción eliminado con éxito")

        // Actualizar estado local
        await loadPlanesAccionRef.current()

        return true
      } catch (err: any) {
        console.error("Error en deletePlanAccion:", err)
        setError(err.message || "Error eliminando plan de acción")
        throw err
      }
    },
    [supabase, setError],
  )

  return {
    items,
    isLoading,
    error,
    areaId,
    areaName,
    loadPlanesAccion,
    addPlanAccion,
    updatePlanAccion,
    deletePlanAccion,
    // Estados de carga mejorados
    progress,
    stage,
    isLoadingTooLong,
    retryCount,
    retry: retryLoading
  }
}
