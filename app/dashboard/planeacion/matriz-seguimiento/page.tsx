"use client"

import { useState } from "react"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { RoleGuard } from "@/components/auth/role-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, Eye, LayoutDashboard, Filter, FileCheck, Clock, FolderOpen } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useMatrizSeguimiento } from "@/hooks/use-matriz-seguimiento"
import { TimelineView } from "@/components/dashboard/timeline-view"
import { ChecklistReal } from "@/components/dashboard/checklist-real"
import { DocumentosReport } from "@/components/dashboard/documentos-report"

export default function MatrizSeguimientoPage() {
  const [activeTab, setActiveTab] = useState("matriz")
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("todas")
  const [estadoFilter, setEstadoFilter] = useState("todos")

  const { data: matrizData, isLoading } = useMatrizSeguimiento()

  // Filtrar datos según los criterios
  const filteredData = matrizData.filter((item) => {
    // Filtro de búsqueda con comprobaciones de null/undefined
    const matchesSearch =
      searchTerm === "" ||
      (item.actividad?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.meta?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.responsable?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    // Filtro de área
    const matchesArea = areaFilter === "todas" || item.areaId === areaFilter

    // Filtro de estado
    const matchesEstado = estadoFilter === "todos" || item.estado === estadoFilter

    return matchesSearch && matchesArea && matchesEstado
  })

  // Agrupar datos por área para la vista de áreas
  const dataByArea = matrizData.reduce(
    (acc, item) => {
      if (!acc[item.areaId]) {
        acc[item.areaId] = {
          id: item.areaId,
          name: item.area,
          color: item.color,
          items: [],
          totalPresupuesto: 0,
          avancePromedio: 0,
        }
      }

      acc[item.areaId].items.push(item)
      acc[item.areaId].totalPresupuesto +=
        Number.parseFloat(item.presupuestoDisponible?.replace(/[^0-9.-]+/g, "") || "0") || 0

      return acc
    },
    {} as Record<
      string,
      {
        id: string
        name: string
        color: string
        items: typeof matrizData
        totalPresupuesto: number
        avancePromedio: number
      }
    >,
  )

  // Calcular avance promedio para cada área
  Object.values(dataByArea).forEach((area) => {
    area.avancePromedio =
      area.items.length > 0 ? area.items.reduce((sum, item) => sum + item.avance, 0) / area.items.length : 0
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completado":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Completado
          </Badge>
        )
      case "En progreso":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            En progreso
          </Badge>
        )
      case "Retrasado":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Retrasado
          </Badge>
        )
      case "Pendiente":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            Pendiente
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
            {status}
          </Badge>
        )
    }
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case "orange":
        return "bg-orange-500"
      case "blue":
        return "bg-blue-500"
      case "green":
        return "bg-green-500"
      case "purple":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <RoleGuard allowedRoles={["ADMIN", "PLANEACION"]}>
      <main className="min-h-screen bg-gray-50">
        <ModuleHeader title="MATRIZ DE SEGUIMIENTO" />
        <div className="container mx-auto p-4 md:p-8">
          <div className="pt-2 pb-16 relative z-0">
            <Tabs
              defaultValue="matriz"
              className="w-full relative z-10 mt-2"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4 sticky top-[4.5rem] bg-background/95 backdrop-blur z-20 w-full overflow-x-auto flex-nowrap">
                <TabsTrigger value="matriz" className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Matriz General
                </TabsTrigger>
                <TabsTrigger value="areas" className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Seguimiento por Áreas
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center">
                  <FileCheck className="mr-2 h-4 w-4" />
                  Lista de Chequeo
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Línea de Tiempo
                </TabsTrigger>
                <TabsTrigger value="documentos" className="flex items-center">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Reporte de Documentos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matriz">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileSpreadsheet className="mr-2 h-5 w-5" />
                      Matriz de Seguimiento
                    </CardTitle>
                    <CardDescription>
                      Esta matriz se alimenta de los planes de acción por área de Calidad Educativa, Inspección y
                      Vigilancia, Cobertura e Infraestructura y Talento Humano.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Input
                            placeholder="Buscar por actividad, meta o responsable..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-48">
                          <Select value={areaFilter} onValueChange={setAreaFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Filtrar por área" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todas">Todas las áreas</SelectItem>
                              <SelectItem value="calidad-educativa">Calidad Educativa</SelectItem>
                              <SelectItem value="inspeccion-vigilancia">Inspección y Vigilancia</SelectItem>
                              <SelectItem value="cobertura-infraestructura">Cobertura e Infraestructura</SelectItem>
                              <SelectItem value="talento-humano">Talento Humano</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-48">
                          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todos">Todos los estados</SelectItem>
                              <SelectItem value="Pendiente">Pendiente</SelectItem>
                              <SelectItem value="En progreso">En progreso</SelectItem>
                              <SelectItem value="Completado">Completado</SelectItem>
                              <SelectItem value="Retrasado">Retrasado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredData.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Área</TableHead>
                              <TableHead>No.</TableHead>
                              <TableHead>Meta</TableHead>
                              <TableHead>Actividad</TableHead>
                              <TableHead>Responsable</TableHead>
                              <TableHead>Presupuesto</TableHead>
                              <TableHead>Fecha Inicio</TableHead>
                              <TableHead>Fecha Fin</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Avance</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredData.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-4 ${getColorClass(item.color)} rounded-full`}></div>
                                    <span>{item.area}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{item.numero}</TableCell>
                                <TableCell className="max-w-[150px] truncate">{item.meta}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{item.actividad}</TableCell>
                                <TableCell>{item.responsable}</TableCell>
                                <TableCell>{item.presupuestoDisponible}</TableCell>
                                <TableCell>{item.fechaInicio}</TableCell>
                                <TableCell>{item.fechaFin}</TableCell>
                                <TableCell>{getStatusBadge(item.estado)}</TableCell>
                                <TableCell>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className={`h-2.5 rounded-full ${getColorClass(item.color)}`}
                                      style={{ width: `${item.avance}%` }}
                                    ></div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Link href={`/dashboard/${item.areaId}/plan-accion`}>
                                      <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">
                          No se encontraron actividades que coincidan con los filtros.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("")
                            setAreaFilter("todas")
                            setEstadoFilter("todos")
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="areas">
                <Card>
                  <CardHeader>
                    <CardTitle>Seguimiento por Áreas</CardTitle>
                    <CardDescription>Resumen del avance y presupuesto por área funcional.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : Object.values(dataByArea).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {Object.values(dataByArea).map((area) => (
                          <Link href={`/dashboard/${area.id}/plan-accion`} key={area.id}>
                            <Card className="hover:shadow-md transition-shadow overflow-hidden">
                              <div className={`h-2 ${getColorClass(area.color)}`}></div>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-semibold">{area.name}</h3>
                                  <Badge variant="outline" className={`bg-${area.color}-100 text-${area.color}-800`}>
                                    {area.items.length} actividades
                                  </Badge>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="text-muted-foreground">Avance general:</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div
                                        className={`${getColorClass(area.color)} h-2.5 rounded-full`}
                                        style={{ width: `${area.avancePromedio}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 gap-4">
                                    <div>
                                      <span className="text-sm text-muted-foreground">Estado:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {(() => {
                                          const estados = area.items.reduce(
                                            (acc, item) => {
                                              acc[item.estado] = (acc[item.estado] || 0) + 1
                                              return acc
                                            },
                                            {} as Record<string, number>,
                                          )

                                          return Object.entries(estados).map(([estado, count]) => (
                                            <Badge key={estado} variant="outline" className="text-xs">
                                              {estado}: {count}
                                            </Badge>
                                          ))
                                        })()}
                                      </div>
                                    </div>
                                  </div>

                                  <Button variant="outline" className="w-full mt-2" size="sm">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Plan de Acción
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">No hay datos disponibles para mostrar.</p>
                        <Button variant="outline" asChild>
                          <Link href="/dashboard">Volver al Dashboard</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileCheck className="mr-2 h-5 w-5" />
                      Lista de Chequeo
                    </CardTitle>
                    <CardDescription>
                      Análisis y seguimiento de las listas de chequeo de todas las áreas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChecklistReal />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Línea de Tiempo de Planes de Acción
                    </CardTitle>
                    <CardDescription>
                      Visualización cronológica de los planes de acción de todas las áreas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <TimelineView
                        projects={filteredData.map((item) => ({
                          id: item.id,
                          programa: item.programa || item.actividad || "Sin nombre",
                          objetivo: item.objetivo || item.meta || "Sin objetivo",
                          meta: item.meta || "Sin meta definida",
                          presupuesto: item.presupuesto || item.presupuestoDisponible || "$0",
                          acciones: item.acciones || item.descripcion || "Sin acciones definidas",
                          indicadores: item.indicadores || `Avance: ${item.avance}%`,
                          fechaInicio: item.fechaInicio || "01/01/2025",
                          fechaFin: item.fechaFin || "31/12/2025",
                          estado: item.estado || "Pendiente",
                          area: item.area || "Sin área",
                          color: item.color || "bg-gray-500",
                        }))}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentos">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FolderOpen className="mr-2 h-5 w-5" />
                      Reporte de Documentos
                    </CardTitle>
                    <CardDescription>
                      Análisis y seguimiento de documentos y carpetas en todas las áreas y módulos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentosReport />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </RoleGuard>
  )
}
