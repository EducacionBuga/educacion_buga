/**
 * Sistema de modo offline con sincronización automática
 * Permite trabajar sin conexión y sincronizar cuando se restablece la conectividad
 */

import { toast } from '@/hooks/use-toast'

export interface OfflineAction {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  table: string
  data: any
  timestamp: number
  retryCount: number
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingActions: number
  lastSyncTime: Date | null
  syncErrors: string[]
}

class OfflineSyncManager {
  private isOnline = navigator.onLine
  private isSyncing = false
  private pendingActions: OfflineAction[] = []
  private syncQueue: OfflineAction[] = []
  private listeners: ((status: SyncStatus) => void)[] = []
  private lastSyncTime: Date | null = null
  private syncErrors: string[] = []
  private readonly STORAGE_KEY = 'offline_actions'
  private readonly MAX_RETRY_COUNT = 3
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    this.loadPendingActions()
    this.setupEventListeners()
    this.startPeriodicSync()
  }

  /**
   * Configurar listeners de eventos de conectividad
   */
  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Conexión restablecida')
      this.isOnline = true
      this.notifyListeners()
      this.syncPendingActions()
      
      toast({
        title: "Conexión restablecida",
        description: "Sincronizando datos pendientes...",
        variant: "default"
      })
    })

    window.addEventListener('offline', () => {
      console.log('📴 Conexión perdida - modo offline activado')
      this.isOnline = false
      this.notifyListeners()
      
      toast({
        title: "Modo offline activado",
        description: "Los cambios se guardarán localmente y se sincronizarán cuando se restablezca la conexión.",
        variant: "default"
      })
    })
  }

  /**
   * Iniciar sincronización periódica
   */
  private startPeriodicSync() {
    // Sincronizar cada 30 segundos si hay acciones pendientes
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingActions.length > 0 && !this.isSyncing) {
        this.syncPendingActions()
      }
    }, 30000)
  }

  /**
   * Cargar acciones pendientes del localStorage
   */
  private loadPendingActions() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.pendingActions = JSON.parse(stored)
        console.log(`📦 Cargadas ${this.pendingActions.length} acciones pendientes`)
      }
    } catch (error) {
      console.error('Error cargando acciones pendientes:', error)
      this.pendingActions = []
    }
  }

  /**
   * Guardar acciones pendientes en localStorage
   */
  private savePendingActions() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pendingActions))
    } catch (error) {
      console.error('Error guardando acciones pendientes:', error)
    }
  }

  /**
   * Notificar a los listeners sobre cambios de estado
   */
  private notifyListeners() {
    const status: SyncStatus = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingActions: this.pendingActions.length,
      lastSyncTime: this.lastSyncTime,
      syncErrors: this.syncErrors
    }

    this.listeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error en listener de sync:', error)
      }
    })
  }

  /**
   * Agregar una acción para sincronización
   */
  addAction(type: OfflineAction['type'], table: string, data: any): string {
    const action: OfflineAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0
    }

    this.pendingActions.push(action)
    this.savePendingActions()
    this.notifyListeners()

    console.log(`📝 Acción ${type} agregada para ${table}:`, action.id)

    // Si estamos online, intentar sincronizar inmediatamente
    if (this.isOnline && !this.isSyncing) {
      setTimeout(() => this.syncPendingActions(), 100)
    }

    return action.id
  }

  /**
   * Sincronizar acciones pendientes
   */
  async syncPendingActions(): Promise<void> {
    if (!this.isOnline || this.isSyncing || this.pendingActions.length === 0) {
      return
    }

    this.isSyncing = true
    this.syncErrors = []
    this.notifyListeners()

    console.log(`🔄 Iniciando sincronización de ${this.pendingActions.length} acciones`)

    const actionsToSync = [...this.pendingActions]
    const successfulActions: string[] = []

    for (const action of actionsToSync) {
      try {
        await this.executeAction(action)
        successfulActions.push(action.id)
        console.log(`✅ Acción sincronizada: ${action.id}`)
      } catch (error: any) {
        console.error(`❌ Error sincronizando acción ${action.id}:`, error)
        
        // Incrementar contador de reintentos
        action.retryCount++
        
        if (action.retryCount >= this.MAX_RETRY_COUNT) {
          console.error(`🚫 Acción ${action.id} descartada después de ${this.MAX_RETRY_COUNT} intentos`)
          successfulActions.push(action.id) // Remover de la cola
          this.syncErrors.push(`Error en ${action.type} ${action.table}: ${error.message}`)
        }
      }
    }

    // Remover acciones exitosas o que excedieron los reintentos
    this.pendingActions = this.pendingActions.filter(
      action => !successfulActions.includes(action.id)
    )

    this.savePendingActions()
    this.lastSyncTime = new Date()
    this.isSyncing = false
    this.notifyListeners()

    const syncedCount = successfulActions.length
    const remainingCount = this.pendingActions.length

    console.log(`🎯 Sincronización completada: ${syncedCount} exitosas, ${remainingCount} pendientes`)

    if (syncedCount > 0) {
      toast({
        title: "Sincronización completada",
        description: `${syncedCount} cambios sincronizados exitosamente.`,
        variant: "default"
      })
    }

    if (this.syncErrors.length > 0) {
      toast({
        title: "Errores de sincronización",
        description: `${this.syncErrors.length} acciones fallaron. Se reintentarán automáticamente.`,
        variant: "destructive"
      })
    }
  }

  /**
   * Ejecutar una acción específica
   */
  private async executeAction(action: OfflineAction): Promise<void> {
    // Aquí implementarías la lógica específica para cada tipo de acción
    // Por ahora, simulamos la ejecución
    
    const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
    const supabase = createClientComponentClient()

    switch (action.type) {
      case 'CREATE':
        const { error: createError } = await supabase
          .from(action.table)
          .insert(action.data)
        
        if (createError) throw createError
        break

      case 'UPDATE':
        const { id, ...updateData } = action.data
        const { error: updateError } = await supabase
          .from(action.table)
          .update(updateData)
          .eq('id', id)
        
        if (updateError) throw updateError
        break

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from(action.table)
          .delete()
          .eq('id', action.data.id)
        
        if (deleteError) throw deleteError
        break

      default:
        throw new Error(`Tipo de acción no soportado: ${action.type}`)
    }
  }

  /**
   * Suscribirse a cambios de estado
   */
  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)
    
    // Notificar estado inicial
    listener({
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingActions: this.pendingActions.length,
      lastSyncTime: this.lastSyncTime,
      syncErrors: this.syncErrors
    })

    // Retornar función de desuscripción
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Obtener estado actual
   */
  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingActions: this.pendingActions.length,
      lastSyncTime: this.lastSyncTime,
      syncErrors: this.syncErrors
    }
  }

  /**
   * Forzar sincronización manual
   */
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingActions()
    } else {
      toast({
        title: "Sin conexión",
        description: "No se puede sincronizar sin conexión a internet.",
        variant: "destructive"
      })
    }
  }

  /**
   * Limpiar todas las acciones pendientes (usar con cuidado)
   */
  clearPendingActions(): void {
    this.pendingActions = []
    this.savePendingActions()
    this.notifyListeners()
    
    toast({
      title: "Acciones pendientes eliminadas",
      description: "Todas las acciones pendientes han sido eliminadas.",
      variant: "default"
    })
  }

  /**
   * Destruir el manager
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    this.listeners = []
  }
}

// Instancia singleton
export const offlineSyncManager = new OfflineSyncManager()

// Hook para usar en componentes React
export function useOfflineSync() {
  const [status, setStatus] = React.useState<SyncStatus>(offlineSyncManager.getStatus())

  React.useEffect(() => {
    const unsubscribe = offlineSyncManager.subscribe(setStatus)
    return unsubscribe
  }, [])

  return {
    ...status,
    addAction: offlineSyncManager.addAction.bind(offlineSyncManager),
    forceSync: offlineSyncManager.forcSync.bind(offlineSyncManager),
    clearPending: offlineSyncManager.clearPendingActions.bind(offlineSyncManager)
  }
}

// Funciones de conveniencia
export const addOfflineAction = (type: OfflineAction['type'], table: string, data: any) => 
  offlineSyncManager.addAction(type, table, data)

export const forceSync = () => offlineSyncManager.forcSync()

export const getOfflineStatus = () => offlineSyncManager.getStatus()