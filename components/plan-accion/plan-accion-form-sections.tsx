"use client"

// Importaciones necesarias
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ChevronDown, ChevronRight, Download } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "@/components/modules/datepicker.css"
import { PlanAccionEstado, type PlanAccionItem } from "@/types/plan-accion"
import { planesDesarrolloMunicipal, getSubprogramasByPrograma, getProyectosBySubprograma } from "@/constants/plan-desarrollo-municipal"
import { useProgramasMetas } from "@/hooks/use-programas-metas"
import { ProgramaMetaSelector } from "@/components/ui/smart-selector"

interface PlanAccionFormSectionsProps {
  item: PlanAccionItem
  errors: Record<string, string>
  fechaInicioDate: Date | null
  fechaFinDate: Date | null
  updateField: (field: keyof PlanAccionItem, value: any) => void
  setFechaInicioDate: (date: Date | null) => void
  setFechaFinDate: (date: Date | null) => void
  // Props para Plan Decenal
  incluirPlanDecenal: boolean
  setIncluirPlanDecenal: (value: boolean) => void
  selectedPlan: string
  setSelectedPlan: (value: string) => void
  selectedMacroobjetivo: string
  setSelectedMacroobjetivo: (value: string) => void
  selectedObjetivo: string
  setSelectedObjetivo: (value: string) => void
  macroobjetivos: any[]
  objetivos: string[]
  planesDecenales: any[]
  // Props para PDM
  incluirPDM: boolean
  setIncluirPDM: (value: boolean) => void
  selectedProgramaPDM: string
  setSelectedProgramaPDM: (value: string) => void
  selectedSubprogramaPDM: string
  setSelectedSubprogramaPDM: (value: string) => void
  selectedProyectoPDM: string
  setSelectedProyectoPDM: (value: string) => void
  subprogramasPDM: any[]
  proyectosPDM: string[]
}

export function PlanAccionFormSections({
  item,
  errors,
  fechaInicioDate,
  fechaFinDate,
  updateField,
  setFechaInicioDate,
  setFechaFinDate,
  // Props para Plan Decenal
  incluirPlanDecenal,
  setIncluirPlanDecenal,
  selectedPlan,
  setSelectedPlan,
  selectedMacroobjetivo,
  setSelectedMacroobjetivo,
  selectedObjetivo,
  setSelectedObjetivo,
  macroobjetivos,
  objetivos,
  planesDecenales,
  // Props para PDM
  incluirPDM,
  setIncluirPDM,
  selectedProgramaPDM,
  setSelectedProgramaPDM,
  selectedSubprogramaPDM,
  setSelectedSubprogramaPDM,
  selectedProyectoPDM,
  setSelectedProyectoPDM,
  subprogramasPDM,
  proyectosPDM,
}: PlanAccionFormSectionsProps) {
  const { programas, getMetasByPrograma, loading: loadingProgramas } = useProgramasMetas()
  const [metasDisponibles, setMetasDisponibles] = useState<string[]>([])

  // Actualizar metas disponibles cuando cambia el programa
  useEffect(() => {
    if (item.programa) {
      const metas = getMetasByPrograma(item.programa)
      setMetasDisponibles(metas)
    } else {
      setMetasDisponibles([])
    }
  }, [item.programa, getMetasByPrograma])
  // Estados para controlar las secciones colapsables
  const [sectionsOpen, setSectionsOpen] = useState({
    basica: true,
    demografica: false,
    especifica: false,
    decenal: false,
    pdm: false,
  })
  // Lógica para PDM (usando props del componente padre)
  // Los datos de Plan Decenal (planesDecenales, macroobjetivos, objetivos) ya vienen como props
  // Los datos de PDM (subprogramasPDM, proyectosPDM) también vienen como props

  // Función para alternar secciones
  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Validación de secciones
  const validateBasicSection = () => {
    return !errors.programa && !errors.objetivo && !errors.meta && !errors.responsable && !errors.fechaInicio && !errors.fechaFin
  }

  const validateDemographicSection = () => {
    // Verificar si al menos un campo demográfico está completo
    return !!(
      item.grupoEtareo ||
      item.grupoPoblacion ||
      item.zona ||
      item.grupoEtnico ||
      item.cantidad
    )
  }

  const validateSpecificSection = () => {
    return !errors.presupuesto && !errors.acciones && !errors.indicadores && !errors.porcentajeAvance
  }


  // Función para descargar PDM
  const downloadPDM = () => {
    const link = document.createElement('a')
    link.href = '/document/plan-de-desarrollo.xlsx'
    link.download = 'plan-de-desarrollo.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Sección: Información Básica */}
      <Collapsible open={sectionsOpen.basica} onOpenChange={() => toggleSection('basica')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
          <div className="flex items-center space-x-2">
            {sectionsOpen.basica ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <h3 className="text-lg font-semibold text-blue-800">Información Básica</h3>
            {validateBasicSection() && <span className="text-green-600 text-sm">✓ Completa</span>}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 border border-blue-200 rounded-b-lg">
          <div className="grid gap-4">
            <div className="md:col-span-2">
              <ProgramaMetaSelector
                programas={programas}
                metas={metasDisponibles}
                selectedPrograma={item.programa}
                selectedMeta={item.meta}
                onProgramaChange={(programa) => {
                  updateField("programa", programa)
                  updateField("meta", "") // Limpiar meta cuando cambia programa
                }}
                onMetaChange={(meta) => updateField("meta", meta)}
                programaError={!!errors.programa}
                metaError={!!errors.meta}
                disabled={loadingProgramas}
              />
              {errors.programa && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.programa}
                </p>
              )}
              {errors.meta && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.meta}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="objetivo" className="block text-sm font-medium mb-1">
                Objetivo <span className="text-red-500">*</span>
              </label>
              <Input
                id="objetivo"
                value={item.objetivo}
                onChange={(e) => updateField("objetivo", e.target.value)}
                placeholder="Objetivo del programa"
                className={`w-full ${errors.objetivo ? "border-red-500" : ""}`}
              />
              {errors.objetivo && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.objetivo}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="responsable" className="block text-sm font-medium mb-1">
                Responsable <span className="text-red-500">*</span>
              </label>
              <Input
                id="responsable"
                value={item.responsable}
                onChange={(e) => updateField("responsable", e.target.value)}
                placeholder="Responsable del programa"
                className={`w-full ${errors.responsable ? "border-red-500" : ""}`}
              />
              {errors.responsable && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.responsable}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <Select value={item.estado} onValueChange={(value) => updateField("estado", value)}>
                <SelectTrigger className={`w-full ${errors.estado ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PlanAccionEstado).map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.estado && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.estado}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium mb-1">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={fechaInicioDate}
                onChange={(date: Date) => {
                  setFechaInicioDate(date)
                  if (date) {
                    const formattedDate = format(date, "dd/MM/yyyy", { locale: es })
                    updateField("fechaInicio", formattedDate)
                  }
                }}
                dateFormat="dd/MM/yyyy"
                locale={es}
                placeholderText="Seleccionar fecha de inicio"
                className={`w-full rounded-md border ${
                  errors.fechaInicio ? "border-red-500" : "border-input"
                } bg-background px-3 py-2 text-sm`}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
              />
              {errors.fechaInicio && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.fechaInicio}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium mb-1">
                Fecha de Fin <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={fechaFinDate}
                onChange={(date: Date) => {
                  setFechaFinDate(date)
                  if (date) {
                    const formattedDate = format(date, "dd/MM/yyyy", { locale: es })
                    updateField("fechaFin", formattedDate)
                  }
                }}
                dateFormat="dd/MM/yyyy"
                locale={es}
                placeholderText="Seleccionar fecha de fin"
                className={`w-full rounded-md border ${
                  errors.fechaFin ? "border-red-500" : "border-input"
                } bg-background px-3 py-2 text-sm`}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
                minDate={fechaInicioDate || undefined}
              />
              {errors.fechaFin && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.fechaFin}
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sección: Información Demográfica (Opcional) */}
      <Collapsible open={sectionsOpen.demografica} onOpenChange={() => toggleSection('demografica')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
          <div className="flex items-center space-x-2">
            {sectionsOpen.demografica ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <h3 className="text-lg font-semibold text-green-800">Información Demográfica</h3>
            <span className="text-green-600 text-sm">(Opcional)</span>
            {validateDemographicSection() && <span className="text-green-600 text-sm ml-2">✓ Con datos</span>}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 border border-green-200 rounded-b-lg">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="grupoEtareo" className="block text-sm font-medium mb-1">
                Grupo Etáreo
              </label>
              <Select value={item.grupoEtareo || ""} onValueChange={(value) => updateField("grupoEtareo", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar grupo etáreo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-5">0 a 5 años</SelectItem>
                  <SelectItem value="6-10">6 a 10 años</SelectItem>
                  <SelectItem value="11-15">11 a 15 años</SelectItem>
                  <SelectItem value="16-20">16 a 20 años</SelectItem>
                  <SelectItem value="21-25">21 a 25 años</SelectItem>
                  <SelectItem value="26-30">26 a 30 años</SelectItem>
                  <SelectItem value="31-35">31 a 35 años</SelectItem>
                  <SelectItem value="36-40">36 a 40 años</SelectItem>
                  <SelectItem value="41-45">41 a 45 años</SelectItem>
                  <SelectItem value="46-50">46 a 50 años</SelectItem>
                  <SelectItem value="50+">+ de 50 años</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="grupoPoblacion" className="block text-sm font-medium mb-1">
                Grupo de Población Identificado
              </label>
              <Select value={item.grupoPoblacion || ""} onValueChange={(value) => updateField("grupoPoblacion", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar grupo de población" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="victima-conflicto">Víctima del conflicto armado</SelectItem>
                  <SelectItem value="negro-mulato-afro">Negro/a, mulato/a, Afrodescendiente, afrocolombiano(a)</SelectItem>
                  <SelectItem value="desplazado">Desplazado</SelectItem>
                  <SelectItem value="indigena">Población Indígena</SelectItem>
                  <SelectItem value="gitano-rom">Gitano /Room</SelectItem>
                  <SelectItem value="raizal">Raizal</SelectItem>
                  <SelectItem value="palenquero">Palenquero</SelectItem>
                  <SelectItem value="lgtbiq">LGTBIQ</SelectItem>
                  <SelectItem value="ninguna">Ninguna de las anteriores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="zona" className="block text-sm font-medium mb-1">
                Zona
              </label>
              <Select value={item.zona || ""} onValueChange={(value) => updateField("zona", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urbana">Urbana</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="grupoEtnico" className="block text-sm font-medium mb-1">
                Grupo Étnico
              </label>
              <Select value={item.grupoEtnico || ""} onValueChange={(value) => updateField("grupoEtnico", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar grupo étnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="na">N/A (No aplica)</SelectItem>
                  <SelectItem value="pueblo-indigena">Pueblo indígena</SelectItem>
                  <SelectItem value="comunidad-negra">Comunidad negra</SelectItem>
                  <SelectItem value="rom-gitano">Rom (gitano)</SelectItem>
                  <SelectItem value="no-pertenece">No pertenece</SelectItem>
                  <SelectItem value="raizal">Raizal del Archipiélago de San Andrés, Providencia y Santa Catalina</SelectItem>
                  <SelectItem value="afrocolombiano">Afrocolombiano</SelectItem>
                  <SelectItem value="palenquero">Palenquero de San Basilio</SelectItem>
                  <SelectItem value="mestizo">Mestizo(a)</SelectItem>
                  <SelectItem value="mulato">Mulato(a)</SelectItem>
                  <SelectItem value="blanco">Blanco(a)</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                  <SelectItem value="no-informa">No informa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="cantidad" className="block text-sm font-medium mb-1">
                Cantidad
              </label>
              <Input
                id="cantidad"
                type="number"
                value={item.cantidad || ""}
                onChange={(e) => {
                  // Asegurar que sea un valor numérico o vacío
                  const value = e.target.value === "" ? "" : e.target.value;
                  updateField("cantidad", value);
                }}
                placeholder="Dato numérico"
                className="w-full"
              />
              {/* Los datos demográficos se guardan automáticamente con el botón principal */}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sección: Información Específica */}
      <Collapsible open={sectionsOpen.especifica} onOpenChange={() => toggleSection('especifica')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
          <div className="flex items-center space-x-2">
            {sectionsOpen.especifica ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <h3 className="text-lg font-semibold text-orange-800">Información Específica</h3>
            {validateSpecificSection() && <span className="text-green-600 text-sm">✓ Completa</span>}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 border border-orange-200 rounded-b-lg">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="presupuesto" className="block text-sm font-medium mb-1">
                Presupuesto <span className="text-red-500">*</span>
              </label>
              <Input
                id="presupuesto"
                value={item.presupuesto}
                onChange={(e) => updateField("presupuesto", e.target.value)}
                placeholder="Ej: $100,000,000"
                className={`w-full ${errors.presupuesto ? "border-red-500" : ""}`}
              />
              {errors.presupuesto && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.presupuesto}
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
                  value={item.porcentajeAvance}
                  onChange={(e) => updateField("porcentajeAvance", Number(e.target.value))}
                  className={`flex-1 ${errors.porcentajeAvance ? "accent-red-500" : ""}`}
                />
                <div className="flex items-center gap-2 w-24">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.porcentajeAvance}
                    onChange={(e) => updateField("porcentajeAvance", Number(e.target.value) || 0)}
                    className={`w-16 ${errors.porcentajeAvance ? "border-red-500" : ""}`}
                  />
                  <span>%</span>
                </div>
              </div>
              {errors.porcentajeAvance && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.porcentajeAvance}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="acciones" className="block text-sm font-medium mb-1">
                Acciones Realizadas <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="acciones"
                value={item.acciones}
                onChange={(e) => updateField("acciones", e.target.value)}
                placeholder="Describa las acciones realizadas"
                className={`w-full ${errors.acciones ? "border-red-500" : ""}`}
                rows={3}
              />
              {errors.acciones && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.acciones}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="indicadores" className="block text-sm font-medium mb-1">
                Indicadores Alcanzados <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="indicadores"
                value={item.indicadores}
                onChange={(e) => updateField("indicadores", e.target.value)}
                placeholder="Describa los indicadores alcanzados"
                className={`w-full ${errors.indicadores ? "border-red-500" : ""}`}
                rows={3}
              />
              {errors.indicadores && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.indicadores}
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sección: Plan Decenal de Educación */}
      <Collapsible open={sectionsOpen.decenal} onOpenChange={() => toggleSection('decenal')}>
        <div className="flex items-center justify-between w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
          <CollapsibleTrigger className="flex items-center space-x-2 flex-1">
            {sectionsOpen.decenal ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <h3 className="text-lg font-semibold text-purple-800">Plan Decenal de Educación</h3>
            <span className="text-purple-600 text-sm">(Opcional)</span>
          </CollapsibleTrigger>

        </div>
        <CollapsibleContent className="p-4 border border-purple-200 rounded-b-lg">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluir-plan-decenal"
                checked={incluirPlanDecenal}
                onCheckedChange={(checked) => {
                  setIncluirPlanDecenal(checked as boolean)
                  if (!checked) {
                    setSelectedPlan("")
                    setSelectedMacroobjetivo("")
                    setSelectedObjetivo("")
                    updateField("metaDecenal", "")
                    updateField("macroobjetivoDecenal", "")
                    updateField("objetivoDecenal", "")
                  }
                }}
              />
              <label htmlFor="incluir-plan-decenal" className="text-sm font-medium">
                ¿Quieres agregar Plan Decenal de Educación?
              </label>
            </div>

            {incluirPlanDecenal && (
              <div className="grid gap-4">
                <div>
                  <label htmlFor="plan-decenal" className="block text-sm font-medium mb-1">
                    Plan Decenal <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedPlan}
                    onValueChange={(value) => {
                      setSelectedPlan(value)
                      setSelectedMacroobjetivo("")
                      setSelectedObjetivo("")
                      updateField("metaDecenal", value)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un Plan Decenal" />
                    </SelectTrigger>
                    <SelectContent>
                      {planesDecenales.map((plan) => (
                        <SelectItem key={plan.nombre} value={plan.nombre}>
                          {plan.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="macroobjetivo" className="block text-sm font-medium mb-1">
                    Macroobjetivo <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedMacroobjetivo}
                    onValueChange={(value) => {
                      setSelectedMacroobjetivo(value)
                      setSelectedObjetivo("")
                      updateField("macroobjetivoDecenal", value)
                    }}
                    disabled={!selectedPlan}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un Macroobjetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {macroobjetivos.map((macro) => (
                        <SelectItem key={macro.nombre} value={macro.nombre}>
                          {macro.nombre.split("\n")[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="objetivo-decenal" className="block text-sm font-medium mb-1">
                    Objetivo Decenal <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedObjetivo}
                    onValueChange={(value) => {
                      setSelectedObjetivo(value)
                      updateField("objetivoDecenal", value)
                    }}
                    disabled={!selectedMacroobjetivo}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un Objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {objetivos.map((obj) => (
                        <SelectItem key={obj} value={obj}>
                          {obj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sección: Plan de Desarrollo Municipal (PDM) */}
      <Collapsible open={sectionsOpen.pdm} onOpenChange={() => toggleSection('pdm')}>
        <div className="flex items-center justify-between w-full p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
          <CollapsibleTrigger className="flex items-center space-x-2 flex-1">
            {sectionsOpen.pdm ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <h3 className="text-lg font-semibold text-indigo-800">Plan de Desarrollo Municipal (PDM) 2024-2027</h3>
            <span className="text-indigo-600 text-sm">(Opcional)</span>
          </CollapsibleTrigger>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 ml-2"
            title="Consultar y descargar Plan de Desarrollo Municipal"
            onClick={downloadPDM}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <CollapsibleContent className="p-4 border border-indigo-200 rounded-b-lg">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluir-pdm"
                checked={incluirPDM}
                onCheckedChange={(checked) => {
                  setIncluirPDM(checked as boolean)
                  if (!checked) {
                    setSelectedProgramaPDM("")
                    setSelectedSubprogramaPDM("")
                    setSelectedProyectoPDM("")
                    updateField("programaPDM", "")
                    updateField("subprogramaPDM", "")
                    updateField("proyectoPDM", "")
                  }
                }}
              />
              <label htmlFor="incluir-pdm" className="text-sm font-medium">
                ¿Quieres agregar Plan de Desarrollo Municipal (PDM) 2024-2027?
              </label>
            </div>

            {incluirPDM && (
              <div className="grid gap-4">
                <div>
                  <label htmlFor="programa-pdm" className="block text-sm font-medium mb-1">
                    Programa PDM <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedProgramaPDM}
                    onValueChange={(value) => {
                      setSelectedProgramaPDM(value)
                      setSelectedSubprogramaPDM("")
                      setSelectedProyectoPDM("")
                      updateField("programaPDM", value)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un Programa PDM" />
                    </SelectTrigger>
                    <SelectContent>
                      {planesDesarrolloMunicipal.map((programa) => (
                        <SelectItem key={programa.nombre} value={programa.nombre}>
                          {programa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="subprograma-pdm" className="block text-sm font-medium mb-1">
                    Subprograma PDM <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedSubprogramaPDM}
                    onValueChange={(value) => {
                      setSelectedSubprogramaPDM(value)
                      setSelectedProyectoPDM("")
                      updateField("subprogramaPDM", value)
                    }}
                    disabled={!selectedProgramaPDM}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un Subprograma PDM" />
                    </SelectTrigger>
                    <SelectContent>
                      {subprogramasPDM.map((subprograma) => (
                        <SelectItem key={subprograma.nombre} value={subprograma.nombre}>
                          {subprograma.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="proyecto-pdm" className="block text-sm font-medium mb-1">
                    Proyecto/Actividad PDM <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedProyectoPDM}
                    onValueChange={(value) => {
                      setSelectedProyectoPDM(value)
                      updateField("proyectoPDM", value)
                    }}
                    disabled={!selectedSubprogramaPDM}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un Proyecto/Actividad PDM" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectosPDM.map((proyecto) => (
                        <SelectItem key={proyecto} value={proyecto}>
                          {proyecto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}