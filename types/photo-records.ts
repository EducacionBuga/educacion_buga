export interface PhotoRecord {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  area: "calidad-educativa" | "inspeccion-vigilancia" | "cobertura-infraestructura" | "talento-humano"
  tags?: string[]
  thumbnail: string
  fullImage: string
}

export interface AreaOption {
  key: "calidad-educativa" | "inspeccion-vigilancia" | "cobertura-infraestructura" | "talento-humano"
  label: string
  color: string
}
