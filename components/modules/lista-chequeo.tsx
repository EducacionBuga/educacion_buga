"use client"

import { useRef, useState, useCallback, useMemo } from "react"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useChecklistData } from "@/hooks/use-checklist-data"
import { usePdfExporter } from "@/hooks/use-pdf-exporter"
import { ChecklistTable } from "@/components/checklist/checklist-table"
import { ChecklistActions } from "@/components/checklist/checklist-actions"
import { Etapa } from "@/constants/checklist"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ListaChequeo() {
  // Obtener el área actual de la URL
  const pathname = usePathname()
  const areaMatch = pathname?.match(/\/dashboard\/([^/]+)\/lista-chequeo/)
  const areaCode = areaMatch ? areaMatch[1] : "area-desconocida"

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<string>(Etapa.Precontractual)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingTab, setPendingTab] = useState<string | null>(null)

  // Referencias
  const tableRef = useRef<HTMLDivElement>(null)

  // Hooks personalizados
  const { checklistItems, setChecklistItems, isLoading, isSaved, areaUuid, saveChecklist } = useChecklistData(areaCode)
  const { exportToPDF, isExporting } = usePdfExporter(tableRef)

  // Handlers memoizados
  const handleCheckChange = useCallback(
    (id: string, field: "si" | "no" | "noAplica", value: boolean) => {
      setChecklistItems((items) =>
        items.map((item) => {
          if (item.id === id) {
            // Si se marca una opción, desmarcamos las otras
            const updatedItem = { ...item }
            if (field === "si") {
              updatedItem.si = value
              if (value) {
                updatedItem.no = false
                updatedItem.noAplica = false
              }
            } else if (field === "no") {
              updatedItem.no = value
              if (value) {
                updatedItem.si = false
                updatedItem.noAplica = false
              }
            } else if (field === "noAplica") {
              updatedItem.noAplica = value
              if (value) {
                updatedItem.si = false
                updatedItem.no = false
              }
            }
            return updatedItem
          }
          return item
        }),
      )
    },
    [setChecklistItems],
  )

  const handleObservacionChange = useCallback(
    (id: string, value: string) => {
      setChecklistItems((items) =>
        items.map((item) => {
          if (item.id === id) {
            return { ...item, observaciones: value }
          }
          return item
        }),
      )
    },
    [setChecklistItems],
  )

  // Filtrar ítems según la pestaña activa (memoizado)
  const filteredItems = useMemo(() => {
    return checklistItems.filter((item) => {
      return (
        activeTab === Etapa.Todos ||
        (activeTab === Etapa.Precontractual && item.etapa === Etapa.Precontractual) ||
        (activeTab === Etapa.Ejecucion && item.etapa === Etapa.Ejecucion) ||
        (activeTab === Etapa.Cierre && item.etapa === Etapa.Cierre)
      )
    })
  }, [checklistItems, activeTab])

  // Manejar cambio de pestaña con confirmación si hay cambios sin guardar
  const handleTabChange = (value: string) => {
    if (!isSaved) {
      setPendingTab(value)
      setShowUnsavedDialog(true)
    } else {
      setActiveTab(value)
    }
  }

  // Confirmar cambio de pestaña descartando cambios
  const confirmTabChange = () => {
    if (pendingTab) {
      setActiveTab(pendingTab)
      setPendingTab(null)
    }
    setShowUnsavedDialog(false)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-purple-500/10 text-purple-500 border-purple-500/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Lista de Chequeo</CardTitle>
                <p className="text-sm text-muted-foreground">Gestión documental contractual</p>
              </div>
            </div>
            <ChecklistActions
              onSave={saveChecklist}
              onExport={exportToPDF}
              disabledSave={isLoading || !areaUuid}
              disabledExport={!isSaved || isLoading}
              isSaving={isLoading}
              isExporting={isExporting}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Select defaultValue={activeTab} onValueChange={handleTabChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Etapa.Todos}>Todas las etapas</SelectItem>
                  <SelectItem value={Etapa.Precontractual}>Etapa Precontractual</SelectItem>
                  <SelectItem value={Etapa.Ejecucion}>Etapa de Ejecución</SelectItem>
                  <SelectItem value={Etapa.Cierre}>Etapa de Cierre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs
            defaultValue={Etapa.Precontractual}
            className="w-full"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value={Etapa.Todos} className="flex-1 sm:flex-none">
                Todos
              </TabsTrigger>
              <TabsTrigger value={Etapa.Precontractual} className="flex-1 sm:flex-none">
                Etapa Precontractual
              </TabsTrigger>
              <TabsTrigger value={Etapa.Ejecucion} className="flex-1 sm:flex-none">
                Etapa de Ejecución
              </TabsTrigger>
              <TabsTrigger value={Etapa.Cierre} className="flex-1 sm:flex-none">
                Etapa de Cierre
              </TabsTrigger>
            </TabsList>

            <div className="table-responsive" ref={tableRef}>
              <ChecklistTable
                items={filteredItems}
                loading={isLoading}
                onCheckChange={handleCheckChange}
                onObservacionChange={handleObservacionChange}
              />
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para cambios sin guardar */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambios sin guardar</DialogTitle>
            <DialogDescription>
              Tienes cambios sin guardar. ¿Estás seguro de que quieres cambiar de pestaña sin guardar los cambios?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnsavedDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmTabChange}>Continuar sin guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
