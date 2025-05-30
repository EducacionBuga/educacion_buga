"use client"

import { ModuleHeader } from "@/components/dashboard/module-header"
import { RoleGuard } from "@/components/auth/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { PlanAccionImportExport } from "@/components/plan-accion/plan-accion-import-export"
import { usePlanAccionService } from "@/hooks/use-plan-accion-service"
import type { PlanAccionItem } from "@/types/plan-accion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PlanAccionPage() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [planAccionItems, setPlanAccionItems] = useState<PlanAccionItem[]>([])
  const [activeTab, setActiveTab] = useState("view")
  // Hook para manejar el plan de acción (usando slug genérico para planeación)
  const { 
    isLoading, 
    error, 
    loadPlanesAccion, 
    addPlanAccion 
  } = usePlanAccionService("planeacion")

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

  const handleDownload = () => {
    setIsDownloading(true)

    try {
      // Crear URL para el blob
      const url = "/plan-accion-2025.xlsx"

      // Crear un enlace para descargar
      const a = document.createElement("a")
      a.href = url
      a.download = `Plan_de_Accion_2025.xlsx`
      document.body.appendChild(a)
      a.click()

      // Limpiar
      setTimeout(() => {
        document.body.removeChild(a)
        setIsDownloading(false)
        toast({
          title: "Descarga iniciada",
          description: "El Plan de Acción se está descargando",
        })
      }, 100)
    } catch (error) {
      console.error("Error al descargar:", error)
      setIsDownloading(false)
      toast({
        title: "Error",
        description: "Ocurrió un error al descargar el documento",
        variant: "destructive",
      })
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
              {/* Barra de herramientas superior */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <FileText className="mr-3 h-6 w-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Plan de Acción Municipal 2025</h2>
                        <p className="text-sm text-gray-600">Secretaría de Educación de Guadalajara de Buga</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setActiveTab("manage")}
                      className="flex items-center justify-center h-10 px-4"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Gestionar Importación/Exportación
                    </Button>
                  </div>

                  {/* Estadísticas rápidas */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Actividades</p>
                          <p className="text-2xl font-bold text-blue-900">{planAccionItems.length}</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">En Progreso</p>
                          <p className="text-2xl font-bold text-green-900">
                            {planAccionItems.filter(item => item.estado === "En progreso" || item.estado === "En Proceso").length}
                          </p>
                        </div>
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Plus className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Sin Iniciar</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {planAccionItems.filter(item => item.estado === "Sin iniciar").length}
                          </p>
                        </div>
                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabla del plan de acción */}
              <Card className="mb-8">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center">
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
                          <th className="border border-gray-300 px-3 py-2 font-medium">Meta de Producto PDM 2024-2027</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Actividad a Realizar</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Proceso / Estrategia</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Presupuesto Disponible</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Presupuesto Ejecutado</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Porcentaje de Avance</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Recursos Necesarios</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Indicador de Gestión</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Unidad de Medida</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Fórmula del Indicador</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Período Propuesto</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Fecha de Inicio</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Fecha de Finalización</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Responsable</th>
                          <th className="border border-gray-300 px-3 py-2 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planAccionItems.length > 0 ? (
                          planAccionItems.slice(0, 10).map((item, index) => (
                            <tr key={item.id}>
                              <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.programa}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.objetivo}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.meta}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.presupuesto}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.acciones}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.porcentajeAvance}%</td>
                              <td className="border border-gray-300 px-3 py-2">{item.indicadores}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.indicadores}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.metaDecenal}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.macroobjetivoDecenal}</td>
                              <td className="border border-gray-300 px-3 py-2">{item.objetivoDecenal}</td>
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
                      Mostrando {Math.min(10, planAccionItems.length)} de {planAccionItems.length} actividades del Plan de Acción 2025. 
                      {planAccionItems.length > 10 && " Use la función de exportar para ver el documento completo."}
                    </p>
                  </div>
                </CardContent>
              </Card>
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
