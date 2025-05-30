// Mapeo de slugs a IDs reales de la base de datos
export const SLUG_TO_AREA_IDS = {
  "calidad-educativa": "e286546b-216c-49cd-9a96-42366c0977f2",
  "inspeccion-vigilancia": "502d6c5d-0a1e-43fa-85b7-ae91f774310d", 
  "cobertura-infraestructura": "2d8bf8a1-0557-4974-8212-a2f4a93a4fb2",
  "talento-humano": "15bb34b0-25eb-407f-9ce7-f781fcd04ecc",
  "despacho": "9850c4bd-119a-444d-831f-2f410bbbaf8b",
  "planeacion": "05f3dac0-933e-46f8-aa80-17c7c0a906c1",
  // Añade más mapeos según sea necesario
}

// Función de utilidad para obtener el ID de área a partir del slug
export function getAreaIdFromSlug(slug: string): string | null {
  const areaId = SLUG_TO_AREA_IDS[slug as keyof typeof SLUG_TO_AREA_IDS]
  if (!areaId) {
    console.error(`Area ID not found for slug: ${slug}`, { availableIds: Object.keys(SLUG_TO_AREA_IDS) })
  }
  return areaId || null
}

// Mapeo de slugs de área a IDs de área
export function getAreaIdMapping() {
  return {
    "calidad-educativa": "calidad-educativa",
    "inspeccion-vigilancia": "inspeccion-vigilancia",
    "cobertura-infraestructura": "cobertura-infraestructura",
    "talento-humano": "talento-humano",
    despacho: "despacho",
    planeacion: "planeacion",
  }
}

// Obtener todas las áreas disponibles
export function getAllAreas() {
  return Object.keys(getAreaIdMapping()).map((slug) => ({
    id: slug,
    slug: slug,
    name: formatAreaName(slug),
  }))
}

// Formatear el nombre del área para mostrar
export function formatAreaName(slug: string): string {
  const nameMap: Record<string, string> = {
    "calidad-educativa": "Calidad Educativa",
    "inspeccion-vigilancia": "Inspección y Vigilancia",
    "cobertura-infraestructura": "Cobertura e Infraestructura",
    "talento-humano": "Talento Humano",
    despacho: "Despacho",
    planeacion: "Planeación",
  }

  return (
    nameMap[slug] ||
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )
}

// Obtener un área por su slug
export function getAreaBySlug(slug: string) {
  const mapping = getAreaIdMapping()
  if (!mapping[slug]) return null

  return {
    id: slug,
    slug: slug,
    name: formatAreaName(slug),
  }
}

// Función para obtener la clase de color basada en el slug del área
export function getColorClass(areaSlug: string): string {
  const colorMap: Record<string, string> = {
    "calidad-educativa": "bg-blue-100 text-blue-800 border-blue-300",
    "inspeccion-vigilancia": "bg-green-100 text-green-800 border-green-300",
    "cobertura-infraestructura": "bg-purple-100 text-purple-800 border-purple-300",
    "talento-humano": "bg-orange-100 text-orange-800 border-orange-300",
    despacho: "bg-red-100 text-red-800 border-red-300",
    planeacion: "bg-teal-100 text-teal-800 border-teal-300",
  }

  return colorMap[areaSlug] || "bg-gray-100 text-gray-800 border-gray-300"
}
