"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getColorClass } from "@/utils/areas"
import { EstadoSelect } from "@/components/matriz/estado-select"
import { ValidacionBadge } from "@/components/matriz/validacion-badge"
import type { MatrizSeguimientoItem } from "@/hooks/use-matriz-seguimiento"
import { useValidaciones } from "@/hooks/use-plan-validaciones"

interface MatrizMejoradaProps {
  data: MatrizSeguimientoItem[]
  isLoading: boolean
  isError: boolean
  error: any
  refetch: () => void
  updatePlanEstado: (planId: string, nuevoEstado: string) => Promise<void>
  searchTerm: string
  setSearchTerm: (value: string) => void
  areaFilter: string
  setAreaFilter: (value: string) => void
  estadoFilter: string
  setEstadoFilter: (value: string) => void
  handleClearFilters: () => void
}

export function MatrizMejorada({
  data,
  isLoading,
  isError,
  error,
  refetch,
  updatePlanEstado,
  searchTerm,
  setSearchTerm,
  areaFilter,
  setAreaFilter,
  estadoFilter,
  setEstadoFilter,
  handleClearFilters,
}: MatrizMejoradaProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"general" | "decenal" | "pdm">("general")

  // Hook para validaciones
  const { 
    isAdmin, 
    validarPlan, 
    loading: validacionLoading 
  } = useValidaciones({ refetchMatriz: refetch })

  // Calcular estadísticas - incluso durante la carga
  const stats = useMemo(() => {
    // Si estamos cargando, mostrar 0 en todos los campos
    if (isLoading) {
      return {
        total: 0,
        completados: 0,
        enProceso: 0,
        pendientes: 0,
        retrasados: 0,
        presupuestoTotal: 0,
        avancePromedio: 0
      }
    }

    // Si no hay datos después de la carga
    if (!data || data.length === 0) {
      return {
        total: 0,
        completados: 0,
        enProceso: 0,
        pendientes: 0,
        retrasados: 0,
        presupuestoTotal: 0,
        avancePromedio: 0
      }
    }

    const completados = data.filter(item => item.estado === "Completado").length
    const enProceso = data.filter(item => item.estado === "En Progreso").length
    const pendientes = data.filter(item => item.estado === "Pendiente").length
    const retrasados = data.filter(item => item.estado === "Retrasado").length
    
    const presupuestoTotal = data.reduce((sum, item) => {
      const presupuesto = parseFloat(item.presupuesto?.replace(/[^\d]/g, '') || '0')
      return sum + presupuesto
    }, 0)

    const avancePromedio = data.length > 0 ? Math.round(
      data.reduce((sum, item) => sum + (item.avance || 0), 0) / data.length
    ) : 0

    return {
      total: data.length,
      completados,
      enProceso,
      pendientes,
      retrasados,
      presupuestoTotal,
      avancePromedio
    }
  }, [data, isLoading])

  // Formatear presupuesto
  const formatCurrency = (amount: number) => {
    // Formatear con puntos como separadores de miles (formato colombiano)
    const formatted = amount.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `$${formatted}`;
  }

  // Componente de tarjeta de plan
  const PlanCard = ({ item }: { item: MatrizSeguimientoItem }) => {
    const isExpanded = expandedRow === item.id

    return (
      <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 ${getColorClass(item.color)} rounded-full`} />
              <div>
                <CardTitle className="text-lg font-semibold">{item.programa}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.area}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={item.estado === "Completado" ? "default" : 
                             item.estado === "En Progreso" ? "secondary" : 
                             item.estado === "Retrasado" ? "destructive" : "outline"}>
                {item.estado}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedRow(isExpanded ? null : item.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Información básica siempre visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Objetivo</p>
                <p className="text-sm">{item.objetivo || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Responsable</p>
                <p className="text-sm">{item.responsable || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avance</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getColorClass(item.color)}`}
                      style={{ width: `${item.avance}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{item.avance}%</span>
                </div>
              </div>
            </div>

            {/* Información expandida */}
            {isExpanded && (
              <div className="space-y-4 border-t pt-4">
                <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="decenal">Plan Decenal</TabsTrigger>
                    <TabsTrigger value="pdm">PDM 2024-2027</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Meta</p>
                        <p className="text-sm">{item.meta || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Presupuesto</p>
                        <p className="text-sm font-medium text-green-600">{item.presupuesto || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha Inicio</p>
                        <p className="text-sm">{item.fechaInicio || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha Fin</p>
                        <p className="text-sm">{item.fechaFin || "-"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Acciones</p>
                        <p className="text-sm">{item.acciones || "-"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Indicadores</p>
                        <p className="text-sm">{item.indicadores || "-"}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="decenal" className="mt-4">
                    <div className="space-y-4">
                      {item.metaDecenal ? (
                        <>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Plan Decenal</p>
                            <p className="text-sm">{item.metaDecenal}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Macroobjetivo</p>
                            <p className="text-sm">{item.macroobjetivoDecenal?.split('\n')[0] || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Objetivo Decenal</p>
                            <p className="text-sm">{item.objetivoDecenal || "-"}</p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No se ha asignado información del Plan Decenal</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pdm" className="mt-4">
                    <div className="space-y-4">
                      {item.programaPDM ? (
                        <>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Programa PDM 2024-2027</p>
                            <p className="text-sm">{item.programaPDM}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Subprograma PDM 2024-2027</p>
                            <p className="text-sm">{item.subprogramaPDM || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Proyecto/Actividad PDM</p>
                            <p className="text-sm">{item.proyectoPDM || "-"}</p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No se ha asignado información del PDM 2024-2027</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Controles adicionales */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <EstadoSelect 
                    planId={item.id}
                    currentEstado={item.estado}
                    onEstadoChange={updatePlanEstado}
                  />
                  <ValidacionBadge
                    planId={item.id}
                    validacion={item.validacion}
                    isAdmin={isAdmin}
                    onValidar={validarPlan}
                    loading={validacionLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Dashboard de estadísticas - skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                  <div className="ml-4 space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Skeleton de filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Skeleton de tarjetas */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-4">
          <p className="text-gray-500">Cargando matriz de seguimiento...</p>
        </div>
      </div>
    )
  }

  // Mostrar estado de error
  if (isError) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar los datos</h3>
          <p className="text-gray-600 mb-4">
            Hubo un problema al cargar la matriz de seguimiento. Por favor, inténtalo de nuevo.
          </p>
          <Button onClick={refetch} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total de Planes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avance Promedio</p>
                <p className="text-2xl font-bold">{stats.avancePromedio}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold">{stats.completados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Presupuesto Total</p>
                <p className="text-lg font-bold">{formatCurrency(stats.presupuestoTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por programa, objetivo, responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="todas">Todas las áreas</option>
                <option value="Calidad Educativa">Calidad Educativa</option>
                <option value="Inspección y Vigilancia">Inspección y Vigilancia</option>
                <option value="Cobertura e Infraestructura">Cobertura e Infraestructura</option>
                <option value="Talento Humano">Talento Humano</option>
              </select>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completado">Completado</option>
                <option value="Retrasado">Retrasado</option>
              </select>
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de planes */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay datos disponibles</h3>
              <p className="text-gray-500">
                No se encontraron planes de acción o no hay datos que coincidan con los filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px]">
            {data.map((item) => (
              <PlanCard key={item.id} item={item} />
            ))}
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
