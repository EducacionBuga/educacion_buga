import { useCallback, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase-types"
import type { PlanValidacion } from "./use-plan-validaciones"

export interface MatrizSeguimientoItem {
  id: string
  area: string
  areaId: string
  color: string
  programa: string
  objetivo: string
  meta: string
  presupuesto: string
  acciones: string
  indicadores: string
  avance: number
  fechaInicio: string
  fechaFin: string
  responsable: string
  estado: string
  prioridad: string
  descripcion: string
  metaDecenal?: string
  macroobjetivoDecenal?: string
  objetivoDecenal?: string
  validacion?: PlanValidacion
}

const defaultAreaColors: { [key: string]: string } = {
  DA: "#E91E63", // Rosa
  DG: "#9C27B0", // Morado
  DJ: "#673AB7", // Morado Oscuro
  DL: "#3F51B5", // Azul Oscuro
  DM: "#2196F3", // Azul
  DN: "#03A9F4", // Azul Claro
  DO: "#00BCD4", // Cian
  DP: "#009688", // Verde Azulado
  DQ: "#4CAF50", // Verde
  DR: "#8BC34A", // Verde Lima
  DS: "#CDDC39", // Lima
  DT: "#FFEB3B", // Amarillo
  DU: "#FFC107", // Ámbar
  DV: "#FF9800", // Naranja
  DW: "#FF5722", // Naranja Oscuro
  DX: "#795548", // Marrón
  DY: "#9E9E9E", // Gris
  DZ: "#607D8B", // Gris Azulado
}

// Función auxiliar para formatear fechas
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
    return dateString || ""
  }
}

export const useMatrizSeguimiento = () => {
  const [data, setData] = useState<MatrizSeguimientoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  // Mover loadData fuera del useEffect y convertirla en useCallback
  const loadData = useCallback(async () => {
    setIsLoading(true)

    try {
      console.log("Cargando datos para matriz de seguimiento...")

      // Obtener todas las áreas de la base de datos
      const { data: areasData, error: areasError } = await supabase.from("areas").select("id, codigo, nombre")

      if (areasError) {
        console.error("Error cargando áreas:", areasError)
        throw areasError
      }

      // Mapear áreas de la base de datos
      const areasMap = new Map()
      areasData?.forEach((area) => {
        // Usar colores predeterminados o un color por defecto
        const areaCode = area.codigo || ""
        areasMap.set(area.id, {
          id: area.id,
          name: area.nombre,
          code: area.codigo,
          color: defaultAreaColors[areaCode] || "gray",
        })
      })

      // Obtener todos los planes de acción con validaciones
      const { data: planesData, error: planesError } = await supabase
        .from("plan_accion")
        .select(`
    id, 
    area_id,
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
    meta_docenal,
    macroobjetivo_docenal,
    objetivo_docenal,
    created_at,
    updated_at
  `)
        .order("created_at", { ascending: false })

      if (planesError) {
        console.error("Error cargando datos de plan de acción:", planesError)
        throw planesError
      }

      // Obtener validaciones para todos los planes
      const { data: validacionesData, error: validacionesError } = await supabase
        .from("plan_validaciones")
        .select("*")

      if (validacionesError) {
        console.error("Error cargando validaciones:", validacionesError)
        // No lanzamos error aquí, las validaciones son opcionales
      }

      // Crear un mapa de validaciones por plan_id
      const validacionesMap = new Map()
      validacionesData?.forEach((validacion) => {
        validacionesMap.set(validacion.plan_id, validacion)
      })

      console.log(`Encontrados ${planesData?.length || 0} planes de acción en total`)

      // Transformar los datos para la matriz
      const combinedData: MatrizSeguimientoItem[] = []

      planesData?.forEach((plan) => {
        const areaId = plan.area_id
        const areaInfo = areasMap.get(areaId) || {
          id: areaId,
          name: "Área Desconocida",
          code: "UNKNOWN",
          color: "gray",
        }

        const validacion = validacionesMap.get(plan.id)

        combinedData.push({
          id: plan.id,
          area: areaInfo.name,
          areaId: areaInfo.id,
          color: areaInfo.color,
          programa: plan.programa || "",
          objetivo: plan.objetivo || "",
          meta: plan.meta || "",
          presupuesto: plan.presupuesto || "",
          acciones: plan.acciones || "",
          indicadores: plan.indicadores || "",
          avance: plan.porcentaje_avance || 0,
          fechaInicio: formatDate(plan.fecha_inicio),
          fechaFin: formatDate(plan.fecha_fin),
          responsable: plan.responsable || "",
          estado: plan.estado || "Pendiente",
          prioridad: plan.prioridad || "Media",
          descripcion: plan.comentarios || plan.acciones || "",
          validacion: validacion || undefined,
          // Mapear campos del Plan Decenal desde la base de datos
          metaDecenal: plan.meta_docenal || "",
          macroobjetivoDecenal: plan.macroobjetivo_docenal || "",
          objetivoDecenal: plan.objetivo_docenal || "",
        })
      })

      setData(combinedData)
      console.log("Datos de matriz de seguimiento cargados correctamente")
    } catch (error) {
      console.error("Error loading matriz de seguimiento data:", error)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Luego en el useEffect solo llamar a loadData
  useEffect(() => {
    loadData()

    // Suscribirse a cambios en la tabla plan_accion
    const subscription = supabase
      .channel("plan_accion_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "plan_accion" }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [loadData, supabase])

  const updatePlanEstado = useCallback(async (planId: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from("plan_accion")
        .update({ estado: nuevoEstado })
        .eq("id", planId)

      if (error) {
        console.error("Error actualizando estado del plan:", error)
        throw error
      }

      // Recargar los datos después de la actualización
      await loadData()
    } catch (error) {
      console.error("Error updating plan estado:", error)
      throw error
    }
  }, [supabase, loadData])

  return {
    data,
    isLoading,
    isError: false, // Agregar este valor
    error: null, // Agregar este valor
    refetch: loadData, // Agregar esta función
    updatePlanEstado, // Nueva función para actualizar estado
  }
}
