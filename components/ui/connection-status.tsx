/**
 * Componente para mostrar el estado de conexión y sincronización offline
 */

import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useOfflineSync } from "@/lib/offline-sync"

export interface ConnectionStatusProps {
  /** Mostrar en modo compacto */
  compact?: boolean
  /** Mostrar detalles de sincronización */
  showSyncDetails?: boolean
  /** Clase CSS adicional */
  className?: string
}

export function ConnectionStatus({
  compact = false,
  showSyncDetails = true,
  className
}: ConnectionStatusProps) {
  const {
    isOnline,
    isSyncing,
    pendingActions,
    lastSyncTime,
    syncErrors,
    forceSync
  } = useOfflineSync()

  // Modo compacto - solo icono y estado
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">Offline</span>
          </>
        )}
        
        {pendingActions > 0 && (
          <Badge variant="secondary" className="text-xs">
            {pendingActions} pendientes
          </Badge>
        )}
        
        {isSyncing && (
          <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
        )}
      </div>
    )
  }

  // Modo completo
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Estado de conexión principal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full",
                isOnline ? "bg-green-100" : "bg-red-100"
              )}>
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
              </div>
              
              <div>
                <h3 className="font-medium">
                  {isOnline ? 'Conectado' : 'Sin conexión'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? 'Los cambios se sincronizan automáticamente'
                    : 'Los cambios se guardan localmente'
                  }
                </p>
              </div>
            </div>
            
            {/* Botón de sincronización manual */}
            {isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={forceSync}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            )}
          </div>

          {/* Detalles de sincronización */}
          {showSyncDetails && (
            <div className="space-y-2">
              {/* Acciones pendientes */}
              {pendingActions > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-600">
                    {pendingActions} cambio{pendingActions !== 1 ? 's' : ''} pendiente{pendingActions !== 1 ? 's' : ''} de sincronización
                  </span>
                </div>
              )}

              {/* Última sincronización */}
              {lastSyncTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>
                    Última sincronización: {lastSyncTime.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Errores de sincronización */}
              {syncErrors.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {syncErrors.length} error{syncErrors.length !== 1 ? 'es' : ''} de sincronización
                    </span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {syncErrors.slice(0, 3).map((error, index) => (
                      <p key={index} className="text-xs text-red-600">
                        • {error}
                      </p>
                    ))}
                    {syncErrors.length > 3 && (
                      <p className="text-xs text-red-600">
                        ... y {syncErrors.length - 3} más
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Estado ideal */}
              {isOnline && pendingActions === 0 && syncErrors.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Todos los cambios están sincronizados</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Componente de badge simple para mostrar en la barra de navegación
 */
export function ConnectionBadge({ className }: { className?: string }) {
  const { isOnline, pendingActions, isSyncing } = useOfflineSync()

  return (
    <Badge 
      variant={isOnline ? "default" : "destructive"}
      className={cn("flex items-center gap-1", className)}
    >
      {isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      
      {isOnline ? 'Online' : 'Offline'}
      
      {isSyncing && (
        <Loader2 className="h-3 w-3 animate-spin ml-1" />
      )}
      
      {pendingActions > 0 && (
        <span className="ml-1 text-xs">({pendingActions})</span>
      )}
    </Badge>
  )
}

/**
 * Hook para obtener solo el estado de conexión
 */
export function useConnectionStatus() {
  const { isOnline, pendingActions, isSyncing } = useOfflineSync()
  
  return {
    isOnline,
    isOffline: !isOnline,
    hasPendingChanges: pendingActions > 0,
    isSyncing
  }
}