/**
 * Hook para manejo de paginación con optimizaciones de rendimiento
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { queryPaginated } from '@/lib/optimized-queries'
import { handleError } from '@/lib/error-handler'
import { toast } from '@/hooks/use-toast'

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginationOptions {
  /** Tamaño de página inicial */
  initialPageSize?: number
  /** Página inicial */
  initialPage?: number
  /** Opciones de tamaño de página */
  pageSizeOptions?: number[]
  /** Usar cache para las páginas */
  useCache?: boolean
  /** Prefetch de páginas adyacentes */
  prefetchAdjacent?: boolean
}

export interface UsePaginationResult<T> {
  /** Datos de la página actual */
  data: T[]
  /** Estado de paginación */
  pagination: PaginationState
  /** Si está cargando */
  isLoading: boolean
  /** Error si existe */
  error: Error | null
  /** Cambiar a una página específica */
  goToPage: (page: number) => void
  /** Ir a la página siguiente */
  nextPage: () => void
  /** Ir a la página anterior */
  previousPage: () => void
  /** Cambiar el tamaño de página */
  setPageSize: (size: number) => void
  /** Refrescar la página actual */
  refresh: () => void
  /** Ir a la primera página */
  goToFirstPage: () => void
  /** Ir a la última página */
  goToLastPage: () => void
}

/**
 * Hook principal para paginación
 */
export function usePagination<T>(
  table: string,
  queryOptions: any = {},
  options: PaginationOptions = {}
): UsePaginationResult<T> {
  const {
    initialPageSize = 20,
    initialPage = 1,
    useCache = true,
    prefetchAdjacent = true
  } = options

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(0)
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Cache de páginas
  const [pageCache] = useState(new Map<string, { data: T[]; timestamp: number }>())
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  // Calcular estado de paginación
  const pagination = useMemo<PaginationState>(() => {
    const totalPages = Math.ceil(totalItems / pageSize)
    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    }
  }, [currentPage, pageSize, totalItems])

  // Generar clave de cache
  const getCacheKey = useCallback((page: number, size: number) => {
    return `${table}_${page}_${size}_${JSON.stringify(queryOptions)}`
  }, [table, queryOptions])

  // Obtener datos del cache
  const getFromCache = useCallback((page: number, size: number): T[] | null => {
    if (!useCache) return null
    
    const key = getCacheKey(page, size)
    const cached = pageCache.get(key)
    
    if (!cached) return null
    
    // Verificar si el cache ha expirado
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      pageCache.delete(key)
      return null
    }
    
    return cached.data
  }, [useCache, getCacheKey, pageCache])

  // Guardar en cache
  const setCache = useCallback((page: number, size: number, data: T[]) => {
    if (!useCache) return
    
    const key = getCacheKey(page, size)
    pageCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }, [useCache, getCacheKey, pageCache])

  // Cargar datos de una página
  const loadPage = useCallback(async (page: number, size: number, showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true)
        setError(null)
      }

      // Intentar obtener del cache primero
      const cachedData = getFromCache(page, size)
      if (cachedData) {
        console.log(`📦 Página ${page} obtenida del cache`)
        if (showLoading) {
          setData(cachedData)
          setIsLoading(false)
        }
        return cachedData
      }

      console.log(`🔄 Cargando página ${page} (tamaño: ${size})`)
      
      const result = await queryPaginated<T>(table, page, size, {
        ...queryOptions,
        useCache: false // Ya manejamos el cache aquí
      })

      // Actualizar estado solo si es la página actual
      if (showLoading) {
        setData(result.data)
        setTotalItems(result.count)
        setCurrentPage(page)
        setPageSizeState(size)
      }

      // Guardar en cache
      setCache(page, size, result.data)

      console.log(`✅ Página ${page} cargada: ${result.data.length} elementos`)
      return result.data
    } catch (err: any) {
      console.error(`❌ Error cargando página ${page}:`, err)
      
      if (showLoading) {
        const userFriendlyError = handleError(err, {
          operation: `Cargar página ${page}`,
          module: 'Paginación',
          metadata: { table, page, pageSize: size }
        })
        
        setError(new Error(userFriendlyError.description))
      }
      
      throw err
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }, [table, queryOptions, getFromCache, setCache])

  // Prefetch de páginas adyacentes
  const prefetchAdjacentPages = useCallback(async (page: number, size: number) => {
    if (!prefetchAdjacent) return

    const totalPages = Math.ceil(totalItems / size)
    const pagesToPrefetch = []

    // Página anterior
    if (page > 1) {
      pagesToPrefetch.push(page - 1)
    }

    // Página siguiente
    if (page < totalPages) {
      pagesToPrefetch.push(page + 1)
    }

    // Prefetch en paralelo sin mostrar loading
    Promise.all(
      pagesToPrefetch.map(p => 
        loadPage(p, size, false).catch(() => {
          // Ignorar errores en prefetch
        })
      )
    )
  }, [prefetchAdjacent, totalItems, loadPage])

  // Cargar página inicial
  useEffect(() => {
    loadPage(currentPage, pageSize)
  }, []) // Solo al montar

  // Prefetch cuando cambie la página actual
  useEffect(() => {
    if (totalItems > 0) {
      prefetchAdjacentPages(currentPage, pageSize)
    }
  }, [currentPage, pageSize, totalItems, prefetchAdjacentPages])

  // Funciones de navegación
  const goToPage = useCallback((page: number) => {
    const totalPages = Math.ceil(totalItems / pageSize)
    const validPage = Math.max(1, Math.min(page, totalPages))
    
    if (validPage !== currentPage) {
      loadPage(validPage, pageSize)
    }
  }, [currentPage, pageSize, totalItems, loadPage])

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      goToPage(currentPage + 1)
    }
  }, [pagination.hasNextPage, currentPage, goToPage])

  const previousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      goToPage(currentPage - 1)
    }
  }, [pagination.hasPreviousPage, currentPage, goToPage])

  const setPageSize = useCallback((size: number) => {
    // Calcular la página equivalente con el nuevo tamaño
    const currentFirstItem = (currentPage - 1) * pageSize + 1
    const newPage = Math.ceil(currentFirstItem / size)
    
    setPageSizeState(size)
    loadPage(newPage, size)
  }, [currentPage, pageSize, loadPage])

  const refresh = useCallback(() => {
    // Limpiar cache para forzar recarga
    const key = getCacheKey(currentPage, pageSize)
    pageCache.delete(key)
    
    loadPage(currentPage, pageSize)
  }, [currentPage, pageSize, loadPage, getCacheKey, pageCache])

  const goToFirstPage = useCallback(() => {
    goToPage(1)
  }, [goToPage])

  const goToLastPage = useCallback(() => {
    const totalPages = Math.ceil(totalItems / pageSize)
    goToPage(totalPages)
  }, [totalItems, pageSize, goToPage])

  return {
    data,
    pagination,
    isLoading,
    error,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    refresh,
    goToFirstPage,
    goToLastPage
  }
}

/**
 * Hook simplificado para paginación básica
 */
export function useSimplePagination<T>(
  table: string,
  queryOptions: any = {},
  pageSize: number = 20
) {
  return usePagination<T>(table, queryOptions, {
    initialPageSize: pageSize,
    prefetchAdjacent: false
  })
}