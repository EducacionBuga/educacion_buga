"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Database, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Trash2,
  Download,
  Settings,
  FileText
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface TableStatus {
  table: string
  exists: boolean
  count: number
  error?: string
}

export function ListaChequeoSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [tableStatus, setTableStatus] = useState<TableStatus[]>([])
  const [lastAction, setLastAction] = useState<string>("")
  const { toast } = useToast()

  const executeAction = async (action: string, actionName: string) => {
    setIsLoading(true)
    setLastAction(actionName)

    try {
      const response = await fetch('/api/lista-chequeo/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const result = await response.json()

      if (response.ok) {
        if (action === 'check_tables') {
          setTableStatus(result.tables)
        }

        toast({
          title: "✅ Éxito",
          description: `${actionName} completado correctamente`,
        })
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      console.error(`Error en ${actionName}:`, error)
      toast({
        title: "❌ Error",
        description: `Error en ${actionName}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setLastAction("")
    }
  }

  const checkTables = () => executeAction('check_tables', 'Verificación de tablas')
  const createTables = () => executeAction('create_tables', 'Creación de tablas')
  const populateData = () => executeAction('populate_data', 'Población de datos')
  const resetAll = () => executeAction('reset_all', 'Limpieza de datos')

  const getTableStatusIcon = (status: TableStatus) => {
    if (!status.exists) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (status.count === 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getTableStatusBadge = (status: TableStatus) => {
    if (!status.exists) {
      return <Badge variant="destructive">No existe</Badge>
    }
    if (status.count === 0) {
      return <Badge variant="outline">Sin datos</Badge>
    }
    return <Badge variant="default">{status.count} registros</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings className="h-6 w-6" />
            Configuración de Lista de Chequeo
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              Panel de Administración
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Estado actual */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">📊 Estado Actual</TabsTrigger>
          <TabsTrigger value="setup">⚙️ Configuración</TabsTrigger>
          <TabsTrigger value="instructions">📖 Instrucciones</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Estado de las Tablas</CardTitle>
                <Button 
                  onClick={checkTables}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  {isLoading && lastAction === 'Verificación de tablas' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Verificar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tableStatus.length === 0 ? (
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    Haga clic en "Verificar" para comprobar el estado de las tablas de lista de chequeo.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {tableStatus.map((status) => (
                    <div key={status.table} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTableStatusIcon(status)}
                        <div>
                          <p className="font-medium">{status.table}</p>
                          {status.error && (
                            <p className="text-sm text-red-600">{status.error}</p>
                          )}
                        </div>
                      </div>
                      {getTableStatusBadge(status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Paso 1: Crear tablas */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                  <h3 className="font-medium">Crear Estructura de Base de Datos</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Crea todas las tablas necesarias para el sistema de lista de chequeo con sus índices y políticas RLS.
                </p>
                <Button 
                  onClick={createTables}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && lastAction === 'Creación de tablas' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Crear Tablas
                </Button>
              </div>

              {/* Paso 2: Poblar datos */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-sm font-bold">2</span>
                  <h3 className="font-medium">Cargar Datos Iniciales</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Inserta las categorías de contrato (SAMC, Mínima Cuantía, etc.) y las etapas del proceso contractual.
                </p>
                <Button 
                  onClick={populateData}
                  disabled={isLoading}
                  className="w-full"
                  variant="default"
                >
                  {isLoading && lastAction === 'Población de datos' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Cargar Datos
                </Button>
              </div>

              {/* Acción de limpieza */}
              <div className="border border-red-200 rounded-lg p-4 space-y-3 bg-red-50">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-bold">⚠️</span>
                  <h3 className="font-medium text-red-800">Limpiar Todos los Datos</h3>
                </div>
                <p className="text-sm text-red-700">
                  ⚠️ <strong>Peligro:</strong> Esta acción eliminará TODOS los datos de lista de chequeo incluyendo respuestas guardadas.
                </p>
                <Button 
                  onClick={resetAll}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading && lastAction === 'Limpieza de datos' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Limpiar Datos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Instrucciones de Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Objetivo:</strong> Configurar el sistema de lista de chequeo contractual para todas las dependencias de la Secretaría de Educación.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">🎯 Paso a Paso:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li><strong>Verificar Estado:</strong> Use "Verificar" en la pestaña "Estado Actual" para revisar qué tablas existen.</li>
                    <li><strong>Crear Estructura:</strong> Ejecute "Crear Tablas" para establecer la base de datos.</li>
                    <li><strong>Cargar Datos:</strong> Use "Cargar Datos" para insertar categorías y etapas básicas.</li>
                    <li><strong>Configurar Items:</strong> Los items específicos se pueden agregar manualmente o importar desde Excel.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-medium mb-2">📋 Categorías de Contrato:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>SAMC:</strong> Selección Abreviada de Menor Cuantía</li>
                    <li><strong>MINIMA CUANTÍA:</strong> Contrato de Mínima Cuantía</li>
                    <li><strong>CONTRATO INTERADMINISTRATIVO:</strong> Contrato Interadministrativo</li>
                    <li><strong>PRESTACIÓN DE SERVICIOS:</strong> Contrato de Prestación de Servicios</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">🔄 Etapas del Proceso:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>PRECONTRACTUAL:</strong> Estudios previos, certificaciones, análisis</li>
                    <li><strong>CONTRACTUAL:</strong> Formalización del contrato, documentos del contratista</li>
                    <li><strong>EJECUCIÓN:</strong> Seguimiento, informes, liquidación</li>
                  </ul>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Nota Importante:</strong> Una vez configurado, el sistema estará disponible para todas las dependencias:
                    Calidad Educativa, Inspección y Vigilancia, Cobertura e Infraestructura, Talento Humano y Despacho.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
