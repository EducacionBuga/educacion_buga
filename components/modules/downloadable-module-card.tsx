"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface DownloadableModuleCardProps {
  title: string
  description?: string
  icon: React.ReactNode
  downloadUrl: string
  fileName: string
  color?: "blue" | "green" | "orange" | "purple" | "default"
  badge?: string
  className?: string
}

export function DownloadableModuleCard({ 
  title, 
  description, 
  icon, 
  downloadUrl, 
  fileName,
  color = "default", 
  badge, 
  className 
}: DownloadableModuleCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "green":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "orange":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "purple":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error('Documento no encontrado')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Descargando ${fileName}`)
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Error al descargar el documento')
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={cn(
        "h-full rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 cursor-pointer",
        className,
      )}
      onClick={handleDownload}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between pb-2">
          <div className={`rounded-lg p-2 sm:p-3 ${getColorClasses()}`}>
            {icon}
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant="outline" className={getColorClasses()}>
                {badge}
              </Badge>
            )}
            <div className={`rounded-lg p-1 ${getColorClasses()}`}>
              <Download className="h-3 w-3" />
            </div>
          </div>
        </div>
        <div className="pt-0">
          <h3 className="text-base sm:text-lg md:text-xl mb-1 font-semibold truncate">{title}</h3>
          {description && <p className="text-xs sm:text-sm text-muted-foreground truncate-2">{description}</p>}
        </div>
      </div>
    </motion.div>
  )
}
