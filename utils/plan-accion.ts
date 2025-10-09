// utils/plan-accion.ts
import { format } from "date-fns"
import { PlanAccionEstado, type PlanAccionItem } from "@/types/plan-accion"

export interface PlanAccionStats {
  total: number
  completados: number
  enProgreso: number
  retrasados: number
  presupuestoTotal: number
  avancePromedio: number
  estadosCount: Record<string, number>
  totalItems: number
}

// Expresión regular para validar formato de presupuesto
export const PRESUPUESTO_REGEX = /^\$?[\d,.]+$/

// Función para formatear fechas
export const formatDate = (date: Date): string => {
  return format(date, "dd/MM/yyyy")
}

// Función para obtener clases de color basadas en el color proporcionado
export const getColorClasses = (color: string): string => {
  switch (color) {
    case "blue":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "green":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "orange":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "purple":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    default:
      return "bg-primary/10 text-primary border-primary/20"
  }
}

// Función para obtener clases de color para los estados
export const getStatusColorClass = (status: PlanAccionEstado | string): string => {
  switch (status) {
    case PlanAccionEstado.PENDIENTE:
      return "bg-yellow-100 text-yellow-800"
    case PlanAccionEstado.EN_PROGRESO:
      return "bg-blue-100 text-blue-800"
    case PlanAccionEstado.COMPLETADO:
      return "bg-green-100 text-green-800"
    case PlanAccionEstado.RETRASADO:
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Función para calcular estadísticas del plan de acción
export const calculateStats = (items: PlanAccionItem[]): PlanAccionStats => {
  const totalItems = items.length

  // Calcular presupuesto total
  const presupuestoTotal = items.reduce((sum, item) => {
    const presupuesto = Number.parseFloat(item.presupuesto?.replace(/[^0-9.-]+/g, "") || "0") || 0
    return sum + presupuesto
  }, 0)

  // Calcular avance promedio
  const avancePromedio =
    totalItems > 0 ? Math.round(items.reduce((sum, item) => sum + (item.porcentajeAvance || 0), 0) / totalItems) : 0

  // Calcular distribución por estado
  const estadosCount = items.reduce(
    (acc, item) => {
      const estado = item.estado || PlanAccionEstado.PENDIENTE
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    total: totalItems,
    completados: estadosCount[PlanAccionEstado.COMPLETADO] || 0,
    enProgreso: estadosCount[PlanAccionEstado.EN_PROGRESO] || 0,
    retrasados: estadosCount[PlanAccionEstado.RETRASADO] || 0,
    presupuestoTotal,
    avancePromedio,
    estadosCount,
    totalItems,
  }
}

// Función para extraer números del formato de presupuesto
export const extractNumberFromCurrency = (value: string): number => {
  return Number.parseFloat(value?.replace(/[^0-9.-]+/g, "") || "0") || 0
}

// Función para formatear números como moneda colombiana
export const formatCurrency = (value: number | string | null | undefined): string => {
  const numValue = typeof value === 'number' ? value : Number.parseFloat(String(value || "0").replace(/[^0-9.-]+/g, "")) || 0
  
  // Formatear con puntos como separadores de miles (formato colombiano)
  const formatted = numValue.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  return `$${formatted}`
}
