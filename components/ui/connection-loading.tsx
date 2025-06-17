import { Loader2 } from "lucide-react"

interface ConnectionLoadingProps {
  message?: string
  showTips?: boolean
}

export function ConnectionLoading({ 
  message = "Conectando con la base de datos...", 
  showTips = false 
}: ConnectionLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Sistema Educativo Buga
        </h2>
        
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full animate-pulse"
            style={{ width: '60%' }}
          />
        </div>
        
        {showTips && (
          <div className="text-sm text-gray-500 space-y-2">
            <p>💡 <strong>Tip:</strong> La primera conexión puede tardar unos segundos</p>
            <p>🌐 Verificando conectividad con el servidor...</p>
          </div>
        )}
        
        <div className="mt-6 text-xs text-gray-400">
          Secretaría de Educación de Guadalajara de Buga
        </div>
      </div>
    </div>
  )
}
