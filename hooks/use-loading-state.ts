/**
 * Hook para manejo avanzado de estados de carga con indicadores de progreso
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

export interface LoadingState {
  isLoading: boolean
  progress: number
  stage: string
  error: Error | null
  isLoadingTooLong: boolean
  retryCount: number
}

export interface LoadingOptions {
  /** Tiempo en ms después del cual se considera "carga lenta" */
  slowLoadingThreshold?: number
  /** Mostrar toast de progreso */
  showProgressToast?: boolean
  /** Mensaje personalizado para carga lenta */
  slowLoadingMessage?: string
}

export function useLoadingState(options: LoadingOptions = {}) {
  const {
    slowLoadingThreshold = 10000, // 10 segundos
    showProgressToast = false,
    slowLoadingMessage = "La carga está tardando más de lo esperado. Por favor, espera..."
  } = options

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    stage: '',
    error: null,
    isLoadingTooLong: false,
    retryCount: 0
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startLoading = useCallback((stage: string = 'Iniciando...') => {
    startTimeRef.current = Date.now()
    setState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      stage,
      error: null,
      isLoadingTooLong: false
    }))

    // Configurar timeout para carga lenta
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isLoadingTooLong: true }))
      
      if (showProgressToast) {
        toast({
          title: "Carga lenta detectada",
          description: slowLoadingMessage,
          variant: "default"
        })
      }
    }, slowLoadingThreshold)
  }, [slowLoadingThreshold, showProgressToast, slowLoadingMessage])

  const updateProgress = useCallback((progress: number, stage?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      ...(stage && { stage })
    }))
  }, [])

  const setError = useCallback((error: Error | string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: error instanceof Error ? error : new Error(error),
      isLoadingTooLong: false
    }))
  }, [])

  const finishLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    const totalTime = Date.now() - startTimeRef.current
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
      stage: 'Completado',
      isLoadingTooLong: false
    }))

    // Mostrar tiempo total si fue una carga lenta
    if (totalTime > slowLoadingThreshold && showProgressToast) {
      toast({
        title: "Carga completada",
        description: `Datos cargados en ${Math.round(totalTime / 1000)} segundos`,
        variant: "default"
      })
    }
  }, [slowLoadingThreshold, showProgressToast])

  const retry = useCallback(() => {
    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      error: null
    }))
  }, [])

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setState({
      isLoading: false,
      progress: 0,
      stage: '',
      error: null,
      isLoadingTooLong: false,
      retryCount: 0
    })
  }, [])

  return {
    ...state,
    startLoading,
    updateProgress,
    setError,
    finishLoading,
    retry,
    reset
  }
}

/**
 * Hook especializado para operaciones con múltiples etapas
 */
export function useMultiStageLoading(stages: string[], options: LoadingOptions = {}) {
  const loadingState = useLoadingState(options)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)

  const nextStage = useCallback(() => {
    const nextIndex = Math.min(currentStageIndex + 1, stages.length - 1)
    setCurrentStageIndex(nextIndex)
    
    const progress = ((nextIndex + 1) / stages.length) * 100
    loadingState.updateProgress(progress, stages[nextIndex])
  }, [currentStageIndex, stages, loadingState])

  const goToStage = useCallback((stageIndex: number) => {
    const index = Math.max(0, Math.min(stageIndex, stages.length - 1))
    setCurrentStageIndex(index)
    
    const progress = ((index + 1) / stages.length) * 100
    loadingState.updateProgress(progress, stages[index])
  }, [stages, loadingState])

  const startMultiStageLoading = useCallback(() => {
    setCurrentStageIndex(0)
    loadingState.startLoading(stages[0] || 'Iniciando...')
  }, [stages, loadingState])

  const resetMultiStage = useCallback(() => {
    setCurrentStageIndex(0)
    loadingState.reset()
  }, [loadingState])

  return {
    ...loadingState,
    currentStageIndex,
    totalStages: stages.length,
    nextStage,
    goToStage,
    startLoading: startMultiStageLoading,
    reset: resetMultiStage
  }
}