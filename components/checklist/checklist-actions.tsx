"use client"

import { Button } from "@/components/ui/button"
import { Download, Save, Loader2 } from "lucide-react"
import { memo } from "react"

interface ChecklistActionsProps {
  onSave: () => void
  onExport: () => void
  disabledSave: boolean
  disabledExport: boolean
  isSaving: boolean
  isExporting: boolean
}

export const ChecklistActions = memo(function ChecklistActions({
  onSave,
  onExport,
  disabledSave,
  disabledExport,
  isSaving,
  isExporting,
}: ChecklistActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={onExport}
        disabled={disabledExport || isExporting}
        title={disabledExport ? "Guarde la lista primero para poder exportarla" : "Exportar lista a PDF"}
      >
        {isExporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </>
        )}
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        className="w-full sm:w-auto"
        title="Guardar y actualizar matriz de seguimiento"
        disabled={disabledSave}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </>
        )}
      </Button>
    </div>
  )
})
