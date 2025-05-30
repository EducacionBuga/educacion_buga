"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { usePlanAccionStore } from "@/hooks/use-plan-accion-store"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { AlertCircle } from "lucide-react"
import type { PlanAccionItem } from "@/types/plan-accion"

interface PlanAccionFormProps {
  areaId: string
  isOpen: boolean
  onClose: () => void
}

export function PlanAccionForm({ areaId, isOpen, onClose }: PlanAccionFormProps) {
  const { addItem, testConnection, submitting } = usePlanAccionStore(areaId as any)

  const [newItem, setNewItem] = useState<Omit<PlanAccionItem, "id">>({
    programa: "",
    objetivo: "",
    meta: "",
    presupuesto: "",
    acciones: "", // Nombre correcto según la tabla en Supabase
    indicadores: "", // Nombre correcto según la tabla en Supabase
    porcentajeAvance: 0,
    fechaInicio: "",
    fechaFin: "",
    responsable: "",
    estado: "Pendiente",
    prioridad: "Media",
    comentarios: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [fechaInicioDate, setFechaInicioDate] = useState<Date | null>(null)
  const [fechaFinDate, setFechaFinDate] = useState<Date | null>(null)

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validar todos los campos obligatorios según la tabla en Supabase
    if (!newItem.programa || newItem.programa.trim() === "") {
      errors.programa = "El programa es obligatorio"
    }

    if (!newItem.objetivo || newItem.objetivo.trim() === "") {
      errors.objetivo = "El objetivo es obligatorio"
    }

    if (!newItem.meta || newItem.meta.trim() === "") {
      errors.meta = "La meta es obligatoria"
    }

    if (!newItem.presupuesto || newItem.presupuesto.trim() === "") {
      errors.presupuesto = "El presupuesto es obligatorio"
    }

    if (!newItem.acciones || newItem.acciones.trim() === "") {
      errors.acciones = "Las acciones son obligatorias"
    }

    if (!newItem.indicadores || newItem.indicadores.trim() === "") {
      errors.indicadores = "Los indicadores son obligatorios"
    }

    if (!newItem.responsable || newItem.responsable.trim() === "") {
      errors.responsable = "El responsable es obligatorio"
    }

    if (!newItem.fechaInicio) {
      errors.fechaInicio = "La fecha de inicio es obligatoria"
    }

    if (!newItem.fechaFin) {
      errors.fechaFin = "La fecha de fin es obligatoria"
    }

    if (fechaInicioDate && fechaFinDate && fechaFinDate < fechaInicioDate) {
      errors.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Modificar la función handleSubmit para validar las fechas antes de enviar
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    try {
      // Asegurarse de que las fechas estén definidas
      if (!newItem.fechaInicio || !newItem.fechaFin) {
        // Si no hay fechas seleccionadas, usar la fecha actual formateada
        const today = new Date()
        const formattedDate = format(today, "dd/MM/yyyy", { locale: es })

        if (!newItem.fechaInicio) {
          setNewItem((prev) => ({ ...prev, fechaInicio: formattedDate }))
        }

        if (!newItem.fechaFin) {
          setNewItem((prev) => ({ ...prev, fechaFin: formattedDate }))
        }
      }

      // Verificar que las fechas tengan el formato correcto (dd/MM/yyyy)
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
      if (!dateRegex.test(newItem.fechaInicio) || !dateRegex.test(newItem.fechaFin)) {
        toast({
          title: "Error de formato de fecha",
          description: "Las fechas deben tener el formato dd/mm/yyyy",
          variant: "destructive",
        })
        return
      }

      console.log("Enviando datos:", newItem)
      await addItem(newItem)
      resetForm()
      onClose()
    } catch (error: any) {
      console.error("Error al guardar:", error)
      toast({
        title: "Error al guardar",
        description: error.message || "Ocurrió un error al guardar el plan de acción",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNewItem({
      programa: "",
      objetivo: "",
      meta: "",
      presupuesto: "",
      acciones: "",
      indicadores: "",
      porcentajeAvance: 0,
      fechaInicio: "",
      fechaFin: "",
      responsable: "",
      estado: "Pendiente",
      prioridad: "Media",
      comentarios: "",
    })
    setFechaInicioDate(null)
    setFechaFinDate(null)
    setFormErrors({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Elemento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label htmlFor="programa" className="block text-sm font-medium mb-1">
              Programa <span className="text-red-500">*</span>
            </label>
            <Input
              id="programa"
              value={newItem.programa}
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
            />
            {formErrors.programa && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.programa}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="objetivo" className="block text-sm font-medium mb-1">
              Objetivo <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="objetivo"
              value={newItem.objetivo}
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
            />
            {formErrors.objetivo && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.objetivo}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="meta" className="block text-sm font-medium mb-1">
              Meta <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="meta"
              value={newItem.meta}
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
            />
            {formErrors.meta && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
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
              value={newItem.presupuesto}
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
            />
            {formErrors.presupuesto && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.presupuesto}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="acciones" className="block text-sm font-medium mb-1">
              Acciones <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="acciones"
              value={newItem.acciones}
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
            />
            {formErrors.acciones && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.acciones}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="indicadores" className="block text-sm font-medium mb-1">
              Indicadores <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="indicadores"
              value={newItem.indicadores}
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
            />
            {formErrors.indicadores && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.indicadores}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="porcentajeAvance" className="block text-sm font-medium mb-1">
              Porcentaje de Avance
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="porcentajeAvance"
                min="0"
                max="100"
                step="5"
                value={newItem.porcentajeAvance}
                onChange={(e) => setNewItem({ ...newItem, porcentajeAvance: Number(e.target.value) })}
                className="flex-1"
              />
              <div className="flex items-center gap-2 w-24">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newItem.porcentajeAvance}
                  onChange={(e) => setNewItem({ ...newItem, porcentajeAvance: Number(e.target.value) })}
                  className="w-16"
                />
                <span>%</span>
              </div>
            </div>
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
                    const formattedDate = format(date, "dd/MM/yyyy", { locale: es })
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
                } bg-background px-3 py-2 text-sm`}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
              />
              {formErrors.fechaInicio && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
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
                    const formattedDate = format(date, "dd/MM/yyyy", { locale: es })
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
                } bg-background px-3 py-2 text-sm`}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
                minDate={fechaInicioDate || undefined}
              />
              {formErrors.fechaFin && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {formErrors.fechaFin}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="responsable" className="block text-sm font-medium mb-1">
              Responsable <span className="text-red-500">*</span>
            </label>
            <Input
              id="responsable"
              value={newItem.responsable}
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
            />
            {formErrors.responsable && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.responsable}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium mb-1">
              Estado
            </label>
            <Select value={newItem.estado} onValueChange={(value) => setNewItem({ ...newItem, estado: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En progreso">En progreso</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="Retrasado">Retrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="prioridad" className="block text-sm font-medium mb-1">
              Prioridad
            </label>
            <Select
              value={newItem.prioridad || "Media"}
              onValueChange={(value) => setNewItem({ ...newItem, prioridad: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baja">Baja</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="comentarios" className="block text-sm font-medium mb-1">
              Comentarios
            </label>
            <Textarea
              id="comentarios"
              value={newItem.comentarios || ""}
              onChange={(e) => setNewItem({ ...newItem, comentarios: e.target.value })}
              placeholder="Comentarios adicionales"
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={testConnection} variant="secondary" disabled={submitting}>
            Probar Conexión
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
