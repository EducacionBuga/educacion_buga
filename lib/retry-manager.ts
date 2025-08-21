/**
 * Sistema de retry robusto para consultas a la base de datos
 * Maneja reintentos automáticos con backoff exponencial
 */

export interface RetryOptions {
  /** Número máximo de intentos */
  maxAttempts?: number
  /** Delay inicial en milisegundos */
  initialDelay?: number
  /** Factor de multiplicación para el backoff exponencial */
  backoffFactor?: number
  /** Delay máximo en milisegundos */
  maxDelay?: number
  /** Función para determinar si un error es reintentable */
  shouldRetry?: (error: any) => boolean
  /** Callback para notificar intentos */
  onRetry?: (attempt: number, error: any) => void
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalTime: number
}

/**
 * Errores que típicamente son reintentables
 */
const RETRYABLE_ERROR_CODES = [
  'PGRST301', // Connection timeout
  'PGRST302', // Connection failed
  'ECONNRESET',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EAI_AGAIN',
  '503', // Service unavailable
  '502', // Bad gateway
  '504', // Gateway timeout
  '429', // Too many requests
]

/**
 * Determina si un error es reintentable por defecto
 */
function isRetryableError(error: any): boolean {
  if (!error) return false
  
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code || error.status || ''
  
  // Verificar códigos de error específicos
  if (RETRYABLE_ERROR_CODES.some(code => 
    errorCode.toString().includes(code) || errorMessage.includes(code.toLowerCase())
  )) {
    return true
  }
  
  // Verificar mensajes de error comunes
  const retryableMessages = [
    'network error',
    'connection timeout',
    'connection failed',
    'connection reset',
    'timeout',
    'temporary failure',
    'service unavailable',
    'rate limit',
    'too many requests'
  ]
  
  return retryableMessages.some(msg => errorMessage.includes(msg))
}

/**
 * Ejecuta una función con retry automático
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffFactor = 2,
    maxDelay = 10000,
    shouldRetry = isRetryableError,
    onRetry
  } = options

  const startTime = Date.now()
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await operation()
      return {
        success: true,
        data,
        attempts: attempt,
        totalTime: Date.now() - startTime
      }
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Si es el último intento o el error no es reintentable, fallar
      if (attempt === maxAttempts || !shouldRetry(error)) {
        break
      }
      
      // Notificar el intento
      if (onRetry) {
        onRetry(attempt, error)
      }
      
      // Calcular delay con backoff exponencial
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      )
      
      // Agregar jitter aleatorio para evitar thundering herd
      const jitter = Math.random() * 0.1 * delay
      const finalDelay = delay + jitter
      
      console.log(`Reintentando operación en ${Math.round(finalDelay)}ms (intento ${attempt}/${maxAttempts})`, error)
      
      await new Promise(resolve => setTimeout(resolve, finalDelay))
    }
  }
  
  return {
    success: false,
    error: lastError || new Error('Operación falló después de múltiples intentos'),
    attempts: maxAttempts,
    totalTime: Date.now() - startTime
  }
}

/**
 * Hook personalizado para usar retry en componentes React
 */
export function useRetryOperation() {
  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> => {
    const result = await withRetry(operation, options)
    
    if (!result.success) {
      throw result.error || new Error('Operación falló')
    }
    
    return result.data as T
  }
  
  return { executeWithRetry }
}

/**
 * Configuraciones predefinidas para diferentes tipos de operaciones
 */
export const RETRY_CONFIGS = {
  /** Para consultas de lectura rápidas */
  FAST_READ: {
    maxAttempts: 3,
    initialDelay: 500,
    backoffFactor: 1.5,
    maxDelay: 3000
  } as RetryOptions,
  
  /** Para consultas de lectura lentas */
  SLOW_READ: {
    maxAttempts: 5,
    initialDelay: 1000,
    backoffFactor: 2,
    maxDelay: 8000
  } as RetryOptions,
  
  /** Para operaciones de escritura */
  WRITE: {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    maxDelay: 5000
  } as RetryOptions,
  
  /** Para operaciones críticas */
  CRITICAL: {
    maxAttempts: 5,
    initialDelay: 2000,
    backoffFactor: 2,
    maxDelay: 15000
  } as RetryOptions
}