"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Headphones, ClipboardList, BookOpen, Eye, Monitor, Users } from "lucide-react"
import { motion } from "framer-motion"
import { ParticlesBackground } from "@/components/ui/particles-background"

interface NavModuleProps {
  href: string
  icon: React.ReactNode
  title: string
}

function formatTitle(title: string): React.ReactNode {
  if (title === "INSPECCIÓN Y VIGILANCIA") {
    return (
      <>
        INSPECCIÓN
        <br />Y VIGILANCIA
      </>
    )
  } else if (title === "COBERTURA E INFRAESTRUCTURA") {
    return (
      <>
        COBERTURA E<br />
        INFRAESTRUCTURA
      </>
    )
  } else if (title === "CALIDAD EDUCATIVA") {
    return (
      <>
        CALIDAD
        <br />
        EDUCATIVA
      </>
    )
  }
  return title
}

function Dashboard({ href, icon, title }: NavModuleProps) {
  return (
    <Link href={href} className="w-full md:flex-1 md:min-w-[100px] md:max-w-[180px]">
      <motion.div
        className="flex flex-col items-center justify-center p-3 mx-2 my-2 md:my-0 cursor-pointer h-full rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/30 group"
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 15px rgba(249, 115, 22, 0.4)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{
          duration: 0.1,
          type: "spring",
          stiffness: 700,
          damping: 15,
        }}
      >
        <div className="w-16 h-16 flex items-center justify-center mb-2 text-orange-500 relative overflow-hidden group-hover:text-orange-600 transition-all duration-100">
          <motion.div
            className="absolute inset-0 bg-orange-100 dark:bg-orange-900/20 rounded-full opacity-0 group-hover:opacity-100"
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          />
          <motion.div
            className="relative z-10"
            whileHover={{
              scale: 1.15,
              rotate: [0, -3, 3, 0],
              transition: {
                rotate: { duration: 0.2 },
                scale: { duration: 0.1 },
              },
            }}
          >
            {icon}
          </motion.div>
        </div>
        <span className="font-poppins text-sm font-medium tracking-wide uppercase text-center group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-all duration-100">
          {formatTitle(title)}
        </span>
      </motion.div>
    </Link>
  )
}

export default function Page() {
  const { user } = useAuth()
  const role = user?.role || ""

  // Información de depuración
  console.log("Estado de autenticación:", {
    usuario: user,
    rol: role,
    email: user?.email,
    nombre: user?.name,
    id: user?.id,
  })

  // Determinar qué módulos mostrar según el rol
  // Modificamos para que sea insensible a mayúsculas/minúsculas
  const normalizedRole = role.toUpperCase()
  const showDespacho = normalizedRole === "ADMIN" || normalizedRole === "DESPACHO"
  const showPlaneacion = normalizedRole === "ADMIN" || normalizedRole === "PLANEACION"
  const showCalidadEducativa = normalizedRole === "ADMIN" || normalizedRole === "CALIDAD_EDUCATIVA"
  const showInspeccionVigilancia = normalizedRole === "ADMIN" || normalizedRole === "INSPECCION_VIGILANCIA"
  const showCoberturaInfraestructura = normalizedRole === "ADMIN" || normalizedRole === "COBERTURA_INFRAESTRUCTURA"
  const showTalentoHumano = normalizedRole === "ADMIN" || normalizedRole === "TALENTO_HUMANO"

  // Información de depuración sobre los módulos
  console.log("Rol normalizado:", normalizedRole)
  console.log("Visibilidad de módulos:", {
    showDespacho,
    showPlaneacion,
    showCalidadEducativa,
    showInspeccionVigilancia,
    showCoberturaInfraestructura,
    showTalentoHumano,
  })

  // Mostrar información de depuración en la interfaz
  const showDebugInfo = false // No mostrar información de depuración

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <ParticlesBackground />

      <motion.div
        className="w-full max-w-md mb-8 -mt-12 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center">
          <Image
            src="/images/logo-educacion.png"
            alt="Logo Alcaldía de Guadalajara de Buga - Secretaría de Educación"
            width={300}
            height={200}
            priority
            className="w-auto h-auto"
          />
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col md:flex-row justify-between items-center overflow-y-auto md:overflow-x-auto py-6 px-4 w-full max-w-7xl mx-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-md gap-4 md:gap-2 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Si no hay módulos visibles, mostrar mensaje */}
        {!showDespacho &&
          !showPlaneacion &&
          !showCalidadEducativa &&
          !showInspeccionVigilancia &&
          !showCoberturaInfraestructura &&
          !showTalentoHumano && (
            <div className="w-full text-center p-4">
              <p className="text-red-500 font-medium">
                No tienes acceso a ningún módulo. Verifica que tu usuario tenga un rol asignado correctamente.
              </p>
              <p className="text-sm mt-2">Rol actual: {role || "No asignado"}</p>
              <p className="text-sm mt-2">Rol normalizado: {normalizedRole || "No asignado"}</p>
              <p className="text-sm mt-2">
                Nota: El rol en la base de datos debe ser uno de los siguientes: ADMIN, DESPACHO, PLANEACION,
                CALIDAD_EDUCATIVA, INSPECCION_VIGILANCIA, COBERTURA_INFRAESTRUCTURA, TALENTO_HUMANO
              </p>
            </div>
          )}

        {showDespacho && (
          <Dashboard href="/dashboard/despacho" icon={<Headphones className="h-10 w-10" />} title="DESPACHO" />
        )}
        {showPlaneacion && (
          <Dashboard href="/dashboard/planeacion" icon={<ClipboardList className="h-10 w-10" />} title="PLANEACIÓN" />
        )}
        {showCalidadEducativa && (
          <Dashboard
            href="/dashboard/calidad-educativa"
            icon={<BookOpen className="h-10 w-10" />}
            title="CALIDAD EDUCATIVA"
          />
        )}
        {showInspeccionVigilancia && (
          <Dashboard
            href="/dashboard/inspeccion-vigilancia"
            icon={<Eye className="h-10 w-10" />}
            title="INSPECCIÓN Y VIGILANCIA"
          />
        )}
        {showCoberturaInfraestructura && (
          <Dashboard
            href="/dashboard/cobertura-infraestructura"
            icon={<Monitor className="h-10 w-10" />}
            title="COBERTURA E INFRAESTRUCTURA"
          />
        )}
        {showTalentoHumano && (
          <Dashboard href="/dashboard/talento-humano" icon={<Users className="h-10 w-10" />} title="TALENTO HUMANO" />
        )}
      </motion.div>
    </div>
  )
}
