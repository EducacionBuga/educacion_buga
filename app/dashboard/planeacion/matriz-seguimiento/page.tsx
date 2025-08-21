"use client"

import { useState, useCallback, lazy } from "react"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { RoleGuard } from "@/components/auth/role-guard"
import { FileSpreadsheet, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMatrizSeguimiento } from "@/hooks/use-matriz-seguimiento"
import { useMatrizFilters } from "@/hooks/use-matriz-filters"

// Lazy load de componentes pesados
const TimelineView = lazy(() =>
  import("@/components/dashboard/timeline-view").then((mod) => ({ default: mod.TimelineView })),
)

import { MatrizGeneralTab } from "./matriz-general-tab"
import { TimelineTab } from "./timeline-tab"

// Componente de carga para Suspense
const LoadingFallback = () => (
  <div className="flex justify-center items-center py-20" aria-live="polite" aria-busy="true">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" role="status"></div>
    <span className="sr-only">Cargando...</span>
  </div>
)

export default function MatrizSeguimientoPage() {
  const [activeTab, setActiveTab] = useState("matriz")
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("todas")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [fechaDesdeFilter, setFechaDesdeFilter] = useState("")
  const [fechaHastaFilter, setFechaHastaFilter] = useState("")

  const { data: matrizData, isLoading, isError, error, refetch, updatePlanEstado } = useMatrizSeguimiento()

  const { filteredData, dataByArea } = useMatrizFilters({
    matrizData,
    searchTerm,
    areaFilter,
    estadoFilter,
    fechaDesdeFilter,
    fechaHastaFilter,
  })

  const handleClearFilters = useCallback(() => {
    setSearchTerm("")
    setAreaFilter("todas")
    setEstadoFilter("todos")
    setFechaDesdeFilter("")
    setFechaHastaFilter("")
  }, [])

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
                  <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Matriz General</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Línea de Tiempo</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matriz">
                <MatrizGeneralTab
                  data={filteredData}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  refetch={refetch}
                  updatePlanEstado={updatePlanEstado}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  areaFilter={areaFilter}
                  setAreaFilter={setAreaFilter}
                  estadoFilter={estadoFilter}
                  setEstadoFilter={setEstadoFilter}
                  fechaDesdeFilter={fechaDesdeFilter}
                  setFechaDesdeFilter={setFechaDesdeFilter}
                  fechaHastaFilter={fechaHastaFilter}
                  setFechaHastaFilter={setFechaHastaFilter}
                  handleClearFilters={handleClearFilters}
                />
              </TabsContent>

              <TabsContent value="timeline">
                <TimelineTab projects={filteredData} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </RoleGuard>
  )
}
