"use client"

import type React from "react"

import { useCallback } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Edit, Trash2 } from "lucide-react"
import type { PlanAccionItem } from "@/components/modules/plan-accion-area"

interface PlanAccionRowProps {
  item: PlanAccionItem
  editingId: string | null
  editValues: Partial<PlanAccionItem>
  onEditStart: (item: PlanAccionItem) => void
  onEditCancel: () => void
  onEditSave: () => void
  onDelete: (id: string) => void
  onEditChange: (field: keyof PlanAccionItem, value: any) => void
}

export function PlanAccionRow({
  item,
  editingId,
  editValues,
  onEditStart,
  onEditCancel,
  onEditSave,
  onDelete,
  onEditChange,
}: PlanAccionRowProps) {
  const isEditing = editingId === item.id

  const handleEditChange = useCallback(
    (field: keyof PlanAccionItem) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "porcentajeAvance" ? Number.parseInt(e.target.value) : e.target.value
      onEditChange(field, value)
    },
    [onEditChange],
  )

  const getStatusBadge = useCallback((status?: string) => {
    if (!status) return null

    switch (status) {
      case "Completado":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Completado
          </Badge>
        )
      case "En progreso":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            En progreso
          </Badge>
        )
      case "Pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Pendiente
          </Badge>
        )
      case "Importado":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            Importado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
            {status}
          </Badge>
        )
    }
  }, [])

  return (
    <TableRow>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.programa || ""}
            onChange={handleEditChange("programa")}
            className="w-full"
            aria-label="Editar programa"
          />
        ) : (
          item.programa
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.objetivo || ""}
            onChange={handleEditChange("objetivo")}
            className="w-full"
            aria-label="Editar objetivo"
          />
        ) : (
          item.objetivo
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.meta || ""}
            onChange={handleEditChange("meta")}
            className="w-full"
            aria-label="Editar meta"
          />
        ) : (
          item.meta
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.presupuesto || ""}
            onChange={handleEditChange("presupuesto")}
            className="w-full"
            aria-label="Editar presupuesto"
          />
        ) : (
          item.presupuesto
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.acciones || ""}
            onChange={handleEditChange("acciones")}
            className="w-full"
            aria-label="Editar acciones"
          />
        ) : (
          item.acciones
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.indicadores || ""}
            onChange={handleEditChange("indicadores")}
            className="w-full"
            aria-label="Editar indicadores"
          />
        ) : (
          item.indicadores
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={editValues.porcentajeAvance || 0}
              onChange={handleEditChange("porcentajeAvance")}
              className="w-20"
              aria-label="Ajustar porcentaje de avance"
            />
            <Input
              type="number"
              min="0"
              max="100"
              value={editValues.porcentajeAvance || 0}
              onChange={handleEditChange("porcentajeAvance")}
              className="w-16"
              aria-label="Porcentaje de avance"
            />
            <span>%</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${item.porcentajeAvance || 0}%` }}
                role="progressbar"
                aria-valuenow={item.porcentajeAvance || 0}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <span>{item.porcentajeAvance || 0}%</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.fechaInicio || ""}
            onChange={handleEditChange("fechaInicio")}
            className="w-full"
            placeholder="DD/MM/AAAA"
            aria-label="Editar fecha de inicio"
          />
        ) : (
          item.fechaInicio
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editValues.fechaFin || ""}
            onChange={handleEditChange("fechaFin")}
            className="w-full"
            placeholder="DD/MM/AAAA"
            aria-label="Editar fecha de fin"
          />
        ) : (
          item.fechaFin
        )}
      </TableCell>
      <TableCell>{getStatusBadge(item.estado)}</TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="icon" onClick={onEditSave} aria-label="Guardar cambios">
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEditCancel} aria-label="Cancelar edición">
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEditStart(item)} aria-label="Editar elemento">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500"
              onClick={() => onDelete(item.id)}
              aria-label="Eliminar elemento"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
