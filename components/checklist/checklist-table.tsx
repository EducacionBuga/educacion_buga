"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, FileText } from "lucide-react"
import type { ChecklistItem } from "@/hooks/use-checklist-data"
import { memo } from "react"

interface ChecklistTableProps {
  items: ChecklistItem[]
  loading: boolean
  onCheckChange: (id: string, field: "si" | "no" | "noAplica", value: boolean) => void
  onObservacionChange: (id: string, value: string) => void
}

export const ChecklistTable = memo(function ChecklistTable({
  items,
  loading,
  onCheckChange,
  onObservacionChange,
}: ChecklistTableProps) {
  return (
    <ScrollArea className="h-[600px] w-full border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[40%]">DOCUMENTO</TableHead>
            <TableHead className="w-[10%] text-center">SI</TableHead>
            <TableHead className="w-[10%] text-center">NO</TableHead>
            <TableHead className="w-[10%] text-center">NO APLICA</TableHead>
            <TableHead className="w-[30%]">OBSERVACIONES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="mb-2 h-10 w-10 animate-spin" />
                  <p className="text-lg font-medium">Cargando datos...</p>
                  <p className="text-sm">Por favor espere mientras se cargan los documentos.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.documento}</p>
                    <p className="text-sm text-muted-foreground truncate-2">{item.descripcion}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={item.si === true}
                      onCheckedChange={(checked) => onCheckChange(item.id, "si", checked === true)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={item.no === true}
                      onCheckedChange={(checked) => onCheckChange(item.id, "no", checked === true)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={item.noAplica === true}
                      onCheckedChange={(checked) => onCheckChange(item.id, "noAplica", checked === true)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Textarea
                    placeholder="Observaciones"
                    className="min-h-[60px]"
                    value={item.observaciones}
                    onChange={(e) => onObservacionChange(item.id, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="mb-2 h-10 w-10" />
                  <p className="text-lg font-medium">No hay documentos disponibles</p>
                  <p className="text-sm">Ajuste los filtros o añada nuevos documentos.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  )
})
