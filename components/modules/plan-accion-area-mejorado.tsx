"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  LayoutGrid,
  TableIcon,
  Edit,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getColorClass } from "@/utils/areas"
import type { PlanAccionItem } from "@/types/plan-accion"
import { useDebouncedSearch } from "@/hooks/use-debounced-search"
import { usePlanAccionService } from "@/hooks/use-plan-accion-service"
import { PlanAccionRow } from "@/components/plan-accion/plan-accion-row"
import { PlanAccionToolbar } from "@/components/plan-accion/plan-accion-toolbar"
import { PlanAccionSummary } from "@/components/plan-accion/plan-accion-summary"
import { PlanAccionAddDialog } from "@/components/plan-accion/plan-accion-add-dialog"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Papa from "papaparse"

/**
 * Props para el componente PlanAccionAreaMejorado
 */
interface PlanAccionAreaMejoradoProps {
  /** Título del componente */
  title: string
  /** Descripción opcional */
  description?: string
  /** ID del área */
  area: string
  /** Color del componente */
  color?: "blue" | "green" | "orange" | "purple" | "default"
  /** Elementos iniciales */
  initialItems?: PlanAccionItem[]
  /** Callback cuando cambian los elementos */
  onItemsChange?: (items: PlanAccionItem[]) => void
}

/**
 * Componente mejorado para gestionar planes de acción por área con estética moderna
 */
export default function PlanAccionAreaMejorado({
  title,
  description,
  area,
  color = "orange",
  initialItems = [],
  onItemsChange,
}: PlanAccionAreaMejoradoProps) {
  // Estado local
  const [planAccionItems, setPlanAccionItems] = useState<PlanAccionItem[]>(initialItems)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [editingItem, setEditingItem] = useState<PlanAccionItem | null>(null)
  const [isLoadingTooLong, setIsLoadingTooLong] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards")
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"general" | "decenal" | "pdm">("general")
  const dataFetchedRef = useRef(false)

  // Hooks personalizados
  const { isLoading, error, areaId, addPlanAccion, updatePlanAccion, deletePlanAccion, loadPlanesAccion } =
    usePlanAccionService(area)

  // Debug: monitorear estado del modal
  useEffect(() => {
    console.log("📊 Estado modal:", { isDialogOpen, dialogMode, editingItem: editingItem?.id })
  }, [isDialogOpen, dialogMode, editingItem])

  // Función de búsqueda para el hook de búsqueda debounced
  const searchPredicate = useCallback((item: PlanAccionItem, term: string) => {
    return (
      item.programa.toLowerCase().includes(term) ||
      item.objetivo.toLowerCase().includes(term) ||
      item.meta.toLowerCase().includes(term) ||
      (item.responsable?.toLowerCase() || "").includes(term)
    )
  }, [])

  // Hook de búsqueda con debounce
  const { searchTerm: debouncedSearchTerm, filteredItems, handleSearchChange } = useDebouncedSearch(planAccionItems, searchPredicate)

  // Filtrar datos según los criterios
  const filteredData = useMemo(() => {
    return planAccionItems.filter((item) => {
      // Filtro de búsqueda
      const matchesSearch =
        searchTerm === "" ||
        (item.programa?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.objetivo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.responsable?.toLowerCase() || "").includes(searchTerm.toLowerCase())

      // Filtro de estado
      const matchesEstado = estadoFilter === "todos" || item.estado === estadoFilter

      return matchesSearch && matchesEstado
    })
  }, [planAccionItems, searchTerm, estadoFilter])

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (isLoading || !filteredData || filteredData.length === 0) {
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

    const completados = filteredData.filter(item => item.estado === "Completado").length
    const enProceso = filteredData.filter(item => item.estado === "En Progreso" || item.estado === "En progreso").length
    const pendientes = filteredData.filter(item => item.estado === "Pendiente" || item.estado === "Sin iniciar").length
    const retrasados = filteredData.filter(item => item.estado === "Retrasado").length
    
    const presupuestoTotal = filteredData.reduce((sum, item) => {
      const presupuesto = parseFloat(item.presupuesto?.replace(/[^\d]/g, '') || '0')
      return sum + presupuesto
    }, 0)

    const avancePromedio = filteredData.length > 0 ? Math.round(
      filteredData.reduce((sum, item) => sum + (item.porcentajeAvance || 0), 0) / filteredData.length
    ) : 0

    return {
      total: filteredData.length,
      completados,
      enProceso,
      pendientes,
      retrasados,
      presupuestoTotal,
      avancePromedio
    }
  }, [filteredData, isLoading])

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (dataFetchedRef.current || !areaId) return

    const fetchData = async () => {
      try {
        dataFetchedRef.current = true
        const items = await loadPlanesAccion()
        setPlanAccionItems(items)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }

    fetchData()
  }, [loadPlanesAccion, areaId])

  // Notificar cambios al componente padre
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(planAccionItems)
    }
  }, [planAccionItems, onItemsChange])

  // Manejar timeout de carga larga
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoadingTooLong(true)
      }, 10000) // 10 segundos

      return () => clearTimeout(timer)
    } else {
      setIsLoadingTooLong(false)
    }
  }, [isLoading])

  // Handlers
  const handleAddItem = useCallback(async (newItem: Omit<PlanAccionItem, "id">) => {
    try {
      const savedItem = await addPlanAccion(newItem as PlanAccionItem)
      if (savedItem) {
        setPlanAccionItems(prev => [...prev, savedItem])
      }
    } catch (error) {
      console.error("Error al añadir elemento:", error)
    }
  }, [addPlanAccion])

  const handleEditItem = useCallback((item: PlanAccionItem) => {
    console.log("🔄 EDITANDO ITEM:", item.programa, item.id)
    setEditingItem(item)
    setDialogMode("edit")
    setIsDialogOpen(true)
    console.log("🔄 MODAL ABIERTO EN MODO EDICIÓN")
  }, [])

  const handleEditDialogClose = useCallback((open: boolean) => {
    console.log("🔄 Cerrando modal:", open)
    setIsDialogOpen(open)
    if (!open) {
      setEditingItem(null)
      setDialogMode("add")
    }
  }, [])

  const handleUpdateItem = useCallback(async (updatedItem: PlanAccionItem) => {
    try {
      const result = await updatePlanAccion(updatedItem.id, updatedItem)
      if (result) {
        setPlanAccionItems(prev => prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ))
        setIsDialogOpen(false)
        setEditingItem(null)
        setDialogMode("add")
      }
    } catch (error) {
      console.error("Error al actualizar elemento:", error)
    }
  }, [updatePlanAccion])

  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      await deletePlanAccion(id)
      setPlanAccionItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error("Error al eliminar elemento:", error)
    }
  }, [deletePlanAccion])

  const handleClearFilters = () => {
    setSearchTerm("")
    setEstadoFilter("todos")
  }

  // Exportar a CSV
  const handleExportCSV = useCallback(() => {
    const csvData = planAccionItems.map(item => ({
      Programa: item.programa,
      Objetivo: item.objetivo,
      Meta: item.meta,
      Presupuesto: item.presupuesto,
      Acciones: item.acciones,
      Indicadores: item.indicadores,
      PorcentajeAvance: item.porcentajeAvance,
      FechaInicio: item.fechaInicio,
      FechaFin: item.fechaFin,
      Responsable: item.responsable,
      Estado: item.estado,
      PlanDecenal: item.metaDecenal,
      MacroobjetivoDecenal: item.macroobjetivoDecenal,
      ObjetivoDecenal: item.objetivoDecenal,
      ProgramaPDM: item.programaPDM,
      SubprogramaPDM: item.subprogramaPDM,
      ProyectoPDM: item.proyectoPDM,
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `plan-accion-${area}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [planAccionItems, area])

  // Formatear presupuesto
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Obtener color por estado
  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "completado":
        return "bg-green-200 border-green-300"
      case "en progreso":
      case "en proceso":
        return "bg-blue-200 border-blue-300"
      case "pendiente":
      case "sin iniciar":
        return "bg-yellow-200 border-yellow-300"
      case "retrasado":
        return "bg-red-200 border-red-300"
      default:
        return "bg-gray-200 border-gray-300"
    }
  }

  // Obtener color para barra de progreso
  const getProgressColor = (estado: string) => {
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
                {item.estado === "Completado" && <CheckCircle2 className="h-6 w-6 text-green-800" />}
                {(item.estado === "En Progreso" || item.estado === "En progreso") && <Clock className="h-6 w-6 text-blue-800" />}
                {(item.estado === "Pendiente" || item.estado === "Sin iniciar") && <AlertCircle className="h-6 w-6 text-yellow-800" />}
                {item.estado === "Retrasado" && <X className="h-6 w-6 text-red-800" />}
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
                      className={cn("h-2 rounded-full", getProgressColor(item.estado))}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditItem(item)}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteItem(item.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                    <TabsTrigger value="general" className="text-xs">📋 General</TabsTrigger>
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

  // Crear clases de color simples
  const colorClasses = useMemo(() => {
    switch (color) {
      case "blue":
        return "bg-blue-500 text-white"
      case "green":
        return "bg-green-500 text-white"
      case "orange":
        return "bg-orange-500 text-white"
      case "purple":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }, [color])

  // Mostrar mensaje si no se puede determinar el ID del área
  if (!areaId && !isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className={`pb-3 ${colorClasses} bg-opacity-10`}>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="text-foreground/70">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se ha podido determinar el ID del área. Por favor, verifique que el área existe en la base de datos.
            </AlertDescription>
          </Alert>
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
                  <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="ml-4 space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center py-4">
          <p className="text-gray-500">Cargando plan de acción...</p>
          {isLoadingTooLong && (
            <div className="mt-4">
              <p className="text-sm text-red-500 mb-2">La carga está tardando más de lo esperado.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm"
              >
                Recargar página
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Mostrar estado de error
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className={`pb-3 ${colorClasses} bg-opacity-10`}>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="text-foreground/70">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className={`pb-3 ${colorClasses} bg-opacity-10 border-l-4 border-l-primary`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-3 ${colorClasses}`}>
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
              {description && <CardDescription className="text-foreground/70 mt-1">{description}</CardDescription>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              onClick={() => setViewMode("cards")}
              size="sm"
              className={`flex items-center gap-2 ${
                viewMode === "cards" ? "text-white" : "text-gray-900"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Tarjetas
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              onClick={() => setViewMode("table")}
              size="sm"
              className={`flex items-center gap-2 ${
                viewMode === "table" ? "text-white" : "text-gray-900"
              }`}
            >
              <TableIcon className="h-4 w-4" />
              Tabla
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {viewMode === "cards" ? (
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

            {/* Panel de filtros mejorado */}
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
                      onClick={() => {
                        setDialogMode("add")
                        setEditingItem(null)
                        setIsDialogOpen(true)
                      }}
                      className="flex items-center gap-2 h-11"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 h-11"
                    >
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleClearFilters}
                      className="flex items-center gap-2 h-11"
                    >
                      <X className="h-4 w-4" />
                      Limpiar
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
              {filteredData.length === 0 ? (
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
                        {filteredData.length} actividad{filteredData.length !== 1 ? 'es' : ''}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      Mostrando {filteredData.length} de {filteredData.length} actividades
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[700px] pr-4">
                    <div className="space-y-4">
                      {filteredData.map((item) => (
                        <PlanCard key={item.id} item={item} />
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Barra de herramientas para tabla */}
            <PlanAccionToolbar
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              onAddClick={() => {
                setDialogMode("add")
                setEditingItem(null)
                setIsDialogOpen(true)
              }}
              onExportClick={handleExportCSV}
            />

            {/* Tabla de planes de acción */}
            <ScrollArea className="h-[600px] w-full border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Programa</TableHead>
                    <TableHead>Plan Decenal</TableHead>
                    <TableHead>Macroobjetivo</TableHead>
                    <TableHead>Objetivo Decenal</TableHead>
                    <TableHead>Objetivo</TableHead>
                    <TableHead>Meta</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Acciones</TableHead>
                    <TableHead>Indicadores</TableHead>
                    <TableHead>% Avance</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Programa PDM 2024-2027</TableHead>
                    <TableHead>Subprograma PDM 2024-2027</TableHead>
                    <TableHead>Proyecto/Actividad PDM</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <PlanAccionRow key={item.id} item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={18} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileSpreadsheet className="mb-2 h-10 w-10" />
                          <p className="text-lg font-medium">No hay datos disponibles</p>
                          <p className="text-sm">Añada elementos</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Resumen de datos */}
            <PlanAccionSummary items={planAccionItems} />
          </div>
        )}

        {/* Diálogo unificado para añadir/editar elemento */}
        <PlanAccionAddDialog
          key={`dialog-${dialogMode}-${editingItem?.id || 'new'}`}
          open={isDialogOpen}
          onOpenChange={handleEditDialogClose}
          onSubmit={dialogMode === "edit" ? handleUpdateItem : handleAddItem}
          isSubmitting={isLoading}
          initialItem={editingItem}
          mode={dialogMode}
        />
      </CardContent>
    </Card>
  )
}

export { PlanAccionAreaMejorado }
