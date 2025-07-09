// Estructura completa de ítems para las listas de chequeo según la plantilla Excel
// Basada en las 4 hojas: SAMC, MINIMA CUANTÍA, CONTRATO INTERADMINISTRATIVO, PRESTACIÓN DE SERVICIOS

export enum TipoContrato {
  SAMC = "SAMC",
  MINIMA_CUANTIA = "MINIMA CUANTÍA",
  CONTRATO_INTERADMINISTRATIVO = "CONTRATO INTERADMINISTRATIVO",
  PRESTACION_SERVICIOS = "PRESTACIÓN DE SERVICIOS"
}

export enum EtapaContrato {
  PRECONTRACTUAL = "PRECONTRACTUAL",
  CONTRACTUAL = "CONTRACTUAL",
  EJECUCION = "EJECUCION", 
  CIERRE = "CIERRE",
  ADICION = "ADICION"
}

export enum RespuestaItem {
  CUMPLE = "CUMPLE",
  NO_CUMPLE = "NO_CUMPLE",
  NO_APLICA = "NO_APLICA"
}

export interface ChecklistItemDefinition {
  id: number
  titulo: string
  descripcion: string
  etapa: EtapaContrato
  tipoContrato: TipoContrato[]
  observaciones?: string
}

// Definición de todos los ítems según la plantilla Excel
export const CHECKLIST_ITEMS: ChecklistItemDefinition[] = [
  // ITEMS PRECONTRACTUALES (aplicables a todos los tipos de contrato)
  {
    id: 1,
    titulo: "Estudio de Necesidad",
    descripcion: "Documento técnico o jurídico que justifica la contratación.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 2,
    titulo: "Análisis del Sector",
    descripcion: "Análisis de la situación del sector económico respectivo.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 3,
    titulo: "Estudios Técnicos",
    descripcion: "Estudios técnicos necesarios para la contratación.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 4,
    titulo: "Estudios de Mercado",
    descripcion: "Estudios de mercado que incluyen análisis de precios y proveedores.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 5,
    titulo: "Análisis de Riesgo",
    descripcion: "Análisis de riesgos asociados a la contratación.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 6,
    titulo: "Definición de Garantías",
    descripcion: "Definición de las garantías requeridas para la contratación.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 7,
    titulo: "Análisis Legal",
    descripcion: "Análisis legal de la contratación.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 8,
    titulo: "Pliego de Condiciones",
    descripcion: "Elaboración del pliego de condiciones.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 9,
    titulo: "Invitación a Presentar Ofertas",
    descripcion: "Invitación a presentar ofertas o cotizaciones.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 10,
    titulo: "Evaluación de Ofertas",
    descripcion: "Evaluación técnica y económica de las ofertas.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 11,
    titulo: "Adjudicación",
    descripcion: "Acto administrativo de adjudicación.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 12,
    titulo: "Registro Presupuestal",
    descripcion: "Expedición del certificado de registro presupuestal.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  
  // ITEMS EJECUCIÓN (aplicables a todos los tipos de contrato)
  {
    id: 13,
    titulo: "Suscripción del Contrato",
    descripcion: "Contrato debidamente suscrito por las partes.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 14,
    titulo: "Perfeccionamiento del Contrato",
    descripcion: "Acta de perfeccionamiento del contrato.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 15,
    titulo: "Designación del Supervisor",
    descripcion: "Designación del supervisor del contrato.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 16,
    titulo: "Acta de Inicio",
    descripcion: "Acta de inicio de la ejecución del contrato.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 17,
    titulo: "Seguimiento y Control",
    descripcion: "Informes de seguimiento y control de la ejecución.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 18,
    titulo: "Modificaciones Contractuales",
    descripcion: "Documentos relacionados con modificaciones contractuales.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 19,
    titulo: "Pagos y Facturas",
    descripcion: "Facturas y órdenes de pago.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 20,
    titulo: "Garantías",
    descripcion: "Garantías constituidas y vigentes.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },

  // ITEMS CIERRE (aplicables a todos los tipos de contrato)
  {
    id: 21,
    titulo: "Recibo Final",
    descripcion: "Acta de recibo final de obra, bien o servicio.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 22,
    titulo: "Liquidación",
    descripcion: "Acta de liquidación del contrato.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 23,
    titulo: "Paz y Salvo",
    descripcion: "Certificado de paz y salvo del contratista.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.CONTRATO_INTERADMINISTRATIVO, TipoContrato.PRESTACION_SERVICIOS]
  },
  // Específicos para CONTRATO INTERADMINISTRATIVO (solo hasta el item 29)
  {
    id: 24,
    titulo: "Convenio Marco",
    descripcion: "Convenio marco interadministrativo.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.CONTRATO_INTERADMINISTRATIVO]
  },
  {
    id: 25,
    titulo: "Autorizaciones",
    descripcion: "Autorizaciones necesarias para la contratación interadministrativa.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.CONTRATO_INTERADMINISTRATIVO]
  },
  {
    id: 26,
    titulo: "Competencia",
    descripcion: "Verificación de competencia de las entidades.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.CONTRATO_INTERADMINISTRATIVO]
  },
  {
    id: 27,
    titulo: "Plan de Trabajo",
    descripcion: "Plan de trabajo conjunto.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.CONTRATO_INTERADMINISTRATIVO]
  },
  {
    id: 28,
    titulo: "Coordinación",
    descripcion: "Mecanismos de coordinación entre entidades.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.CONTRATO_INTERADMINISTRATIVO]
  },
  {
    id: 29,
    titulo: "Evaluación Final",
    descripcion: "Evaluación final del convenio.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.CONTRATO_INTERADMINISTRATIVO]
  },
  
  // Items adicionales para otros tipos de contrato hasta el 51
  {
    id: 30,
    titulo: "Análisis de Capacidad",
    descripcion: "Análisis de capacidad técnica y financiera.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 31,
    titulo: "Cronograma",
    descripcion: "Cronograma de ejecución del contrato.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 32,
    titulo: "Entregables",
    descripcion: "Verificación de entregables del contrato.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 33,
    titulo: "Control de Calidad",
    descripcion: "Control de calidad de los productos o servicios.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 34,
    titulo: "Capacitación",
    descripcion: "Capacitación del personal involucrado.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 35,
    titulo: "Manuales",
    descripcion: "Manuales técnicos y de usuario.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 36,
    titulo: "Soporte Técnico",
    descripcion: "Soporte técnico especializado.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 37,
    titulo: "Pruebas",
    descripcion: "Pruebas de funcionamiento y aceptación.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 38,
    titulo: "Mantenimiento",
    descripcion: "Plan de mantenimiento preventivo y correctivo.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 39,
    titulo: "Documentación Final",
    descripcion: "Documentación final del proyecto.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 40,
    titulo: "Transferencia",
    descripcion: "Transferencia de conocimiento y tecnología.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 41,
    titulo: "Garantía de Calidad",
    descripcion: "Garantía de calidad del producto o servicio.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 42,
    titulo: "Evaluación de Desempeño",
    descripcion: "Evaluación del desempeño del contratista.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 43,
    titulo: "Cierre Financiero",
    descripcion: "Cierre financiero del contrato.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 44,
    titulo: "Archivo",
    descripcion: "Archivo completo del expediente contractual.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 45,
    titulo: "Publicación SECOP",
    descripcion: "Publicación en el Sistema Electrónico de Contratación Pública.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 46,
    titulo: "Certificaciones",
    descripcion: "Certificaciones técnicas requeridas.",
    etapa: EtapaContrato.PRECONTRACTUAL,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 47,
    titulo: "Seguros",
    descripcion: "Pólizas de seguros requeridas.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 48,
    titulo: "Interventoría",
    descripcion: "Informes de interventoría externa.",
    etapa: EtapaContrato.EJECUCION,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 49,
    titulo: "Auditoría",
    descripcion: "Auditoría técnica y financiera.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 50,
    titulo: "Lecciones Aprendidas",
    descripcion: "Documento de lecciones aprendidas.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  },
  {
    id: 51,
    titulo: "Cierre Administrativo",
    descripcion: "Cierre administrativo completo del contrato.",
    etapa: EtapaContrato.CIERRE,
    tipoContrato: [TipoContrato.SAMC, TipoContrato.MINIMA_CUANTIA, TipoContrato.PRESTACION_SERVICIOS]
  }
]

// Función para obtener items por tipo de contrato
export const getItemsByTipoContrato = (tipoContrato: TipoContrato): ChecklistItemDefinition[] => {
  return CHECKLIST_ITEMS.filter(item => item.tipoContrato.includes(tipoContrato))
}

// Función para obtener items por etapa y tipo de contrato
export const getItemsByEtapaAndTipo = (etapa: EtapaContrato, tipoContrato: TipoContrato): ChecklistItemDefinition[] => {
  return CHECKLIST_ITEMS.filter(item => 
    item.etapa === etapa && item.tipoContrato.includes(tipoContrato)
  )
}

// Mapeo de tipos de contrato a números para la exportación
export const TIPO_CONTRATO_TO_NUMBER: Record<TipoContrato, number> = {
  [TipoContrato.SAMC]: 1,
  [TipoContrato.MINIMA_CUANTIA]: 2,
  [TipoContrato.CONTRATO_INTERADMINISTRATIVO]: 3,
  [TipoContrato.PRESTACION_SERVICIOS]: 4
}

// Mapeo inverso
export const NUMBER_TO_TIPO_CONTRATO: Record<number, TipoContrato> = {
  1: TipoContrato.SAMC,
  2: TipoContrato.MINIMA_CUANTIA,
  3: TipoContrato.CONTRATO_INTERADMINISTRATIVO,
  4: TipoContrato.PRESTACION_SERVICIOS
}
