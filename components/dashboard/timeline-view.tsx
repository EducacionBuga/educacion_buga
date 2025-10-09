"use client"

import { useScroll, useTransform, motion } from "framer-motion"
import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Target, TrendingUp, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineProject {
  id: string
  programa: string
  objetivo: string
  meta: string
  presupuesto: string
  acciones: string
  indicadores: string
  fechaInicio: string
  fechaFin: string
  estado: "Completado" | "En progreso" | "Pendiente" | "Retrasado"
  area: string
  color?: string
  avance?: number | string
}

interface TimelineViewProps {
  projects: TimelineProject[]
  className?: string
}

export function TimelineView({ projects, className }: TimelineViewProps) {
  const [selectedArea, setSelectedArea] = useState<string>("todas")
  const [selectedEstado, setSelectedEstado] = useState<string>("todos")
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  // Convertir fecha de string a objeto Date
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date()
    const [day, month, year] = dateStr.split("/").map(Number)
    return new Date(year, month - 1, day)
  }

  // Formatear fecha para mostrar
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const [day, month, year] = dateStr.split("/")
    return `${day}/${month}/${year}`
  }

  // Filtrar proyectos por área y estado
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesArea = selectedArea === "todas" || project.area === selectedArea
      const matchesEstado = selectedEstado === "todos" || project.estado === selectedEstado
      return matchesArea && matchesEstado
    })
  }, [projects, selectedArea, selectedEstado])

  // Ordenar proyectos por fecha de inicio
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const dateA = parseDate(a.fechaInicio)
      const dateB = parseDate(b.fechaInicio)
      return dateA.getTime() - dateB.getTime()
    })
  }, [filteredProjects])

  // Obtener áreas únicas
  const areas = useMemo(() => {
    const uniqueAreas = Array.from(new Set(projects.map((project) => project.area)))
    return ["todas", ...uniqueAreas]
  }, [projects])

  // Obtener estados únicos
  const estados = useMemo(() => {
    return ["todos", "Completado", "En progreso", "Pendiente", "Retrasado"]
  }, [])

  // Calcular la duración del proyecto en días
  const calculateDuration = (startDateStr: string, endDateStr: string) => {
    const startDate = parseDate(startDateStr)
    const endDate = parseDate(endDateStr)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Obtener las clases de color completas basadas en el estado del proyecto
  const getStatusColorClasses = (status: string, defaultColor?: string) => {
    if (defaultColor) {
      if (defaultColor.startsWith("bg-")) {
        const color = defaultColor.replace("bg-", "").replace("-500", "")
        return {
          border: `border-${color}-500`,
          bg: `bg-${color}-500`,
          bgLight: `bg-${color}-50`,
          borderLight: `border-${color}-200`
        }
      }
    }

    switch (status) {
      case "Completado":
        return {
          border: "border-green-500",
          bg: "bg-green-500",
          bgLight: "bg-green-50",
          borderLight: "border-green-200"
        }
      case "En progreso":
        return {
          border: "border-blue-500",
          bg: "bg-blue-500",
          bgLight: "bg-blue-50",
          borderLight: "border-blue-200"
        }
      case "Pendiente":
        return {
          border: "border-orange-500",
          bg: "bg-orange-500",
          bgLight: "bg-orange-50",
          borderLight: "border-orange-200"
        }
      case "Retrasado":
        return {
          border: "border-red-500",
          bg: "bg-red-500",
          bgLight: "bg-red-50",
          borderLight: "border-red-200"
        }
      default:
        return {
          border: "border-gray-500",
          bg: "bg-gray-500",
          bgLight: "bg-gray-50",
          borderLight: "border-gray-200"
        }
    }
  }

  // Obtener el icono basado en el estado del proyecto
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completado":
        return <CheckCircle className="h-5 w-5" />
      case "En progreso":
        return <TrendingUp className="h-5 w-5" />
      case "Pendiente":
        return <Clock className="h-5 w-5" />
      case "Retrasado":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  // Obtener el porcentaje de avance real del proyecto
  const getProjectProgress = (project: TimelineProject) => {
    // Si existe avance en el proyecto, usarlo
    if (project.avance !== undefined) {
      // Si es string, convertirlo a número
      if (typeof project.avance === "string") {
        // Si el string termina con %, quitarlo
        const avanceStr = project.avance.endsWith("%") ? project.avance.slice(0, -1) : project.avance
        return Number.parseInt(avanceStr, 10)
      }
      return project.avance
    }

    // Si no hay avance definido, usar valores por defecto según el estado
    switch (project.estado) {
      case "Completado":
        return 100
      case "En progreso":
        return 60
      case "Pendiente":
        return 10
      case "Retrasado":
        return 30
      default:
        return 0
    }
  }

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setHeight(rect.height)
    }
  }, [ref, sortedProjects])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Visualización de Planes de Acción</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area === "todas" ? "Todas las áreas" : area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado === "todos" ? "Todos los estados" : estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-white dark:bg-neutral-950 font-sans" ref={containerRef}>
          {sortedProjects.length > 0 ? (
            <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
              {sortedProjects.map((project, index) => {
                const statusColors = getStatusColorClasses(project.estado, project.color)
                const duration = calculateDuration(project.fechaInicio, project.fechaFin)
                const progress = getProjectProgress(project)

                return (
                  <div key={project.id} className="flex justify-start pt-10 md:pt-20 md:gap-10">
                    <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                      <div
                        className={`h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center border-2 ${statusColors.border}`}
                      >
                        <div
                          className={`h-6 w-6 rounded-full ${statusColors.bg} flex items-center justify-center text-white`}
                        >
                          {getStatusIcon(project.estado)}
                        </div>
                      </div>
                      <h3 className="hidden md:block text-xl md:pl-20 md:text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                        {formatDate(project.fechaInicio)}
                      </h3>
                    </div>

                    <div className="relative pl-20 pr-4 md:pl-4 w-full">
                      <h3 className="md:hidden block text-lg mb-2 text-left font-bold text-neutral-800 dark:text-neutral-200">
                        {formatDate(project.fechaInicio)}
                      </h3>

                      <div className={`p-4 rounded-lg border ${statusColors.borderLight} ${statusColors.bgLight} mb-6`}>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                              {project.programa}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`${statusColors.bgLight} text-gray-800 ${statusColors.borderLight}`}
                            >
                              {project.estado}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-500">{project.area}</p>

                          <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <Target className="h-4 w-4 text-gray-500" />
                                  Objetivo
                                </h4>
                                <p className="text-sm mt-1">{project.objetivo}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-gray-500" />
                                  Meta
                                </h4>
                                <p className="text-sm mt-1">{project.meta}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-gray-500" />
                                  Presupuesto
                                </h4>
                                <p className="text-sm mt-1">{project.presupuesto}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  Periodo
                                </h4>
                                <p className="text-sm mt-1">
                                  {formatDate(project.fechaInicio)} - {formatDate(project.fechaFin)} ({duration} días)
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-gray-500" />
                                Indicadores
                              </h4>
                              <p className="text-sm mt-1">{project.indicadores}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium">Acciones realizadas</h4>
                              <p className="text-sm mt-1">{project.acciones}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium">Progreso</h4>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div
                                  className={`h-2.5 rounded-full ${statusColors.bg}`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div
                style={{
                  height: height + "px",
                }}
                className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
              >
                <motion.div
                  style={{
                    height: heightTransform,
                    opacity: opacityTransform,
                  }}
                  className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No hay proyectos que coincidan con los filtros</h3>
              <p className="text-gray-500 mt-2">Intente cambiar los filtros o añadir nuevos proyectos al sistema</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
