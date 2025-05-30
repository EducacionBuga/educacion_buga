"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveChartWrapper } from "@/components/dashboard/responsive-chart-wrapper"
import { Chart } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, BarChart3, LineChart } from "lucide-react"
import type { PlanAccionItem } from "@/types/plan-accion"

interface PlanAccionAreaChartsProps {
  data: PlanAccionItem[]
  area: string
  color?: "blue" | "green" | "orange" | "purple" | "default"
}

export function PlanAccionAreaCharts({ data, area, color = "orange" }: PlanAccionAreaChartsProps) {
  const [activeChart, setActiveChart] = useState("avance")

  const getColorHex = () => {
    switch (color) {
      case "blue":
        return "#3b82f6"
      case "green":
        return "#22c55e"
      case "orange":
        return "#f97316"
      case "purple":
        return "#a855f7"
      default:
        return "#6366f1"
    }
  }

  const colorHex = getColorHex()
  const colorHexLight = `${colorHex}33` // 20% opacity

  // Calcular datos para el gráfico de avance
  const avanceData = {
    labels: data.map((item) => item.programa),
    datasets: [
      {
        label: "% de Avance",
        data: data.map((item) => item.porcentajeAvance),
        backgroundColor: colorHexLight,
        borderColor: colorHex,
        borderWidth: 2,
      },
    ],
  }

  // Calcular datos para el gráfico de estado
  const estadoData = {
    labels: ["Pendiente", "En progreso", "Completado"],
    datasets: [
      {
        label: "Cantidad",
        data: [
          data.filter((item) => item.estado === "Pendiente").length,
          data.filter((item) => item.estado === "En progreso").length,
          data.filter((item) => item.estado === "Completado").length,
        ],
        backgroundColor: ["#fde047", "#60a5fa", "#86efac"],
        borderColor: ["#eab308", "#3b82f6", "#22c55e"],
        borderWidth: 1,
      },
    ],
  }

  // Calcular datos para el gráfico de presupuesto
  const presupuestoData = {
    labels: data.map((item) => item.programa),
    datasets: [
      {
        label: "Presupuesto",
        data: data.map((item) => {
          // Convertir el presupuesto de formato "$100,000,000" a número
          const numStr = item.presupuesto.replace(/[^\d]/g, "")
          return numStr ? Number.parseInt(numStr, 10) : 0
        }),
        backgroundColor: colorHexLight,
        borderColor: colorHex,
        borderWidth: 2,
      },
    ],
  }

  // Opciones para los gráficos
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Porcentaje de Avance por Programa - ${area}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Porcentaje (%)",
        },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Distribución por Estado - ${area}`,
      },
    },
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Presupuesto por Programa - ${area}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Presupuesto ($)",
        },
      },
    },
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Análisis del Plan de Acción</CardTitle>
          <Tabs defaultValue="avance" value={activeChart} onValueChange={setActiveChart}>
            <TabsList>
              <TabsTrigger value="avance">
                <BarChart3 className="h-4 w-4 mr-2" />
                Avance
              </TabsTrigger>
              <TabsTrigger value="estado">
                <PieChart className="h-4 w-4 mr-2" />
                Estado
              </TabsTrigger>
              <TabsTrigger value="presupuesto">
                <LineChart className="h-4 w-4 mr-2" />
                Presupuesto
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No hay datos disponibles</p>
            <p className="text-sm">Añada elementos al plan de acción para visualizar los gráficos</p>
          </div>
        ) : (
          <ResponsiveChartWrapper>
            {activeChart === "avance" && <Chart type="bar" data={avanceData} options={barOptions} />}
            {activeChart === "estado" && <Chart type="pie" data={estadoData} options={pieOptions} />}
            {activeChart === "presupuesto" && <Chart type="line" data={presupuestoData} options={lineOptions} />}
          </ResponsiveChartWrapper>
        )}
      </CardContent>
    </Card>
  )
}
