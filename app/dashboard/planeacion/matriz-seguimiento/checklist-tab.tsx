"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileCheck } from "lucide-react"
import { Suspense, lazy } from "react"

const ChecklistReal = lazy(() =>
  import("@/components/dashboard/checklist-real").then((mod) => ({ default: mod.ChecklistReal })),
)

const LoadingFallback = () => (
  <div className="flex justify-center items-center py-20" aria-live="polite" aria-busy="true">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" role="status"></div>
    <span className="sr-only">Cargando...</span>
  </div>
)

export function ChecklistTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCheck className="mr-2 h-5 w-5" aria-hidden="true" />
          Lista de Chequeo
        </CardTitle>
        <CardDescription>Análisis y seguimiento de las listas de chequeo de todas las áreas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<LoadingFallback />}>
          <ChecklistReal />
        </Suspense>
      </CardContent>
    </Card>
  )
}
