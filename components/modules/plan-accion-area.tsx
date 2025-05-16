"use client"

import { TableCell } from "@/components/ui/table"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { Plus, FileSpreadsheet, Filter, Save, AlertCircle } from "lucide-react"
import Papa from "papaparse"
import { es } from "date-fns/locale"
import { usePlanAccionForm } from "@/hooks/use-plan-accion-form"
import { useDebouncedSearch } from "@/hooks/use-debounced-search"
import { format } from "date-fns"

// Importar DatePicker de forma estática para garantizar que los estilos se carguen correctamente
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
// Importar los estilos personalizados después para que puedan sobrescribir los estilos por defecto
import "./datepicker.css"
// Importar DatePicker de forma dinámica para reducir el bundle inicial
// const DatePicker = dynamic(() => import("react-datepicker"), {
//   ssr: false,
//   loading: () => <div className="h-10 w-full bg-muted animate-pulse rounded-md" />,
// })

export interface PlanAccionItem {
  id: string
  programa: string
  objetivo: string
  meta: string
  presupuesto: string
  acciones: string
  indicadores: string
  porcentajeAvance: number
  fechaInicio: string
  fechaFin: string
  estado?: string
  responsable: string // Nueva propiedad
}

interface PlanAccionAreaProps {
  title: string
  description?: string
  area: string
  color?: "blue" | "green" | "orange" | "purple" | "default"
  initialItems?: PlanAccionItem[]
  onItemsChange?: (items: PlanAccionItem[]) => void
}

// Función para obtener clases de color basadas en el color proporcionado
// Extraída fuera del componente para evitar recreación en cada render
const getColorClasses = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "green":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "orange":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "purple":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    default:
      return "bg-primary/10 text-primary border-primary/20"
  }
}

export default function PlanAccionArea({
  title,
  description,
  area,
  color = "orange",
  initialItems = [],
  onItemsChange,
}: PlanAccionAreaProps) {
  const [planAccionItems, setPlanAccionItems] = useState<PlanAccionItem[]>(initialItems)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<PlanAccionItem>>({})
  const [newItem, setNewItem] = useState<PlanAccionItem>({
    id: "",
    programa: "",
    objetivo: "",
    meta: "",
    presupuesto: "",
    acciones: "",
    indicadores: "",
    porcentajeAvance: 0,
    fechaInicio: "",
    fechaFin: "",
    estado: "Pendiente",
    responsable: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [fechaInicioDate, setFechaInicioDate] = useState<Date | null>(null)
  const [fechaFinDate, setFechaFinDate] = useState<Date | null>(null)

  // Función de búsqueda para el hook de búsqueda debounced
  const searchPredicate = useCallback((item: PlanAccionItem, term: string) => {
    return (
      item.programa.toLowerCase().includes(term) ||
      item.objetivo.toLowerCase().includes(term) ||
      item.meta.toLowerCase().includes(term)
    )
  }, [])

  // Hook de búsqueda con debounce
  const { searchTerm, filteredItems, handleSearchChange } = useDebouncedSearch(planAccionItems, searchPredicate)

  // Hook de formulario para añadir nuevos elementos
  const {
    // newItem,
    // formErrors,
    // fechaInicioDate,
    // fechaFinDate,
    // setFechaInicioDate,
    // setFechaFinDate,
    // handleSubmit,
    resetForm,
    // updateField,
  } = usePlanAccionForm((item) => {
    const updatedItems = [...planAccionItems, item]
    setPlanAccionItems(updatedItems)
    setIsAddDialogOpen(false)

    toast({
      title: "Éxito",
      description: "Elemento añadido correctamente",
    })
  })

  // Notificar cambios al componente padre
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(planAccionItems)
    }
  }, [planAccionItems, onItemsChange])

  // Handlers para edición
  const handleEditStart = useCallback((item: PlanAccionItem) => {
    setEditingId(item.id)
    setEditValues({ ...item })
  }, [])

  const handleEditCancel = useCallback(() => {
    setEditingId(null)
    setEditValues({})
  }, [])

  const handleEditSave = useCallback(() => {
    if (!editingId) return

    const updatedItems = planAccionItems.map((item) => (item.id === editingId ? { ...item, ...editValues } : item))

    setPlanAccionItems(updatedItems)
    setEditingId(null)
    setEditValues({})

    toast({
      title: "Éxito",
      description: "Elemento actualizado correctamente",
    })
  }, [editingId, editValues, planAccionItems])

  const handleEditChange = useCallback((field: keyof PlanAccionItem, value: any) => {
    setEditValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handler para eliminar elementos
  const handleDeleteItem = useCallback(
    (id: string) => {
      const updatedItems = planAccionItems.filter((item) => item.id !== id)
      setPlanAccionItems(updatedItems)

      toast({
        title: "Éxito",
        description: "Elemento eliminado correctamente",
        variant: "destructive",
      })
    },
    [planAccionItems],
  )

  // Handler para exportar a CSV
  const handleExportCSV = useCallback(() => {
    // Solo crear el blob y el link cuando el usuario realmente exporta
    const csv = Papa.unparse(planAccionItems)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `plan-accion-${area}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url) // Liberar memoria
  }, [planAccionItems, area])

  // Memorizar las clases de color para evitar recálculos
  const colorClasses = useMemo(() => getColorClasses(color), [color])

  // Manejar el envío del formulario
  const handleAddItem = () => {
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    const id = (planAccionItems.length + 1).toString()
    const updatedItems = [
      ...planAccionItems,
      {
        id,
        programa: newItem.programa || "",
        objetivo: newItem.objetivo || "",
        meta: newItem.meta || "",
        presupuesto: newItem.presupuesto || "",
        acciones: newItem.acciones || "",
        indicadores: newItem.indicadores || "",
        porcentajeAvance: newItem.porcentajeAvance || 0,
        fechaInicio: newItem.fechaInicio || "",
        fechaFin: newItem.fechaFin || "",
        estado: newItem.estado || "Pendiente",
        responsable: newItem.responsable || "",
      },
    ]

    setPlanAccionItems(updatedItems)
    setNewItem({
      porcentajeAvance: 0,
      id: "",
      programa: "",
      objetivo: "",
      meta: "",
      presupuesto: "",
      acciones: "",
      indicadores: "",
      fechaInicio: "",
      fechaFin: "",
      estado: "Pendiente",
      responsable: "",
    })
    setFechaInicioDate(null)
    setFechaFinDate(null)
    setFormErrors({})
    setIsAddDialogOpen(false)

    toast({
      title: "Éxito",
      description: "Elemento añadido correctamente",
    })
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validar campos obligatorios
    if (!newItem.programa || newItem.programa.trim() === "") {
      errors.programa = "El programa es obligatorio"
    }

    if (!newItem.objetivo || newItem.objetivo.trim() === "") {
      errors.objetivo = "El objetivo es obligatorio"
    }

    if (!newItem.meta || newItem.meta.trim() === "") {
      errors.meta = "La meta es obligatoria"
    }

    // Validar presupuesto (debe tener formato de moneda)
    if (!newItem.presupuesto || newItem.presupuesto.trim() === "") {
      errors.presupuesto = "El presupuesto es obligatorio"
    } else if (!/^\$?[\d,.]+$/.test(newItem.presupuesto)) {
      errors.presupuesto = "Formato inválido. Ejemplo: $100,000,000"
    }

    // Validar acciones
    if (!newItem.acciones || newItem.acciones.trim() === "") {
      errors.acciones = "Las acciones son obligatorias"
    }

    // Validar indicadores
    if (!newItem.indicadores || newItem.indicadores.trim() === "") {
      errors.indicadores = "Los indicadores son obligatorios"
    }

    // Validar responsable
    if (!newItem.responsable || newItem.responsable.trim() === "") {
      errors.responsable = "El responsable es obligatorio"
    }

    // Validar porcentaje de avance
    if (newItem.porcentajeAvance === undefined || newItem.porcentajeAvance < 0 || newItem.porcentajeAvance > 100) {
      errors.porcentajeAvance = "El porcentaje debe estar entre 0 y 100"
    }

    // Validar fechas
    if (!newItem.fechaInicio) {
      errors.fechaInicio = "La fecha de inicio es obligatoria"
    }

    if (!newItem.fechaFin) {
      errors.fechaFin = "La fecha de fin es obligatoria"
    }

    // Validar que la fecha fin sea posterior a la fecha inicio
    if (newItem.fechaInicio && newItem.fechaFin && fechaInicioDate && fechaFinDate) {
      if (fechaFinDate < fechaInicioDate) {
        errors.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Cerrar el diálogo y resetear el formulario
  const handleCloseDialog = useCallback(() => {
    setIsAddDialogOpen(false)
    resetForm()
  }, [resetForm])

  const getStatusBadge = (status: string | undefined) => {
    let colorClass = "bg-gray-100 text-gray-800" // Default color
    switch (status) {
      case "Pendiente":
        colorClass = "bg-yellow-100 text-yellow-800"
        break
      case "En progreso":
        colorClass = "bg-blue-100 text-blue-800"
        break
      case "Completado":
        colorClass = "bg-green-100 text-green-800"
        break
      default:
        break
    }

    return <span className={`px-2 py-1 font-semibold rounded-full ${colorClass}`}>{status}</span>
  }

  return (
    <Card className="w-full">
      <CardHeader className={`pb-3 ${colorClasses} bg-opacity-10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${colorClasses}`}>
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription className="text-foreground/70">{description}</CardDescription>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)} aria-label="Añadir nuevo elemento">
              <Plus className="mr-2 h-4 w-4" />
              Añadir
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportCSV} aria-label="Exportar a CSV">
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2 w-full">
            <Button variant="outline" size="sm" aria-label="Filtrar elementos">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Buscar programa..."
                className="w-full"
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Buscar programa"
              />
            </div>
          </div>
        </div>

        <ScrollArea className="h-[600px] w-full border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Programa</TableHead>
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
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editValues.programa || ""}
                          onChange={(e) => handleEditChange("programa", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.programa
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editValues.objetivo || ""}
                          onChange={(e) => handleEditChange("objetivo", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.objetivo
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editValues.meta || ""}
                          onChange={(e) => handleEditChange("meta", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.meta
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editValues.presupuesto || ""}
                          onChange={(e) => handleEditChange("presupuesto", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.presupuesto
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editValues.acciones || ""}
                          onChange={(e) => handleEditChange("acciones", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.acciones
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editValues.indicadores || ""}
                          onChange={(e) => handleEditChange("indicadores", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.indicadores
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editValues.porcentajeAvance || 0}
                          onChange={(e) => handleEditChange("porcentajeAvance", Number(e.target.value))}
                          className="w-20"
                        />
                      ) : (
                        `${item.porcentajeAvance}%`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editValues.fechaInicio || ""}
                          onChange={(e) => handleEditChange("fechaInicio", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.fechaInicio
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editValues.fechaFin || ""}
                          onChange={(e) => handleEditChange("fechaFin", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.fechaFin
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editValues.responsable || ""}
                          onChange={(e) => setEditValues({ ...editValues, responsable: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        item.responsable
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.estado)}</TableCell>
                    <TableCell className="text-right">
                      {editingId === item.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={handleEditCancel} aria-label="Cancelar edición">
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleEditSave} aria-label="Guardar cambios">
                            Guardar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStart(item)}
                            aria-label="Editar elemento"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteItem(item.id)}
                            aria-label="Eliminar elemento"
                          >
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileSpreadsheet className="mb-2 h-10 w-10" />
                      <p className="text-lg font-medium">No hay datos disponibles</p>
                      <p className="text-sm">Añada elementos</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Resumen de datos */}
        <div className="mt-8 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Resumen del Plan de Acción</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Presupuesto Total */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <span className="text-sm text-muted-foreground">Presupuesto Total:</span>
              <p className="text-2xl font-bold text-green-600">
                $
                {planAccionItems
                  .reduce((sum, item) => {
                    // Extraer números del formato de presupuesto (ej: "$100,000,000" -> 100000000)
                    const presupuesto = Number.parseFloat(item.presupuesto?.replace(/[^0-9.-]+/g, "") || "0") || 0
                    return sum + presupuesto
                  }, 0)
                  .toLocaleString("es-CO", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
              </p>
              <span className="text-xs text-muted-foreground">Suma de {planAccionItems.length} actividades</span>
            </div>

            {/* Porcentaje de Avance Promedio */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <span className="text-sm text-muted-foreground">Avance Promedio:</span>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-blue-600">
                  {planAccionItems.length > 0
                    ? Math.round(
                        planAccionItems.reduce((sum, item) => sum + (item.porcentajeAvance || 0), 0) /
                          planAccionItems.length,
                      )
                    : 0}
                  %
                </p>
                <span className="text-xs text-muted-foreground mb-1">de todas las actividades</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className={`h-2.5 rounded-full bg-blue-500`}
                  style={{
                    width: `${
                      planAccionItems.length > 0
                        ? Math.round(
                            planAccionItems.reduce((sum, item) => sum + (item.porcentajeAvance || 0), 0) /
                              planAccionItems.length,
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Distribución por Estado */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <span className="text-sm text-muted-foreground">Distribución por Estado:</span>

              {(() => {
                // Calcular la distribución de estados
                const estadosCount = planAccionItems.reduce(
                  (acc, item) => {
                    const estado = item.estado || "Pendiente"
                    acc[estado] = (acc[estado] || 0) + 1
                    return acc
                  },
                  {} as Record<string, number>,
                )

                const total = planAccionItems.length || 1 // Evitar división por cero

                // Definir colores para cada estado
                const estadoColors: Record<string, string> = {
                  Pendiente: "bg-yellow-500",
                  "En progreso": "bg-blue-500",
                  Completado: "bg-green-500",
                  Retrasado: "bg-red-500",
                }

                return (
                  <div className="space-y-3 mt-2">
                    {/* Barra horizontal de distribución */}
                    <div className="flex w-full h-6 rounded-md overflow-hidden">
                      {Object.entries(estadosCount).map(([estado, count]) => (
                        <div
                          key={estado}
                          className={`${estadoColors[estado] || "bg-gray-500"}`}
                          style={{ width: `${(count / total) * 100}%` }}
                          title={`${estado}: ${Math.round((count / total) * 100)}%`}
                        ></div>
                      ))}
                    </div>

                    {/* Leyenda */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Object.entries(estadosCount).map(([estado, count]) => (
                        <div key={estado} className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-1 ${estadoColors[estado] || "bg-gray-500"}`}></div>
                          <span>
                            {estado}: {count} ({Math.round((count / total) * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Diálogo para añadir nuevo elemento */}
        <Dialog open={isAddDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Elemento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="programa" className="block text-sm font-medium mb-1">
                    Programa <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="programa"
                    value={newItem.programa || ""}
                    onChange={(e) => {
                      setNewItem({ ...newItem, programa: e.target.value })
                      if (formErrors.programa && e.target.value.trim() !== "") {
                        setFormErrors((prev) => {
                          const updated = { ...prev }
                          delete updated.programa
                          return updated
                        })
                      }
                    }}
                    placeholder="Nombre del programa"
                    className={`w-full ${formErrors.programa ? "border-red-500" : ""}`}
                    aria-invalid={!!formErrors.programa}
                    aria-describedby={formErrors.programa ? "programa-error" : undefined}
                  />
                  {formErrors.programa && (
                    <p id="programa-error" className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.programa}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="objetivo" className="block text-sm font-medium mb-1">
                    Objetivo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="objetivo"
                    value={newItem.objetivo || ""}
                    onChange={(e) => {
                      setNewItem({ ...newItem, objetivo: e.target.value })
                      if (formErrors.objetivo && e.target.value.trim() !== "") {
                        setFormErrors((prev) => {
                          const updated = { ...prev }
                          delete updated.objetivo
                          return updated
                        })
                      }
                    }}
                    placeholder="Objetivo del programa"
                    className={`w-full ${formErrors.objetivo ? "border-red-500" : ""}`}
                    aria-invalid={!!formErrors.objetivo}
                    aria-describedby={formErrors.objetivo ? "objetivo-error" : undefined}
                  />
                  {formErrors.objetivo && (
                    <p id="objetivo-error" className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.objetivo}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="meta" className="block text-sm font-medium mb-1">
                    Meta <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="meta"
                    value={newItem.meta || ""}
                    onChange={(e) => {
                      setNewItem({ ...newItem, meta: e.target.value })
                      if (formErrors.meta && e.target.value.trim() !== "") {
                        setFormErrors((prev) => {
                          const updated = { ...prev }
                          delete updated.meta
                          return updated
                        })
                      }
                    }}
                    placeholder="Meta a alcanzar"
                    className={`w-full ${formErrors.meta ? "border-red-500" : ""}`}
                    aria-invalid={!!formErrors.meta}
                    aria-describedby={formErrors.meta ? "meta-error" : undefined}
                  />
                  {formErrors.meta && (
                    <p id="meta-error" className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.meta}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="presupuesto" className="block text-sm font-medium mb-1">
                    Presupuesto <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="presupuesto"
                    value={newItem.presupuesto || ""}
                    onChange={(e) => {
                      setNewItem({ ...newItem, presupuesto: e.target.value })
                      if (formErrors.presupuesto && e.target.value.trim() !== "") {
                        setFormErrors((prev) => {
                          const updated = { ...prev }
                          delete updated.presupuesto
                          return updated
                        })
                      }
                    }}
                    placeholder="Ej: $100,000,000"
                    className={`w-full ${formErrors.presupuesto ? "border-red-500" : ""}`}
                    aria-invalid={!!formErrors.presupuesto}
                    aria-describedby={formErrors.presupuesto ? "presupuesto-error" : undefined}
                  />
                  {formErrors.presupuesto && (
                    <p id="presupuesto-error" className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.presupuesto}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="acciones" className="block text-sm font-medium mb-1">
                  Acciones realizadas <span className="text-red-500">*</span>
                </label>
                <Input
                  id="acciones"
                  value={newItem.acciones || ""}
                  onChange={(e) => {
                    setNewItem({ ...newItem, acciones: e.target.value })
                    if (formErrors.acciones && e.target.value.trim() !== "") {
                      setFormErrors((prev) => {
                        const updated = { ...prev }
                        delete updated.acciones
                        return updated
                      })
                    }
                  }}
                  placeholder="Acciones separadas por comas"
                  className={`w-full ${formErrors.acciones ? "border-red-500" : ""}`}
                  aria-invalid={!!formErrors.acciones}
                  aria-describedby={formErrors.acciones ? "acciones-error" : undefined}
                />
                {formErrors.acciones && (
                  <p id="acciones-error" className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.acciones}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="indicadores" className="block text-sm font-medium mb-1">
                  Indicadores Alcanzados <span className="text-red-500">*</span>
                </label>
                <Input
                  id="indicadores"
                  value={newItem.indicadores || ""}
                  onChange={(e) => {
                    setNewItem({ ...newItem, indicadores: e.target.value })
                    if (formErrors.indicadores && e.target.value.trim() !== "") {
                      setFormErrors((prev) => {
                        const updated = { ...prev }
                        delete updated.indicadores
                        return updated
                      })
                    }
                  }}
                  placeholder="Indicadores de avance"
                  className={`w-full ${formErrors.indicadores ? "border-red-500" : ""}`}
                  aria-invalid={!!formErrors.indicadores}
                  aria-describedby={formErrors.indicadores ? "indicadores-error" : undefined}
                />
                {formErrors.indicadores && (
                  <p id="indicadores-error" className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.indicadores}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="porcentajeAvance" className="block text-sm font-medium mb-1">
                  Porcentaje de Avance <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    id="porcentajeAvance"
                    min="0"
                    max="100"
                    step="5"
                    value={newItem.porcentajeAvance || 0}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      setNewItem({ ...newItem, porcentajeAvance: value })
                      if (formErrors.porcentajeAvance && value >= 0 && value <= 100) {
                        setFormErrors((prev) => {
                          const updated = { ...prev }
                          delete updated.porcentajeAvance
                          return updated
                        })
                      }
                    }}
                    className={`flex-1 ${formErrors.porcentajeAvance ? "border-red-500" : ""}`}
                    aria-label="Ajustar porcentaje de avance"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={newItem.porcentajeAvance || 0}
                  />
                  <div className="flex items-center gap-2 w-24">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newItem.porcentajeAvance || 0}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        setNewItem({ ...newItem, porcentajeAvance: value })
                        if (formErrors.porcentajeAvance && value >= 0 && value <= 100) {
                          setFormErrors((prev) => {
                            const updated = { ...prev }
                            delete updated.porcentajeAvance
                            return updated
                          })
                        }
                      }}
                      className={`w-16 ${formErrors.porcentajeAvance ? "border-red-500" : ""}`}
                      aria-label="Porcentaje de avance"
                    />
                    <span>%</span>
                  </div>
                </div>
                {formErrors.porcentajeAvance && (
                  <p id="porcentajeAvance-error" className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.porcentajeAvance}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-medium mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  id="estado"
                  value={newItem.estado || "Pendiente"}
                  onChange={(e) => setNewItem({ ...newItem, estado: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Estado del elemento"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>
              <div>
                <label htmlFor="responsable" className="block text-sm font-medium mb-1">
                  Responsable <span className="text-red-500">*</span>
                </label>
                <Input
                  id="responsable"
                  value={newItem.responsable || ""}
                  onChange={(e) => {
                    setNewItem({ ...newItem, responsable: e.target.value })
                    if (formErrors.responsable && e.target.value.trim() !== "") {
                      setFormErrors((prev) => {
                        const updated = { ...prev }
                        delete updated.responsable
                        return updated
                      })
                    }
                  }}
                  placeholder="Nombre del responsable"
                  className={`w-full ${formErrors.responsable ? "border-red-500" : ""}`}
                  aria-invalid={!!formErrors.responsable}
                  aria-describedby={formErrors.responsable ? "responsable-error" : undefined}
                />
                {formErrors.responsable && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.responsable}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fechaInicio" className="block text-sm font-medium mb-1">
                    Fecha Inicio <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={fechaInicioDate}
                    onChange={(date: Date) => {
                      setFechaInicioDate(date)
                      if (date) {
                        const formattedDate = format(date, "dd/MM/yyyy")
                        setNewItem((prev) => ({ ...prev, fechaInicio: formattedDate }))
                        if (formErrors.fechaInicio) {
                          setFormErrors((prev) => {
                            const updated = { ...prev }
                            delete updated.fechaInicio
                            return updated
                          })
                        }
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale={es}
                    placeholderText="Seleccionar fecha"
                    className={`w-full rounded-md border ${
                      formErrors.fechaInicio ? "border-red-500" : "border-input"
                    } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    isClearable
                    popperPlacement="bottom-start"
                    popperProps={{
                      positionFixed: true,
                      modifiers: [
                        {
                          name: "preventOverflow",
                          enabled: true,
                          options: {
                            boundary: "viewport",
                          },
                        },
                      ],
                    }}
                    aria-label="Fecha de inicio"
                    aria-invalid={!!formErrors.fechaInicio}
                    aria-describedby={formErrors.fechaInicio ? "fechaInicio-error" : undefined}
                  />
                  {formErrors.fechaInicio && (
                    <p id="fechaInicio-error" className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.fechaInicio}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="fechaFin" className="block text-sm font-medium mb-1">
                    Fecha Fin <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={fechaFinDate}
                    onChange={(date: Date) => {
                      setFechaFinDate(date)
                      if (date) {
                        const formattedDate = format(date, "dd/MM/yyyy")
                        setNewItem((prev) => ({ ...prev, fechaFin: formattedDate }))
                        if (formErrors.fechaFin) {
                          setFormErrors((prev) => {
                            const updated = { ...prev }
                            delete updated.fechaFin
                            return updated
                          })
                        }
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale={es}
                    placeholderText="Seleccionar fecha"
                    className={`w-full rounded-md border ${
                      formErrors.fechaFin ? "border-red-500" : "border-input"
                    } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    isClearable
                    minDate={fechaInicioDate || undefined}
                    popperPlacement="bottom-start"
                    popperProps={{
                      positionFixed: true,
                      modifiers: [
                        {
                          name: "preventOverflow",
                          enabled: true,
                          options: {
                            boundary: "viewport",
                          },
                        },
                      ],
                    }}
                    aria-label="Fecha de fin"
                    aria-invalid={!!formErrors.fechaFin}
                    aria-describedby={formErrors.fechaFin ? "fechaFin-error" : undefined}
                  />
                  {formErrors.fechaFin && (
                    <p id="fechaFin-error" className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.fechaFin}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} aria-label="Cancelar">
                Cancelar
              </Button>
              <Button onClick={handleAddItem} aria-label="Guardar elemento">
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export { PlanAccionArea }
