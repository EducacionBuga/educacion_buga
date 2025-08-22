"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 [ERROR BOUNDARY] Error capturado:', error)
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 [ERROR BOUNDARY] Error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
    
    this.setState({
      error,
      errorInfo
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Oops! Algo salió mal
              </h1>
              <p className="text-gray-600 mb-4">
                Ha ocurrido un error inesperado en la aplicación.
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <p className="text-sm text-red-700 font-mono">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-red-600 hover:text-red-800">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={this.resetError}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
                variant="outline"
              >
                Recargar página
              </Button>
              
              <Button 
                onClick={() => {
                  localStorage.clear()
                  window.location.href = '/'
                }}
                className="w-full"
                variant="ghost"
              >
                Limpiar datos y reiniciar
              </Button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>Si el problema persiste, contacte al administrador del sistema.</p>
              <p className="mt-1">
                <strong>Secretaría de Educación de Guadalajara de Buga</strong>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Hook para usar con componentes funcionales
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('🚨 [ERROR HANDLER] Error capturado:', {
      error: error.message,
      stack: error.stack,
      errorInfo
    })
  }
}

// Componente de fallback personalizable
export function ProductionErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error
  resetError: () => void 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema Temporalmente No Disponible
          </h1>
          <p className="text-gray-600 text-lg">
            Estamos experimentando dificultades técnicas.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={resetError}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Reintentar
          </Button>
          
          <Button 
            onClick={() => {
              localStorage.clear()
              window.location.href = '/'
            }}
            size="lg"
            variant="outline"
            className="w-full"
          >
            Ir al inicio
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Secretaría de Educación de Guadalajara de Buga</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Si el problema persiste, contacte al soporte técnico.
          </p>
        </div>
      </div>
    </div>
  )
}