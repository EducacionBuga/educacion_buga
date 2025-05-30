"use client"

import { useMemo } from "react"
import { PlanAccionEstado, type PlanAccionItem } from "@/types/plan-accion"
import { calculateStats, formatCurrency } from "@/utils/plan-accion"

interface PlanAccionSummaryProps {
  items: PlanAccionItem[]
}

export function PlanAccionSummary({ items }: PlanAccionSummaryProps) {
  // Calcular estadísticas
  const stats = useMemo(() => calculateStats(items), [items])

  // Definir colores para cada estado
  const estadoColors: Record<string, string> = {
    [PlanAccionEstado.PENDIENTE]: "bg-yellow-500",
    [PlanAccionEstado.EN_PROGRESO]: "bg-blue-500",
    [PlanAccionEstado.COMPLETADO]: "bg-green-500",
    [PlanAccionEstado.RETRASADO]: "bg-red-500",
  }

  return (
    <div className="mt-8 border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Resumen del Plan de Acción</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Presupuesto Total */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <span className="text-sm text-muted-foreground">Presupuesto Total:</span>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.presupuestoTotal)}</p>
          <span className="text-xs text-muted-foreground">Suma de {stats.totalItems} actividades</span>
        </div>

        {/* Porcentaje de Avance Promedio */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <span className="text-sm text-muted-foreground">Avance Promedio:</span>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-blue-600">{stats.avancePromedio}%</p>
            <span className="text-xs text-muted-foreground mb-1">de todas las actividades</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="h-2.5 rounded-full bg-blue-500"
              style={{ width: `${stats.avancePromedio}%` }}
              aria-label={`${stats.avancePromedio}% de avance promedio`}
              role="progressbar"
              aria-valuenow={stats.avancePromedio}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>

        {/* Distribución por Estado */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <span className="text-sm text-muted-foreground">Distribución por Estado:</span>

          <div className="space-y-3 mt-2">
            {/* Barra horizontal de distribución */}
            <div className="flex w-full h-6 rounded-md overflow-hidden">
              {Object.entries(stats.estadosCount).map(([estado, count]) => (
                <div
                  key={estado}
                  className={`${estadoColors[estado] || "bg-gray-500"}`}
                  style={{ width: `${(count / stats.totalItems) * 100}%` }}
                  title={`${estado}: ${Math.round((count / stats.totalItems) * 100)}%`}
                  role="presentation"
                ></div>
              ))}
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(stats.estadosCount).map(([estado, count]) => (
                <div key={estado} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-1 ${estadoColors[estado] || "bg-gray-500"}`}
                    aria-hidden="true"
                  ></div>
                  <span>
                    {estado}: {count} ({Math.round((count / stats.totalItems) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
