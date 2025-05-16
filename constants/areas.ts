export const AREAS = [
  {
    key: "calidad-educativa",
    label: "Calidad Educativa",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  {
    key: "inspeccion-vigilancia",
    label: "Inspección y Vigilancia",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    key: "cobertura-infraestructura",
    label: "Cobertura e Infraestructura",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  { key: "talento-humano", label: "Talento Humano", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
]

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]

export const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
