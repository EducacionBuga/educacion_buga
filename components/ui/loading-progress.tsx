/**
 * Componente de indicador de progreso avanzado para operaciones de carga
 */

import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoadingProgressProps {
  /** Si está cargando actualmente */
  isLoading: boolean
  /** Progreso de 0 a 100 */
  progress: number
  /** Etapa actual de la carga */
  stage: string
  /** Si la carga está tardando demasiado */
  isLoadingTooLong?: boolean
  /** Número de reintentos realizados */
  retryCount?: number
  /** Error si existe */
  error?: Error | string | null
  /** Función para reintentar */
  onRetry?: () => void
  /** Mostrar en modo compacto */
  compact?: boolean
  /** Clase CSS adicional */
  className?: string
}

export function LoadingProgress({
  isLoading,
  progress,
  stage,
  isLoadingTooLong = false,
  retryCount = 0,
  error,
  onRetry,
  compact = false,
  className
}: LoadingProgressProps) {
  // Si no está cargando y no hay error, no mostrar nada
  if (!isLoading && !error) {
    return null
  }

  // Modo compacto - solo barra de progreso
  if (compact && isLoading && !error) {
    return (
      <div className={cn("w-full space-y-2", className)}>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            {stage}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        {isLoadingTooLong && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            La carga está tardando más de lo esperado...
          </p>
        )}
      </div>
    )
  }

  // Modo completo
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Estado de carga */}
        {isLoading && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  {retryCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {retryCount}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{stage}</p>
                  {retryCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Reintento {retryCount}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{Math.round(progress)}%</p>
                <p className="text-xs text-muted-foreground">
                  {progress < 25 ? "Iniciando..." :
                   progress < 50 ? "Conectando..." :
                   progress < 75 ? "Cargando..." :
                   "Finalizando..."}
                </p>
              </div>
            </div>
            
            <Progress value={progress} className="h-3" />
            
            {/* Advertencia de carga lenta */}
            {isLoadingTooLong && (
              <Alert className="border-amber-200 bg-amber-50">
                <Clock className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>La carga está tardando más de lo esperado.</strong>
                  <br />
                  Esto puede deberse a una conexión lenta o alta carga del servidor.
                  {onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      className="mt-2 ml-0"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reintentar
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Estado de error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  {typeof error === 'string' ? error : error.message}
                </p>
                
                {/* Sugerencias basadas en el tipo de error */}
                {typeof error === 'string' || error.message ? (
                  <div className="text-sm space-y-1">
                    {(typeof error === 'string' ? error : error.message).includes('network') && (
                      <p className="flex items-center gap-1">
                        <WifiOff className="h-3 w-3" />
                        Verifica tu conexión a internet
                      </p>
                    )}
                    {(typeof error === 'string' ? error : error.message).includes('auth') && (
                      <p className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Tu sesión puede haber expirado
                      </p>
                    )}
                    {(typeof error === 'string' ? error : error.message).includes('timeout') && (
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        El servidor tardó demasiado en responder
                      </p>
                    )}
                  </div>
                ) : null}
                
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="mt-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reintentar {retryCount > 0 && `(${retryCount + 1})`}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Estado completado */}
        {!isLoading && !error && progress === 100 && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Carga completada exitosamente</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Componente simplificado para mostrar solo el estado de conexión
 */
export function ConnectionStatus({ 
  isConnected, 
  isLoading, 
  onRetry 
}: { 
  isConnected: boolean
  isLoading: boolean
  onRetry?: () => void 
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Conectando...
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm",
      isConnected ? "text-green-600" : "text-red-600"
    )}>
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Conectado
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Sin conexión
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </>
      )}
    </div>
  )
}