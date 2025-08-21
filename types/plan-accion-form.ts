// Tipos explícitos para el formulario de Plan de Acción

// Enums para catálogos
export enum GrupoEtareo {
  CERO_CINCO = "0-5",
  SEIS_DIEZ = "6-10",
  ONCE_QUINCE = "11-15",
  DIECISEIS_VEINTE = "16-20",
  VEINTIUNO_VEINTICINCO = "21-25",
  VEINTISEIS_TREINTA = "26-30",
  TREINTA_UNO_TREINTA_CINCO = "31-35",
  TREINTA_SEIS_CUARENTA = "36-40",
  CUARENTA_UNO_CUARENTA_CINCO = "41-45",
  CUARENTA_SEIS_CINCUENTA = "46-50",
  MAS_CINCUENTA = "50+"
}

export enum GrupoPoblacion {
  VICTIMA_CONFLICTO = "victima-conflicto",
  NEGRO_MULATO_AFRO = "negro-mulato-afro",
  DESPLAZADO = "desplazado",
  INDIGENA = "indigena",
  GITANO_ROM = "gitano-rom",
  RAIZAL = "raizal",
  PALENQUERO = "palenquero",
  LGTBIQ = "lgtbiq",
  NINGUNA = "ninguna"
}

export enum Zona {
  URBANA = "urbana",
  RURAL = "rural"
}

export enum GrupoEtnico {
  NA = "na",
  PUEBLO_INDIGENA = "pueblo-indigena",
  COMUNIDAD_NEGRA = "comunidad-negra",
  ROM_GITANO = "rom-gitano",
  NO_PERTENECE = "no-pertenece",
  RAIZAL = "raizal",
  AFROCOLOMBIANO = "afrocolombiano",
  PALENQUERO = "palenquero",
  MESTIZO = "mestizo",
  MULATO = "mulato",
  BLANCO = "blanco",
  OTRO = "otro",
  NO_INFORMA = "no-informa"
}

export enum FormSection {
  BASICA = "basica",
  DEMOGRAFICA = "demografica",
  ESPECIFICA = "especifica",
  DECENAL = "decenal",
  PDM = "pdm"
}

// Interfaces para entidades
export interface Programa {
  id: string;
  nombre: string;
}

export interface Meta {
  id: string;
  programaId: string;
  nombre: string;
}

export interface PlanDecenal {
  id: string;
  nombre: string;
  macroobjetivos: Macroobjetivo[];
}

export interface Macroobjetivo {
  id: string;
  planId: string;
  nombre: string;
  objetivos: string[];
}

export interface ProgramaPDM {
  id: string;
  nombre: string;
  subprogramas: SubprogramaPDM[];
}

export interface SubprogramaPDM {
  id: string;
  programaId: string;
  nombre: string;
  proyectos: string[];
}

// Estados de secciones colapsables
export interface SectionsState {
  [FormSection.BASICA]: boolean;
  [FormSection.DEMOGRAFICA]: boolean;
  [FormSection.ESPECIFICA]: boolean;
  [FormSection.DECENAL]: boolean;
  [FormSection.PDM]: boolean;
}

// Props para componentes de sección
export interface BaseSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isValid?: boolean;
}

export interface FieldErrorProps {
  error?: string;
  className?: string;
}

// Props para selectores especializados
export interface PlanDecenalSelectorProps {
  incluir: boolean;
  onIncluirChange: (incluir: boolean) => void;
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
  selectedMacroobjetivo: string;
  onMacroobjetivoChange: (macro: string) => void;
  selectedObjetivo: string;
  onObjetivoChange: (objetivo: string) => void;
  planesDecenales: PlanDecenal[];
  macroobjetivos: Macroobjetivo[];
  objetivos: string[];
  disabled?: boolean;
}

export interface PDMSelectorProps {
  incluir: boolean;
  onIncluirChange: (incluir: boolean) => void;
  selectedPrograma: string;
  onProgramaChange: (programa: string) => void;
  selectedSubprograma: string;
  onSubprogramaChange: (subprograma: string) => void;
  selectedProyecto: string;
  onProyectoChange: (proyecto: string) => void;
  programasPDM: ProgramaPDM[];
  subprogramas: SubprogramaPDM[];
  proyectos: string[];
  disabled?: boolean;
  onDownload?: () => void;
}

// Mappers para normalización de datos
export interface ProgramasMetasNormalized {
  programas: {
    byId: Record<string, Programa>;
    allIds: string[];
  };
  metas: {
    byId: Record<string, Meta>;
    allIds: string[];
    byProgramaId: Record<string, string[]>;
  };
}

// Constantes para labels de UI
export const GRUPO_ETAREO_LABELS: Record<GrupoEtareo, string> = {
  [GrupoEtareo.CERO_CINCO]: "0 a 5 años",
  [GrupoEtareo.SEIS_DIEZ]: "6 a 10 años",
  [GrupoEtareo.ONCE_QUINCE]: "11 a 15 años",
  [GrupoEtareo.DIECISEIS_VEINTE]: "16 a 20 años",
  [GrupoEtareo.VEINTIUNO_VEINTICINCO]: "21 a 25 años",
  [GrupoEtareo.VEINTISEIS_TREINTA]: "26 a 30 años",
  [GrupoEtareo.TREINTA_UNO_TREINTA_CINCO]: "31 a 35 años",
  [GrupoEtareo.TREINTA_SEIS_CUARENTA]: "36 a 40 años",
  [GrupoEtareo.CUARENTA_UNO_CUARENTA_CINCO]: "41 a 45 años",
  [GrupoEtareo.CUARENTA_SEIS_CINCUENTA]: "46 a 50 años",
  [GrupoEtareo.MAS_CINCUENTA]: "+ de 50 años"
};

export const GRUPO_POBLACION_LABELS: Record<GrupoPoblacion, string> = {
  [GrupoPoblacion.VICTIMA_CONFLICTO]: "Víctima del conflicto armado",
  [GrupoPoblacion.NEGRO_MULATO_AFRO]: "Negro/a, mulato/a, Afrodescendiente, afrocolombiano(a)",
  [GrupoPoblacion.DESPLAZADO]: "Desplazado",
  [GrupoPoblacion.INDIGENA]: "Población Indígena",
  [GrupoPoblacion.GITANO_ROM]: "Gitano /Room",
  [GrupoPoblacion.RAIZAL]: "Raizal",
  [GrupoPoblacion.PALENQUERO]: "Palenquero",
  [GrupoPoblacion.LGTBIQ]: "LGTBIQ",
  [GrupoPoblacion.NINGUNA]: "Ninguna de las anteriores"
};

export const ZONA_LABELS: Record<Zona, string> = {
  [Zona.URBANA]: "Urbana",
  [Zona.RURAL]: "Rural"
};

export const GRUPO_ETNICO_LABELS: Record<GrupoEtnico, string> = {
  [GrupoEtnico.NA]: "N/A (No aplica)",
  [GrupoEtnico.PUEBLO_INDIGENA]: "Pueblo indígena",
  [GrupoEtnico.COMUNIDAD_NEGRA]: "Comunidad negra",
  [GrupoEtnico.ROM_GITANO]: "Rom (gitano)",
  [GrupoEtnico.NO_PERTENECE]: "No pertenece",
  [GrupoEtnico.RAIZAL]: "Raizal del Archipiélago de San Andrés, Providencia y Santa Catalina",
  [GrupoEtnico.AFROCOLOMBIANO]: "Afrocolombiano",
  [GrupoEtnico.PALENQUERO]: "Palenquero de San Basilio",
  [GrupoEtnico.MESTIZO]: "Mestizo(a)",
  [GrupoEtnico.MULATO]: "Mulato(a)",
  [GrupoEtnico.BLANCO]: "Blanco(a)",
  [GrupoEtnico.OTRO]: "Otro",
  [GrupoEtnico.NO_INFORMA]: "No informa"
};