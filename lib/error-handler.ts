/**
 * Sistema robusto de manejo de errores con mensajes específicos para el usuario
 */

import { toast } from '@/hooks/use-toast'

export interface ErrorContext {
  /** Operación que se estaba realizando */
  operation: string
  /** Área o módulo donde ocurrió el error */
  module?: string
  /** ID del usuario (para logging) */
  userId?: string
  /** Datos adicionales del contexto */
  metadata?: Record<string, any>
}

export interface UserFriendlyError {
  /** Título del error para mostrar al usuario */
  title: string
  /** Descripción detallada del error */
  description: string
  /** Sugerencias para resolver el problema */
  suggestions: string[]
  /** Nivel de severidad */
  severity: 'low' | 'medium' | 'high' | 'critical'
  /** Si se puede reintentar automáticamente */
  canRetry: boolean
  /** Tiempo sugerido antes de reintentar (en ms) */
  retryDelay?: number
}

/**
 * Tipos de errores conocidos y sus patrones
 */
const ERROR_PATTERNS = {
  // Errores de conexión
  CONNECTION: {
    patterns: ['network', 'connection', 'timeout', 'econnreset', 'enotfound', 'econnrefused'],
    handler: (error: any, context: ErrorContext): UserFriendlyError => ({
      title: 'Error de conexión',
      description: 'No se pudo establecer conexión con el servidor',
      suggestions: [
        'Verifica tu conexión a internet',
        'Intenta recargar la página',
        'Si el problema persiste, contacta al administrador del sistema'
      ],
      severity: 'high',
      canRetry: true,
      retryDelay: 3000
    })
  },

  // Errores de autenticación
  AUTH: {
    patterns: ['auth', 'unauthorized', '401', 'forbidden', '403', 'token', 'session'],
    handler: (error: any, context: ErrorContext): UserFriendlyError => ({
      title: 'Error de autenticación',
      description: 'Tu sesión ha expirado o no tienes permisos suficientes',
      suggestions: [
        'Cierra sesión e inicia sesión nuevamente',
        'Verifica que tengas los permisos necesarios',
        'Contacta al administrador si el problema persiste'
      ],
      severity: 'high',
      canRetry: false
    })
  },

  // Errores de validación
  VALIDATION: {
    patterns: ['validation', 'invalid', 'required', 'format', 'constraint'],
    handler: (error: any, context: ErrorContext): UserFriendlyError => ({
      title: 'Error de validación',
      description: 'Los datos ingresados no son válidos',
      suggestions: [
        'Revisa que todos los campos requeridos estén completos',
        'Verifica el formato de fechas y números',
        'Asegúrate de que los datos cumplan con los requisitos'
      ],
      severity: 'medium',
      canRetry: false
    })
  },

  // Errores de servidor
  SERVER: {
    patterns: ['500', '502', '503', '504', 'internal server', 'service unavailable'],
    handler: (error: any, context: ErrorContext): UserFriendlyError => ({
      title: 'Error del servidor',
      description: 'El servidor está experimentando problemas temporales',
      suggestions: [
        'Intenta nuevamente en unos minutos',
        'El problema es temporal y se resolverá pronto',
        'Si es urgente, contacta al soporte técnico'
      ],
      severity: 'high',
      canRetry: true,
      retryDelay: 5000
    })
  },

  // Errores de base de datos
  DATABASE: {
    patterns: ['database', 'sql', 'query', 'constraint', 'foreign key', 'unique'],
    handler: (error: any, context: ErrorContext): UserFriendlyError => ({
      title: 'Error de base de datos',
      description: 'Ocurrió un problema al procesar los datos',
      suggestions: [
        'Verifica que los datos no estén duplicados',
        'Asegúrate de que las referencias sean válidas',
        'Intenta nuevamente o contacta al administrador'
      ],
      severity: 'medium',
      canRetry: true,
      retryDelay: 2000
    })
  },

  // Errores de límite de tasa
  RATE_LIMIT: {
    patterns: ['rate limit', '429', 'too many requests'],
    handler: (error: any, context: ErrorContext): UserFriendlyError => ({
      title: 'Demasiadas solicitudes',
      description: 'Has realizado demasiadas operaciones muy rápido',
      suggestions: [
        'Espera unos segundos antes de intentar nuevamente',
        'Reduce la frecuencia de tus acciones',
        'El límite se restablecerá automáticamente'
      ],
      severity: 'medium',
      canRetry: true,
      retryDelay: 10000
    })
  },

  // Errores de permisos
  PERMISSIONS: {
    patterns: ['permission', 'access denied', 'not allowed', 'insufficient'],
    handler: (error: any, context: ErrorContext): UserFriendlyError => ({
      title: 'Permisos insuficientes',
      description: 'No tienes permisos para realizar esta acción',
      suggestions: [
        'Contacta al administrador para solicitar permisos',
        'Verifica que estés en el rol correcto',
        'Algunos datos pueden estar restringidos'
      ],
      severity: 'medium',
      canRetry: false
    })
  }
}

/**
 * Analiza un error y determina su tipo
 */
function analyzeError(error: any): keyof typeof ERROR_PATTERNS | null {
  const errorMessage = (error?.message || error?.toString() || '').toLowerCase()
  const errorCode = (error?.code || error?.status || '').toString().toLowerCase()
  const fullErrorText = `${errorMessage} ${errorCode}`

  for (const [type, config] of Object.entries(ERROR_PATTERNS)) {
    if (config.patterns.some(pattern => fullErrorText.includes(pattern))) {
      return type as keyof typeof ERROR_PATTERNS
    }
  }

  return null
}

/**
 * Convierte un error técnico en un mensaje amigable para el usuario
 */
export function createUserFriendlyError(
  error: any, 
  context: ErrorContext
): UserFriendlyError {
  const errorType = analyzeError(error)
  
  if (errorType && ERROR_PATTERNS[errorType]) {
    return ERROR_PATTERNS[errorType].handler(error, context)
  }

  // Error genérico como fallback
  return {
    title: 'Error inesperado',
    description: 'Ocurrió un error inesperado al procesar tu solicitud',
    suggestions: [
      'Intenta recargar la página',
      'Verifica tu conexión a internet',
      'Si el problema persiste, contacta al soporte técnico'
    ],
    severity: 'medium',
    canRetry: true,
    retryDelay: 3000
  }
}

/**
 * Registra un error para análisis posterior
 */
export function logError(
  error: any, 
  context: ErrorContext, 
  userFriendlyError: UserFriendlyError
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      code: error?.code,
      status: error?.status
    },
    context,
    userFriendlyError,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  }

  // Log en consola para desarrollo
  console.group('🚨 Error Logged')
  console.error('Original Error:', error)
  console.log('Context:', context)
  console.log('User Friendly:', userFriendlyError)
  console.log('Full Log Entry:', logEntry)
  console.groupEnd()

  // Aquí podrías enviar el log a un servicio externo como Sentry, LogRocket, etc.
  // sendToLoggingService(logEntry)
}

/**
 * Maneja un error de forma completa: análisis, logging y notificación al usuario
 */
export function handleError(
  error: any, 
  context: ErrorContext, 
  options: {
    showToast?: boolean
    onRetry?: () => void
    customMessage?: Partial<UserFriendlyError>
  } = {}
): UserFriendlyError {
  const { showToast = true, onRetry, customMessage } = options

  // Crear mensaje amigable
  const userFriendlyError = {
    ...createUserFriendlyError(error, context),
    ...customMessage
  }

  // Registrar error
  logError(error, context, userFriendlyError)

  // Mostrar notificación al usuario
  if (showToast) {
    const toastAction = userFriendlyError.canRetry && onRetry ? {
      label: 'Reintentar',
      onClick: onRetry
    } : undefined

    toast({
      title: userFriendlyError.title,
      description: `${userFriendlyError.description}\n\n💡 ${userFriendlyError.suggestions.join('. ')}.`,
      variant: userFriendlyError.severity === 'critical' ? 'destructive' : 'default',
      duration: userFriendlyError.severity === 'low' ? 3000 : 8000,
      action: toastAction
    })
  }

  return userFriendlyError
}

/**
 * Hook para manejo de errores en componentes React
 */
export function useErrorHandler(defaultContext: Partial<ErrorContext> = {}) {
  const handleComponentError = (error: any, additionalContext: Partial<ErrorContext> = {}) => {
    const fullContext = {
      operation: 'Component Operation',
      module: 'Unknown Component',
      ...defaultContext,
      ...additionalContext
    }

    return handleError(error, fullContext)
  }

  return { handleError: handleComponentError }
}

/**
 * Wrapper para operaciones asíncronas con manejo de errores
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  options?: {
    showToast?: boolean
    onRetry?: () => void
    customMessage?: Partial<UserFriendlyError>
  }
): Promise<{ success: boolean; data?: T; error?: UserFriendlyError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    const userFriendlyError = handleError(error, context, options)
    return { success: false, error: userFriendlyError }
  }
}