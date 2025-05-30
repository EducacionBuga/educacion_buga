"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"
import type { PlanAccionItem } from "@/types/plan-accion"
import { useState, useRef } from "react"

interface PlanAccionViewerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  items: PlanAccionItem[]
  documentoNombre: string
  documentoFecha: string
  onDownload: () => void
}

export function PlanAccionViewer({
  isOpen,
  onOpenChange,
  items,
  documentoNombre,
  documentoFecha,
  onDownload,
}: PlanAccionViewerProps) {
  const [selectedRow, setSelectedRow] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  const openInNewTab = () => {
    const tableHtml = tableRef.current?.innerHTML
    if (!tableHtml) return

    const newWindow = window.open("", "_blank")
    if (!newWindow) {
      alert("El navegador bloqueó la apertura de una nueva pestaña. Por favor, permita las ventanas emergentes.")
      return
    }

    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentoNombre}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 100%; overflow-x: auto; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; }
            tr:hover { background-color: #f8fafc; }
            .selected { background-color: #dbeafe; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            p { color: #64748b; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <h1>${documentoNombre}</h1>
          <p>Última actualización: ${documentoFecha}</p>
          <div class="container">
            ${tableHtml}
          </div>
        </body>
      </html>
    `)
    newWindow.document.close()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] dialog-content">
        <DialogHeader>
          <DialogTitle>{documentoNombre}</DialogTitle>
          <DialogDescription>Última actualización: {documentoFecha}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden rounded-md border h-full">
          <div className="w-full h-full min-h-[500px] bg-white overflow-x-scroll overflow-y-auto p-4 scrollbar-thin">
            <div className="min-w-max" ref={tableRef}>
              <table className="min-w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">N°</th>
                    <th className="border border-gray-300 p-2">Meta de Producto PDM 2024-2027</th>
                    <th className="border border-gray-300 p-2">Actividad a Realizar</th>
                    <th className="border border-gray-300 p-2">Proceso / Estrategia</th>
                    <th className="border border-gray-300 p-2">Presupuesto Disponible</th>
                    <th className="border border-gray-300 p-2">Presupuesto Ejecutado</th>
                    <th className="border border-gray-300 p-2">Porcentaje de Avance</th>
                    <th className="border border-gray-300 p-2">Recursos Necesarios</th>
                    <th className="border border-gray-300 p-2">Indicador de Gestión</th>
                    <th className="border border-gray-300 p-2">Unidad de Medida</th>
                    <th className="border border-gray-300 p-2">Fórmula del Indicador</th>
                    <th className="border border-gray-300 p-2">Período Propuesto</th>
                    <th className="border border-gray-300 p-2">Fecha de Inicio</th>
                    <th className="border border-gray-300 p-2">Fecha de Finalización</th>
                    <th className="border border-gray-300 p-2">Responsable</th>
                    <th className="border border-gray-300 p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((item) => {
                      const itemNum = Number.parseInt(item.numero)
                      return itemNum < 63 || itemNum > 68
                    })
                    .map((item) => (
                      <tr
                        key={item.numero}
                        onClick={() => setSelectedRow(selectedRow === item.numero ? null : item.numero)}
                        className={`cursor-pointer hover:bg-gray-50 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                      >
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.numero}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.meta}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.actividad}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.proceso}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.presupuestoDisponible}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.presupuestoEjecutado}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.porcentajeAvance}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.recursosNecesarios}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.indicador}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.unidadMedida}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.formula}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.periodo}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.fechaInicio}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.fechaFin}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.responsable}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${selectedRow === item.numero ? "bg-blue-100" : ""}`}
                        >
                          {item.estado}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir en nueva pestaña
            </Button>
            <Button onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
