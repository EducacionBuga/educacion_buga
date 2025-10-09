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
  X,
  Plus,
  Edit,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getColorClass } from "@/utils/areas"
import type { PlanAccionItem } from "@/types/plan-accion"

interface PlanAccionMejoradoProps {
  data: PlanAccionItem[]
  isLoading: boolean
  isError: boolean
  error: any
  refetch?: () => void
  searchTerm: string
  setSearchTerm: (value: string) => void
  estadoFilter: string
  setEstadoFilter: (value: string) => void
  handleClearFilters: () => void
  onItemUpdate?: (item: PlanAccionItem) => void
  onItemDelete?: (id: string) => void
}

export function PlanAccionMejorado({
  data,
  isLoading,
  isError,
  error,
  refetch,
  searchTerm,
  setSearchTerm,
  estadoFilter,
  setEstadoFilter,
  handleClearFilters,
  onItemUpdate,
  onItemDelete,
}: PlanAccionMejoradoProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"general" | "demografica" | "decenal" | "pdm">("general")

  // Calcular estadísticas
  const stats = useMemo(() => {
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
    const enProceso = data.filter(item => item.estado === "En Progreso" || item.estado === "En progreso").length
    const pendientes = data.filter(item => item.estado === "Pendiente" || item.estado === "Sin iniciar").length
    const retrasados = data.filter(item => item.estado === "Retrasado").length
    
    const presupuestoTotal = data.reduce((sum, item) => {
      const presupuesto = parseFloat(item.presupuesto?.replace(/[^\d]/g, '') || '0')
      return sum + presupuesto
    }, 0)

    const avancePromedio = data.length > 0 ? Math.round(
      data.reduce((sum, item) => sum + (item.porcentajeAvance || 0), 0) / data.length
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

  // Obtener color por estado (para contenedores)
  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "completado":
        return "bg-green-500"
      case "en progreso":
      case "en proceso":
        return "bg-blue-500"
      case "pendiente":
      case "sin iniciar":
        return "bg-yellow-500"
      case "retrasado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Componente de tarjeta de plan mejorado
  const PlanCard = ({ item }: { item: PlanAccionItem }) => {
    const isExpanded = expandedRow === item.id

    return (
      <Card className="mb-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                getEstadoColor(item.estado)
              )}>
                {item.estado === "Completado" && <CheckCircle2 className="h-6 w-6 text-white" />}
                {(item.estado === "En Progreso" || item.estado === "En progreso") && <Clock className="h-6 w-6 text-white" />}
                {(item.estado === "Pendiente" || item.estado === "Sin iniciar") && <AlertCircle className="h-6 w-6 text-white" />}
                {item.estado === "Retrasado" && <X className="h-6 w-6 text-white" />}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900">{item.programa}</CardTitle>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.objetivo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Avance</p>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={cn("h-2 rounded-full", getEstadoColor(item.estado))}
                      style={{ width: `${item.porcentajeAvance}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.porcentajeAvance}%</span>
                </div>
              </div>
              <Badge 
                variant={item.estado === "Completado" ? "default" : 
                         item.estado === "En Progreso" || item.estado === "En progreso" ? "secondary" : 
                         item.estado === "Retrasado" ? "destructive" : "outline"}
                className="whitespace-nowrap"
              >
                {item.estado}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {onItemUpdate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onItemUpdate(item)}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onItemDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onItemDelete(item.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Información básica en grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meta</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{item.meta || "No definida"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Responsable</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{item.responsable || "No asignado"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Presupuesto</p>
                <p className="text-sm font-bold text-green-600 mt-1">{item.presupuesto || "No definido"}</p>
              </div>
            </div>

            {/* Información expandida con tabs */}
            {isExpanded && (
              <div className="border-t pt-4 mt-4">
                <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                    <TabsTrigger value="general" className="text-xs">📋 General</TabsTrigger>
                    <TabsTrigger value="demografica" className="text-xs">👥 Demográfica</TabsTrigger>
                    <TabsTrigger value="decenal" className="text-xs">🎯 Plan Decenal</TabsTrigger>
                    <TabsTrigger value="pdm" className="text-xs">📊 PDM 2024-2027</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones Realizadas</p>
                          <p className="text-sm text-gray-900 mt-1">{item.acciones || "No especificadas"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Indicadores</p>
                          <p className="text-sm text-gray-900 mt-1">{item.indicadores || "No definidos"}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Período</p>
                          <p className="text-sm text-gray-900 mt-1">
                            {item.fechaInicio || "No definido"} - {item.fechaFin || "No definido"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado Actual</p>
                          <Badge variant="outline" className="mt-1">{item.estado}</Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="demografica" className="mt-4">
                    <div className="space-y-4">
                      {(item.zona || item.grupoEtnico || item.grupoEtareo || item.grupoPoblacion || item.cantidad) ? (
                        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Zona</p>
                                <p className="text-sm text-teal-900 mt-1">{item.zona || "No especificada"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Grupo Étnico</p>
                                <p className="text-sm text-teal-900 mt-1">{item.grupoEtnico || "No especificado"}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Grupo Etáreo</p>
                                <p className="text-sm text-teal-900 mt-1">{item.grupoEtareo || "No especificado"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Grupo de Población</p>
                                <p className="text-sm text-teal-900 mt-1">{item.grupoPoblacion || "No especificado"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Cantidad</p>
                                <p className="text-sm text-teal-900 mt-1">{item.cantidad ? (typeof item.cantidad === 'number' ? item.cantidad.toLocaleString() : item.cantidad) : "No especificada"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="font-medium">No se ha registrado información demográfica</p>
                          <p className="text-sm mt-1">Esta actividad no tiene datos demográficos asociados</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="decenal" className="mt-4">
                    <div className="space-y-4">
                      {item.metaDecenal ? (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Plan Decenal</p>
                              <p className="text-sm text-blue-900 mt-1 font-medium">{item.metaDecenal}</p>
                            </div>
                            {item.macroobjetivoDecenal && (
                              <div>
                                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Macroobjetivo</p>
                                <p className="text-sm text-blue-900 mt-1">{item.macroobjetivoDecenal.split('\n')[0]}</p>
                              </div>
                            )}
                            {item.objetivoDecenal && (
                              <div>
                                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Objetivo Decenal</p>
                                <p className="text-sm text-blue-900 mt-1">{item.objetivoDecenal}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="font-medium">No se ha asignado información del Plan Decenal</p>
                          <p className="text-sm mt-1">Esta actividad no está vinculada al Plan Decenal de Educación</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pdm" className="mt-4">
                    <div className="space-y-4">
                      {item.programaPDM ? (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Programa PDM 2024-2027</p>
                              <p className="text-sm text-purple-900 mt-1 font-medium">{item.programaPDM}</p>
                            </div>
                            {item.subprogramaPDM && (
                              <div>
                                <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Subprograma</p>
                                <p className="text-sm text-purple-900 mt-1">{item.subprogramaPDM}</p>
                              </div>
                            )}
                            {item.proyectoPDM && (
                              <div>
                                <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Proyecto/Actividad</p>
                                <p className="text-sm text-purple-900 mt-1">{item.proyectoPDM}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="font-medium">No se ha asignado información del PDM 2024-2027</p>
                          <p className="text-sm mt-1">Esta actividad no está vinculada al Plan de Desarrollo Municipal</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
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
                <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center py-4">
          <p className="text-gray-500">Cargando plan de acción...</p>
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
            Hubo un problema al cargar el plan de acción. Por favor, inténtalo de nuevo.
          </p>
          {refetch && (
            <Button onClick={refetch} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard de estadísticas - Estilo Matriz */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Total Actividades</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Avance Promedio</p>
                <p className="text-2xl font-bold text-green-900">{stats.avancePromedio}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-emerald-200 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-700">Completadas</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.completados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Presupuesto Total</p>
                <p className="text-lg font-bold text-purple-900">{formatCurrency(stats.presupuestoTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de filtros mejorado - Estilo Matriz */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por programa, objetivo, responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white min-w-[180px] h-11"
              >
                <option value="todos">📋 Todos los estados</option>
                <option value="Pendiente">⏳ Pendiente</option>
                <option value="Sin iniciar">🔴 Sin iniciar</option>
                <option value="En Progreso">🔵 En Progreso</option>
                <option value="En progreso">🔵 En progreso</option>
                <option value="Completado">✅ Completado</option>
                <option value="Retrasado">⚠️ Retrasado</option>
              </select>
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="flex items-center gap-2 h-11"
              >
                <X className="h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
          
          {/* Indicadores de filtros activos */}
          {(searchTerm || estadoFilter !== "todos") && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Búsqueda: "{searchTerm}"
                </Badge>
              )}
              {estadoFilter !== "todos" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Estado: {estadoFilter}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de planes con mejor diseño */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay actividades disponibles</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No se encontraron actividades del plan de acción que coincidan con los filtros aplicados. 
                Intente ajustar los criterios de búsqueda o agregue nuevas actividades.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Actividades del Plan de Acción
                </h3>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {data.length} actividad{data.length !== 1 ? 'es' : ''}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                Mostrando {data.length} de {data.length} actividades
              </div>
            </div>
            
            <ScrollArea className="h-[700px] pr-4">
              <div className="space-y-4">
                {data.map((item) => (
                  <PlanCard key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  )
}
