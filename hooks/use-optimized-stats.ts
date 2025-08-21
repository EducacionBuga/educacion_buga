/**
 * Hook optimizado para estadísticas de planes de acción
 * Utiliza consultas específicas y cache para mejorar el rendimiento
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { queryStats, STATS_FIELDS } from '@/lib/optimized-queries'
import { toast } from '@/hooks/use-toast'

export interface PlanAccionStats {
  total: number
  completados: number
  enProceso: number
  pendientes: number
  retrasados: number
  presupuestoTotal: number
  avancePromedio: number
}

export interface StatsItem {
  id: string
  estado: string
  porcentaje_avance: number
  presupuesto: string
}

export function useOptimizedStats(areaId: string | null) {
  const [rawData, setRawData] = useState<StatsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Cargar estadísticas optimizadas
  const loadStats = useCallback(async () => {
    if (!areaId) {
      setRawData([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('📊 Cargando estadísticas optimizadas para área:', areaId)
      const data = await queryStats(areaId)
      
      setRawData(data)
      setLastUpdated(new Date())
      
      console.log('✅ Estadísticas cargadas:', data.length, 'registros')
    } catch (err: any) {
      console.error('❌ Error cargando estadísticas:', err)
      setError(err instanceof Error ? err : new Error(err.message || 'Error desconocido'))
      
      toast({
        title: "Error al cargar estadísticas",
        description: "No se pudieron cargar las estadísticas. Los datos mostrados pueden estar desactualizados.",
        variant: "default"
      })
    } finally {
      setIsLoading(false)
    }
  }, [areaId])

  // Cargar datos al montar y cuando cambie el área
  useEffect(() => {
    loadStats()
  }, [loadStats])

  // Calcular estadísticas de forma memoizada
  const stats = useMemo<PlanAccionStats>(() => {
    if (!rawData || rawData.length === 0) {
      return {
        total: 0,
        completados: 0,
        enProceso: 0,
        pendientes: 0,
        retrasados: 0,
        presupuestoTotal: 0,
        avancePromedio: 0
      }
    }

    // Contadores por estado
    const completados = rawData.filter(item => 
      item.estado?.toLowerCase() === 'completado'
    ).length
    
    const enProceso = rawData.filter(item => 
      item.estado?.toLowerCase() === 'en progreso' || 
      item.estado?.toLowerCase() === 'en proceso'
    ).length
    
    const pendientes = rawData.filter(item => 
      item.estado?.toLowerCase() === 'pendiente' || 
      item.estado?.toLowerCase() === 'sin iniciar'
    ).length
    
    const retrasados = rawData.filter(item => 
      item.estado?.toLowerCase() === 'retrasado'
    ).length

    // Cálculo de presupuesto total
    const presupuestoTotal = rawData.reduce((sum, item) => {
      const presupuesto = parseFloat(
        item.presupuesto?.replace(/[^\d]/g, '') || '0'
      )
      return sum + presupuesto
    }, 0)

    // Cálculo de avance promedio
    const avancePromedio = rawData.length > 0 
      ? Math.round(
          rawData.reduce((sum, item) => sum + (item.porcentaje_avance || 0), 0) / rawData.length
        )
      : 0

    return {
      total: rawData.length,
      completados,
      enProceso,
      pendientes,
      retrasados,
      presupuestoTotal,
      avancePromedio
    }
  }, [rawData])

  // Función para refrescar estadísticas manualmente
  const refresh = useCallback(() => {
    loadStats()
  }, [loadStats])

  // Función para obtener estadísticas por estado
  const getStatsByStatus = useCallback((status: string) => {
    return rawData.filter(item => 
      item.estado?.toLowerCase() === status.toLowerCase()
    )
  }, [rawData])

  // Función para obtener distribución de avance
  const getProgressDistribution = useCallback(() => {
    const distribution = {
      '0-25': 0,
      '26-50': 0,
      '51-75': 0,
      '76-100': 0
    }

    rawData.forEach(item => {
      const progress = item.porcentaje_avance || 0
      if (progress <= 25) distribution['0-25']++
      else if (progress <= 50) distribution['26-50']++
      else if (progress <= 75) distribution['51-75']++
      else distribution['76-100']++
    })

    return distribution
  }, [rawData])

  return {
    stats,
    rawData,
    isLoading,
    error,
    lastUpdated,
    refresh,
    getStatsByStatus,
    getProgressDistribution
  }
}

/**
 * Hook para estadísticas globales (todas las áreas)
 */
export function useGlobalStats() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [globalStats, setGlobalStats] = useState<Record<string, PlanAccionStats>>({})

  const loadGlobalStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Aquí podrías implementar una consulta que obtenga estadísticas
      // de todas las áreas de una vez, o cargar área por área
      // Por ahora, dejamos la implementación básica
      
      console.log('📊 Cargando estadísticas globales...')
      
      // Implementación pendiente según necesidades específicas
      setGlobalStats({})
      
    } catch (err: any) {
      console.error('❌ Error cargando estadísticas globales:', err)
      setError(err instanceof Error ? err : new Error(err.message || 'Error desconocido'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGlobalStats()
  }, [loadGlobalStats])

  return {
    globalStats,
    isLoading,
    error,
    refresh: loadGlobalStats
  }
}