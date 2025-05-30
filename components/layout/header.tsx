"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { motion } from "framer-motion"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  // No mostrar el header en la página principal del dashboard
  if (pathname === "/dashboard") {
    return null
  }

  // Obtener el título de la página basado en la ruta
  const getPageTitle = () => {
    if (pathname === "/dashboard/home") return "Inicio"
    if (pathname.startsWith("/dashboard/despacho")) return "Despacho"
    if (pathname.startsWith("/dashboard/planeacion")) return "Planeación"
    if (pathname.startsWith("/dashboard/calidad-educativa")) return "Calidad Educativa"
    if (pathname.startsWith("/dashboard/inspeccion-vigilancia")) return "Inspección y Vigilancia"
    if (pathname.startsWith("/dashboard/cobertura-infraestructura")) return "Cobertura e Infraestructura"
    if (pathname.startsWith("/dashboard/talento-humano")) return "Talento Humano"
    return "Dashboard"
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-gray-800"
        >
          <Home className="h-5 w-5" />
          <span className="sr-only">Inicio</span>
        </Button>

        <motion.h1
          className="text-lg sm:text-xl font-semibold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getPageTitle()}
        </motion.h1>
      </div>

      <div></div>
    </header>
  )
}
