"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import dashboardData from "@/data/dashboard-data.json"

// Importar ApexCharts de forma dinámica para evitar problemas de SSR
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

// Obtener datos del archivo JSON centralizado
const { proyectos } = dashboardData.timelinePreview

// Colores para cada área
const areaColors = {
  "Calidad Educativa": "#f97316",
  "Cobertura e Infraestructura": "#22c55e",
  "Inspección y Vigilancia": "#3b82f6",
  "Talento Humano": "#a855f7",
}

export function TimelinePreview() {
  const [mounted, setMounted] = useState(false)

  // Preparar datos para el gráfico de Gantt
  const prepareGanttData = () => {
    return proyectos.map((proyecto) => ({
      x: proyecto.nombre,
      y: [new Date(proyecto.fechaInicio).getTime(), new Date(proyecto.fechaFin).getTime()],
      fillColor: areaColors[proyecto.area as keyof typeof areaColors],
      proyecto: proyecto,
    }))
  }

  // Opciones para el gráfico de Gantt
  const ganttChartOptions = {
    chart: {
      height: 250,
      type: "rangeBar",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        dataLabels: {
          hideOverflowingLabels: false,
        },
        barHeight: "50%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: any, opts: any) => {
        const proyecto = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].proyecto
        return `${proyecto.progreso}%`
      },
      style: {
        colors: ["#fff"],
        fontWeight: "bold",
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "#9ca3af",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9ca3af",
        },
      },
    },
    grid: {
      borderColor: "rgba(163, 163, 163, 0.1)",
      strokeDashArray: 5,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    tooltip: {
      theme: "dark",
      custom: ({ seriesIndex, dataPointIndex, w }: any) => {
        const proyecto = w.config.series[seriesIndex].data[dataPointIndex].proyecto
        return `
          <div class="p-2">
            <div class="font-bold mb-1">${proyecto.nombre}</div>
            <div class="text-xs mb-1">${proyecto.area}</div>
            <div class="text-xs mb-1">Progreso: ${proyecto.progreso}%</div>
            <div class="text-xs mb-1">Responsable: ${proyecto.responsable}</div>
            <div class="text-xs">${proyecto.fechaInicio} - ${proyecto.fechaFin}</div>
          </div>
        `
      },
    },
    legend: {
      show: false,
    },
  }

  // Efecto para manejar el montaje del componente
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Línea de Tiempo</CardTitle>
          <CardDescription>Visualización de planes de acción en curso</CardDescription>
        </div>
        <Link href="/dashboard/plan-accion-timeline">
          <Button variant="outline" size="sm" className="ml-auto">
            <Calendar className="mr-2 h-4 w-4" />
            Ver completo
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(areaColors).map(([area, color]) => (
              <Badge
                key={area}
                variant="outline"
                style={{ backgroundColor: `${color}20`, color: color, borderColor: `${color}40` }}
              >
                {area}
              </Badge>
            ))}
          </div>

          <div className="h-[250px]">
            {mounted && (
              <ReactApexChart
                options={ganttChartOptions}
                series={[{ data: prepareGanttData() }]}
                type="rangeBar"
                height={250}
              />
            )}
          </div>

          <div className="flex justify-end">
            <Link href="/dashboard/plan-accion-timeline">
              <Button variant="link" size="sm" className="text-primary">
                Ver todos los planes
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
