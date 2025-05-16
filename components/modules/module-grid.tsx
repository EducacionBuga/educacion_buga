"use client"

import type React from "react"
import { motion } from "framer-motion"
import { ModuleCard } from "./module-card"

// Modificar la interfaz ModuleItem para incluir propiedades relacionadas con el sistema de archivos
interface ModuleItem {
  title: string
  description?: string
  icon: React.ReactNode
  href: string
  color?: "blue" | "green" | "orange" | "purple" | "default"
  badge?: string
  isFileManager?: boolean
  fileTypes?: string[]
  maxFileSize?: number // en bytes
}

interface ModuleGridProps {
  modules: ModuleItem[]
  columns?: 1 | 2 | 3 | 4
  className?: string
  showOnlyFileManagers?: boolean // Nueva propiedad para filtrar solo los módulos de gestión de archivos
}

export function ModuleGrid({ modules, columns = 3, className = "", showOnlyFileManagers = false }: ModuleGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const getGridClass = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-1 sm:grid-cols-2"
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      case 4:
        return "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    }
  }

  // Cambiamos el valor predeterminado a false para mostrar todos los módulos
  // y asegurarnos de que "Lista de Chequeo" siempre aparezca
  const filteredModules = showOnlyFileManagers
    ? modules.filter(
        (module) =>
          module.title === "Informes de ejecución" ||
          module.title === "Registros fotográficos" ||
          module.title === "Plan de acción por área" ||
          module.title === "Proveedores" ||
          module.title === "Prestación de servicio" ||
          module.title === "Lista de Chequeo",
      )
    : modules

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid gap-3 sm:gap-4 md:gap-6 ${getGridClass()} ${className}`}
    >
      {filteredModules.map((module, index) => (
        <motion.div key={index} variants={item}>
          <ModuleCard
            title={module.title}
            description={
              module.description ||
              (module.title === "Informes de ejecución"
                ? "Sistema de archivos para gestión de informes"
                : module.title === "Registros fotográficos"
                  ? "Gestor de imágenes (máx. 2MB por archivo)"
                  : module.title === "Lista de Chequeo"
                    ? "Gestión documental contractual"
                    : module.description)
            }
            icon={module.icon}
            href={module.href}
            color={module.color}
            badge={
              module.badge ||
              (module.title === "Informes de ejecución" || module.title === "Registros fotográficos"
                ? "Gestor de archivos"
                : module.title === "Lista de Chequeo"
                  ? "Documental"
                  : module.badge)
            }
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
