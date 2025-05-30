"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileSpreadsheet } from "lucide-react"
import Papa from "papaparse"
import type { PlanAccionItem } from "@/types/plan-accion"
import { useDebouncedSearch } from "@/hooks/use-debounced-search"
import { usePlanAccionService } from "@/hooks/use-plan-accion-service"
import { getColorClasses } from "@/utils/plan-accion"
import { PlanAccionRow } from "@/components/plan-accion/plan-accion-row"
import { PlanAccionToolbar } from "@/components/plan-accion/plan-accion-toolbar"
import { PlanAccionSummary } from "@/components/plan-accion/plan-accion-summary"
import { PlanAccionAddDialog } from "@/components/plan-accion/plan-accion-add-dialog"

/**
 * Props para el componente PlanAccionArea
 */
interface PlanAccionAreaProps {
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
 * Componente para gestionar planes de acción por área
 *
 * @example
 * \`\`\`tsx
 * <PlanAccionArea
 *   title="Plan de Acción - Calidad Educativa"
 *   area="calidad-educativa"
 *   color="orange"
 * />
 * \`\`\`
 */
export default function PlanAccionArea({
  title,
  description,
  area,
  color = "orange",
  initialItems = [],
  onItemsChange,
}: PlanAccionAreaProps) {
  // Estado local
  const [planAccionItems, setPlanAccionItems] = useState<PlanAccionItem[]>(initialItems)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoadingTooLong, setIsLoadingTooLong] = useState(false)
  const dataFetchedRef = useRef(false)

  // Hooks personalizados
  const { isLoading, error, areaId, addPlanAccion, updatePlanAccion, deletePlanAccion, loadPlanesAccion } =
    usePlanAccionService(area)

  // Función de búsqueda para el hook de búsqueda debounced
  const searchPredicate = useCallback((item: PlanAccionItem, term: string) => {
    return (
      item.programa.toLowerCase().includes(term) ||
      item.objetivo.toLowerCase().includes(term) ||
      item.meta.toLowerCase().includes(term)
    )
  }, [])

  // Hook de búsqueda con debounce
  const { searchTerm, filteredItems, handleSearchChange } = useDebouncedSearch(planAccionItems, searchPredicate)

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

  // Detectar carga prolongada
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoadingTooLong(true)
      }, 10000) // 10 segundos
    } else {
      setIsLoadingTooLong(false)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isLoading])

  // Handlers
  const handleAddItem = useCallback(
    async (newItem: PlanAccionItem) => {
      try {
        if (!areaId) {
          console.error("No se ha podido determinar el ID del área")
          return
        }

        // Asegurar que las fechas estén definidas
        const itemToAdd = { ...newItem }

        // Si no hay fechas, usar la fecha actual
        if (!itemToAdd.fechaInicio || itemToAdd.fechaInicio.trim() === "") {
          const today = new Date()
          itemToAdd.fechaInicio = today.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        }

        if (!itemToAdd.fechaFin || itemToAdd.fechaFin.trim() === "") {
          // Para fecha fin, usar fecha actual + 30 días como valor predeterminado
          const endDate = new Date()
          endDate.setDate(endDate.getDate() + 30)
          itemToAdd.fechaFin = endDate.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        }

        console.log("Enviando item con fechas verificadas:", itemToAdd)
        const createdItem = await addPlanAccion(itemToAdd)
        if (createdItem) {
          setPlanAccionItems((prev) => [
            ...prev,
            {
              ...itemToAdd,
              id: createdItem.id,
            },
          ])
        }
        setIsAddDialogOpen(false)
      } catch (error) {
        console.error("Error al añadir elemento:", error)
      }
    },
    [addPlanAccion, areaId],
  )

  const handleUpdateItem = useCallback(
    async (updatedItem: PlanAccionItem) => {
      try {
        await updatePlanAccion(updatedItem.id, updatedItem)
        setPlanAccionItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
      } catch (error) {
        console.error("Error al actualizar elemento:", error)
      }
    },
    [updatePlanAccion],
  )

  const handleDeleteItem = useCallback(
    async (id: string) => {
      try {
        await deletePlanAccion(id)
        setPlanAccionItems((prev) => prev.filter((item) => item.id !== id))
      } catch (error) {
        console.error("Error al eliminar elemento:", error)
      }
    },
    [deletePlanAccion],
  )

  // Handler para exportar a CSV
  const handleExportCSV = useCallback(() => {
    const csv = Papa.unparse(planAccionItems)
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

  // Memorizar las clases de color para evitar recálculos
  const colorClasses = useMemo(() => getColorClasses(color), [color])

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

  return (
    <Card className="w-full">
      <CardHeader className={`pb-3 ${colorClasses} bg-opacity-10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${colorClasses}`}>
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription className="text-foreground/70">{description}</CardDescription>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Barra de herramientas */}
        <PlanAccionToolbar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddClick={() => setIsAddDialogOpen(true)}
          onExportClick={handleExportCSV}
        />

        {/* Mostrar error si existe */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Tabla de planes de acción */}
        <ScrollArea className="h-[600px] w-full border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Plan Decenal</TableHead>
                <TableHead>Macroobjetivo</TableHead>
                <TableHead>Objetivo Decenal</TableHead>
                <TableHead>Programa</TableHead>
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
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <td colSpan={15} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                      <p className="text-lg font-medium">Cargando datos...</p>
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
                  </td>
                </TableRow>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <PlanAccionRow key={item.id} item={item} onEdit={handleUpdateItem} onDelete={handleDeleteItem} />
                ))
              ) : (
                <TableRow>
                  <td colSpan={15} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileSpreadsheet className="mb-2 h-10 w-10" />
                      <p className="text-lg font-medium">No hay datos disponibles</p>
                      <p className="text-sm">Añada elementos</p>
                    </div>
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Resumen de datos */}
        <PlanAccionSummary items={planAccionItems} />

        {/* Diálogo para añadir nuevo elemento */}
        <PlanAccionAddDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddItem}
          isSubmitting={isLoading}
        />
      </CardContent>
    </Card>
  )
}

export { PlanAccionArea }
