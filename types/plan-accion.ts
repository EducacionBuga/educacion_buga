export interface PlanAccionItem {
  id?: string
  numero: string
  meta: string
  actividad: string
  proceso: string
  presupuestoDisponible: string
  presupuestoEjecutado: string
  porcentajeAvance: string
  recursosNecesarios: string
  indicador: string
  unidadMedida: string
  formula: string
  periodo: string
  fechaInicio: string
  fechaFin: string
  responsable: string
  estado: string
}

export interface DocumentoBase {
  id: string
  nombre: string
  fecha: string
  tipo: string
  tamaño: string
  estado: string
  url: string
}
