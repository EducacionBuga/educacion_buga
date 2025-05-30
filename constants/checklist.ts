// Constantes para la lista de chequeo

export enum Etapa {
  Precontractual = "Precontractual",
  Ejecucion = "Ejecución",
  Cierre = "Cierre",
  Todos = "todos",
}

export type AreaCode =
  | "calidad-educativa"
  | "inspeccion-vigilancia"
  | "cobertura-infraestructura"
  | "talento-humano"
  | "planeacion"
  | "despacho"

export interface AreaMap {
  [key: string]: string
}

// Mapeo de códigos de área a sus nombres para la consulta
export const areaCodeToName: AreaMap = {
  "calidad-educativa": "CALIDAD_EDUCATIVA",
  "inspeccion-vigilancia": "INSPECCION_VIGILANCIA",
  "cobertura-infraestructura": "COBERTURA_INFRAESTRUCTURA",
  "talento-humano": "TALENTO_HUMANO",
  planeacion: "PLANEACION",
  despacho: "DESPACHO",
}

// Mapear categorías a etapas
export const etapaMap = new Map([
  ["PRECONTRACTUAL", Etapa.Precontractual],
  ["EJECUCION", Etapa.Ejecucion],
  ["CIERRE", Etapa.Cierre],
])

// Datos iniciales para la lista de chequeo
export const initialChecklistItems = [
  // Etapa Precontractual
  {
    etapa: Etapa.Precontractual,
    documento: "Estudio de Necesidad",
    descripcion: "Documento técnico o jurídico que justifica la contratación.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Precontractual,
    documento: "Disponibilidad Presupuestal",
    descripcion: "Certificado de disponibilidad presupuestal (CDP) expedido por la entidad.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Precontractual,
    documento: "Pliegos de Condiciones",
    descripcion: "Elaboración de pliegos, términos de referencia o condiciones de participación.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Precontractual,
    documento: "Selección del Proceso de Contratación",
    descripcion:
      "Definición del tipo de proceso (licitación, selección abreviada, mínima cuantía, concurso de méritos, contratación directa).",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Precontractual,
    documento: "Análisis de Riesgos",
    descripcion: "Matriz de riesgos contractuales.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Precontractual,
    documento: "Estudio del Sector",
    descripcion: "Investigación de mercado o estudios de condiciones de mercado.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Precontractual,
    documento: "Verificación de Inhabilidades e Incompatibilidades",
    descripcion: "Confirmar que potenciales oferentes no estén incursos en causales de inhabilidad o incompatibilidad.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  // Etapa de Ejecución Contractual
  {
    etapa: Etapa.Ejecucion,
    documento: "Firma del Contrato",
    descripcion: "Formalización escrita del contrato (con cumplimiento de requisitos de perfeccionamiento).",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Ejecucion,
    documento: "Acta de Inicio",
    descripcion: "Firma de acta donde se estipula la fecha de inicio de las actividades.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Ejecucion,
    documento: "Designación de Supervisor o Interventor",
    descripcion: "Designación oficial del responsable del seguimiento del contrato.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Ejecucion,
    documento: "Plan de Trabajo o Cronograma",
    descripcion: "Aprobación del plan de ejecución del contrato.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Ejecucion,
    documento: "Informes de Supervisión/Interventoría",
    descripcion: "Elaboración de informes periódicos de seguimiento.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  // Etapa de Cierre de Contrato
  {
    etapa: Etapa.Cierre,
    documento: "Recepción Final de Bienes o Servicios",
    descripcion: "Comprobación del cumplimiento de todas las obligaciones.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Cierre,
    documento: "Acta de Terminación o Liquidación",
    descripcion: "Elaboración y firma del acta que formaliza la terminación o liquidación del contrato.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Cierre,
    documento: "Informe Final de Supervisión/Interventoría",
    descripcion: "Reporte técnico final de cumplimiento del contrato.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
  {
    etapa: Etapa.Cierre,
    documento: "Cierre Financiero",
    descripcion:
      "Verificación del uso de recursos, devolución de saldos, pago de saldos pendientes, sanciones o multas.",
    si: null,
    no: null,
    noAplica: null,
    observaciones: "",
  },
]
