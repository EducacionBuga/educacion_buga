// types/plan-accion.ts
export enum PlanAccionEstado {
  PENDIENTE = "Pendiente",
  EN_PROGRESO = "En Progreso",
  COMPLETADO = "Completado",
  RETRASADO = "Retrasado",
}

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
  responsable: string
  estado: string
  prioridad?: string
  comentarios?: string
  // Campos del Plan Decenal (OPCIONALES)
  metaDecenal?: string
  macroobjetivoDecenal?: string
  objetivoDecenal?: string
  // Campos del Plan de Desarrollo Municipal - PDM 2024-2027 (OPCIONALES)
  programaPDM?: string
  subprogramaPDM?: string
  proyectoPDM?: string
  // Campos de Información Demográfica (OPCIONALES)
  grupoEtareo?: string
  grupoPoblacion?: string
  zona?: string
  grupoEtnico?: string
  cantidad?: string
}

export interface PlanAccionFormErrors {
  [key: string]: string
}

export interface PlanAccionFormState {
  item: PlanAccionItem
  errors: PlanAccionFormErrors
  fechaInicioDate: Date | null
  fechaFinDate: Date | null
}

export type PlanAccionFormAction =
  | { type: "SET_FIELD"; field: keyof PlanAccionItem; value: any }
  | { type: "SET_DATE"; field: "fechaInicio" | "fechaFin"; date: Date | null }
  | {
      type: "SET_PLAN_DECENAL"
      payload: { metaDecenal: string; macroobjetivoDecenal: string; objetivoDecenal: string }
    }
  | {
      type: "SET_PLAN_PDM"
      payload: { programaPDM: string; subprogramaPDM: string; proyectoPDM: string }
    }
  | { type: "RESET" }
  | { type: "SET_ITEM"; payload: PlanAccionItem }
  | { type: "SET_ERRORS"; payload: PlanAccionFormErrors }
  | { type: "CLEAR_ERROR"; field: string }
