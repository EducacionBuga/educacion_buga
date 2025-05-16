// Definir la interfaz para los informes
export interface Report {
  id: string
  file: File
  name: string
  area: string
  areaLabel: string
  date: string
  type: string
}

// Definir la interfaz para las áreas
export interface AreaOption {
  key: string
  label: string
  color: string
}
