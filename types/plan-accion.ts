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
  // Campos del Plan Decenal
  metaDecenal: string
  macroobjetivoDecenal: string
  objetivoDecenal: string
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
  | { type: "RESET" }
  | { type: "SET_ERRORS"; payload: PlanAccionFormErrors }
  | { type: "CLEAR_ERROR"; field: string }
