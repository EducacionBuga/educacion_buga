"use client"

// components/plan-accion/plan-accion-add-dialog.tsx
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Save } from "lucide-react"
import { PlanAccionEstado, type PlanAccionItem } from "@/types/plan-accion"
import { usePlanAccionForm } from "@/hooks/use-plan-accion-form"
import { DatePicker } from "@/components/ui/date-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { planesDesarrolloMunicipal, getSubprogramasByPrograma, getProyectosBySubprograma } from "@/constants/plan-desarrollo-municipal"

// Helper function to safely format dates for input[type="date"]
const formatDateForInput = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) {
    return ""
  }
  return date.toISOString().split('T')[0]
}

interface PlanAccionAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (item: PlanAccionItem) => void
  isSubmitting: boolean
  initialItem?: PlanAccionItem | null
  mode?: "add" | "edit"
}

export function PlanAccionAddDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isSubmitting, 
  initialItem = null, 
  mode = "add" 
}: PlanAccionAddDialogProps) {
  const {
    item,
    errors,
    fechaInicioDate,
    fechaFinDate,
    updateField,
    updatePlanPDM,
    setFechaInicioDate,
    setFechaFinDate,
    validateForm,
    resetForm,
    setItem,
    handleSubmit,
  } = usePlanAccionForm((formItem) => {
    console.log("🎯 DATOS DEL FORMULARIO RECIBIDOS:", formItem)
    onSubmit(formItem)
  })

  // Inicializar el formulario cuando se abra en modo edición
  useEffect(() => {
    console.log("🔧 useEffect triggered:", { open, mode, initialItem: initialItem?.id || "null" })
    
    if (open && mode === "edit" && initialItem) {
      console.log("🔄 CONFIGURANDO FORMULARIO PARA EDICIÓN:", initialItem)
      setItem(initialItem)
    } else if (open && mode === "add") {
      console.log("🆕 RESETEANDO FORMULARIO PARA NUEVO ITEM")
      resetForm()
    }
  }, [open, mode, initialItem, setItem, resetForm])

  const [planesDecenales] = useState([
    {
      nombre: "MODELO EDUCATIVO DE ALTA CALIDAD",
      macroobjetivos: [
        {
          nombre:
            "1. Administración y gestión del sistema educativo:\nConsolidar un sistema educativo integrado  de alta calidad a partir de la articulacion, cooperacion y coherencia entre los diversos estamentos, politicas, planes y programas del sector.",
          objetivos: [
            "Objetivo.",
            "Objetivo1: Fortalecer unidades de gestión en la SEM para optimizar los resultados",
            "Objetivo2: Sistema de educación inicial, básica, media y terciaria articulado que garantice la reducción de las brechas entre ellos.",
            "Objetivo3: Consolidar mecanismos de participación con los diferentes sectores de la sociedad civil y la cooperación internacional que coadyuven a fortalecer un sistema educativo integrado",
            "Objetivo4: Asegurar que los recursos aprobados en los Planes de Desarrollo Municipal (2021-2032) para el  sector educción, los cuales están definidos en recursos del sistema General de Participaciones, ICLD y otros recursos de la Nación, se priorice su destinación para la calidad de la educación.",
          ],
        },
        {
          nombre:
            "2. Fomento a la Calidad:\nContar con un sistema de estrategias consolidadas y pertinentes para que las Instituciones Educativas alcancen los niveles de calidad esperados .",
          objetivos: [
            "Objetivo1: Programas de fortalecimiento a la infraestructura educativa, digital y los ambientes de aprendizaje.",
            "Objetivo2: Una estrategia municipal de acompañamiento a los procesos de desarrollo pedagógico en las IE  que propenda por la calidad educativa.",
            "Objetivo3: Fortalecimiento y consolidación de programas orientados a la competitividad del municipio tales como: integración de las TIC, bilinguismo,emprendimiento.",
            "Objetivo4:Perfil docente y directivo docente definidos y articulados con las facultades de educación para responder a las necesidades de la educación actual.",
          ],
        },
      ],
    },
    {
      nombre: "ACCESO, PERMANENCIA E INCLUSIÓN CON EQUIDAD",
      macroobjetivos: [
        {
          nombre:
            "3. Cobertura, acceso y permanencia en el sistema educativo:\nGarantizar y promover a través de politicas publicas el derecho al acceso a un sistema educativo público sostenible, que asegure la calidad, la permanencia y la pertinencia.",
          objetivos: [
            "Objetivo1: Ruta definida para la sostenibilidad de los estudiantes en el sector educativo.",
            "Objetivo2:  Sistema que garantice la permanencia de los estudiantes en los diferentes niveles educativos.",
          ],
        },
        {
          nombre:
            "4. Acceso y permanencia a población vulnerable:\nSistema que garantice el acceso y la permanencia en el sector educativo de las poblaciones vulnerables, reconociendo un enfoque diverso desde los PEI e implementando de manera transversal las políticas públicas municipales adoptadas por el municipio.",
          objetivos: [
            "Objetivo1: Implementar las disposiciones en materia de educación aprobadas en las políticas públicas municipales para poblaciones vulnerables.",
            "Objetivo2: Sistema que garantice la permanencia de la población vulnerable  en el sistema educativo.",
          ],
        },
      ],
    },
    {
      nombre: "PERTINENCIA E INNOVACION",
      macroobjetivos: [
        {
          nombre:
            "5. Inteligencias múltiples y demandas de aprendizaje en los estudiantes:\nImplementar programas y construir escenarios y ambientes, donde se puedan trabajar las preferencias individuales, para potencializar habilidades y destrezas bajo el contexto de pandemia COVID 19.",
          objetivos: [
            "Objetivo1: Ambientes de aprendizajes donde los estudiantes fortalezcan habilidades y destrezas para trabajar las preferencias individuales.",
            "Objetivo2: Propuesta de formación orientadas al desarrollo de habilidades blandas que respondan a las características del contexto glocalizado.",
          ],
        },
        {
          nombre:
            "6. Propuesta educativa contextualizada:\nContar con una oferta educativa articulada que responda a las necesidades, expectativas y potencialidades del Municipio y al contexto a partir del manejo de la pandemia COVID 19 .",
          objetivos: [
            "Objetivo1: Tener un proyecto educativo municipal  construido participativamente que tenga en cuenta la realidad de la alternancia y las dinámicas que esta conlleva.",
            "Objetivo2: Vinculación y apoyo de la sociedad civil al desarrollo de la propuesta educativa municipal.",
            "Objetivo3: Contar con proyectos educativos pertinentes con la vocación socioeconómica y cultural de la región.",
          ],
        },
      ],
    },
    {
      nombre: "CIUDAD EDUCADORA PARA TODAS LAS ETAPAS DE LA VIDA (Desde la Educación Inicial a la Terciaria)",
      macroobjetivos: [
        {
          nombre:
            "7. Ciudad educadora que articula todos los Niveles de Educación para los Ciudadanos: \nSistema Educativo articulado en todos los niveles de educación (Inicial a terciaria), que responda al contexto regional, los intereses y necesidades de los ciudadanos. Se debe trabajar articulado con el POT 2021 a 2037, en construcción, donde la educación hace parte de la apuesta transversal (ciudad educadora y universitaria); se debe articular a la Política Pública de adulto mayor (Acuerdo 062 del 2018).",
          objetivos: [
            "Objetivo1: Consolidar a Buga como un nodo de desarrollo para la educación terciaria con una proyección de absorción desde la micro región Valle-Centro que responda a las demandas del sector productivo.",
            "Objetivo2: Tener un Sistema Educativo que articule y de coherencia a todos los niveles de formación presente en el Municipio de Guadalajara de Buga.",
            "Objetivo3:   Costear y garantizar los recursos de los niveles de formación orientados al desarrollo de competencias",
          ],
        },
        {
          nombre:
            "8. Participación de la familia en la formación del ser:\nvinculacion efectiva de la familia como la principal responsable del proceso de formación de sus integrantes, con la participacion concensuada de los demas actores locales.",
          objetivos: [
            "Objetivo1: Consolidar la participación activa y responsable de los Padres de Familia en la formación de los Educandos.",
            "Objetivo2.Diseñar proyectos de formación para el nucleo familiar orientados al fortalecimiento de los vlaores ciudadanos.",
          ],
        },
      ],
    },
    {
      nombre: "COMPROMISO CON EL DESARROLLO Y SOSTENIBILIDAD DE LA REGIÓN",
      macroobjetivos: [
        {
          nombre:
            "9.Formación de cultura ciudadana,  tributaria, financiera y participativa de la vida política:\nExiste participación de diferentes actores locales y regionales que permite el desarrollo de programas para el fortalecimiento de valores ciudadanos.",
          objetivos: [
            "Objetivo1: se cuenta con programas que incentivan y fortalezcan los valores ciudadanos.",
            "Objetivo2. Se cuenta con programas que incentivan y fortalezcan la formación de jóvenes líderes políticos para participar en espacios democráticos.",
            "Objetivo3. Sistema Educativo con programas que desarrollan la solidaridad, la cultura tributaria y el compromiso social.",
            "Objetivo4: Contar con ciudadanos que respetan y fomentan los valores propios de la democracia participativa.",
          ],
        },
        {
          nombre:
            "10.Emprendimiento social y promocion de la conciencia ambiental:\nCiudadanos enfocados en la responsabilidad social,  conciencia ambiental y respeto a la biodiversidad. Se debe articular la Política Pública de Protección Animal (Acuerdo 076 del 2014)",
          objetivos: [
            "Objetivo1:  implrementar  programas de fomento al emprendimiento social, con el fin de fortalecer el proyecto de vida de los ciudadanos y su entorno.",
            "Objetivo2. promover proyectos ambientales  escolares.",
            "Objetivo3: Promover y difundir  los valores culturales y arqueológicos del municipio de Buga.",
          ],
        },
      ],
    },
    {
      nombre: "EDUCACION EN LAS RURALIDADES",
      macroobjetivos: [
        {
          nombre:
            "11. Pertinencia, conectividad y Calidad en la Oferta Educativa en las Ruralidades:\nGarantizar que la educación rural del Municipio responda a las necesidades y expectativas de la región. Se debe articular la Política Pública de Desarrollo Rural (Acuerdo 056 de 2018); se debe articular la Política Publica del adulto mayor (Acuerdo 062 del 2018) y se debe articular el POT 2021-2037 en construcción",
          objetivos: [
            "Objetivo1: El Municipio de Buga, implementa la política rural y la Secretaría de Educación Municipal con un Plan Educativo Rural, construido participativamente y articulado con el sector productivo el cual debe estar alineado a la Política de Educación.",
            "Objetivo2: El Municipio de Guadalajara de Buga, tiene definido la asignación de diferentes clases de recursos para la oferta de la educación rural de acuerdo con su contexto asegurando la conectividad.",
            "Objetivo3: La zona rural de Guadalajara de Buga, cuenta con una educación que fomenta y favorece la autonomía y soberanía alimentaria que aporta a la oferta local y regional.",
            "Objetivo4: Se fortalecen e integran las TIC y la conectividad en las instituciones educativas rurales.",
          ],
        },
      ],
    },
  ])

  // Estados locales para los selectores del Plan Decenal
  const [incluirPlanDecenal, setIncluirPlanDecenal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")
  const [selectedMacroobjetivo, setSelectedMacroobjetivo] = useState("")
  const [selectedObjetivo, setSelectedObjetivo] = useState("")
  const [macroobjetivos, setMacroobjetivos] = useState<any[]>([])
  const [objetivos, setObjetivos] = useState<string[]>([])

  // Estados locales para los selectores del PDM 2024-2027
  const [incluirPDM, setIncluirPDM] = useState(false)
  const [selectedProgramaPDM, setSelectedProgramaPDM] = useState("")
  const [selectedSubprogramaPDM, setSelectedSubprogramaPDM] = useState("")
  const [selectedProyectoPDM, setSelectedProyectoPDM] = useState("")
  const [subprogramasPDM, setSubprogramasPDM] = useState<any[]>([])
  const [proyectosPDM, setProyectosPDM] = useState<string[]>([])

  // Manejar cambios en el Plan Decenal
  useEffect(() => {
    if (incluirPlanDecenal && selectedPlan) {
      const plan = planesDecenales.find((p) => p.nombre === selectedPlan)
      if (plan) {
        setMacroobjetivos(plan.macroobjetivos)
        setSelectedMacroobjetivo("")
        setSelectedObjetivo("")
        setObjetivos([])
        // Actualizar el campo en el formulario
        updateField("metaDecenal", selectedPlan)
      }
    } else {
      setMacroobjetivos([])
      setSelectedMacroobjetivo("")
      setSelectedObjetivo("")
      setObjetivos([])
      updateField("metaDecenal", "")
    }
  }, [incluirPlanDecenal, selectedPlan, planesDecenales, updateField])

  // Manejar cambios en el Macroobjetivo
  useEffect(() => {
    if (incluirPlanDecenal && selectedMacroobjetivo) {
      const macroobjetivo = macroobjetivos.find((m) => m.nombre === selectedMacroobjetivo)
      if (macroobjetivo) {
        setObjetivos(macroobjetivo.objetivos)
        setSelectedObjetivo("")
        // Actualizar el campo en el formulario
        updateField("macroobjetivoDecenal", selectedMacroobjetivo)
      }
    } else {
      setObjetivos([])
      setSelectedObjetivo("")
      updateField("macroobjetivoDecenal", "")
    }
  }, [incluirPlanDecenal, selectedMacroobjetivo, macroobjetivos, updateField])

  // Manejar cambios en el Objetivo Decenal
  useEffect(() => {
    if (incluirPlanDecenal && selectedObjetivo) {
      updateField("objetivoDecenal", selectedObjetivo)
    } else {
      updateField("objetivoDecenal", "")
    }
  }, [incluirPlanDecenal, selectedObjetivo, updateField])

  // Manejar cambios en el Programa PDM
  useEffect(() => {
    if (incluirPDM && selectedProgramaPDM) {
      const subprogramas = getSubprogramasByPrograma(selectedProgramaPDM)
      setSubprogramasPDM(subprogramas)
      setSelectedSubprogramaPDM("")
      setSelectedProyectoPDM("")
      setProyectosPDM([])
      // Actualizar el campo en el formulario
      updateField("programaPDM", selectedProgramaPDM)
    } else {
      updateField("programaPDM", "")
    }
  }, [incluirPDM, selectedProgramaPDM, updateField])

  // Manejar cambios en el Subprograma PDM
  useEffect(() => {
    if (incluirPDM && selectedProgramaPDM && selectedSubprogramaPDM) {
      const proyectos = getProyectosBySubprograma(selectedProgramaPDM, selectedSubprogramaPDM)
      setProyectosPDM(proyectos)
      setSelectedProyectoPDM("")
      // Actualizar el campo en el formulario
      updateField("subprogramaPDM", selectedSubprogramaPDM)
    } else {
      updateField("subprogramaPDM", "")
    }
  }, [incluirPDM, selectedProgramaPDM, selectedSubprogramaPDM, updateField])

  // Manejar cambios en el Proyecto PDM
  useEffect(() => {
    if (incluirPDM && selectedProyectoPDM) {
      updateField("proyectoPDM", selectedProyectoPDM)
    } else {
      updateField("proyectoPDM", "")
    }
  }, [incluirPDM, selectedProyectoPDM, updateField])

  // Resetear formulario al cerrar
  useEffect(() => {
    if (!open) {
      resetForm()
      setIncluirPlanDecenal(false)
      setSelectedPlan("")
      setSelectedMacroobjetivo("")
      setSelectedObjetivo("")
      setMacroobjetivos([])
      setObjetivos([])
      // Reset PDM states
      setIncluirPDM(false)
      setSelectedProgramaPDM("")
      setSelectedSubprogramaPDM("")
      setSelectedProyectoPDM("")
      setSubprogramasPDM([])
      setProyectosPDM([])
    }
  }, [open, resetForm])

  // Manejar cierre del diálogo
  const handleClose = () => {
    onOpenChange(false)
  }

  // Validar y enviar formulario
  const handleFormSubmit = () => {
    // Validar campos del Plan Decenal solo si está habilitado
    if (incluirPlanDecenal) {
      if (!selectedPlan) {
        alert("Por favor seleccione un Plan Decenal")
        return
      }

      if (!selectedMacroobjetivo) {
        alert("Por favor seleccione un Macroobjetivo")
        return
      }

      if (!selectedObjetivo) {
        alert("Por favor seleccione un Objetivo")
        return
      }

      // Agregar los campos del Plan Decenal directamente al item antes de validar
      updateField("metaDecenal", selectedPlan)
      updateField("macroobjetivoDecenal", selectedMacroobjetivo)
      updateField("objetivoDecenal", selectedObjetivo)
    } else {
      // Limpiar campos del Plan Decenal si no está habilitado
      updateField("metaDecenal", "")
      updateField("macroobjetivoDecenal", "")
      updateField("objetivoDecenal", "")
    }

    // Validar campos del PDM solo si está habilitado
    if (incluirPDM) {
      if (!selectedProgramaPDM) {
        alert("Por favor seleccione un Programa PDM")
        return
      }

      if (!selectedSubprogramaPDM) {
        alert("Por favor seleccione un Subprograma PDM")
        return
      }

      if (!selectedProyectoPDM) {
        alert("Por favor seleccione un Proyecto/Actividad PDM")
        return
      }

      // Agregar los campos del PDM directamente al item antes de validar
      updateField("programaPDM", selectedProgramaPDM)
      updateField("subprogramaPDM", selectedSubprogramaPDM)
      updateField("proyectoPDM", selectedProyectoPDM)
    } else {
      // Limpiar campos del PDM si no está habilitado
      updateField("programaPDM", "")
      updateField("subprogramaPDM", "")
      updateField("proyectoPDM", "")
    }

    // Usar un setTimeout para asegurar que los campos se actualicen antes de enviar
    setTimeout(() => {
      if (validateForm()) {
        console.log("Enviando datos completos:", item)
        handleSubmit()
      }
    }, 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Elemento" : "Añadir Nuevo Elemento"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid gap-8 py-8 md:grid-cols-2 px-4">
            <div>
              <label htmlFor="programa" className="block text-sm font-medium mb-1">
                Programa <span className="text-red-500">*</span>
              </label>
              <Input
                id="programa"
                value={item.programa}
                onChange={(e) => updateField("programa", e.target.value)}
                placeholder="Nombre del programa"
                className={`w-full ${errors.programa ? "border-red-500" : ""}`}
                aria-invalid={!!errors.programa}
                aria-describedby={errors.programa ? "programa-error" : undefined}
              />
              {errors.programa && (
                <p id="programa-error" className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.programa}
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
                aria-invalid={!!errors.objetivo}
                aria-describedby={errors.objetivo ? "objetivo-error" : undefined}
              />
              {errors.objetivo && (
                <p id="objetivo-error" className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.objetivo}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="meta" className="block text-sm font-medium mb-1">
                Meta <span className="text-red-500">*</span>
              </label>
              <Input
                id="meta"
                value={item.meta}
                onChange={(e) => updateField("meta", e.target.value)}
                placeholder="Meta a alcanzar"
                className={`w-full ${errors.meta ? "border-red-500" : ""}`}
                aria-invalid={!!errors.meta}
                aria-describedby={errors.meta ? "meta-error" : undefined}
              />
              {errors.meta && (
                <p id="meta-error" className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.meta}
                </p>
              )}
            </div>
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
                aria-invalid={!!errors.presupuesto}
                aria-describedby={errors.presupuesto ? "presupuesto-error" : undefined}
              />
              {errors.presupuesto && (
                <p id="presupuesto-error" className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.presupuesto}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="acciones" className="block text-sm font-medium mb-1">
                Acciones realizadas <span className="text-red-500">*</span>
              </label>
              <Input
                id="acciones"
                value={item.acciones}
                onChange={(e) => updateField("acciones", e.target.value)}
                placeholder="Acciones separadas por comas"
                className={`w-full ${errors.acciones ? "border-red-500" : ""}`}
                aria-invalid={!!errors.acciones}
                aria-describedby={errors.acciones ? "acciones-error" : undefined}
              />
              {errors.acciones && (
                <p id="acciones-error" className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.acciones}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="indicadores" className="block text-sm font-medium mb-1">
                Indicadores Alcanzados <span className="text-red-500">*</span>
              </label>
              <Input
                id="indicadores"
                value={item.indicadores}
                onChange={(e) => updateField("indicadores", e.target.value)}
                placeholder="Indicadores de avance"
                className={`w-full ${errors.indicadores ? "border-red-500" : ""}`}
                aria-invalid={!!errors.indicadores}
                aria-describedby={errors.indicadores ? "indicadores-error" : undefined}
              />
              {errors.indicadores && (
                <p id="indicadores-error" className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.indicadores}
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
                  className={`flex-1 ${errors.porcentajeAvance ? "border-red-500" : ""}`}
                  aria-label="Ajustar porcentaje de avance"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.porcentajeAvance}
                />
                <div className="flex items-center gap-2 w-24">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.porcentajeAvance}
                    onChange={(e) => updateField("porcentajeAvance", Number(e.target.value))}
                    className={`w-16 ${errors.porcentajeAvance ? "border-red-500" : ""}`}
                    aria-label="Porcentaje de avance"
                  />
                  <span>%</span>
                </div>
              </div>
              {errors.porcentajeAvance && (
                <p id="porcentajeAvance-error" className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.porcentajeAvance}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm font-medium mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="estado"
                value={item.estado}
                onChange={(e) => updateField("estado", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Estado del elemento"
              >
                <option value={PlanAccionEstado.PENDIENTE}>{PlanAccionEstado.PENDIENTE}</option>
                <option value={PlanAccionEstado.EN_PROGRESO}>{PlanAccionEstado.EN_PROGRESO}</option>
                <option value={PlanAccionEstado.COMPLETADO}>{PlanAccionEstado.COMPLETADO}</option>
                <option value={PlanAccionEstado.RETRASADO}>{PlanAccionEstado.RETRASADO}</option>
              </select>
            </div>
            <div>
              <label htmlFor="responsable" className="block text-sm font-medium mb-1">
                Responsable <span className="text-red-500">*</span>
              </label>
              <Input
                id="responsable"
                value={item.responsable}
                onChange={(e) => updateField("responsable", e.target.value)}
                placeholder="Nombre del responsable"
                className={`w-full ${errors.responsable ? "border-red-500" : ""}`}
                aria-invalid={!!errors.responsable}
                aria-describedby={errors.responsable ? "responsable-error" : undefined}
              />
              {errors.responsable && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.responsable}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium mb-1">
                Fecha de inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fechaInicio"
                value={formatDateForInput(fechaInicioDate)}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    const date = new Date(value)
                    setFechaInicioDate(date)
                    updateField("fechaInicio", value)
                  } else {
                    setFechaInicioDate(null)
                    updateField("fechaInicio", "")
                  }
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Fecha de inicio"
                aria-describedby={errors.fechaInicio ? "fechaInicio-error" : undefined}
              />
              {errors.fechaInicio && (
                <p id="fechaInicio-error" className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.fechaInicio}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium mb-1">
                Fecha de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fechaFin"
                value={formatDateForInput(fechaFinDate)}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    const date = new Date(value)
                    setFechaFinDate(date)
                    updateField("fechaFin", value)
                  } else {
                    setFechaFinDate(null)
                    updateField("fechaFin", "")
                  }
                }}
                min={formatDateForInput(fechaInicioDate)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Fecha de fin"
                aria-describedby={errors.fechaFin ? "fechaFin-error" : undefined}
              />
              {errors.fechaFin && (
                <p id="fechaFin-error" className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.fechaFin}
                </p>
              )}
            </div>

            {/* Checkbox para Plan Decenal */}
            <div className="md:col-span-2">
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
                    }
                  }}
                />
                <label
                  htmlFor="incluir-plan-decenal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  ¿Quieres agregar plan decenal?
                </label>
              </div>
            </div>

            {/* Selectores del Plan Decenal - Solo se muestran si el checkbox está marcado */}
            {incluirPlanDecenal && (
              <>
                <div className="md:col-span-2">
                  <label htmlFor="planDecenal" className="block text-sm font-medium mb-1">
                    Plan Decenal <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="planDecenal"
                    value={selectedPlan}
                    onChange={(e) => {
                      console.log("Plan Decenal seleccionado:", e.target.value)
                      setSelectedPlan(e.target.value)
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Seleccionar Plan Decenal"
                  >
                    <option value="">Seleccione un Plan Decenal</option>
                    {planesDecenales.map((plan) => (
                      <option key={plan.nombre} value={plan.nombre}>
                        {plan.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="macroobjetivo" className="block text-sm font-medium mb-1">
                    Macroobjetivo <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="macroobjetivo"
                    value={selectedMacroobjetivo}
                    onChange={(e) => {
                      console.log("Macroobjetivo seleccionado:", e.target.value)
                      setSelectedMacroobjetivo(e.target.value)
                    }}
                    disabled={!selectedPlan}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Seleccionar Macroobjetivo"
                  >
                    <option value="">Seleccione un Macroobjetivo</option>
                    {macroobjetivos.map((macro) => (
                      <option key={macro.nombre} value={macro.nombre}>
                        {macro.nombre.split("\n")[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="objetivo-especifico" className="block text-sm font-medium mb-1">
                    Objetivo Decenal <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="objetivo-especifico"
                    value={selectedObjetivo}
                    onChange={(e) => {
                      console.log("Objetivo Decenal seleccionado:", e.target.value)
                      setSelectedObjetivo(e.target.value)
                    }}
                    disabled={!selectedMacroobjetivo}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Seleccionar Objetivo"
                  >
                    <option value="">Seleccione un Objetivo</option>
                    {objetivos.map((obj) => (
                      <option key={obj} value={obj}>
                        {obj}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Checkbox para Plan de Desarrollo Municipal (PDM) */}
            <div className="md:col-span-2">
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
                    }
                  }}
                />
                <label
                  htmlFor="incluir-pdm"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  ¿Quieres agregar Plan de Desarrollo Municipal (PDM) 2024-2027?
                </label>
              </div>
            </div>

            {/* Selectores del PDM - Solo se muestran si el checkbox está marcado */}
            {incluirPDM && (
              <>
                <div className="md:col-span-2">
                  <label htmlFor="programaPDM" className="block text-sm font-medium mb-1">
                    Programa PDM <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="programaPDM"
                    value={selectedProgramaPDM}
                    onChange={(e) => {
                      console.log("Programa PDM seleccionado:", e.target.value)
                      setSelectedProgramaPDM(e.target.value)
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Seleccionar Programa PDM"
                  >
                    <option value="">Seleccione un Programa PDM</option>
                    {planesDesarrolloMunicipal.map((programa) => (
                      <option key={programa.nombre} value={programa.nombre}>
                        {programa.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="subprogramaPDM" className="block text-sm font-medium mb-1">
                    Subprograma PDM <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subprogramaPDM"
                    value={selectedSubprogramaPDM}
                    onChange={(e) => {
                      console.log("Subprograma PDM seleccionado:", e.target.value)
                      setSelectedSubprogramaPDM(e.target.value)
                    }}
                    disabled={!selectedProgramaPDM}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Seleccionar Subprograma PDM"
                  >
                    <option value="">Seleccione un Subprograma PDM</option>
                    {subprogramasPDM.map((subprograma) => (
                      <option key={subprograma.nombre} value={subprograma.nombre}>
                        {subprograma.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="proyectoPDM" className="block text-sm font-medium mb-1">
                    Proyecto/Actividad PDM <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="proyectoPDM"
                    value={selectedProyectoPDM}
                    onChange={(e) => {
                      console.log("Proyecto PDM seleccionado:", e.target.value)
                      setSelectedProyectoPDM(e.target.value)
                    }}
                    disabled={!selectedSubprogramaPDM}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Seleccionar Proyecto PDM"
                  >
                    <option value="">Seleccione un Proyecto/Actividad PDM</option>
                    {proyectosPDM.map((proyecto) => (
                      <option key={proyecto} value={proyecto}>
                        {proyecto}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} aria-label="Cancelar">
            Cancelar
          </Button>
          <Button
            onClick={async (e) => {
              e.preventDefault()

              console.log("🔥 === INICIO DEL PROCESO DE GUARDADO ===")
              console.log("📋 Estado actual del formulario (item):", item)
              console.log("🎯 Variables locales del Plan Decenal:")
              console.log("   selectedPlan:", selectedPlan)
              console.log("   selectedMacroobjetivo:", selectedMacroobjetivo)
              console.log("   selectedObjetivo:", selectedObjetivo)

              // Validar campos del Plan Decenal
              if (!selectedPlan) {
                alert("Por favor seleccione un Plan Decenal")
                return
              }

              if (!selectedMacroobjetivo) {
                alert("Por favor seleccione un Macroobjetivo")
                return
              }

              if (!selectedObjetivo) {
                alert("Por favor seleccione un Objetivo")
                return
              }

              // Forzar actualización de los campos del Plan Decenal ANTES del envío
              console.log("🔄 FORZANDO ACTUALIZACIÓN DE CAMPOS PLAN DECENAL...")
              updateField("metaDecenal", selectedPlan)
              updateField("macroobjetivoDecenal", selectedMacroobjetivo)
              updateField("objetivoDecenal", selectedObjetivo)

              // Esperar un momento para que se actualice el estado
              await new Promise(resolve => setTimeout(resolve, 100))

              console.log("📋 Estado DESPUÉS de forzar actualización:", item)

              // Crear objeto final con los valores más actuales para estar seguro
              const finalFormData = {
                ...item,
                metaDecenal: selectedPlan,
                macroobjetivoDecenal: selectedMacroobjetivo,
                objetivoDecenal: selectedObjetivo,
              }

              console.log("🎯 DATOS FINALES GARANTIZADOS:", finalFormData)
              console.log("🔍 VERIFICACIÓN FINAL DE CAMPOS PLAN DECENAL:")
              console.log("   metaDecenal:", finalFormData.metaDecenal)
              console.log("   macroobjetivoDecenal:", finalFormData.macroobjetivoDecenal)
              console.log("   objetivoDecenal:", finalFormData.objetivoDecenal)

              // Validar que los campos básicos estén completos
              if (
                !finalFormData.programa ||
                !finalFormData.objetivo ||
                !finalFormData.meta ||
                !finalFormData.presupuesto ||
                !finalFormData.acciones ||
                !finalFormData.indicadores ||
                !finalFormData.responsable
              ) {
                alert("Por favor complete todos los campos obligatorios")
                return
              }

              console.log("✅ Enviando datos directamente a onSubmit...")
              
              // Enviar los datos directamente asegurando que tienen los campos del Plan Decenal
              onSubmit(finalFormData)
            }}
            aria-label="Guardar elemento"
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === "edit" ? "Actualizar" : "Guardar"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
