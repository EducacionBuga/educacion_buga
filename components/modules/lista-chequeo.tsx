"use client"

import { useState, useRef } from "react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload, Save, FileText } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ChecklistItem {
  id: string
  etapa: string
  documento: string
  descripcion: string
  si: boolean | null
  no: boolean | null
  noAplica: boolean | null
  observaciones: string
}

export function ListaChequeo() {
  const [activeTab, setActiveTab] = useState("precontractual")
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    // Etapa Precontractual
    {
      id: "1",
      etapa: "Precontractual",
      documento: "Estudio de Necesidad",
      descripcion: "Documento técnico o jurídico que justifica la contratación.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "2",
      etapa: "Precontractual",
      documento: "Disponibilidad Presupuestal",
      descripcion: "Certificado de disponibilidad presupuestal (CDP) expedido por la entidad.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "3",
      etapa: "Precontractual",
      documento: "Pliegos de Condiciones",
      descripcion: "Elaboración de pliegos, términos de referencia o condiciones de participación.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "4",
      etapa: "Precontractual",
      documento: "Selección del Proceso de Contratación",
      descripcion:
        "Definición del tipo de proceso (licitación, selección abreviada, mínima cuantía, concurso de méritos, contratación directa).",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "5",
      etapa: "Precontractual",
      documento: "Análisis de Riesgos",
      descripcion: "Matriz de riesgos contractuales.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "6",
      etapa: "Precontractual",
      documento: "Estudio del Sector",
      descripcion: "Investigación de mercado o estudios de condiciones de mercado.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "7",
      etapa: "Precontractual",
      documento: "Verificación de Inhabilidades e Incompatibilidades",
      descripcion:
        "Confirmar que potenciales oferentes no estén incursos en causales de inhabilidad o incompatibilidad.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    // Etapa de Ejecución Contractual
    {
      id: "8",
      etapa: "Ejecución",
      documento: "Firma del Contrato",
      descripcion: "Formalización escrita del contrato (con cumplimiento de requisitos de perfeccionamiento).",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "9",
      etapa: "Ejecución",
      documento: "Acta de Inicio",
      descripcion: "Firma de acta donde se estipula la fecha de inicio de las actividades.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "10",
      etapa: "Ejecución",
      documento: "Designación de Supervisor o Interventor",
      descripcion: "Designación oficial del responsable del seguimiento del contrato.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "11",
      etapa: "Ejecución",
      documento: "Plan de Trabajo o Cronograma",
      descripcion: "Aprobación del plan de ejecución del contrato.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "12",
      etapa: "Ejecución",
      documento: "Informes de Supervisión/Interventoría",
      descripcion: "Elaboración de informes periódicos de seguimiento.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    // Etapa de Cierre de Contrato
    {
      id: "13",
      etapa: "Cierre",
      documento: "Recepción Final de Bienes o Servicios",
      descripcion: "Comprobación del cumplimiento de todas las obligaciones.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "14",
      etapa: "Cierre",
      documento: "Acta de Terminación o Liquidación",
      descripcion: "Elaboración y firma del acta que formaliza la terminación o liquidación del contrato.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "15",
      etapa: "Cierre",
      documento: "Informe Final de Supervisión/Interventoría",
      descripcion: "Reporte técnico final de cumplimiento del contrato.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
    {
      id: "16",
      etapa: "Cierre",
      documento: "Cierre Financiero",
      descripcion:
        "Verificación del uso de recursos, devolución de saldos, pago de saldos pendientes, sanciones o multas.",
      si: null,
      no: null,
      noAplica: null,
      observaciones: "",
    },
  ])

  const [isSaved, setIsSaved] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)

  const handleCheckChange = (id: string, field: "si" | "no" | "noAplica", value: boolean) => {
    setChecklistItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          // Si se marca una opción, desmarcamos las otras
          const updatedItem = { ...item }
          if (field === "si") {
            updatedItem.si = value
            if (value) {
              updatedItem.no = false
              updatedItem.noAplica = false
            }
          } else if (field === "no") {
            updatedItem.no = value
            if (value) {
              updatedItem.si = false
              updatedItem.noAplica = false
            }
          } else if (field === "noAplica") {
            updatedItem.noAplica = value
            if (value) {
              updatedItem.si = false
              updatedItem.no = false
            }
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const handleObservacionChange = (id: string, value: string) => {
    setChecklistItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          return { ...item, observaciones: value }
        }
        return item
      }),
    )
  }

  const filteredItems = checklistItems.filter((item) => {
    return (
      activeTab === "todos" ||
      (activeTab === "precontractual" && item.etapa === "Precontractual") ||
      (activeTab === "ejecucion" && item.etapa === "Ejecución") ||
      (activeTab === "cierre" && item.etapa === "Cierre")
    )
  })

  const saveChecklist = () => {
    try {
      // Obtener el área actual de la URL
      const pathname = window.location.pathname
      const areaMatch = pathname.match(/\/dashboard\/([^/]+)\/lista-chequeo/)
      const areaId = areaMatch ? areaMatch[1] : "area-desconocida"

      // Guardar los datos en localStorage con el ID del área
      localStorage.setItem(`${areaId}-lista-chequeo-items`, JSON.stringify(checklistItems))

      // Actualizar el estado
      setIsSaved(true)

      // Mostrar mensaje de éxito
      alert("Lista de chequeo guardada correctamente. Los datos están disponibles en la matriz de seguimiento.")

      // Opcional: Redirigir a la matriz de seguimiento
      // Si se descomenta, redirigirá automáticamente al usuario
      // window.location.href = "/dashboard/planeacion/matriz-seguimiento";
    } catch (error) {
      console.error("Error al guardar la lista de chequeo:", error)
      alert("Error al guardar la lista de chequeo. Por favor, intente nuevamente.")
    }
  }

  const exportToPDF = async () => {
    if (!tableRef.current) return

    try {
      // Mostrar mensaje de carga
      const loadingToast = alert("Generando PDF, por favor espere...")

      // Capturar la tabla como imagen
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      // Crear un nuevo documento PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Añadir título
      pdf.setFontSize(16)
      pdf.text("Lista de Chequeo - Gestión documental contractual", 14, 15)

      // Añadir fecha
      pdf.setFontSize(10)
      pdf.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 14, 22)

      // Añadir la imagen de la tabla
      const imgData = canvas.toDataURL("image/png")
      const imgWidth = 280
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 14, 30, imgWidth, imgHeight)

      // Guardar el PDF
      pdf.save(`Lista_de_Chequeo_${new Date().toISOString().split("T")[0]}.pdf`)

      // Cerrar mensaje de carga
      alert("PDF generado correctamente")
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      alert("Error al generar el PDF. Por favor, intente nuevamente.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-purple-500/10 text-purple-500 border-purple-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Lista de Chequeo</CardTitle>
              <p className="text-sm text-muted-foreground">Gestión documental contractual</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={exportToPDF}
              disabled={!isSaved}
              title={!isSaved ? "Guarde la lista primero para poder exportarla" : "Exportar lista a PDF"}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button
              size="sm"
              onClick={saveChecklist}
              className="w-full sm:w-auto"
              title="Guardar y actualizar matriz de seguimiento"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Select defaultValue={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las etapas</SelectItem>
                <SelectItem value="precontractual">Etapa Precontractual</SelectItem>
                <SelectItem value="ejecucion">Etapa de Ejecución</SelectItem>
                <SelectItem value="cierre">Etapa de Cierre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="precontractual" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="todos" className="flex-1 sm:flex-none">
              Todos
            </TabsTrigger>
            <TabsTrigger value="precontractual" className="flex-1 sm:flex-none">
              Etapa Precontractual
            </TabsTrigger>
            <TabsTrigger value="ejecucion" className="flex-1 sm:flex-none">
              Etapa de Ejecución
            </TabsTrigger>
            <TabsTrigger value="cierre" className="flex-1 sm:flex-none">
              Etapa de Cierre
            </TabsTrigger>
          </TabsList>

          <div className="table-responsive" ref={tableRef}>
            <ScrollArea className="h-[600px] w-full border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-[40%]">DOCUMENTO</TableHead>
                    <TableHead className="w-[10%] text-center">SI</TableHead>
                    <TableHead className="w-[10%] text-center">NO</TableHead>
                    <TableHead className="w-[10%] text-center">NO APLICA</TableHead>
                    <TableHead className="w-[30%]">OBSERVACIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.documento}</p>
                            <p className="text-sm text-muted-foreground truncate-2">{item.descripcion}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={item.si === true}
                              onCheckedChange={(checked) => handleCheckChange(item.id, "si", checked === true)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={item.no === true}
                              onCheckedChange={(checked) => handleCheckChange(item.id, "no", checked === true)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={item.noAplica === true}
                              onCheckedChange={(checked) => handleCheckChange(item.id, "noAplica", checked === true)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Observaciones"
                            className="min-h-[60px]"
                            value={item.observaciones}
                            onChange={(e) => handleObservacionChange(item.id, e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="mb-2 h-10 w-10" />
                          <p className="text-lg font-medium">No hay documentos disponibles</p>
                          <p className="text-sm">Ajuste los filtros o añada nuevos documentos.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
