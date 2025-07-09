"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, CheckCircle2, Clock, AlertCircle, X } from "lucide-react"
import { getColorClass } from "@/utils/areas"
import { EstadoSelect } from "@/components/matriz/estado-select"
import { ErrorState } from "@/components/matriz/error-state"
import { EmptyState } from "@/components/matriz/empty-state"
import { ValidacionBadge } from "@/components/matriz/validacion-badge"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import type { MatrizSeguimientoItem } from "@/hooks/use-matriz-seguimiento"
import { useValidaciones } from "@/hooks/use-plan-validaciones"
import { calculateStats, formatCurrency } from "@/utils/plan-accion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MatrizGeneralTabProps {
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

export function MatrizGeneralTab({
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
}: MatrizGeneralTabProps) {
  
  // Hook para manejar las validaciones
  const { 
    isAdmin, 
    validarPlan, 
    loading: validacionLoading 
  } = useValidaciones({ refetchMatriz: refetch })

  const columns: ColumnDef<MatrizSeguimientoItem>[] = [
    {
      accessorKey: "metaDecenal",
      header: "Plan Decenal",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("metaDecenal") || ""}>
          {row.getValue("metaDecenal") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "macroobjetivoDecenal",
      header: "Macroobjetivo",
      cell: ({ row }) => {
        const macroobjetivo = row.getValue("macroobjetivoDecenal") as string
        // Mostrar solo la primera línea para mejor legibilidad
        const firstLine = macroobjetivo?.split("\n")[0] || "-"
        return (
          <div className="max-w-[200px] truncate" title={macroobjetivo || ""}>
            {firstLine}
          </div>
        )
      },
    },
    {
      accessorKey: "objetivoDecenal",
      header: "Objetivo Decenal",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("objetivoDecenal") || ""}>
          {row.getValue("objetivoDecenal") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "area",
      header: "Área",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-4 ${getColorClass(row.original.color)} rounded-full`} aria-hidden="true"></div>
          <span>{row.getValue("area")}</span>
        </div>
      ),
    },
    {
      accessorKey: "programa",
      header: "Programa",
    },
    {
      accessorKey: "meta",
      header: "Meta",
    },
    {
      accessorKey: "acciones",
      header: "Actividad",
    },
    {
      accessorKey: "responsable",
      header: "Responsable",
    },
    {
      accessorKey: "presupuesto",
      header: "Presupuesto",
    },
    {
      accessorKey: "fechaInicio",
      header: "Fecha Inicio",
    },
    {
      accessorKey: "fechaFin",
      header: "Fecha Fin",
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <EstadoSelect 
          planId={row.original.id}
          currentEstado={row.getValue("estado")}
          onEstadoChange={updatePlanEstado}
        />
      ),
    },
    {
      accessorKey: "avance",
      header: "Avance",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium text-center">{row.original.avance}%</div>
          <div
            className="w-full bg-gray-200 rounded-full h-2.5"
            role="progressbar"
            aria-valuenow={row.original.avance}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-2.5 rounded-full ${getColorClass(row.original.color)}`}
              style={{ width: `${row.original.avance}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "validacion",
      header: "Validación",
      cell: ({ row }) => (
        <ValidacionBadge
          planId={row.original.id}
          validacion={row.original.validacion}
          isAdmin={isAdmin}
          onValidar={validarPlan}
          loading={validacionLoading}
        />
      ),
    },
  ]

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Calcular el avance promedio directamente de los datos de la matriz
  const avancePromedio = useMemo(() => {
    if (data.length === 0) return 0
    const totalAvance = data.reduce((sum, item) => sum + (item.avance || 0), 0)
    return Math.round(totalAvance / data.length)
  }, [data])

  // Calcular estadísticas específicas para la matriz
  const stats = useMemo(() => {
    if (data.length === 0) return {
      total: 0,
      completados: 0,
      enProceso: 0,
      pendientes: 0,
      retrasados: 0,
      presupuestoTotal: 0,
    }

    const completados = data.filter(item => item.estado === "Completado").length
    const enProceso = data.filter(item => item.estado === "En Proceso").length
    const pendientes = data.filter(item => item.estado === "Pendiente").length
    const retrasados = data.filter(item => item.estado === "Retrasado").length
    
    // Calcular presupuesto total
    const presupuestoTotal = data.reduce((sum, item) => {
      const presupuesto = item.presupuesto
      if (presupuesto && typeof presupuesto === 'string') {
        // Extraer número del formato de presupuesto (ej: "$1,000,000" -> 1000000)
        const numero = Number.parseFloat(presupuesto.replace(/[^0-9.-]+/g, "")) || 0
        return sum + numero
      }
      return sum
    }, 0)

    return {
      total: data.length,
      completados,
      enProceso,
      pendientes,
      retrasados,
      presupuestoTotal,
    }
  }, [data])

  // Determinar el color del avance promedio
  const getAvanceColor = (avance: number) => {
    if (avance >= 75) return "bg-green-500"
    if (avance >= 50) return "bg-blue-500"
    if (avance >= 25) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Obtener conteos por estado
  const estadosCount = useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach((item) => {
      const estado = item.estado || "Pendiente"
      counts[estado] = (counts[estado] || 0) + 1
    })
    return counts
  }, [data])

  // Obtener color por estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 text-green-800 border-green-200"
      case "En progreso":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Retrasado":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Obtener icono por estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Completado":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "En progreso":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "Pendiente":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Retrasado":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // Extraer áreas únicas de los datos
  const uniqueAreas = useMemo(() => {
    const areas = new Map<string, { id: string; name: string; color: string }>()
    data.forEach((item) => {
      if (item.areaId && item.area && !areas.has(item.areaId)) {
        areas.set(item.areaId, {
          id: item.areaId,
          name: item.area,
          color: item.color || "gray",
        })
      }
    })
    return Array.from(areas.values())
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="mr-2 h-5 w-5" aria-hidden="true" />
          Matriz de Seguimiento
        </CardTitle>
        <CardDescription>
          Esta matriz se alimenta de los planes de acción por área de Calidad Educativa, Inspección y Vigilancia,
          Cobertura e Infraestructura y Talento Humano.
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          {areaFilter !== "todas" && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-1"
              onClick={() => setAreaFilter("todas")}
            >
              <X className="h-3 w-3" />
              Limpiar filtro
            </Badge>
          )}
          {uniqueAreas.map((area) => (
            <Badge
              key={area.id}
              variant={areaFilter === area.id ? "default" : "outline"}
              className={cn(
                "cursor-pointer hover:bg-primary/10 transition-colors",
                areaFilter === area.id ? "bg-primary" : "",
              )}
              onClick={() => setAreaFilter(area.id)}
            >
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 ${getColorClass(area.color)} rounded-full`} aria-hidden="true"></div>
                <span>{area.name}</span>
              </div>
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-20" aria-live="polite" aria-busy="true">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" role="status"></div>
            <span className="sr-only">Cargando datos de la matriz...</span>
          </div>
        ) : isError ? (
          <ErrorState
            message={`Error al cargar la matriz de seguimiento: ${error?.message || "Ocurrió un problema al obtener los datos"}`}
            onRetry={() => refetch()}
          />
        ) : data.length > 0 ? (
          <>
            <div className="overflow-x-auto mb-8">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="border-2 border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary">Presupuesto Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary animate-pulse">
                    {formatCurrency(stats.presupuestoTotal)}
                  </div>
                  <p className="text-sm text-muted-foreground">Suma de todas las actividades</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary">Avance Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="text-3xl font-bold text-primary">{avancePromedio}%</div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`absolute left-0 top-0 h-full ${getAvanceColor(avancePromedio)} transition-all duration-1000 ease-in-out`}
                        style={{ width: `${avancePromedio}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Promedio de {data.length} actividades</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary">Distribución por Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {Object.entries(estadosCount).map(([estado, count]) => (
                      <div key={estado} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(estado)}
                          <span>{estado}</span>
                        </div>
                        <Badge
                          className={cn("transition-all duration-300 group-hover:scale-110", getEstadoColor(estado))}
                        >
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <EmptyState
            message="No se encontraron actividades que coincidan con los filtros."
            onClearFilters={handleClearFilters}
          />
        )}
      </CardContent>
    </Card>
  )
}
