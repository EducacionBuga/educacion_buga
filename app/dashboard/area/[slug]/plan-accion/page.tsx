"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, FileText, Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { MatrizSeguimientoItem } from "@/hooks/use-matriz-seguimiento"

// Mapeo de slugs a nombres de área
const AREA_SLUGS: Record<string, string> = {
  "calidad-educativa": "Calidad Educativa",
  "inspeccion-vigilancia": "Inspección y Vigilancia",
  "cobertura-infraestructura": "Cobertura e Infraestructura",
  "talento-humano": "Talento Humano",
  planeacion: "Planeación",
  despacho: "Despacho",
}

// Función para obtener la clase de color según el estado
function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "en progreso":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "completado":
      return "bg-green-100 text-green-800 border-green-200"
    case "retrasado":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function PlanAccionPage() {
  const params = useParams()
  const slug = params.slug as string
  const [areaName, setAreaName] = useState<string>(AREA_SLUGS[slug] || "Área")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<MatrizSeguimientoItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClientComponentClient()

  // Cargar datos del plan de acción para el área
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // 1. Obtener información del área desde Supabase usando el slug
        const { data: areasData, error: areasError } = await supabase
          .from("areas")
          .select("id, codigo, nombre")
          .or(`codigo.ilike.${slug}%,nombre.ilike.%${AREA_SLUGS[slug] || slug}%`)

        if (areasError) {
          console.error("Error cargando áreas:", areasError)
          setError(`Error: ${areasError.message}`)
          return
        }

        if (!areasData || areasData.length === 0) {
          setError("No se encontró el área especificada")
          return
        }

        // Usar la primera área encontrada
        const area = areasData[0]
        setAreaName(area.nombre || AREA_SLUGS[slug] || "Área")

        // 2. Obtener datos del plan de acción para el área
        const { data: planesData, error: planesError } = await supabase
          .from("plan_accion")
          .select(`
            id, 
            area_id,
            programa,
            objetivo,
            meta,
            presupuesto,
            acciones,
            indicadores,
            porcentaje_avance,
            fecha_inicio,
            fecha_fin,
            responsable,
            estado,
            prioridad,
            comentarios,
            meta_decenal,
            macroobjetivo_decenal,
            objetivo_decenal,
            created_at,
            updated_at
          `)
          .eq("area_id", area.id)
          .order("created_at", { ascending: false })

        if (planesError) {
          console.error("Error cargando datos de plan de acción:", planesError)
          setError(`Error: ${planesError.message}`)
          return
        }

        // Transformar los datos para la visualización
        const transformedData: MatrizSeguimientoItem[] = planesData.map((plan) => ({
          id: plan.id,
          area: area.nombre || "",
          areaId: area.id,
          color: "blue",
          programa: plan.programa || "",
          objetivo: plan.objetivo || "",
          meta: plan.meta || "",
          presupuesto: plan.presupuesto || "",
          acciones: plan.acciones || "",
          indicadores: plan.indicadores || "",
          avance: plan.porcentaje_avance || 0,
          fechaInicio: formatDate(plan.fecha_inicio),
          fechaFin: formatDate(plan.fecha_fin),
          responsable: plan.responsable || "",
          estado: plan.estado || "Pendiente",
          prioridad: plan.prioridad || "Media",
          descripcion: plan.comentarios || plan.acciones || "",
          metaDecenal: plan.meta_decenal || "",
          macroobjetivoDecenal: plan.macroobjetivo_decenal || "",
          objetivoDecenal: plan.objetivo_decenal || "",
        }))

        setItems(transformedData)
        console.log(`Cargados ${transformedData.length} elementos del plan de acción para ${area.nombre}`)
      } catch (err: any) {
        console.error("Error inesperado:", err)
        setError(`Error inesperado: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadData()
    }
  }, [slug, supabase])

  // Filtrar items por término de búsqueda
  const filteredItems = items.filter(
    (item) =>
      item.programa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.objetivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.meta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsable.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calcular estadísticas
  const calculateStats = () => {
    if (items.length === 0) return { total: 0, presupuestoTotal: 0, avancePromedio: 0, estadoCount: {} }

    const presupuestoTotal = items.reduce((sum, item) => {
      const numStr = item.presupuesto.replace(/[^\d]/g, "")
      return sum + (numStr ? Number.parseInt(numStr, 10) : 0)
    }, 0)

    const avancePromedio = Math.round(items.reduce((sum, item) => sum + item.avance, 0) / items.length)

    // Contar por estado
    const estadoCount: Record<string, number> = {}
    items.forEach((item) => {
      const estado = item.estado
      estadoCount[estado] = (estadoCount[estado] || 0) + 1
    })

    return {
      total: items.length,
      presupuestoTotal,
      avancePromedio,
      estadoCount,
    }
  }

  const stats = calculateStats()

  // Función para añadir un nuevo elemento (placeholder)
  const handleAdd = () => {
    alert("Funcionalidad de añadir en desarrollo")
  }

  // Función para exportar (placeholder)
  const handleExport = () => {
    alert("Funcionalidad de exportar en desarrollo")
  }

  // Función para editar (placeholder)
  const handleEdit = (id: string) => {
    alert(`Editar elemento con ID: ${id}`)
  }

  // Función para eliminar (placeholder)
  const handleDelete = (id: string) => {
    alert(`Eliminar elemento con ID: ${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando información del área...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto mt-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">{areaName}</h1>

      <h2 className="text-xl font-bold text-center uppercase mt-8">PLAN DE ACCIÓN POR ÁREA</h2>

      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start gap-3">
              <FileText className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold text-blue-600">Plan de acción por área</h3>
                <p className="text-sm text-muted-foreground">Gestión de planes de acción por área de {areaName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>
                <span className="mr-1">+</span> Añadir
              </Button>
              <Button variant="outline" onClick={handleExport}>
                Exportar
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" /> Filtrar
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar programa..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa</TableHead>
                  <TableHead>Plan Decenal</TableHead>
                  <TableHead>Macroobjetivo</TableHead>
                  <TableHead>Objetivo Decenal</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Acciones realizadas</TableHead>
                  <TableHead>Indicadores Alcanzados</TableHead>
                  <TableHead>% Avance</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                      No hay actividades registradas para esta área
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.programa}</TableCell>
                      <TableCell>{item.metaDecenal || "N/A"}</TableCell>
                      <TableCell>
                        {item.macroobjetivoDecenal ? item.macroobjetivoDecenal.split("\n")[0] : "N/A"}
                      </TableCell>
                      <TableCell>{item.objetivoDecenal || "N/A"}</TableCell>
                      <TableCell>{item.objetivo}</TableCell>
                      <TableCell>{item.meta}</TableCell>
                      <TableCell>{item.presupuesto}</TableCell>
                      <TableCell>{item.acciones}</TableCell>
                      <TableCell>{item.indicadores}</TableCell>
                      <TableCell>{item.avance}%</TableCell>
                      <TableCell>{item.fechaInicio}</TableCell>
                      <TableCell>{item.fechaFin}</TableCell>
                      <TableCell>{item.responsable}</TableCell>
                      <TableCell>
                        <Badge
                          className={`font-normal ${
                            item.estado.toLowerCase() === "en progreso"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : item.estado.toLowerCase() === "pendiente"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-green-100 text-green-800 hover:bg-green-100"
                          }`}
                        >
                          {item.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item.id)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resumen del Plan de Acción */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resumen del Plan de Acción</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Presupuesto Total */}
            <div className="border rounded-md p-4">
              <h4 className="text-sm text-muted-foreground mb-1">Presupuesto Total:</h4>
              <p className="text-2xl font-bold text-green-600">${stats.presupuestoTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Suma de {stats.total} actividades</p>
            </div>

            {/* Avance Promedio */}
            <div className="border rounded-md p-4">
              <h4 className="text-sm text-muted-foreground mb-1">Avance Promedio:</h4>
              <p className="text-2xl font-bold text-blue-600">{stats.avancePromedio}%</p>
              <p className="text-xs text-muted-foreground mb-2">de todas las actividades</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
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
            <div className="border rounded-md p-4">
              <h4 className="text-sm text-muted-foreground mb-1">Distribución por Estado:</h4>

              {/* Barra de distribución */}
              <div className="flex w-full h-6 rounded-md overflow-hidden mt-2 mb-2">
                {Object.entries(stats.estadoCount).map(([estado, count]) => {
                  const porcentaje = Math.round((count / stats.total) * 100)
                  let color = "bg-gray-500"

                  if (estado.toLowerCase() === "en progreso") color = "bg-blue-500"
                  else if (estado.toLowerCase() === "pendiente") color = "bg-yellow-500"
                  else if (estado.toLowerCase() === "completado") color = "bg-green-500"
                  else if (estado.toLowerCase() === "retrasado") color = "bg-red-500"

                  return (
                    <div
                      key={estado}
                      className={color}
                      style={{ width: `${porcentaje}%` }}
                      title={`${estado}: ${porcentaje}%`}
                    ></div>
                  )
                })}
              </div>

              {/* Leyenda */}
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(stats.estadoCount).map(([estado, count]) => {
                  const porcentaje = Math.round((count / stats.total) * 100)
                  let color = "bg-gray-500"

                  if (estado.toLowerCase() === "en progreso") color = "bg-blue-500"
                  else if (estado.toLowerCase() === "pendiente") color = "bg-yellow-500"
                  else if (estado.toLowerCase() === "completado") color = "bg-green-500"
                  else if (estado.toLowerCase() === "retrasado") color = "bg-red-500"

                  return (
                    <div key={estado} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-1 ${color}`}></div>
                      <span>
                        {estado}: {count} ({porcentaje}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Función auxiliar para formatear fechas
function formatDate(dateString: string | null): string {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    return dateString || ""
  }
}
