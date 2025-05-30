"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Download } from "lucide-react"
import type { DocumentoBase } from "@/types/plan-accion"

interface PlanAccionInfoProps {
  documento: DocumentoBase
  onView: () => void
  onDownload: () => void
}

export function PlanAccionInfo({ documento, onView, onDownload }: PlanAccionInfoProps) {
  return (
    <div className="p-4 border rounded-md bg-gray-50 flex justify-between items-center mb-6">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{documento.nombre}</h3>
          <Badge variant="default">{documento.estado}</Badge>
        </div>
        <div className="mt-1 text-sm text-gray-600 flex items-center gap-4">
          <span>Última actualización: {documento.fecha}</span>
          <span>{documento.tipo}</span>
          <span>{documento.tamaño}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onView} title="Ver documento" aria-label="Ver documento">
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
        <Button variant="outline" size="sm" title="Descargar" aria-label="Descargar" onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" />
          Descargar
        </Button>
      </div>
    </div>
  )
}
