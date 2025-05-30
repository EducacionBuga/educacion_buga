"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { Headphones, ClipboardList, BookOpen, Eye, Monitor, Users } from "lucide-react"

interface ModuleItemProps {
  href: string
  icon: React.ReactNode
  title: string
}

function ModuleItem({ href, icon, title }: ModuleItemProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-all"
    >
      <div className="w-16 h-16 flex items-center justify-center mb-3">{icon}</div>
      <span className="text-sm font-medium text-center">{title}</span>
    </Link>
  )
}

export function DashboardModules() {
  const { user } = useAuth()
  const role = user?.role || ""

  // Determinar qué módulos mostrar según el rol
  const showDespacho = role === "ADMIN" || role === "DESPACHO"
  const showPlaneacion = role === "ADMIN" || role === "PLANEACION"
  const showCalidadEducativa = role === "ADMIN" || role === "CALIDAD_EDUCATIVA"
  const showInspeccionVigilancia = role === "ADMIN" || role === "INSPECCION_VIGILANCIA"
  const showCoberturaInfraestructura = role === "ADMIN" || role === "COBERTURA_INFRAESTRUCTURA"
  const showTalentoHumano = role === "ADMIN" || role === "TALENTO_HUMANO"

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {showDespacho && (
        <ModuleItem
          title="DESPACHO"
          icon={<Headphones className="h-12 w-12 text-orange-500" />}
          href="/dashboard/despacho"
        />
      )}
      {showPlaneacion && (
        <ModuleItem
          title="PLANEACIÓN"
          icon={<ClipboardList className="h-12 w-12 text-orange-500" />}
          href="/dashboard/planeacion"
        />
      )}
      {showCalidadEducativa && (
        <ModuleItem
          title="CALIDAD EDUCATIVA"
          icon={<BookOpen className="h-12 w-12 text-orange-500" />}
          href="/dashboard/calidad-educativa"
        />
      )}
      {showInspeccionVigilancia && (
        <ModuleItem
          title="INSPECCIÓN Y VIGILANCIA"
          icon={<Eye className="h-12 w-12 text-orange-500" />}
          href="/dashboard/inspeccion-vigilancia"
        />
      )}
      {showCoberturaInfraestructura && (
        <ModuleItem
          title="COBERTURA E INFRAESTRUCTURA"
          icon={<Monitor className="h-12 w-12 text-orange-500" />}
          href="/dashboard/cobertura-infraestructura"
        />
      )}
      {showTalentoHumano && (
        <ModuleItem
          title="TALENTO HUMANO"
          icon={<Users className="h-12 w-12 text-orange-500" />}
          href="/dashboard/talento-humano"
        />
      )}
    </div>
  )
}
