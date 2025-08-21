/**
 * Servicio de consultas optimizadas para mejorar el rendimiento de la base de datos
 */

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { withRetry, RETRY_CONFIGS } from "./retry-manager"

export interface QueryOptions {
  /** Campos específicos a seleccionar */
  fields?: string[]
  /** Límite de resultados */
  limit?: number
  /** Offset para paginación */
  offset?: number
  /** Ordenamiento */
  orderBy?: { column: string; ascending?: boolean }
  /** Filtros adicionales */
  filters?: Record<string, any>
  /** Usar cache si está disponible */
  useCache?: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  hasMore: boolean
  page: number
  pageSize: number
}

/**
 * Campos básicos para consultas rápidas (solo datos esenciales)
 */
export const BASIC_FIELDS = [
  'id',
  'programa',
  'objetivo',
  'estado',
  'porcentaje_avance',
  'responsable',
  'fecha_inicio',
  'fecha_fin'
]

/**
 * Campos completos para consultas detalladas
 */
export const FULL_FIELDS = [
  'id',
  'programa',
  'objetivo',
  'meta',
  'presupuesto',
  'acciones',
  'indicadores',
  'porcentaje_avance',
  'fecha_inicio',
  'fecha_fin',
  'responsable',
  'estado',
  'prioridad',
  'comentarios',
  'meta_docenal',
  'macroobjetivo_docenal',
  'objetivo_docenal',
  'programa_pdm',
  'subprograma_pdm',
  'proyecto_pdm',
  'grupo_etareo',
  'grupo_poblacion',
  'zona',
  'grupo_etnico',
  'cantidad',
  'created_at',
  'updated_at'
]

/**
 * Campos para estadísticas (solo lo necesario para cálculos)
 */
export const STATS_FIELDS = [
  'id',
  'estado',
  'porcentaje_avance',
  'presupuesto'
]

class OptimizedQueryService {
  private supabase = createClientComponentClient()
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  /**
   * Genera una clave de cache basada en los parámetros de la consulta
   */
  private getCacheKey(table: string, options: QueryOptions): string {
    return `${table}_${JSON.stringify(options)}`
  }

  /**
   * Obtiene datos del cache si están disponibles y no han expirado
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  /**
   * Guarda datos en el cache
   */
  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Limpia el cache
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * Limpia el cache para una tabla específica
   */
  public clearTableCache(table: string): void {
    for (const [key] of this.cache) {
      if (key.startsWith(table)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Consulta optimizada para planes de acción
   */
  async queryPlanAccion(areaId: string, options: QueryOptions = {}): Promise<any[]> {
    const {
      fields = FULL_FIELDS,
      limit,
      offset,
      orderBy = { column: 'created_at', ascending: false },
      filters = {},
      useCache = true
    } = options

    const cacheKey = this.getCacheKey('plan_accion', { areaId, ...options })
    
    // Intentar obtener del cache primero
    if (useCache) {
      const cached = this.getFromCache<any[]>(cacheKey)
      if (cached) {
        console.log('📦 Datos obtenidos del cache:', cacheKey)
        return cached
      }
    }

    const result = await withRetry(
      async () => {
        let query = this.supabase
          .from('plan_accion')
          .select(fields.join(', '))
          .eq('area_id', areaId)

        // Aplicar filtros adicionales
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value)
          }
        })

        // Aplicar ordenamiento
        query = query.order(orderBy.column, { ascending: orderBy.ascending })

        // Aplicar límite y offset
        if (limit) {
          query = query.limit(limit)
        }
        if (offset) {
          query = query.range(offset, offset + (limit || 1000) - 1)
        }

        const { data, error } = await query
        
        if (error) throw error
        return data || []
      },
      RETRY_CONFIGS.SLOW_READ
    )

    if (!result.success) {
      throw result.error || new Error('Error en consulta optimizada')
    }

    // Guardar en cache
    if (useCache) {
      this.setCache(cacheKey, result.data)
    }

    console.log(`🚀 Consulta optimizada completada: ${result.data.length} registros`)
    return result.data
  }

  /**
   * Consulta paginada optimizada
   */
  async queryPaginated<T>(
    table: string,
    page: number = 1,
    pageSize: number = 20,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      fields = ['*'],
      orderBy = { column: 'created_at', ascending: false },
      filters = {},
      useCache = true
    } = options

    const offset = (page - 1) * pageSize
    const cacheKey = this.getCacheKey(`${table}_paginated`, { page, pageSize, ...options })

    // Intentar obtener del cache
    if (useCache) {
      const cached = this.getFromCache<PaginatedResult<T>>(cacheKey)
      if (cached) {
        console.log('📦 Datos paginados obtenidos del cache:', cacheKey)
        return cached
      }
    }

    const result = await withRetry(
      async () => {
        // Consulta para obtener el conteo total
        let countQuery = this.supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        // Consulta para obtener los datos
        let dataQuery = this.supabase
          .from(table)
          .select(fields.join(', '))

        // Aplicar filtros a ambas consultas
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            countQuery = countQuery.eq(key, value)
            dataQuery = dataQuery.eq(key, value)
          }
        })

        // Aplicar ordenamiento y paginación a la consulta de datos
        dataQuery = dataQuery
          .order(orderBy.column, { ascending: orderBy.ascending })
          .range(offset, offset + pageSize - 1)

        // Ejecutar ambas consultas en paralelo
        const [countResult, dataResult] = await Promise.all([
          countQuery,
          dataQuery
        ])

        if (countResult.error) throw countResult.error
        if (dataResult.error) throw dataResult.error

        const totalCount = countResult.count || 0
        const data = dataResult.data || []

        return {
          data,
          count: totalCount,
          hasMore: offset + pageSize < totalCount,
          page,
          pageSize
        }
      },
      RETRY_CONFIGS.SLOW_READ
    )

    if (!result.success) {
      throw result.error || new Error('Error en consulta paginada')
    }

    // Guardar en cache
    if (useCache) {
      this.setCache(cacheKey, result.data, this.CACHE_TTL / 2) // Cache más corto para datos paginados
    }

    console.log(`📄 Consulta paginada completada: página ${page}, ${result.data.data.length}/${result.data.count} registros`)
    return result.data
  }

  /**
   * Consulta optimizada solo para estadísticas
   */
  async queryStats(areaId: string): Promise<any[]> {
    const cacheKey = this.getCacheKey('plan_accion_stats', { areaId })
    
    // Cache más largo para estadísticas (10 minutos)
    const cached = this.getFromCache<any[]>(cacheKey)
    if (cached) {
      console.log('📊 Estadísticas obtenidas del cache')
      return cached
    }

    const result = await withRetry(
      async () => {
        const { data, error } = await this.supabase
          .from('plan_accion')
          .select(STATS_FIELDS.join(', '))
          .eq('area_id', areaId)

        if (error) throw error
        return data || []
      },
      RETRY_CONFIGS.FAST_READ
    )

    if (!result.success) {
      throw result.error || new Error('Error cargando estadísticas')
    }

    // Cache más largo para estadísticas
    this.setCache(cacheKey, result.data, 10 * 60 * 1000)
    
    console.log('📊 Estadísticas cargadas:', result.data.length, 'registros')
    return result.data
  }

  /**
   * Búsqueda optimizada con texto completo
   */
  async searchPlanAccion(areaId: string, searchTerm: string, options: QueryOptions = {}): Promise<any[]> {
    const {
      fields = BASIC_FIELDS,
      limit = 50
    } = options

    if (!searchTerm.trim()) {
      return this.queryPlanAccion(areaId, { fields, limit })
    }

    const result = await withRetry(
      async () => {
        const { data, error } = await this.supabase
          .from('plan_accion')
          .select(fields.join(', '))
          .eq('area_id', areaId)
          .or(`programa.ilike.%${searchTerm}%,objetivo.ilike.%${searchTerm}%,responsable.ilike.%${searchTerm}%`)
          .limit(limit)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      },
      RETRY_CONFIGS.FAST_READ
    )

    if (!result.success) {
      throw result.error || new Error('Error en búsqueda')
    }

    console.log(`🔍 Búsqueda completada: "${searchTerm}" - ${result.data.length} resultados`)
    return result.data
  }
}

// Instancia singleton del servicio
export const optimizedQueryService = new OptimizedQueryService()

// Funciones de conveniencia
export const queryPlanAccion = (areaId: string, options?: QueryOptions) => 
  optimizedQueryService.queryPlanAccion(areaId, options)

export const queryPaginated = <T>(table: string, page: number, pageSize: number, options?: QueryOptions) => 
  optimizedQueryService.queryPaginated<T>(table, page, pageSize, options)

export const queryStats = (areaId: string) => 
  optimizedQueryService.queryStats(areaId)

export const searchPlanAccion = (areaId: string, searchTerm: string, options?: QueryOptions) => 
  optimizedQueryService.searchPlanAccion(areaId, searchTerm, options)

export const clearCache = () => 
  optimizedQueryService.clearCache()

export const clearTableCache = (table: string) => 
  optimizedQueryService.clearTableCache(table)