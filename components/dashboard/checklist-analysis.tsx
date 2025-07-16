"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"
import listaChequeoData from "@/data/lista-chequeo-data.json"

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

// Asegurarse de que listaChequeoData tenga la estructura esperada
const defaultData = {
  titulo: "Lista de Chequeo Contractual",
  etapas: [],
}

// Verificar y normalizar los datos
const safeListaChequeoData = {
  titulo: listaChequeoData.titulo || defaultData.titulo,
  etapas: Array.isArray(listaChequeoData.etapas) ? listaChequeoData.etapas : defaultData.etapas,
}

export function ChecklistAnalysis() {
  const [activeTab, setActiveTab] = useState("grafico")
  const [mounted, setMounted] = useState(false)
  const [selectedEtapa, setSelectedEtapa] = useState<string>("todas")
  const [selectedDocumento, setSelectedDocumento] = useState<string>("todos")
  const [documentosFiltrados, setDocumentosFiltrados] = useState<any[]>([])
  const [documentosDisponibles, setDocumentosDisponibles] = useState<any[]>([])

  // Obtener todas las etapas
  const etapas = safeListaChequeoData.etapas || []

  // Efecto para filtrar documentos según la etapa seleccionada
  useEffect(() => {
    if (selectedEtapa === "todas") {
      // Si se selecciona "todas", obtener todos los documentos de todas las etapas
      const todosDocumentos = etapas.flatMap((etapa) => (Array.isArray(etapa.documentos) ? etapa.documentos : []))
      setDocumentosDisponibles(todosDocumentos)
      setDocumentosFiltrados(todosDocumentos)
    } else {
      // Filtrar por la etapa seleccionada
      const etapaSeleccionada = etapas.find((etapa) => etapa.nombre === selectedEtapa)
      if (etapaSeleccionada && Array.isArray(etapaSeleccionada.documentos)) {
        setDocumentosDisponibles(etapaSeleccionada.documentos)
        setDocumentosFiltrados(etapaSeleccionada.documentos)
      } else {
        setDocumentosDisponibles([])
        setDocumentosFiltrados([])
      }
    }
    // Resetear el documento seleccionado cuando cambia la etapa
    setSelectedDocumento("todos")
  }, [selectedEtapa, etapas])

  // Efecto para filtrar por documento específico
  useEffect(() => {
    if (selectedDocumento === "todos") {
      // Si se selecciona "todos", mostrar todos los documentos disponibles según la etapa
      setDocumentosFiltrados(documentosDisponibles)
    } else {
      // Filtrar por el documento seleccionado
      const documentoFiltrado = documentosDisponibles.filter((doc) => doc.nombre === selectedDocumento)
      setDocumentosFiltrados(documentoFiltrado)
    }
  }, [selectedDocumento, documentosDisponibles])

  // Preparar datos para el gráfico
  const prepararDatosGrafico = () => {
    // Si no hay documentos filtrados, devolver datos vacíos
    if (!documentosFiltrados || documentosFiltrados.length === 0) return { categories: [], series: [] }

    // Si es un documento específico
    if (selectedDocumento !== "todos" && documentosFiltrados.length > 0) {
      const documento = documentosFiltrados[0]
      // Verificar que documento.respuestas existe
      if (!documento.respuestas) {
        return { categories: [], series: [] }
      }

      return {
        categories: [documento.nombre],
        series: [
          {
            name: "Sí",
            data: [documento.respuestas.si || 0],
          },
          {
            name: "No",
            data: [documento.respuestas.no || 0],
          },
          {
            name: "No Aplica",
            data: [documento.respuestas.noAplica || 0],
          },
        ],
      }
    }

    // Si estamos viendo todas las etapas y no se ha seleccionado una etapa específica,
    // mostrar el consolidado por etapas
    if (selectedEtapa === "todas") {
      // Verificar que etapas es un array
      if (!Array.isArray(etapas) || etapas.length === 0) {
        return { categories: [], series: [] }
      }

      // Calcular promedios por etapa
      const promediosPorEtapa = etapas.map((etapa) => {
        // Verificar que etapa.documentos existe y es un array
        const docs = Array.isArray(etapa.documentos) ? etapa.documentos : []
        const total = docs.length

        if (total === 0) return { nombre: etapa.nombre || "Sin nombre", si: 0, no: 0, noAplica: 0 }

        const sumatorias = docs.reduce(
          (acc, doc) => {
            // Verificar que doc.respuestas existe
            if (doc.respuestas) {
              acc.si += doc.respuestas.si || 0
              acc.no += doc.respuestas.no || 0
              acc.noAplica += doc.respuestas.noAplica || 0
            }
            return acc
          },
          { si: 0, no: 0, noAplica: 0 },
        )

        return {
          nombre: etapa.nombre || "Sin nombre",
          si: Number.parseFloat((sumatorias.si / total).toFixed(1)),
          no: Number.parseFloat((sumatorias.no / total).toFixed(1)),
          noAplica: Number.parseFloat((sumatorias.noAplica / total).toFixed(1)),
        }
      })

      // Verificar que promediosPorEtapa es un array
      if (!Array.isArray(promediosPorEtapa) || promediosPorEtapa.length === 0) {
        return { categories: [], series: [] }
      }

      return {
        categories: promediosPorEtapa.map((etapa) => etapa.nombre),
        series: [
          {
            name: "Sí",
            data: promediosPorEtapa.map((etapa) => etapa.si),
          },
          {
            name: "No",
            data: promediosPorEtapa.map((etapa) => etapa.no),
          },
          {
            name: "No Aplica",
            data: promediosPorEtapa.map((etapa) => etapa.noAplica),
          },
        ],
      }
    }

    // Si se ha seleccionado una etapa específica, mostrar todos los documentos de esa etapa
    // Verificar que documentosFiltrados es un array
    if (!Array.isArray(documentosFiltrados) || documentosFiltrados.length === 0) {
      return { categories: [], series: [] }
    }

    return {
      categories: documentosFiltrados.map((doc) => doc.nombre || "Sin nombre"),
      series: [
        {
          name: "Sí",
          data: documentosFiltrados.map((doc) => (doc.respuestas ? doc.respuestas.si || 0 : 0)),
        },
        {
          name: "No",
          data: documentosFiltrados.map((doc) => (doc.respuestas ? doc.respuestas.no || 0 : 0)),
        },
        {
          name: "No Aplica",
          data: documentosFiltrados.map((doc) => (doc.respuestas ? doc.respuestas.noAplica || 0 : 0)),
        },
      ],
    }
  }

  const chartData = prepararDatosGrafico()

  // Calcular promedios para los documentos filtrados
  const calcularPromedios = () => {
    if (!Array.isArray(documentosFiltrados) || documentosFiltrados.length === 0) {
      return { si: 0, no: 0, noAplica: 0 }
    }

    const totales = documentosFiltrados.reduce(
      (acc, doc) => {
        // Verificar que doc.respuestas existe
        if (doc.respuestas) {
          acc.si += doc.respuestas.si || 0
          acc.no += doc.respuestas.no || 0
          acc.noAplica += doc.respuestas.noAplica || 0
        }
        return acc
      },
      { si: 0, no: 0, noAplica: 0 },
    )

    return {
      si: Number.parseFloat((totales.si / documentosFiltrados.length).toFixed(1)),
      no: Number.parseFloat((totales.no / documentosFiltrados.length).toFixed(1)),
      noAplica: Number.parseFloat((totales.noAplica / documentosFiltrados.length).toFixed(1)),
    }
  }

  const promedios = calcularPromedios()

  // Opciones para el gráfico radial
  const radarChartOptions = {
    chart: {
      type: "radar",
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
    colors: ["#22c55e", "#ef4444", "#f59e0b"],
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.2,
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: Array(chartData.categories.length).fill("#9ca3af"),
          fontSize: "12px",
        },
        // Ajustar el formato de las etiquetas para que se muestren mejor cuando hay muchas
        formatter: (val) => {
          // Si la etiqueta es muy larga, truncarla
          if (val && val.length > 20 && chartData.categories.length > 5) {
            return val.substring(0, 20) + "..."
          }
          return val || ""
        },
      },
    },
    yaxis: {
      show: false,
      max: 100,
    },
    legend: {
      position: "bottom",
      fontSize: "12px",
      labels: {
        colors: "#9ca3af",
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => (val || 0) + "%",
      },
      // Añadir el nombre completo en el tooltip para etiquetas truncadas
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const category = w.globals.labels[dataPointIndex] || "Sin nombre"
        const value = series[seriesIndex][dataPointIndex] || 0
        const seriesName = w.globals.seriesNames[seriesIndex] || "Sin nombre"

        return `<div class="p-2">
          <div class="font-medium">${category}</div>
          <div>${seriesName}: ${value}%</div>
        </div>`
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
          chart: {
            height: 350,
          },
          legend: {
            position: "bottom",
            offsetY: 0,
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
    <Card className="dashboard-card col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Lista de Chequeo Contractual</CardTitle>
        <CardDescription className="text-sm">{safeListaChequeoData.titulo}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full max-w-[400px] mx-auto">
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="observaciones">Observaciones</TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
            <div className="w-full md:w-1/3">
              <Select value={selectedEtapa} onValueChange={setSelectedEtapa}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las etapas</SelectItem>
                  {etapas.map((etapa, index) => (
                    <SelectItem key={index} value={etapa.nombre || `etapa-${index}`}>
                      {etapa.nombre || `Etapa ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/3">
              <Select
                value={selectedDocumento}
                onValueChange={setSelectedDocumento}
                disabled={selectedEtapa === "todas"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los documentos</SelectItem>
                  {documentosDisponibles.map((doc, index) => (
                    <SelectItem key={index} value={doc.nombre || `doc-${index}`}>
                      {doc.nombre || `Documento ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mensaje informativo cuando se muestra el consolidado por etapas */}
          {selectedEtapa === "todas" && activeTab === "grafico" && (
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-md text-sm mb-2">
              Mostrando consolidado por etapas. Seleccione una etapa específica para ver el detalle de sus documentos.
            </div>
          )}

          {/* Resumen de porcentajes */}
          <div className="grid grid-cols-3 gap-4 my-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm text-muted-foreground">Sí</span>
              <span className="text-2xl font-bold text-green-500">{promedios.si}%</span>
              <Progress
                value={promedios.si}
                className="h-2 mt-2 bg-muted w-full max-w-[150px]"
                indicatorColor="bg-green-500"
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm text-muted-foreground">No</span>
              <span className="text-2xl font-bold text-red-500">{promedios.no}%</span>
              <Progress
                value={promedios.no}
                className="h-2 mt-2 bg-muted w-full max-w-[150px]"
                indicatorColor="bg-red-500"
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm text-muted-foreground">No Aplica</span>
              <span className="text-2xl font-bold text-amber-500">{promedios.noAplica}%</span>
              <Progress
                value={promedios.noAplica}
                className="h-2 mt-2 bg-muted w-full max-w-[150px]"
                indicatorColor="bg-amber-500"
              />
            </div>
          </div>

          <TabsContent value="grafico" className="h-[500px]">
            {mounted && chartData.categories.length > 0 && (
              <ReactApexChart options={radarChartOptions} series={chartData.series} type="radar" height={500} />
            )}
            {(!chartData.categories.length || chartData.categories.length === 0) && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No hay datos disponibles para mostrar</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="observaciones" className="h-[500px]">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {Array.isArray(documentosFiltrados) &&
                  documentosFiltrados.map((documento, docIndex) => (
                    <div key={docIndex} className="border rounded-lg p-4">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div>
                          <h3 className="font-medium text-base">{documento.nombre || `Documento ${docIndex + 1}`}</h3>
                          <p className="text-sm text-muted-foreground">{documento.descripcion || "Sin descripción"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            Sí: {documento.respuestas ? documento.respuestas.si || 0 : 0}%
                          </Badge>
                          <Badge variant="outline" className="bg-red-500/10 text-red-500">
                            No: {documento.respuestas ? documento.respuestas.no || 0 : 0}%
                          </Badge>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                            No Aplica: {documento.respuestas ? documento.respuestas.noAplica || 0 : 0}%
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Observaciones:</h4>
                        <ul className="space-y-2">
                          {Array.isArray(documento.observaciones) ? (
                            documento.observaciones.map((obs: string, obsIndex: number) => (
                              <li key={obsIndex} className="text-sm bg-muted/30 p-2 rounded">
                                {obs}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm bg-muted/30 p-2 rounded">No hay observaciones disponibles</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}

                {(!Array.isArray(documentosFiltrados) || documentosFiltrados.length === 0) && (
                  <div className="flex items-center justify-center h-[400px]">
                    <p className="text-muted-foreground">No hay observaciones disponibles para mostrar</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
