"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDocumentosReport } from "@/hooks/use-documentos-report"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { FileText, Folder, HardDrive, Calendar, BarChart2 } from "lucide-react"

export function DocumentosReport() {
  const { report, isLoading } = useDocumentosReport()
  const [activeTab, setActiveTab] = useState("resumen")
  const [areaFilter, setAreaFilter] = useState("todas")
  const [moduleFilter, setModuleFilter] = useState("todos")

  // Filtrar estadísticas según los filtros seleccionados
  const filteredStats = report.stats.filter((stat) => {
    const matchesArea = areaFilter === "todas" || stat.areaId === areaFilter
    const matchesModule = moduleFilter === "todos" || stat.moduleType === moduleFilter
    return matchesArea && matchesModule
  })

  // Preparar datos para gráficos
  const areaChartData = Object.entries(report.byArea).map(([areaId, data]) => ({
    name:
      areaId === "calidad-educativa"
        ? "Calidad Ed."
        : areaId === "inspeccion-vigilancia"
          ? "Insp. y Vig."
          : areaId === "cobertura-infraestructura"
            ? "Cob. e Infr."
            : "Talento H.",
    documentos: data.totalDocuments,
    carpetas: data.totalFolders,
    tamaño: Math.round((data.totalSize / 1024 / 1024) * 100) / 100, // Convertir a MB con 2 decimales
  }))

  const moduleChartData = Object.entries(report.byModule).map(([moduleType, data]) => ({
    name: moduleType === "proveedores" ? "Proveedores" : "Prestación",
    documentos: data.totalDocuments,
    carpetas: data.totalFolders,
    tamaño: Math.round((data.totalSize / 1024 / 1024) * 100) / 100, // Convertir a MB con 2 decimales
  }))

  // Colores para los gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  // Función para formatear bytes en una unidad legible
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  // Función para formatear fechas
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="resumen" className="flex items-center">
                <BarChart2 className="mr-2 h-4 w-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="areas" className="flex items-center">
                <Folder className="mr-2 h-4 w-4" />
                Por Área
              </TabsTrigger>
              <TabsTrigger value="detalle" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Detalle
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los módulos</SelectItem>
                <SelectItem value="proveedores">Proveedores</SelectItem>
                <SelectItem value="prestacion-servicio">Prestación de Servicio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {activeTab === "resumen" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Documentos</p>
                    <h3 className="text-2xl font-bold">{report.totalDocuments}</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Carpetas</p>
                    <h3 className="text-2xl font-bold">{report.totalFolders}</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Folder className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Espacio Utilizado</p>
                    <h3 className="text-2xl font-bold">{formatBytes(report.totalSize)}</h3>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <HardDrive className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Promedio por Área</p>
                    <h3 className="text-2xl font-bold">{Math.round(report.totalDocuments / 4)}</h3>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Área</CardTitle>
                <CardDescription>Distribución de documentos entre las diferentes áreas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={areaChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="documentos" name="Documentos" fill="#8884d8" />
                      <Bar dataKey="carpetas" name="Carpetas" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentos por Módulo</CardTitle>
                <CardDescription>Comparación entre módulos de Proveedores y Prestación de Servicio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Proveedores", value: report.byModule.proveedores.totalDocuments },
                          { name: "Prestación", value: report.byModule["prestacion-servicio"].totalDocuments },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: "Proveedores", value: report.byModule.proveedores.totalDocuments },
                          { name: "Prestación", value: report.byModule["prestacion-servicio"].totalDocuments },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} documentos`, "Cantidad"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "areas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(report.byArea).map(([areaId, data]) => (
            <Card key={areaId} className={areaId === areaFilter || areaFilter === "todas" ? "" : "hidden"}>
              <CardHeader className="pb-2">
                <CardTitle>
                  {areaId === "calidad-educativa"
                    ? "Calidad Educativa"
                    : areaId === "inspeccion-vigilancia"
                      ? "Inspección y Vigilancia"
                      : areaId === "cobertura-infraestructura"
                        ? "Cobertura e Infraestructura"
                        : "Talento Humano"}
                </CardTitle>
                <CardDescription>Resumen de documentos y carpetas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Documentos</p>
                    <p className="text-2xl font-bold">{data.totalDocuments}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Carpetas</p>
                    <p className="text-2xl font-bold">{data.totalFolders}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium">Tamaño</p>
                    <p className="text-2xl font-bold">{formatBytes(data.totalSize)}</p>
                  </div>
                </div>

                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.stats
                        .filter((stat) => stat.areaId === areaId)
                        .map((stat) => ({
                          name: stat.moduleType === "proveedores" ? "Proveedores" : "Prestación",
                          documentos: stat.totalDocuments,
                          carpetas: stat.totalFolders,
                        }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="documentos" name="Documentos" fill="#8884d8" />
                      <Bar dataKey="carpetas" name="Carpetas" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "detalle" && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Documentos por Área y Módulo</CardTitle>
            <CardDescription>Información detallada sobre documentos y carpetas en cada área y módulo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Área</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Documentos</TableHead>
                    <TableHead>Carpetas</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Categorías</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStats.length > 0 ? (
                    filteredStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stat.areaName}</TableCell>
                        <TableCell>{stat.moduleName}</TableCell>
                        <TableCell>{stat.totalDocuments}</TableCell>
                        <TableCell>{stat.totalFolders}</TableCell>
                        <TableCell>{formatBytes(stat.totalSize)}</TableCell>
                        <TableCell>{formatDate(stat.lastUpdated)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(stat.foldersByCategory).map(([category, count]) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category === "preContractual"
                                  ? "Pre Contractual"
                                  : category === "execution"
                                    ? "Ejecución"
                                    : "Cierre"}
                                : {count}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No hay datos disponibles para los filtros seleccionados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
