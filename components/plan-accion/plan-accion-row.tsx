"use client"

// components/plan-accion/plan-accion-row.tsx
import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { PlanAccionEstado, PlanAccionItem } from "@/types/plan-accion"

interface PlanAccionRowProps {
  item: PlanAccionItem
  onEdit: (item: PlanAccionItem) => void
  onDelete: (id: string) => void
}

export function PlanAccionRow({ item, onEdit, onDelete }: PlanAccionRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState<Partial<PlanAccionItem>>({})

  // Iniciar edición
  const handleEditStart = () => {
    setIsEditing(true)
    setEditValues({ ...item })
  }

  // Cancelar edición
  const handleEditCancel = () => {
    setIsEditing(false)
    setEditValues({})
  }

  // Guardar cambios
  const handleEditSave = () => {
    onEdit({ ...item, ...editValues })
    setIsEditing(false)
    setEditValues({})
  }

  // Actualizar valor en edición
  const handleEditChange = (field: keyof PlanAccionItem, value: any) => {
    setEditValues((prev) => ({ ...prev, [field]: value }))
  }

  // Renderizar badge de estado
  const renderStatusBadge = (status: PlanAccionEstado | string) => {
    // Definir clases de color directamente aquí para simplificar
    let colorClass = "bg-gray-100 text-gray-800"

    switch (status) {
      case "Pendiente":
        colorClass = "bg-yellow-100 text-yellow-800"
        break
      case "En Progreso":
        colorClass = "bg-blue-100 text-blue-800"
        break
      case "Completado":
        colorClass = "bg-green-100 text-green-800"
        break
      case "Retrasado":
        colorClass = "bg-red-100 text-red-800"
        break
    }

    return <span className={`px-2 py-1 font-semibold rounded-full ${colorClass}`}>{status}</span>
  }

  return (
    <TableRow>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.programa || ""}
            onChange={(e) => handleEditChange("programa", e.target.value)}
            className="w-full"
            aria-label="Programa"
          />
        ) : (
          item.programa
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.metaDecenal || ""}
            onChange={(e) => handleEditChange("metaDecenal", e.target.value)}
            className="w-full"
            aria-label="Meta Decenal"
          />
        ) : (
          item.metaDecenal || "N/A"
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.macroobjetivoDecenal || ""}
            onChange={(e) => handleEditChange("macroobjetivoDecenal", e.target.value)}
            className="w-full"
            aria-label="Macroobjetivo Decenal"
          />
        ) : item.macroobjetivoDecenal ? (
          item.macroobjetivoDecenal.split("\n")[0]
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.objetivoDecenal || ""}
            onChange={(e) => handleEditChange("objetivoDecenal", e.target.value)}
            className="w-full"
            aria-label="Objetivo Decenal"
          />
        ) : (
          item.objetivoDecenal || "N/A"
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.objetivo || ""}
            onChange={(e) => handleEditChange("objetivo", e.target.value)}
            className="w-full"
            aria-label="Objetivo"
          />
        ) : (
          item.objetivo
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.meta || ""}
            onChange={(e) => handleEditChange("meta", e.target.value)}
            className="w-full"
            aria-label="Meta"
          />
        ) : (
          item.meta
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.presupuesto || ""}
            onChange={(e) => handleEditChange("presupuesto", e.target.value)}
            className="w-full"
            aria-label="Presupuesto"
          />
        ) : (
          item.presupuesto
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.acciones || ""}
            onChange={(e) => handleEditChange("acciones", e.target.value)}
            className="w-full"
            aria-label="Acciones realizadas"
          />
        ) : (
          item.acciones
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.indicadores || ""}
            onChange={(e) => handleEditChange("indicadores", e.target.value)}
            className="w-full"
            aria-label="Indicadores alcanzados"
          />
        ) : (
          item.indicadores
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            min="0"
            max="100"
            value={editValues.porcentajeAvance || 0}
            onChange={(e) => handleEditChange("porcentajeAvance", Number(e.target.value))}
            className="w-20"
            aria-label="Porcentaje de avance"
          />
        ) : (
          `${item.porcentajeAvance}%`
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.fechaInicio || ""}
            onChange={(e) => handleEditChange("fechaInicio", e.target.value)}
            className="w-full"
            aria-label="Fecha de inicio"
          />
        ) : (
          item.fechaInicio
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.fechaFin || ""}
            onChange={(e) => handleEditChange("fechaFin", e.target.value)}
            className="w-full"
            aria-label="Fecha de fin"
          />
        ) : (
          item.fechaFin
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.responsable || ""}
            onChange={(e) => handleEditChange("responsable", e.target.value)}
            className="w-full"
            aria-label="Responsable"
          />
        ) : (
          item.responsable
        )}
      </TableCell>
      <TableCell>{renderStatusBadge(item.estado)}</TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={handleEditCancel} aria-label="Cancelar edición">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleEditSave} aria-label="Guardar cambios">
              Guardar
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={handleEditStart} aria-label="Editar elemento">
              Editar
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)} aria-label="Eliminar elemento">
              Eliminar
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
