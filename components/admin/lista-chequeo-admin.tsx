"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Database, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  Upload,
  Download
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ScriptResult {
  success: boolean
  message: string
  details?: any
}

export function ListaChequeoAdmin() {
  const { toast } = useToast()
  const [isExecuting, setIsExecuting] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, ScriptResult>>({})
  const [sqlOutput, setSqlOutput] = useState("")

  const executeScript = async (scriptName: string, description: string) => {
    setIsExecuting(scriptName)
    
    try {
      const response = await fetch('/api/admin/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script: scriptName })
      })

      const result = await response.json()
      
      setResults(prev => ({
        ...prev,
        [scriptName]: result
      }))

      if (result.success) {
        toast({
          title: "Script ejecutado exitosamente",
          description: description
        })
        setSqlOutput(prev => prev + `\n✅ ${description}\n${result.details || ''}\n`)
      } else {
        toast({
          title: "Error en la ejecución",
          description: result.message,
          variant: "destructive"
        })
        setSqlOutput(prev => prev + `\n❌ Error en ${description}: ${result.message}\n`)
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: 'Error de conexión'
      }
      
      setResults(prev => ({
        ...prev,
        [scriptName]: errorResult
      }))

      toast({
        title: "Error de conexión",
        description: "No se pudo ejecutar el script",
        variant: "destructive"
      })
      setSqlOutput(prev => prev + `\n❌ Error de conexión en ${description}\n`)
    } finally {
      setIsExecuting(null)
    }
  }

  const scripts = [
    {
      name: 'init-lista-chequeo',
      title: 'Inicializar Estructura',
      description: 'Crear tablas y estructura base de lista de chequeo',
      icon: Database,
      color: 'bg-blue-500',
      priority: 1
    },
    {
      name: 'populate-lista-chequeo-data',
      title: 'Poblar Datos',
      description: 'Insertar todos los items de lista de chequeo según documentos oficiales',
      icon: Upload,
      color: 'bg-green-500',
      priority: 2
    },
    {
      name: 'enhance-lista-chequeo-structure',
      title: 'Mejorar Estructura',
      description: 'Agregar campos adicionales y optimizaciones',
      icon: FileText,
      color: 'bg-purple-500',
      priority: 3
    }
  ]

  const getStatusBadge = (scriptName: string) => {
    const result = results[scriptName]
    if (!result) return <Badge variant="outline">No ejecutado</Badge>
    if (result.success) return <Badge className="bg-green-100 text-green-800">Exitoso</Badge>
    return <Badge variant="destructive">Error</Badge>
  }

  const getStatusIcon = (scriptName: string) => {
    const result = results[scriptName]
    if (isExecuting === scriptName) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    if (!result) return null
    if (result.success) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <AlertCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-blue-900">
            <Database className="h-8 w-8" />
            <div>
              <h2 className="text-2xl">Administración Lista de Chequeo</h2>
              <p className="text-sm font-normal text-blue-700">
                Configuración e inicialización del sistema de listas de chequeo contractual
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Información importante */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Ejecute los scripts en el orden indicado. 
          Primero inicialice la estructura, luego poblar los datos y finalmente las mejoras.
        </AlertDescription>
      </Alert>

      {/* Scripts disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scripts.map((script) => {
          const Icon = script.icon
          return (
            <Card key={script.name} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${script.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{script.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        Prioridad {script.priority}
                      </Badge>
                    </div>
                  </div>
                  {getStatusIcon(script.name)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {script.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {getStatusBadge(script.name)}
                  <Button
                    onClick={() => executeScript(script.name, script.description)}
                    disabled={isExecuting === script.name}
                    variant={results[script.name]?.success ? "outline" : "default"}
                    size="sm"
                  >
                    {isExecuting === script.name ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {results[script.name]?.success ? "Re-ejecutar" : "Ejecutar"}
                  </Button>
                </div>
                
                {results[script.name] && !results[script.name].success && (
                  <Alert className="mt-3" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {results[script.name].message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Ejecutar todos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Ejecución Completa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Ejecutar todos los scripts en el orden correcto para configuración completa
            </p>
            <Button
              onClick={async () => {
                for (const script of scripts) {
                  await executeScript(script.name, script.description)
                  // Esperar un poco entre scripts
                  await new Promise(resolve => setTimeout(resolve, 1000))
                }
              }}
              disabled={!!isExecuting}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Configuración Completa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output log */}
      {sqlOutput && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Log de Ejecución</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sqlOutput}
              readOnly
              className="min-h-[200px] font-mono text-xs"
              placeholder="Los resultados de la ejecución aparecerán aquí..."
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSqlOutput("")}
              >
                Limpiar Log
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado del sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Scripts Ejecutados</h4>
              <div className="space-y-1">
                {scripts.map(script => (
                  <div key={script.name} className="flex items-center justify-between text-sm">
                    <span>{script.title}</span>
                    {getStatusBadge(script.name)}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Información</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Las listas de chequeo están basadas en documentos oficiales</p>
                <p>• Incluye SAMC, Mínima Cuantía, Interadministrativo y Prestación de Servicios</p>
                <p>• Soporta registro por número de contrato, valor y contratista</p>
                <p>• Todas las respuestas son editables y descargables</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
