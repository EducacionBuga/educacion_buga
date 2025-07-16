"use client"

import { ModuleHeader } from "@/components/dashboard/module-header"
import { RoleGuard } from "@/components/auth/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Plus, Upload, LayoutGrid, TableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { PlanAccionImportExport } from "@/components/plan-accion/plan-accion-import-export"
import { PlanAccionMejorado } from "@/components/plan-accion/plan-accion-mejorado"
import { usePlanAccionService } from "@/hooks/use-plan-accion-service"
import { usePlanAccionImportExport } from "@/hooks/use-plan-accion-import-export"
import type { PlanAccionItem } from "@/types/plan-accion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PlanAccionPage() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [planAccionItems, setPlanAccionItems] = useState<PlanAccionItem[]>([])
  const [activeTab, setActiveTab] = useState("view")
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards")
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  
  // Hook para manejar el plan de acción (usando slug genérico para planeación)
  const { 
    isLoading, 
    error, 
    loadPlanesAccion, 
    addPlanAccion 
  } = usePlanAccionService("planeacion")

  // Hook para importación/exportación de Excel
  const { exportToExcel, isExporting } = usePlanAccionImportExport()

  // Filtrar datos según los criterios
  const filteredData = planAccionItems.filter((item) => {
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

  const handleClearFilters = () => {
    setSearchTerm("")
    setEstadoFilter("todos")
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadPlanesAccion().then((data) => {
      if (data) {
        setPlanAccionItems(data)
      }
    }).catch((err) => {
      console.error("Error cargando planes de acción:", err)
    })
  }, [loadPlanesAccion])

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // Usar la función de exportar a Excel del hook
      await exportToExcel(filteredData, `plan-accion-${new Date().toISOString().split('T')[0]}.xlsx`)
      
      toast({
        title: "Exportación exitosa",
        description: "El Plan de Acción se ha exportado a Excel correctamente",
      })
    } catch (error) {
      console.error("Error al exportar:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al exportar el documento",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleImportData = async (importedData: PlanAccionItem[]) => {
    try {
      // Guardar cada item importado
      const savedItems: PlanAccionItem[] = []
      
      for (const item of importedData) {
        try {
          const savedItem = await addPlanAccion(item)
          if (savedItem) {
            savedItems.push(savedItem)
          }
        } catch (error) {
          console.error("Error guardando item:", error)
        }
      }

      // Actualizar estado local
      setPlanAccionItems(prev => [...prev, ...savedItems])
      
      toast({
        title: "Importación completada",
        description: `Se importaron ${savedItems.length} de ${importedData.length} registros.`,
      })
    } catch (error: any) {
      console.error("Error en importación:", error)
      toast({
        title: "Error en importación",
        description: error.message || "Ocurrió un error al importar los datos",
        variant: "destructive",
      })
    }
  }

  return (
    <RoleGuard allowedRoles={["ADMIN", "PLANEACION"]}>
      <main className="min-h-screen bg-gray-50">
        <ModuleHeader title="PLAN DE ACCIÓN" />
        <div className="container mx-auto p-4 md:p-8">
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Visualizar Plan</TabsTrigger>
              <TabsTrigger value="manage">Gestionar Datos</TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="mt-6">
              {/* Header mejorado estilo matriz */}
              <Card className="mb-6 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Plan de Acción Municipal 2025</h2>
                        <p className="text-sm text-gray-600 mt-1">Secretaría de Educación de Guadalajara de Buga</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "cards" ? "default" : "outline"}
                        onClick={() => setViewMode("cards")}
                        className={`flex items-center gap-2 ${
                          viewMode === "cards" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                        Vista Tarjetas
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        onClick={() => setViewMode("table")}
                        className={`flex items-center gap-2 ${
                          viewMode === "table" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <TableIcon className="h-4 w-4" />
                        Vista Tabla
                      </Button>
                      <Button 
                        onClick={handleDownload}
                        disabled={isDownloading || isExporting || filteredData.length === 0}
                        className="flex items-center justify-center h-10 px-4 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isDownloading || isExporting ? "Exportando..." : "Exportar"}
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("manage")}
                        className="flex items-center justify-center h-10 px-4"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Gestionar
                      </Button>
                    </div>
                  </div>

                  {/* Estadísticas del Plan de Acción - Estilo Matriz */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700">Total Actividades</p>
                            <p className="text-2xl font-bold text-blue-900">{filteredData.length}</p>
                          </div>
                          <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">Completadas</p>
                            <p className="text-2xl font-bold text-green-900">
                              {filteredData.filter(item => item.estado === "Completado").length}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                            <Plus className="h-6 w-6 text-green-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-amber-700">En Progreso</p>
                            <p className="text-2xl font-bold text-amber-900">
                              {filteredData.filter(item => item.estado === "En progreso" || item.estado === "En Progreso").length}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                            <FileText className="h-6 w-6 text-amber-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-700">Avance Promedio</p>
                            <p className="text-2xl font-bold text-purple-900">
                              {filteredData.length > 0 
                                ? Math.round(filteredData.reduce((sum, item) => sum + (item.porcentajeAvance || 0), 0) / filteredData.length)
                                : 0}%
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <FileText className="h-6 w-6 text-purple-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Vista mejorada de tarjetas */}
              {viewMode === "cards" ? (
                <PlanAccionMejorado
                  data={filteredData}
                  isLoading={isLoading}
                  isError={!!error}
                  error={error}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  estadoFilter={estadoFilter}
                  setEstadoFilter={setEstadoFilter}
                  handleClearFilters={handleClearFilters}
                  onItemUpdate={async (updatedItem) => {
                    try {
                      // Actualizar en la base de datos usando el servicio
                      const result = await addPlanAccion(updatedItem) // addPlanAccion también actualiza si existe el ID
                      if (result) {
                        // Actualizar el estado local
                        setPlanAccionItems(prev => prev.map(item => 
                          item.id === updatedItem.id ? updatedItem : item
                        ))
                        toast({
                          title: "Plan actualizado",
                          description: "Los cambios se han guardado correctamente",
                        })
                      }
                    } catch (error) {
                      console.error("Error al actualizar plan:", error)
                      toast({
                        title: "Error",
                        description: "No se pudo actualizar el plan de acción",
                        variant: "destructive",
                      })
                    }
                  }}
                  onItemDelete={async (itemId) => {
                    try {
                      // Eliminar de la lista local (la eliminación real se maneja en el componente)
                      setPlanAccionItems(prev => prev.filter(item => item.id !== itemId))
                      toast({
                        title: "Plan eliminado",
                        description: "El plan de acción se ha eliminado correctamente",
                      })
                    } catch (error) {
                      console.error("Error al eliminar plan:", error)
                      toast({
                        title: "Error",
                        description: "No se pudo eliminar el plan de acción",
                        variant: "destructive",
                      })
                    }
                  }}
                />
              ) : (
                // Tabla tradicional del plan de acción
                <Card className="mb-8">
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center text-gray-900">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      Actividades del Plan de Acción
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 overflow-auto">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-gray-100 text-left">
                            <th className="border border-gray-300 px-3 py-2 font-medium">N°</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Programa</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Objetivo</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Meta</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Presupuesto</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Acciones</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">% Avance</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Indicadores</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Plan Decenal</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Programa PDM</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Subprograma PDM</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Proyecto PDM</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Fecha Inicio</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Fecha Fin</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Responsable</th>
                            <th className="border border-gray-300 px-3 py-2 font-medium">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.length > 0 ? (
                            filteredData.slice(0, 10).map((item, index) => (
                              <tr key={item.id}>
                                <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.programa}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.objetivo}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.meta}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.presupuesto}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.acciones}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.porcentajeAvance}%</td>
                                <td className="border border-gray-300 px-3 py-2">{item.indicadores}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.metaDecenal || "-"}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.programaPDM || "-"}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.subprogramaPDM || "-"}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.proyectoPDM || "-"}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.fechaInicio}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.fechaFin}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.responsable}</td>
                                <td className="border border-gray-300 px-3 py-2">{item.estado}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={16} className="border border-gray-300 px-3 py-8 text-center text-gray-500">
                                {isLoading ? "Cargando datos..." : "No hay datos del plan de acción. Use la pestaña 'Gestionar Datos' para importar información."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 text-center text-sm text-gray-500">
                      <p>
                        Mostrando {Math.min(10, filteredData.length)} de {filteredData.length} actividades del Plan de Acción 2025. 
                        {filteredData.length > 10 && " Use la función de exportar para ver el documento completo."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="manage" className="mt-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <Upload className="mr-3 h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-xl">Gestión de Datos del Plan de Acción</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Importe, exporte y gestione los datos del plan de acción municipal
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="hidden sm:inline">Última actualización:</span>
                      <span className="font-medium">
                        {new Date().toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <PlanAccionImportExport
                    data={planAccionItems}
                    onImport={handleImportData}
                    disabled={isLoading}
                  />
                  
                  {/* Información adicional */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para la gestión de datos:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use la plantilla CSV para asegurar el formato correcto de los datos</li>
                      <li>• Los archivos Excel (.xlsx) y CSV son compatibles para importación</li>
                      <li>• Revise los datos antes de importar para evitar errores</li>
                      <li>• Exporte regularmente para mantener respaldos actualizados</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </RoleGuard>
  )
}
