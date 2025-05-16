"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { itemAnimation } from "@/constants/dashboard"
import { FileText, Users, CheckSquare, Clock } from "lucide-react"
import dynamic from "next/dynamic"
import dashboardData from "@/data/dashboard-data.json"

// Importar ApexCharts de forma dinámica para evitar problemas de SSR
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

// Obtener datos del archivo JSON centralizado
const { documentos, planesAccion, usuariosActivos, tareasPendientes } = dashboardData.statsCards

export function StatsCards() {
  const [mounted, setMounted] = useState(false)

  // Referencias para los contenedores de gráficos
  const chartRefs = {
    documentos: useRef<HTMLDivElement>(null),
    planesAccion: useRef<HTMLDivElement>(null),
    usuariosActivos: useRef<HTMLDivElement>(null),
    tareasPendientes: useRef<HTMLDivElement>(null),
  }

  // Opciones comunes para los mini gráficos
  const getSparklineOptions = (isPositive: boolean) => ({
    chart: {
      type: "line",
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    colors: [isPositive ? "#22c55e" : "#ef4444"],
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: () => "",
        },
      },
      marker: {
        show: false,
      },
    },
  })

  // Efecto para manejar el montaje del componente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setMounted(false)
      setTimeout(() => setMounted(true), 100)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <motion.div variants={itemAnimation}>
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Documentos Totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{documentos.total}</div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+{documentos.incremento}%</span> desde el mes pasado
              </p>
            </div>
            <div className="h-[40px] mt-2">
              {mounted && (
                <ReactApexChart
                  options={getSparklineOptions(true)}
                  series={[{ data: documentos.tendencia }]}
                  type="line"
                  height={40}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemAnimation}>
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Planes de Acción</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{planesAccion.total}</div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+{planesAccion.incremento}%</span> desde el mes pasado
              </p>
            </div>
            <div className="h-[40px] mt-2">
              {mounted && (
                <ReactApexChart
                  options={getSparklineOptions(true)}
                  series={[{ data: planesAccion.tendencia }]}
                  type="line"
                  height={40}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemAnimation}>
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{usuariosActivos.total}</div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+{usuariosActivos.incremento}%</span> desde el mes pasado
              </p>
            </div>
            <div className="h-[40px] mt-2">
              {mounted && (
                <ReactApexChart
                  options={getSparklineOptions(true)}
                  series={[{ data: usuariosActivos.tendencia }]}
                  type="line"
                  height={40}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemAnimation}>
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{tareasPendientes.total}</div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">-{tareasPendientes.decremento}%</span> desde el mes pasado
              </p>
            </div>
            <div className="h-[40px] mt-2">
              {mounted && (
                <ReactApexChart
                  options={getSparklineOptions(false)}
                  series={[{ data: tareasPendientes.tendencia }]}
                  type="line"
                  height={40}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
