"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, BarChart2, FileText } from "lucide-react"
import Link from "next/link"
import dashboardData from "@/data/dashboard-data.json"

// Obtener datos del archivo JSON centralizado
const items = dashboardData.quickAccess

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-4 w-4" />,
  BarChart: <BarChart className="h-4 w-4" />,
  BarChart2: <BarChart2 className="h-4 w-4" />,
}

export function QuickAccess({ className }: { className?: string }) {
  return (
    <Card className={`dashboard-card h-full ${className || ""}`}>
      <CardHeader>
        <CardTitle>Acceso Rápido</CardTitle>
        <CardDescription>Enlaces a secciones frecuentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center space-x-2 rounded-md border p-2 md:p-3 transition-colors hover:bg-muted"
            >
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md bg-primary/10">
                {iconMap[item.icon] || <FileText className="h-4 w-4 md:h-5 md:w-5" />}
              </div>
              <div className="text-sm md:text-base font-medium">{item.title}</div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
