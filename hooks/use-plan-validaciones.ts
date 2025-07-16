"use client"

import { useCallback, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase-types"
import { useAuth } from "@/context"
import { useToast } from "@/hooks/use-toast"

export type EstadoValidacion = "pendiente" | "aprobado" | "rechazado" | "en_revision"

export interface PlanValidacion {
  id: string
  plan_id: string
  estado_validacion: EstadoValidacion
  comentarios: string | null
  validado_por: string | null
  fecha_validacion: string | null
  created_at: string
  updated_at: string
}

interface UseValidacionesProps {
  refetchMatriz?: () => void
}

export function useValidaciones({ refetchMatriz }: UseValidacionesProps = {}) {
  const [validaciones, setValidaciones] = useState<PlanValidacion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  // Verificar si el usuario es admin
  const isAdmin = user?.role === "admin"

  const fetchValidaciones = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("plan_validaciones")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setValidaciones(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar validaciones"
      setError(errorMessage)
      console.error("Error fetching validaciones:", err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  const getValidacionByPlanId = useCallback(
    (planId: string): PlanValidacion | undefined => {
      return validaciones.find((v) => v.plan_id === planId)
    },
    [validaciones]
  )

  const validarPlan = useCallback(
    async (planId: string, estado: EstadoValidacion, comentarios?: string) => {
      if (!user || !isAdmin) {
        toast({
          title: "Acceso denegado",
          description: "Solo los administradores pueden validar planes",
          variant: "destructive",
        })
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Buscar si ya existe una validación para este plan
        const existingValidacion = getValidacionByPlanId(planId)

        if (existingValidacion) {
          // Actualizar validación existente
          const { error } = await supabase
            .from("plan_validaciones")
            .update({
              estado_validacion: estado,
              comentarios: comentarios || null,
              validado_por: user.id,
              fecha_validacion: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingValidacion.id)

          if (error) throw error
        } else {
          // Crear nueva validación
          const { error } = await supabase
            .from("plan_validaciones")
            .insert({
              plan_id: planId,
              estado_validacion: estado,
              comentarios: comentarios || null,
              validado_por: user.id,
              fecha_validacion: new Date().toISOString(),
            })

          if (error) throw error
        }

        // Actualizar el estado local
        await fetchValidaciones()
        
        // Refrescar la matriz si se proporciona la función
        if (refetchMatriz) {
          await refetchMatriz()
        }

        toast({
          title: "Validación actualizada",
          description: `Plan ${estado === "aprobado" ? "aprobado" : estado === "rechazado" ? "rechazado" : "puesto en " + estado}`,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al validar plan"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error("Error validating plan:", err)
      } finally {
        setLoading(false)
      }
    },
    [user, isAdmin, supabase, getValidacionByPlanId, fetchValidaciones, refetchMatriz, toast]
  )

  const aprobarPlan = useCallback(
    (planId: string, comentarios?: string) => {
      return validarPlan(planId, "aprobado", comentarios)
    },
    [validarPlan]
  )

  const rechazarPlan = useCallback(
    (planId: string, comentarios?: string) => {
      return validarPlan(planId, "rechazado", comentarios)
    },
    [validarPlan]
  )

  const ponerEnRevision = useCallback(
    (planId: string, comentarios?: string) => {
      return validarPlan(planId, "en_revision", comentarios)
    },
    [validarPlan]
  )

  // Obtener estadísticas de validaciones
  const getEstadisticas = useCallback(() => {
    const stats = {
      total: validaciones.length,
      aprobados: validaciones.filter((v) => v.estado_validacion === "aprobado").length,
      rechazados: validaciones.filter((v) => v.estado_validacion === "rechazado").length,
      en_revision: validaciones.filter((v) => v.estado_validacion === "en_revision").length,
      pendientes: validaciones.filter((v) => v.estado_validacion === "pendiente").length,
    }

    return stats
  }, [validaciones])

  useEffect(() => {
    fetchValidaciones()
  }, [fetchValidaciones])

  return {
    validaciones,
    loading,
    error,
    isAdmin,
    getValidacionByPlanId,
    validarPlan,
    aprobarPlan,
    rechazarPlan,
    ponerEnRevision,
    getEstadisticas,
    refetch: fetchValidaciones,
  }
}
