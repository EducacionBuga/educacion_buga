// Constantes para la lista de chequeo - Nueva estructura según plantilla Excel

import { TipoContrato, EtapaContrato, RespuestaItem } from './checklist-items'

// Exportar tipos y enums del archivo de items
export { TipoContrato, EtapaContrato, RespuestaItem }

// Tipos para la estructura de datos del frontend
export interface ChecklistItemResponse {
  id: string
  categoriaId: string
  itemId: string
  respuesta: RespuestaItem | null
  observaciones: string
}

export interface ChecklistFormData {
  areaId: string
  tipoContrato: TipoContrato
  items: ChecklistItemResponse[]
}

// Mapeo de códigos de área a sus nombres para la consulta
export const areaCodeToName: Record<string, string> = {
  "calidad-educativa": "CALIDAD_EDUCATIVA",
  "inspeccion-vigilancia": "INSPECCION_VIGILANCIA",
  "cobertura-infraestructura": "COBERTURA_INFRAESTRUCTURA",
  "talento-humano": "TALENTO_HUMANO",
  planeacion: "PLANEACION",
  despacho: "DESPACHO",
}

// Mapeo de tipos de contrato a hojas de Excel
export const tipoContratoToSheet: Record<TipoContrato, string> = {
  [TipoContrato.SAMC]: "SAMC",
  [TipoContrato.MINIMA_CUANTIA]: "MINIMA CUANTÍA",
  [TipoContrato.CONTRATO_INTERADMINISTRATIVO]: "CONTRATO INTERADMINISTRATIVO",
  [TipoContrato.PRESTACION_SERVICIOS]: "PRESTACIÓN DE SERVICIOS"
}

// Mapeo de respuestas a columnas de Excel
export const respuestaToColumn: Record<RespuestaItem, string> = {
  [RespuestaItem.CUMPLE]: "C",
  [RespuestaItem.NO_CUMPLE]: "D", 
  [RespuestaItem.NO_APLICA]: "E"
}

// Columna para observaciones
export const OBSERVACIONES_COLUMN = "J"

// Etiquetas de respuesta para el frontend
export const respuestaLabels: Record<RespuestaItem, string> = {
  [RespuestaItem.CUMPLE]: "Cumple",
  [RespuestaItem.NO_CUMPLE]: "No Cumple",
  [RespuestaItem.NO_APLICA]: "No Aplica"
}

// Colores para las respuestas
export const respuestaColors: Record<RespuestaItem, string> = {
  [RespuestaItem.CUMPLE]: "text-green-600",
  [RespuestaItem.NO_CUMPLE]: "text-red-600",
  [RespuestaItem.NO_APLICA]: "text-gray-500"
}

// Datos de ejemplo para desarrollo (se eliminará cuando se implemente la BD)
export const mockChecklistData = {
  categorias: [
    { id: "1", nombre: "SAMC", descripcion: "Subasta Abierta de Mayor Cuantía" },
    { id: "2", nombre: "MINIMA CUANTÍA", descripcion: "Contrato de Mínima Cuantía" },
    { id: "3", nombre: "CONTRATO INTERADMINISTRATIVO", descripcion: "Contrato Interadministrativo" },
    { id: "4", nombre: "PRESTACIÓN DE SERVICIOS", descripcion: "Prestación de Servicios" }
  ],
  etapas: [
    { id: "1", nombre: "PRECONTRACTUAL", descripcion: "Etapa precontractual" },
    { id: "2", nombre: "EJECUCION", descripcion: "Etapa de ejecución" },
    { id: "3", nombre: "CIERRE", descripcion: "Etapa de cierre" }
  ]
}
