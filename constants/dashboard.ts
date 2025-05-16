import type { TimelineProject } from "@/components/dashboard/timeline-view"

// Variantes de animación
export const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

// Datos para la línea de tiempo en el dashboard (vacío)
export const mockProjectsData: TimelineProject[] = []
