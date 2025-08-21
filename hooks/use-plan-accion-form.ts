"use client"

// hooks/use-plan-accion-form.ts
import { useReducer, useCallback } from "react"
import { format } from "date-fns"
import {
  PlanAccionEstado,
  type PlanAccionFormAction,
  type PlanAccionFormErrors,
  type PlanAccionFormState,
  type PlanAccionItem,
} from "@/types/plan-accion"

// Expresión regular para validar formato de presupuesto
const PRESUPUESTO_REGEX = /^\$?[\d,.]+$/

// Estado inicial del formulario
const initialState: PlanAccionFormState = {
  item: {
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
    estado: PlanAccionEstado.PENDIENTE,
    responsable: "",
    // Agregar campos del Plan Decenal
    metaDecenal: "",
    macroobjetivoDecenal: "",
    objetivoDecenal: "",
    // Agregar campos del PDM
    programaPDM: "",
    subprogramaPDM: "",
    proyectoPDM: "",
    // Agregar campos de Información Demográfica
    grupoEtareo: "",
    grupoPoblacion: "",
    zona: "",
    grupoEtnico: "",
    cantidad: "",
  },
  errors: {},
  fechaInicioDate: null,
  fechaFinDate: null,
}

// Reducer para manejar el estado del formulario
function formReducer(state: PlanAccionFormState, action: PlanAccionFormAction): PlanAccionFormState {
  switch (action.type) {
    case "SET_FIELD":
      console.log(`📝 REDUCER SET_FIELD - Campo: ${action.field}, Valor:`, action.value)
      const newState = {
        ...state,
        item: {
          ...state.item,
          [action.field]: action.value,
        },
      }
      console.log(`📋 REDUCER - Estado actualizado del item:`, newState.item)
      return newState
    case "SET_DATE":
      if (action.field === "fechaInicio") {
        return {
          ...state,
          fechaInicioDate: action.date,
          item: {
            ...state.item,
            fechaInicio: action.date ? format(action.date, "dd/MM/yyyy") : "",
          },
        }
      } else if (action.field === "fechaFin") {
        return {
          ...state,
          fechaFinDate: action.date,
          item: {
            ...state.item,
            fechaFin: action.date ? format(action.date, "dd/MM/yyyy") : "",
          },
        }
      }
      return state
    case "SET_PLAN_DECENAL":
      console.log("Actualizando campos del Plan Decenal:", action.payload)
      return {
        ...state,
        item: {
          ...state.item,
          metaDecenal: action.payload.metaDecenal || "",
          macroobjetivoDecenal: action.payload.macroobjetivoDecenal || "",
          objetivoDecenal: action.payload.objetivoDecenal || "",
        },
      }
    case "SET_PLAN_PDM":
      console.log("Actualizando campos del PDM 2024-2027:", action.payload)
      return {
        ...state,
        item: {
          ...state.item,
          programaPDM: action.payload.programaPDM || "",
          subprogramaPDM: action.payload.subprogramaPDM || "",
          proyectoPDM: action.payload.proyectoPDM || "",
        },
      }
    case "RESET":
      return initialState
    case "SET_ITEM":
      const item = action.payload
      
      // Función auxiliar para parsear fechas en formato dd/MM/yyyy
      const parseDate = (dateString: string): Date | null => {
        if (!dateString) return null
        
        try {
          // Si ya está en formato ISO, usar directamente
          if (dateString.includes('T')) {
            return new Date(dateString)
          }
          
          // Si está en formato dd/MM/yyyy, convertir
          const parts = dateString.split('/')
          if (parts.length === 3) {
            const [day, month, year] = parts.map(Number)
            const date = new Date(year, month - 1, day)
            return isNaN(date.getTime()) ? null : date
          }
          
          return null
        } catch (error) {
          console.error('Error parsing date:', dateString, error)
          return null
        }
      }
      
      return {
        ...state,
        item: { ...item },
        fechaInicioDate: parseDate(item.fechaInicio),
        fechaFinDate: parseDate(item.fechaFin),
        errors: {},
      }
    case "SET_ERRORS":
      return {
        ...state,
        errors: action.payload,
      }
    case "CLEAR_ERROR":
      const { [action.field]: _, ...restErrors } = state.errors
      return {
        ...state,
        errors: restErrors,
      }
    default:
      return state
  }
}

/**
 * Hook personalizado para manejar el formulario de Plan de Acción
 * @param onSubmit Función a ejecutar cuando el formulario es válido y se envía
 */
export function usePlanAccionForm(onSubmit: (item: PlanAccionItem) => void) {
  const [state, dispatch] = useReducer(formReducer, initialState)

  // Función para actualizar un campo del formulario
  const updateField = useCallback(
    (field: keyof PlanAccionItem, value: any) => {
      console.log(`🔄 UPDATEFIELD - Campo: ${field}, Valor:`, value)
      dispatch({ type: "SET_FIELD", field, value })

      // Limpiar error si el campo tiene valor
      if (state.errors[field] && value) {
        dispatch({ type: "CLEAR_ERROR", field })
      }
    },
    [state.errors],
  )

  // Función para actualizar los campos del Plan Decenal
  const updatePlanDecenal = useCallback(
    (metaDecenal: string, macroobjetivoDecenal: string, objetivoDecenal: string) => {
      dispatch({
        type: "SET_PLAN_DECENAL",
        payload: {
          metaDecenal,
          macroobjetivoDecenal,
          objetivoDecenal,
        },
      })
    },
    [],
  )

  // Función para actualizar los campos del PDM 2024-2027
  const updatePlanPDM = useCallback(
    (programaPDM: string, subprogramaPDM: string, proyectoPDM: string) => {
      dispatch({
        type: "SET_PLAN_PDM",
        payload: {
          programaPDM,
          subprogramaPDM,
          proyectoPDM,
        },
      })
    },
    [],
  )

  // Función para establecer la fecha de inicio
  const setFechaInicioDate = useCallback(
    (date: Date | null) => {
      dispatch({ type: "SET_DATE", field: "fechaInicio", date })

      // Limpiar error si hay fecha
      if (date && state.errors.fechaInicio) {
        dispatch({ type: "CLEAR_ERROR", field: "fechaInicio" })
      }
    },
    [state.errors.fechaInicio],
  )

  // Función para establecer la fecha de fin
  const setFechaFinDate = useCallback(
    (date: Date | null) => {
      dispatch({ type: "SET_DATE", field: "fechaFin", date })

      // Limpiar error si hay fecha
      if (date && state.errors.fechaFin) {
        dispatch({ type: "CLEAR_ERROR", field: "fechaFin" })
      }
    },
    [state.errors.fechaFin],
  )

  // Función para validar el formulario
  const validateForm = useCallback((): boolean => {
    const errors: PlanAccionFormErrors = {}
    const { item } = state

    // Validar campos obligatorios
    if (!item.programa || item.programa.trim() === "") {
      errors.programa = "El programa es obligatorio"
    }

    if (!item.objetivo || item.objetivo.trim() === "") {
      errors.objetivo = "El objetivo es obligatorio"
    }

    if (!item.meta || item.meta.trim() === "") {
      errors.meta = "La meta es obligatoria"
    }

    // Validar presupuesto (debe tener formato de moneda)
    if (!item.presupuesto || item.presupuesto.trim() === "") {
      errors.presupuesto = "El presupuesto es obligatorio"
    } else if (!PRESUPUESTO_REGEX.test(item.presupuesto)) {
      errors.presupuesto = "Formato inválido. Ejemplo: $100,000,000"
    }

    // Validar acciones
    if (!item.acciones || item.acciones.trim() === "") {
      errors.acciones = "Las acciones son obligatorias"
    }

    // Validar indicadores
    if (!item.indicadores || item.indicadores.trim() === "") {
      errors.indicadores = "Los indicadores son obligatorios"
    }

    // Validar responsable
    if (!item.responsable || item.responsable.trim() === "") {
      errors.responsable = "El responsable es obligatorio"
    }

    // Validar porcentaje de avance
    if (item.porcentajeAvance === undefined || item.porcentajeAvance < 0 || item.porcentajeAvance > 100) {
      errors.porcentajeAvance = "El porcentaje debe estar entre 0 y 100"
    }

    // Validar fechas
    if (!item.fechaInicio) {
      errors.fechaInicio = "La fecha de inicio es obligatoria"
    }

    if (!item.fechaFin) {
      errors.fechaFin = "La fecha de fin es obligatoria"
    }

    // Validar que la fecha fin sea posterior a la fecha inicio
    if (item.fechaInicio && item.fechaFin && state.fechaInicioDate && state.fechaFinDate) {
      if (state.fechaFinDate < state.fechaInicioDate) {
        errors.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio"
      }
    }

    // Plan Decenal y PDM son completamente opcionales - no se validan como obligatorios

    dispatch({ type: "SET_ERRORS", payload: errors })
    return Object.keys(errors).length === 0
  }, [state])

  // Función para generar mensaje de campos faltantes
  const getValidationMessage = useCallback((errors: PlanAccionFormErrors) => {
    const missingFields = []
    
    if (errors.programa) missingFields.push("Programa")
    if (errors.objetivo) missingFields.push("Objetivo")
    if (errors.meta) missingFields.push("Meta")
    if (errors.presupuesto) missingFields.push("Presupuesto")
    if (errors.acciones) missingFields.push("Acciones")
    if (errors.indicadores) missingFields.push("Indicadores")
    if (errors.responsable) missingFields.push("Responsable")
    if (errors.fechaInicio) missingFields.push("Fecha de Inicio")
    if (errors.fechaFin) missingFields.push("Fecha de Fin")
    if (errors.porcentajeAvance) missingFields.push("Porcentaje de Avance")
    
    if (missingFields.length > 0) {
      return `Por favor complete los siguientes campos obligatorios: ${missingFields.join(", ")}`
    }
    
    return "Por favor revise los campos marcados en rojo"
  }, [])

  // Función para manejar el envío del formulario
  const handleSubmit = useCallback(() => {
    console.log("🚀 HANDLESUBMIT - Estado del formulario antes de validar:", state.item)
    console.log("🔍 VERIFICANDO CAMPOS DEL PLAN DECENAL EN HANDLESUBMIT:")
    console.log("metaDecenal:", state.item.metaDecenal)
    console.log("macroobjetivoDecenal:", state.item.macroobjetivoDecenal)
    console.log("objetivoDecenal:", state.item.objetivoDecenal)
    console.log("🏛️ VERIFICANDO CAMPOS DEL PDM 2024-2027 EN HANDLESUBMIT:")
    console.log("programaPDM:", state.item.programaPDM)
    console.log("subprogramaPDM:", state.item.subprogramaPDM)
    console.log("proyectoPDM:", state.item.proyectoPDM)
    console.log("📊 VERIFICANDO CAMPOS DEMOGRÁFICOS EN HANDLESUBMIT:")
    console.log("grupoEtareo:", state.item.grupoEtareo)
    console.log("grupoPoblacion:", state.item.grupoPoblacion)
    console.log("zona:", state.item.zona)
    console.log("grupoEtnico:", state.item.grupoEtnico)
    console.log("cantidad:", state.item.cantidad)
    
    if (validateForm()) {
      console.log("✅ Formulario válido, enviando datos:", state.item)
      onSubmit(state.item)
      dispatch({ type: "RESET" })
    } else {
      console.log("❌ Formulario inválido, errores:", state.errors)
      const message = getValidationMessage(state.errors)
      alert(message)
    }
  }, [validateForm, state.item, state.errors, onSubmit, getValidationMessage])

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  // Función para establecer un item para edición
  const setItem = useCallback((item: PlanAccionItem) => {
    dispatch({ type: "SET_ITEM", payload: item })
  }, [])

  return {
    item: state.item,
    errors: state.errors,
    fechaInicioDate: state.fechaInicioDate,
    fechaFinDate: state.fechaFinDate,
    updateField,
    updatePlanDecenal,
    updatePlanPDM,
    setFechaInicioDate,
    setFechaFinDate,
    validateForm,
    handleSubmit,
    resetForm,
    setItem,
  }
}
