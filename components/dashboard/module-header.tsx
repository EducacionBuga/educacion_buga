"use client"
import { Button } from "@/components/ui/button"
import { Download, Upload, Filter } from "lucide-react"
import { motion } from "framer-motion"

interface ModuleHeaderProps {
  title: string
  description?: string
  searchTerm?: string
  onSearch?: (value: string) => void
  showExport?: boolean
  showImport?: boolean
  showFilter?: boolean
  onExport?: () => void
  onImport?: () => void
  onFilter?: () => void
}

export function ModuleHeader({
  title,
  description,
  searchTerm = "",
  onSearch,
  showExport = false,
  showImport = false,
  showFilter = false,
  onExport,
  onImport,
  onFilter,
}: ModuleHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 w-full relative z-10">
      <div className="flex flex-col space-y-1 w-full">
        <motion.h1
          className="text-2xl font-bold tracking-tight w-full overflow-visible text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {description}
          </motion.p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {showFilter && (
            <Button variant="outline" size="sm" onClick={onFilter} className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          )}
          {showExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
          {showImport && (
            <Button variant="outline" size="sm" onClick={onImport} className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
