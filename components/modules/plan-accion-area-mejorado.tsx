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
  Trash2,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getColorClass } from "@/utils/areas"
import type { PlanAccionItem } from "@/types/plan-accion"
import { useDebouncedSearch } from "@/hooks/use-debounced-search"
import { usePlanAccionService } from "@/hooks/use-plan-accion-service"
import { useOptimizedStats } from "@/hooks/use-optimized-stats"
import { PlanAccionRow } from "@/components/plan-accion/plan-accion-row"
import { PlanAccionToolbar } from "@/components/plan-accion/plan-accion-toolbar"
import { PlanAccionSummary } from "@/components/plan-accion/plan-accion-summary"
import { PlanAccionAddDialog } from "@/components/plan-accion/plan-accion-add-dialog"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingProgress } from "@/components/ui/loading-progress"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { usePagination } from "@/hooks/use-pagination"
import Papa from "papaparse"
import * as XLSX from 'xlsx'

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [editingItem, setEditingItem] = useState<PlanAccionItem | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards")
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"general" | "demografica" | "decenal" | "pdm">("general")
  const dataFetchedRef = useRef(false)

  // Hooks personalizados
  const { 
    items: planAccionItemsFromService, // 🔥 USAR items del servicio directamente
    isLoading, 
    error, 
    areaId, 
    addPlanAccion, 
    updatePlanAccion, 
    deletePlanAccion, 
    loadPlanesAccion,
    progress,
    stage,
    isLoadingTooLong,
    retryCount,
    retry
  } = usePlanAccionService(area)
  
  // 🔥 USAR items del servicio que se actualizan automáticamente vía suscripción
  const planAccionItems = planAccionItemsFromService
  
  // 🔍 DEBUG: Monitorear cambios en items
  useEffect(() => {
    console.log("🔄 planAccionItems actualizados:", {
      count: planAccionItems.length,
      items: planAccionItems.map(item => ({
        id: item.id,
        programa: item.programa,
        metaDecenal: item.metaDecenal,
        programaPDM: item.programaPDM
      }))
    })
  }, [planAccionItems])
  
  // Hook optimizado para estadísticas
  const { 
    stats: optimizedStats, 
    isLoading: statsLoading, 
    refresh: refreshStats 
  } = useOptimizedStats(areaId)
  
  // 🔥 PAGINACIÓN LOCAL (en lugar de queries separadas a BD)
  const ITEMS_PER_PAGE = 20
  const [currentPage, setCurrentPage] = useState(1)
  
  // Calcular paginación local sobre datos ya transformados
  const totalPages = Math.ceil(planAccionItems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedItems = planAccionItems.slice(startIndex, endIndex)
  
  // Usar datos paginados localmente (YA transformados a camelCase)
  const displayData = paginatedItems
  
  // Funciones de paginación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  
  const pagination = {
    currentPage,
    pageSize: ITEMS_PER_PAGE,
    totalItems: planAccionItems.length,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  }

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
    // Siempre usar planAccionItems como fuente (ya transformados)
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

  // Usar estadísticas optimizadas o calcular localmente como fallback
  const stats = useMemo(() => {
    // Si tenemos estadísticas optimizadas y no están cargando, usarlas
    if (!statsLoading && optimizedStats && optimizedStats.total > 0) {
      return optimizedStats
    }
    
    // Fallback: calcular estadísticas localmente para datos filtrados
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
  }, [filteredData, isLoading, optimizedStats, statsLoading])

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (dataFetchedRef.current || !areaId) return

    const fetchData = async () => {
      try {
        dataFetchedRef.current = true
        // 🔥 Ya no necesitamos setPlanAccionItems, los items vienen automáticamente del servicio
        await loadPlanesAccion()
        console.log("✅ Datos cargados desde usePlanAccionService")
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

  // El timeout de carga larga ahora se maneja en usePlanAccionService

  // Handlers
  const handleAddItem = useCallback(async (newItem: Omit<PlanAccionItem, "id">) => {
    try {
      console.log("➕ AÑADIENDO NUEVO ITEM:", newItem.programa)
      const savedItem = await addPlanAccion(newItem as PlanAccionItem)
      if (savedItem) {
        console.log("✅ ITEM AÑADIDO EXITOSAMENTE")
        // 🔥 Ya no necesitamos setPlanAccionItems
        // El servicio actualiza automáticamente los items vía suscripción
        
        // Cerrar el diálogo
        setTimeout(() => {
          setIsDialogOpen(false)
          setDialogMode("add")
        }, 100)
        
        // Refrescar estadísticas optimizadas
        refreshStats()
        
        console.log("✅ UI SE ACTUALIZARÁ AUTOMÁTICAMENTE VÍA SUSCRIPCIÓN")
      }
    } catch (error) {
      console.error("❌ Error al añadir elemento:", error)
    }
  }, [addPlanAccion, refreshStats])

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
      console.log("🔄 ACTUALIZANDO ITEM:", updatedItem.programa, updatedItem.id)
      const result = await updatePlanAccion(updatedItem.id, updatedItem)
      if (result) {
        console.log("✅ ITEM ACTUALIZADO EXITOSAMENTE")
        // 🔥 Ya no necesitamos setPlanAccionItems
        // El servicio actualiza automáticamente los items vía suscripción
        
        // Cerrar el diálogo y limpiar estados
        setTimeout(() => {
          setIsDialogOpen(false)
          setEditingItem(null)
          setDialogMode("add")
        }, 100)
        
        // Refrescar estadísticas optimizadas
        refreshStats()
        
        console.log("✅ UI SE ACTUALIZARÁ AUTOMÁTICAMENTE VÍA SUSCRIPCIÓN")
      }
    } catch (error) {
      console.error("❌ Error al actualizar elemento:", error)
    }
  }, [updatePlanAccion, refreshStats])

  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      console.log("🗑️ ELIMINANDO ITEM:", id)
      await deletePlanAccion(id)
      console.log("✅ ITEM ELIMINADO EXITOSAMENTE")
      
      // 🔥 Ya no necesitamos setPlanAccionItems
      // El servicio actualiza automáticamente los items vía suscripción
      console.log("✅ UI SE ACTUALIZARÁ AUTOMÁTICAMENTE VÍA SUSCRIPCIÓN")
      
      // Refrescar estadísticas optimizadas
      refreshStats()
      
      console.log("✅ UI ACTUALIZADA DESPUÉS DE ELIMINACIÓN")
    } catch (error) {
      console.error("❌ Error al eliminar elemento:", error)
    }
  }, [deletePlanAccion, refreshStats])

  // Limpiar cache y recargar datos frescos
  const handleClearCacheAndReload = useCallback(() => {
    console.log('🧹 Limpiando TODOS los caches...')
    
    // Limpiar TODO el localStorage relacionado con queries y paginación
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('_page_') || 
        key.includes('pagination_') || 
        key.includes('query_cache_') || 
        key.includes('_paginated') ||
        key.startsWith('v') ||
        key.includes('plan_accion')
      )) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`  ❌ Eliminada: ${key}`)
    })
    console.log(`✅ Cache limpiado - ${keysToRemove.length} claves eliminadas`)
    
    // Actualizar versión de cache
    const CACHE_VERSION = 3 // Incrementado para invalidar todo
    localStorage.setItem('pagination_cache_version', String(CACHE_VERSION))
    localStorage.setItem('query_cache_version', String(CACHE_VERSION))
    
    // Recargar la página para forzar carga fresca
    console.log('🔄 Recargando página...')
    window.location.reload()
  }, [])

  const handleClearFilters = () => {
    setSearchTerm("")
    setEstadoFilter("todos")
  }

  // Exportar a Excel
  const handleExportExcel = useCallback(() => {
    // Preparar los datos para Excel con columnas separadas
    const excelData = planAccionItems.map((item, index) => ({
      "N°": index + 1,
      "Programa": item.programa || '',
      "Objetivo": item.objetivo || '',
      "Meta": item.meta || '',
      "Presupuesto": item.presupuesto || 0,
      "Acciones": item.acciones || '',
      "Indicadores": item.indicadores || '',
      "Porcentaje de Avance": `${item.porcentajeAvance || 0}%`,
      "Fecha de Inicio": item.fechaInicio || '',
      "Fecha de Fin": item.fechaFin || '',
      "Responsable": item.responsable || '',
      "Estado": item.estado || '',
      "Plan Decenal": item.metaDecenal || '',
      "Macroobjetivo Decenal": item.macroobjetivoDecenal || '',
      "Objetivo Decenal": item.objetivoDecenal || '',
      "Programa PDM": item.programaPDM || '',
      "Subprograma PDM": item.subprogramaPDM || '',
      "Proyecto PDM": item.proyectoPDM || ''
    }))

    // Crear el libro de trabajo de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    
    // Configurar el ancho de las columnas
    const columnWidths = [
      { wch: 5 },   // N°
      { wch: 30 },  // Programa
      { wch: 40 },  // Objetivo
      { wch: 30 },  // Meta
      { wch: 15 },  // Presupuesto
      { wch: 30 },  // Acciones
      { wch: 25 },  // Indicadores
      { wch: 15 },  // Porcentaje de Avance
      { wch: 15 },  // Fecha de Inicio
      { wch: 15 },  // Fecha de Fin
      { wch: 20 },  // Responsable
      { wch: 15 },  // Estado
      { wch: 25 },  // Plan Decenal
      { wch: 30 },  // Macroobjetivo Decenal
      { wch: 25 },  // Objetivo Decenal
      { wch: 20 },  // Programa PDM
      { wch: 20 },  // Subprograma PDM
      { wch: 20 }   // Proyecto PDM
    ]
    
    worksheet['!cols'] = columnWidths
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plan de Acción')
    
    // Generar el archivo y descargarlo
    const fileName = `plan-accion-${area}-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }, [planAccionItems, area])

  // Formatear presupuesto
  const formatCurrency = (amount: number) => {
    // Formatear con puntos como separadores de miles (formato colombiano)
    const formatted = amount.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `$${formatted}`;
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
    
    // 🔍 DEBUG: Ver qué datos tiene el item
    useEffect(() => {
      console.log("📊 PlanCard - Item data:", {
        id: item.id,
        programa: item.programa,
        metaDecenal: item.metaDecenal,
        macroobjetivoDecenal: item.macroobjetivoDecenal,
        objetivoDecenal: item.objetivoDecenal,
        programaPDM: item.programaPDM,
        subprogramaPDM: item.subprogramaPDM,
        proyectoPDM: item.proyectoPDM,
        allFields: item
      })
    }, [item])

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
                      {item.zona || item.grupoEtnico || item.grupoEtareo || item.grupoPoblacion || item.cantidad ? (
                        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Zona</p>
                              <p className="text-sm text-teal-900 mt-1">{item.zona || "No especificada"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Grupo Étnico</p>
                              <p className="text-sm text-teal-900 mt-1">{item.grupoEtnico || "No especificado"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Grupo Etáreo</p>
                              <p className="text-sm text-teal-900 mt-1">{item.grupoEtareo || "No especificado"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Grupo de Población</p>
                              <p className="text-sm text-teal-900 mt-1">{item.grupoPoblacion || "No especificado"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Cantidad</p>
                              <p className="text-sm text-teal-900 mt-1 font-medium">
                                {item.cantidad 
                                  ? (typeof item.cantidad === 'number' 
                                      ? (item.cantidad as number).toLocaleString() 
                                      : Number(item.cantidad).toLocaleString()) 
                                  : "No especificada"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="font-medium">No se ha registrado información demográfica</p>
                          <p className="text-sm mt-1">Puede agregar esta información editando el plan de acción</p>
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

  // Mostrar estado de carga con indicador mejorado
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header del módulo */}
        <Card className="w-full">
          <CardHeader className={`pb-3 ${colorClasses} bg-opacity-10 border-l-4 border-l-primary`}>
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${colorClasses}`}>
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
                {description && <CardDescription className="text-foreground/70 mt-1">{description}</CardDescription>}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Indicador de progreso mejorado */}
        <LoadingProgress
          isLoading={isLoading}
          progress={progress}
          stage={stage}
          isLoadingTooLong={isLoadingTooLong}
          retryCount={retryCount}
          error={error}
          onRetry={retry}
        />

        {/* Dashboard de estadísticas - skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                  <div className="ml-4 space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="h-6 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Skeleton para contenido principal */}
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar estado de error
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        {/* Header del módulo */}
        <Card className="w-full">
          <CardHeader className={`pb-3 ${colorClasses} bg-opacity-10 border-l-4 border-l-primary`}>
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${colorClasses}`}>
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
                {description && <CardDescription className="text-foreground/70 mt-1">{description}</CardDescription>}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Indicador de error mejorado */}
        <LoadingProgress
          isLoading={false}
          progress={0}
          stage="Error"
          error={error}
          onRetry={retry}
          retryCount={retryCount}
        />
      </div>
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
              variant="outline"
              onClick={handleClearCacheAndReload}
              size="sm"
              className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
              title="Limpiar caché y recargar datos frescos desde la base de datos"
            >
              <RefreshCw className="h-4 w-4" />
              Limpiar Caché
            </Button>
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
                      onClick={handleExportExcel}
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
              onExportClick={handleExportExcel}
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

        {/* Controles de paginación (siempre mostrar si hay más de 1 página) */}
        {totalPages > 1 && (
          <div className="mt-6">
            <PaginationControls
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalItems: pagination.totalItems,
                itemsPerPage: pagination.pageSize,
                hasNextPage: pagination.hasNextPage,
                hasPreviousPage: pagination.hasPreviousPage
              }}
              onPageChange={goToPage}
              onPageSizeChange={() => {}} // No soportado en paginación local simple
              isLoading={isLoading}
              showItemInfo={true}
              showPageSizeSelector={true}
              showQuickNavigation={true}
            />
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
