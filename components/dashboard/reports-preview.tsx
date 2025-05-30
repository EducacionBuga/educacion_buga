"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import dashboardData from "@/data/dashboard-data.json"

// Importar ApexCharts de forma dinámica para evitar problemas de SSR
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

// Función para limitar la frecuencia de ejecución de una función
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Obtener datos del archivo JSON centralizado
const { cumplimiento, comparativo, areaColors } = dashboardData.reportsPreview

export function ReportsPreview() {
  const [activeTab, setActiveTab] = useState("cumplimiento")
  const [mounted, setMounted] = useState(false)

  // Preparar series para el gráfico de cumplimiento
  const prepareAreaSeries = () => {
    const areas = Object.keys(areaColors)
    return areas.map((area) => ({
      name: area,
      data: cumplimiento.map((item) => item[area as keyof typeof item] as number),
    }))
  }

  // Preparar series para el gráfico comparativo
  const prepareComparativeSeries = () => [
    {
      name: "2023",
      data: comparativo.map((item) => item["2023"]),
    },
    {
      name: "2024",
      data: comparativo.map((item) => item["2024"]),
    },
  ]

  // Opciones para el gráfico de cumplimiento
  const areaChartOptions = {
    chart: {
      type: "area",
      height: 350,
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
    colors: Object.values(areaColors),
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: cumplimiento.map((item) => item.mes),
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
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#9ca3af",
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        show: true,
      },
    },
    grid: {
      borderColor: "rgba(163, 163, 163, 0.1)",
      strokeDashArray: 5,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetY: 10,
          },
        },
      },
    ],
  }

  // Opciones para el gráfico comparativo
  const lineChartOptions = {
    chart: {
      type: "line",
      height: 350,
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
    colors: ["#f97316", "#3b82f6"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 5,
      hover: {
        size: 7,
      },
    },
    xaxis: {
      categories: comparativo.map((item) => item.mes),
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
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#9ca3af",
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        show: true,
      },
    },
    grid: {
      borderColor: "rgba(163, 163, 163, 0.1)",
      strokeDashArray: 5,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetY: 10,
          },
        },
      },
    ],
  }

  // Efecto para manejar el montaje del componente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setMounted(false)
      setTimeout(() => setMounted(true), 100)
    }

    const debouncedHandleResize = debounce(handleResize, 250)
    window.addEventListener("resize", debouncedHandleResize)
    return () => window.removeEventListener("resize", debouncedHandleResize)
  }, [])

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle>Informes y Reportes</CardTitle>
        <CardDescription>Visualización de informes y métricas de cumplimiento</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full max-w-[400px] mx-auto">
            <TabsTrigger value="cumplimiento">Cumplimiento Mensual</TabsTrigger>
            <TabsTrigger value="comparativo">Análisis Comparativo</TabsTrigger>
          </TabsList>

          <TabsContent value="cumplimiento" className="h-[350px]">
            {mounted && (
              <ReactApexChart options={areaChartOptions} series={prepareAreaSeries()} type="area" height={350} />
            )}
          </TabsContent>

          <TabsContent value="comparativo" className="h-[350px]">
            {mounted && (
              <ReactApexChart options={lineChartOptions} series={prepareComparativeSeries()} type="line" height={350} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
