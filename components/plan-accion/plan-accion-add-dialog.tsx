"use client"

// components/plan-accion/plan-accion-add-dialog.tsx
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Save, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { PlanAccionEstado, type PlanAccionItem } from "@/types/plan-accion"
import { usePlanAccionForm } from "@/hooks/use-plan-accion-form"
import { DatePicker } from "@/components/ui/date-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { planesDesarrolloMunicipal, getSubprogramasByPrograma, getProyectosBySubprograma } from "@/constants/plan-desarrollo-municipal"
import { PlanAccionFormSections } from "./plan-accion-form-sections"

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
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false)
  
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

  // Inicializar el formulario cuando se abra en modo edición
  useEffect(() => {
    console.log("🔧 useEffect triggered:", { open, mode, initialItem: initialItem?.id || "null" })
    
    if (open && mode === "edit" && initialItem) {
      console.log("🔄 CONFIGURANDO FORMULARIO PARA EDICIÓN:", initialItem)
      setItem(initialItem)
      
      // Configurar Plan Decenal si existe
      if (initialItem.metaDecenal && initialItem.metaDecenal.trim() !== "") {
        console.log("📝 Cargando Plan Decenal existente:", {
          metaDecenal: initialItem.metaDecenal,
          macroobjetivoDecenal: initialItem.macroobjetivoDecenal,
          objetivoDecenal: initialItem.objetivoDecenal
        })
        
        setIncluirPlanDecenal(true)
        setSelectedPlan(initialItem.metaDecenal)
        
        // Buscar y configurar macroobjetivos
        const plan = planesDecenales.find(p => p.nombre === initialItem.metaDecenal)
        if (plan) {
          setMacroobjetivos(plan.macroobjetivos)
          
          if (initialItem.macroobjetivoDecenal) {
            setSelectedMacroobjetivo(initialItem.macroobjetivoDecenal)
            
            // Buscar y configurar objetivos
            const macro = plan.macroobjetivos.find(m => m.nombre === initialItem.macroobjetivoDecenal)
            if (macro) {
              setObjetivos(macro.objetivos)
              
              if (initialItem.objetivoDecenal) {
                setSelectedObjetivo(initialItem.objetivoDecenal)
              }
            }
          }
        }
      } else {
        // Limpiar Plan Decenal si no existe
        setIncluirPlanDecenal(false)
        setSelectedPlan("")
        setSelectedMacroobjetivo("")
        setSelectedObjetivo("")
        setMacroobjetivos([])
        setObjetivos([])
      }
      
      // Configurar PDM si existe
      if (initialItem.programaPDM && initialItem.programaPDM.trim() !== "") {
        console.log("📝 Cargando PDM existente:", {
          programaPDM: initialItem.programaPDM,
          subprogramaPDM: initialItem.subprogramaPDM,
          proyectoPDM: initialItem.proyectoPDM
        })
        
        setIncluirPDM(true)
        setSelectedProgramaPDM(initialItem.programaPDM)
        
        // Configurar subprogramas
        const subprogramas = getSubprogramasByPrograma(initialItem.programaPDM)
        setSubprogramasPDM(subprogramas)
        
        if (initialItem.subprogramaPDM) {
          setSelectedSubprogramaPDM(initialItem.subprogramaPDM)
          
          // Configurar proyectos
          const proyectos = getProyectosBySubprograma(initialItem.programaPDM, initialItem.subprogramaPDM)
          setProyectosPDM(proyectos)
          
          if (initialItem.proyectoPDM) {
            setSelectedProyectoPDM(initialItem.proyectoPDM)
          }
        }
      } else {
        // Limpiar PDM si no existe
        setIncluirPDM(false)
        setSelectedProgramaPDM("")
        setSelectedSubprogramaPDM("")
        setSelectedProyectoPDM("")
        setSubprogramasPDM([])
        setProyectosPDM([])
      }
      
    } else if (open && mode === "add") {
      console.log("🆕 RESETEANDO FORMULARIO PARA NUEVO ITEM")
      resetForm()
    }
  }, [open, mode, initialItem, setItem, resetForm, planesDecenales])

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
      setHasBeenSubmitted(false)
    }
  }, [open, resetForm])

  // Manejar cierre del diálogo
  const handleClose = () => {
    onOpenChange(false)
  }

  // Validar y enviar formulario
  const handleFormSubmit = () => {
    // Actualizar campos del Plan Decenal si está habilitado (sin validación obligatoria)
    if (incluirPlanDecenal) {
      // Solo actualizar los campos que están seleccionados
      updateField("metaDecenal", selectedPlan || "")
      updateField("macroobjetivoDecenal", selectedMacroobjetivo || "")
      updateField("objetivoDecenal", selectedObjetivo || "")
    } else {
      // Limpiar campos del Plan Decenal si no está habilitado
      updateField("metaDecenal", "")
      updateField("macroobjetivoDecenal", "")
      updateField("objetivoDecenal", "")
    }

    // Actualizar campos del PDM si está habilitado (sin validación obligatoria)
    if (incluirPDM) {
      // Solo actualizar los campos que están seleccionados
      updateField("programaPDM", selectedProgramaPDM || "")
      updateField("subprogramaPDM", selectedSubprogramaPDM || "")
      updateField("proyectoPDM", selectedProyectoPDM || "")
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
          <div className="px-4 py-6">
            <PlanAccionFormSections
              item={item}
              errors={errors}
              fechaInicioDate={fechaInicioDate}
              fechaFinDate={fechaFinDate}
              updateField={updateField}
              setFechaInicioDate={setFechaInicioDate}
              setFechaFinDate={setFechaFinDate}
              // Props para Plan Decenal
              incluirPlanDecenal={incluirPlanDecenal}
              setIncluirPlanDecenal={setIncluirPlanDecenal}
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
              selectedMacroobjetivo={selectedMacroobjetivo}
              setSelectedMacroobjetivo={setSelectedMacroobjetivo}
              selectedObjetivo={selectedObjetivo}
              setSelectedObjetivo={setSelectedObjetivo}
              macroobjetivos={macroobjetivos}
              objetivos={objetivos}
              planesDecenales={planesDecenales}
              // Props para PDM
              incluirPDM={incluirPDM}
              setIncluirPDM={setIncluirPDM}
              selectedProgramaPDM={selectedProgramaPDM}
              setSelectedProgramaPDM={setSelectedProgramaPDM}
              selectedSubprogramaPDM={selectedSubprogramaPDM}
              setSelectedSubprogramaPDM={setSelectedSubprogramaPDM}
              selectedProyectoPDM={selectedProyectoPDM}
              setSelectedProyectoPDM={setSelectedProyectoPDM}
              subprogramasPDM={subprogramasPDM}
              proyectosPDM={proyectosPDM}
            />
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} aria-label="Cancelar">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              // Prevenir múltiples envíos
              if (isSubmitting || hasBeenSubmitted) {
                console.log("⚠️ Envío bloqueado - ya está en proceso o completado")
                return
              }

              console.log("🔄 BOTÓN GUARDAR PRESIONADO")
              console.log("📊 Estado actual del item:", item)
              
              // Validar campos obligatorios antes de proceder
              const requiredFields = [
                { field: 'programa', label: 'Programa' },
                { field: 'objetivo', label: 'Objetivo' },
                { field: 'meta', label: 'Meta' },
                { field: 'presupuesto', label: 'Presupuesto' },
                { field: 'acciones', label: 'Acciones' },
                { field: 'indicadores', label: 'Indicadores' },
                { field: 'responsable', label: 'Responsable' },
                { field: 'fechaInicio', label: 'Fecha de Inicio' },
                { field: 'fechaFin', label: 'Fecha de Fin' }
              ]
              
              const missingFields = requiredFields.filter(({ field }) => {
                const value = item[field as keyof PlanAccionItem]
                return !value || (typeof value === 'string' && value.trim() === '')
              })
              
              if (missingFields.length > 0) {
                const missingFieldNames = missingFields.map(({ label }) => label).join(', ')
                toast({
                  title: "Campos obligatorios faltantes",
                  description: `Por favor complete los siguientes campos: ${missingFieldNames}`,
                  variant: "destructive"
                })
                return
              }
              
              // Validar fechas
              if (fechaInicioDate && fechaFinDate && fechaFinDate <= fechaInicioDate) {
                toast({
                  title: "Error en fechas",
                  description: "La fecha de fin debe ser posterior a la fecha de inicio",
                  variant: "destructive"
                })
                return
              }
              
              // Validar porcentaje de avance
              if (item.porcentajeAvance !== undefined && (item.porcentajeAvance < 0 || item.porcentajeAvance > 100)) {
                toast({
                  title: "Error en porcentaje",
                  description: "El porcentaje de avance debe estar entre 0 y 100",
                  variant: "destructive"
                })
                return
              }

              // Marcar como enviado para prevenir múltiples envíos
              setHasBeenSubmitted(true)

              // Crear una copia del item con todos los campos necesarios
              let finalFormData = {
                ...item,
                // Asegurar que los campos del Plan Decenal estén incluidos
                metaDecenal: item.metaDecenal || "",
                macroobjetivoDecenal: item.macroobjetivoDecenal || "",
                objetivoDecenal: item.objetivoDecenal || "",
                // Asegurar que los campos del PDM estén incluidos
                programaPDM: item.programaPDM || "",
                subprogramaPDM: item.subprogramaPDM || "",
                proyectoPDM: item.proyectoPDM || "",
                // Asegurar que los campos demográficos se incluyan correctamente
                grupoEtareo: item.grupoEtareo || "",
                grupoPoblacion: item.grupoPoblacion || "",
                zona: item.zona || "",
                grupoEtnico: item.grupoEtnico || "",
                cantidad: item.cantidad || ""
              }

              console.log("✅ Enviando datos directamente a onSubmit...")
              
              // Mostrar toast de éxito
              toast({
                title: "¡Guardado exitoso!",
                description: `El plan de acción ha sido ${mode === "edit" ? "actualizado" : "guardado"} correctamente`,
                variant: "default"
              })
              
              // Enviar los datos directamente
              onSubmit(finalFormData)
              
              // Cerrar el diálogo automáticamente después de guardar
              setTimeout(() => {
                onOpenChange(false)
              }, 1500) // Esperar 1.5 segundos para que el usuario vea el toast
            }}
            aria-label="Guardar elemento"
            disabled={isSubmitting || hasBeenSubmitted}
            type="button"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Guardando...
              </>
            ) : hasBeenSubmitted ? (
              <>
                <span className="mr-2">✅</span>
                {mode === "edit" ? "Actualizado" : "Guardado"}
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
