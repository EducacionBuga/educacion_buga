"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { z } from "zod"
import type { PlanAccionItem } from "@/components/modules/plan-accion-area"

// Esquema de validación con Zod
const planAccionSchema = z.object({
  programa: z.string().min(1, "El programa es obligatorio"),
  objetivo: z.string().min(1, "El objetivo es obligatorio"),
  meta: z.string().min(1, "La meta es obligatoria"),
  presupuesto: z
    .string()
    .min(1, "El presupuesto es obligatorio")
    .regex(/^\$?[\d,.]+$/, "Formato inválido. Ejemplo: $100,000,000"),
  acciones: z.string().min(1, "Las acciones son obligatorias"),
  indicadores: z.string().min(1, "Los indicadores son obligatorios"),
  porcentajeAvance: z
    .number()
    .min(0, "El porcentaje debe ser mayor o igual a 0")
    .max(100, "El porcentaje debe ser menor o igual a 100"),
  fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  fechaFin: z.string().min(1, "La fecha de fin es obligatoria"),
  estado: z.string().optional(),
})

export type PlanAccionFormData = z.infer<typeof planAccionSchema>

export function usePlanAccionForm(onSubmit: (data: PlanAccionItem) => void) {
  const [newItem, setNewItem] = useState<Partial<PlanAccionItem>>({ porcentajeAvance: 0 })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [fechaInicioDate, setFechaInicioDate] = useState<Date | null>(null)
  const [fechaFinDate, setFechaFinDate] = useState<Date | null>(null)

  // Actualizar fechas en formato string cuando cambian las fechas seleccionadas
  useEffect(() => {
    if (fechaInicioDate) {
      const formattedDate = format(fechaInicioDate, "dd/MM/yyyy")
      setNewItem((prev) => ({ ...prev, fechaInicio: formattedDate }))
      // Limpiar error si existe
      if (formErrors.fechaInicio) {
        setFormErrors((prev) => {
          const updated = { ...prev }
          delete updated.fechaInicio
          return updated
        })
      }
    }
  }, [fechaInicioDate, formErrors])

  useEffect(() => {
    if (fechaFinDate) {
      const formattedDate = format(fechaFinDate, "dd/MM/yyyy")
      setNewItem((prev) => ({ ...prev, fechaFin: formattedDate }))
      // Limpiar error si existe
      if (formErrors.fechaFin) {
        setFormErrors((prev) => {
          const updated = { ...prev }
          delete updated.fechaFin
          return updated
        })
      }
    }
  }, [fechaFinDate, formErrors])

  const validateForm = (): boolean => {
    try {
      // Validación básica con Zod
      planAccionSchema.parse(newItem)

      // Validación adicional para fechas
      if (fechaInicioDate && fechaFinDate && fechaFinDate < fechaInicioDate) {
        setFormErrors({
          fechaFin: "La fecha de fin debe ser posterior a la fecha de inicio",
        })
        return false
      }

      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message
          }
        })
        setFormErrors(errors)
      }
      return false
    }
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return false
    }

    // Generar un ID único usando crypto API
    const id = crypto.randomUUID()

    onSubmit({
      id,
      programa: newItem.programa || "",
      objetivo: newItem.objetivo || "",
      meta: newItem.meta || "",
      presupuesto: newItem.presupuesto || "",
      acciones: newItem.acciones || "",
      indicadores: newItem.indicadores || "",
      porcentajeAvance: newItem.porcentajeAvance || 0,
      fechaInicio: newItem.fechaInicio || "",
      fechaFin: newItem.fechaFin || "",
      estado: newItem.estado || "Pendiente",
    })

    // Resetear el formulario
    resetForm()
    return true
  }

  const resetForm = () => {
    setNewItem({ porcentajeAvance: 0 })
    setFechaInicioDate(null)
    setFechaFinDate(null)
    setFormErrors({})
  }

  const updateField = (field: keyof PlanAccionItem, value: any) => {
    setNewItem((prev) => ({ ...prev, [field]: value }))

    // Limpiar error si existe y el valor es válido
    if (formErrors[field]) {
      try {
        // Validar solo este campo
        planAccionSchema.shape[field].parse(value)
        setFormErrors((prev) => {
          const updated = { ...prev }
          delete updated[field]
          return updated
        })
      } catch (error) {
        // Mantener el error si la validación falla
      }
    }
  }

  return {
    newItem,
    formErrors,
    fechaInicioDate,
    fechaFinDate,
    setFechaInicioDate,
    setFechaFinDate,
    handleSubmit,
    resetForm,
    updateField,
  }
}
