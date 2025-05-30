"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { itemAnimation } from "@/constants/dashboard"
import dynamic from "next/dynamic"
import dashboardData from "@/data/dashboard-data.json"

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

// Importar ApexCharts de forma dinámica para evitar problemas de SSR
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

// Obtener datos del archivo JSON centralizado
const { areas, meses, datos, totales } = dashboardData.activityChart

// Definir tipos para los datos de actividad
type FilterType = "documentos" | "planesAccion" | "listasChequeo"

// Colores para cada área
const areaColors = {
  "Calidad Educativa": "#f97316", // naranja
  "Cobertura e Infraestructura": "#22c55e", // verde
  "Inspección y Vigilancia": "#3b82f6", // azul
  "Talento Humano": "#a855f7", // púrpura
}

export function ActivityChart() {
  const [mounted, setMounted] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    documentos: true,
    planesAccion: true,
    listasChequeo: true,
  })

  // Función para alternar filtros
  const toggleFilter = (filter: FilterType) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }))
  }

  // Generar series de datos basadas en los filtros activos
  const generateSeriesData = () => {
    return areas.map((area) => {
      // Ajustar los valores según los filtros activos
      const adjustedData = meses.map((_, index) => {
        let value = datos[area][index]

        // Ajustar valor según filtros activos
        if (!activeFilters.documentos) value -= 10
        if (!activeFilters.planesAccion) value -= 8
        if (!activeFilters.listasChequeo) value -= 7

        return Math.max(value, 0) // Asegurar que no sea negativo
      })

      return {
        name: area,
        data: adjustedData,
      }
    })
  }

  // Opciones para el gráfico de ApexCharts
  const chartOptions = {
    chart: {
      type: "line",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      background: "transparent",
    },
    colors: Object.values(areaColors),
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: meses,
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
      show: false,
    },
    grid: {
      borderColor: "rgba(163, 163, 163, 0.1)",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        show: true,
      },
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
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
    <motion.div variants={itemAnimation} className="col-span-full lg:col-span-4">
      <Card className="dashboard-card h-full">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Resumen de actividades en el sistema durante los últimos meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Filtros simplificados */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-2">
              <button
                onClick={() => toggleFilter("documentos")}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  activeFilters.documentos ? "bg-gray-100 dark:bg-gray-800" : "opacity-50"
                }`}
              >
                <span className="text-xs font-medium">Documentos ({totales.documentos})</span>
              </button>
              <button
                onClick={() => toggleFilter("planesAccion")}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  activeFilters.planesAccion ? "bg-gray-100 dark:bg-gray-800" : "opacity-50"
                }`}
              >
                <span className="text-xs font-medium">Planes de Acción ({totales.planesAccion})</span>
              </button>
              <button
                onClick={() => toggleFilter("listasChequeo")}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  activeFilters.listasChequeo ? "bg-gray-100 dark:bg-gray-800" : "opacity-50"
                }`}
              >
                <span className="text-xs font-medium">Listas de Chequeo ({totales.listasChequeo})</span>
              </button>
            </div>

            {/* Leyenda de áreas */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
              {areas.map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: areaColors[area as keyof typeof areaColors] }}
                  ></div>
                  <span className="text-xs font-medium">{area}</span>
                </div>
              ))}
            </div>

            {/* Gráfico con ApexCharts */}
            <div className="h-[280px] w-full">
              {mounted && (
                <ReactApexChart options={chartOptions} series={generateSeriesData()} type="line" height={280} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
