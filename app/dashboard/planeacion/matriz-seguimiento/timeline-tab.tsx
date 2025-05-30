"use client"

import { CardDescription } from "@/components/ui/card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { Suspense, lazy } from "react"
import type { MatrizSeguimientoItem } from "@/hooks/use-matriz-seguimiento"

const TimelineView = lazy(() =>
  import("@/components/dashboard/timeline-view").then((mod) => ({ default: mod.TimelineView })),
)

const LoadingFallback = () => (
  <div className="flex justify-center items-center py-20" aria-live="polite" aria-busy="true">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" role="status"></div>
    <span className="sr-only">Cargando...</span>
  </div>
)

interface TimelineTabProps {
  projects: MatrizSeguimientoItem[]
}

export function TimelineTab({ projects }: TimelineTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" aria-hidden="true" />
          Línea de Tiempo de Planes de Acción
        </CardTitle>
        <CardDescription>Visualización cronológica de los planes de acción de todas las áreas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<LoadingFallback />}>
          <TimelineView
            projects={projects.map((item) => ({
              id: item.id,
              programa: item.programa || item.acciones || "Sin nombre",
              objetivo: item.objetivo || item.meta || "Sin objetivo",
              meta: item.meta || "Sin meta definida",
              presupuesto: item.presupuesto || "$0",
              acciones: item.acciones || "Sin acciones definidas",
              indicadores: item.indicadores || `Avance: ${item.avance}%`,
              fechaInicio: item.fechaInicio || "01/01/2025",
              fechaFin: item.fechaFin || "31/12/2025",
              estado: item.estado || "Pendiente",
              area: item.area || "Sin área",
              color: item.color || "bg-gray-500",
              avance: item.avance,
            }))}
          />
        </Suspense>
      </CardContent>
    </Card>
  )
}
