"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Headphones, ClipboardList, BookOpen, Eye, Monitor, Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/context"
import { SessionStatus } from "@/components/auth/session-status"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  isActive: boolean
}

function NavItem({ href, icon, title, isActive }: NavItemProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex flex-col items-center justify-center p-2 transition-colors rounded-md",
              isActive ? "text-orange-600" : "text-gray-600 hover:text-orange-500",
            )}
          >
            <div className="w-12 h-12 flex items-center justify-center mb-1">{icon}</div>
            <span className="text-xs font-medium text-center">{title}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function HorizontalNav() {
  const pathname = usePathname()
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
    <div className="w-full bg-white shadow-sm border-b">
      <div className="container mx-auto py-2">
        <div className="flex justify-center items-center gap-4 md:gap-8 lg:gap-12 overflow-x-auto px-2">
          {showDespacho && (
            <NavItem
              href="/dashboard/despacho"
              icon={<Headphones className="h-8 w-8 text-orange-500" />}
              title="DESPACHO"
              isActive={pathname.startsWith("/dashboard/despacho")}
            />
          )}
          {showPlaneacion && (
            <NavItem
              href="/dashboard/planeacion"
              icon={<ClipboardList className="h-8 w-8 text-orange-500" />}
              title="PLANEACIÓN"
              isActive={pathname.startsWith("/dashboard/planeacion")}
            />
          )}
          {showCalidadEducativa && (
            <NavItem
              href="/dashboard/calidad-educativa"
              icon={<BookOpen className="h-8 w-8 text-orange-500" />}
              title="CALIDAD EDUCATIVA"
              isActive={pathname.startsWith("/dashboard/calidad-educativa")}
            />
          )}
          {showInspeccionVigilancia && (
            <NavItem
              href="/dashboard/inspeccion-vigilancia"
              icon={<Eye className="h-8 w-8 text-orange-500" />}
              title="INSPECCIÓN Y VIGILANCIA"
              isActive={pathname.startsWith("/dashboard/inspeccion-vigilancia")}
            />
          )}
          {showCoberturaInfraestructura && (
            <NavItem
              href="/dashboard/cobertura-infraestructura"
              icon={<Monitor className="h-8 w-8 text-orange-500" />}
              title="COBERTURA E INFRAESTRUCTURA"
              isActive={pathname.startsWith("/dashboard/cobertura-infraestructura")}
            />
          )}
          {showTalentoHumano && (
            <NavItem
              href="/dashboard/talento-humano"
              icon={<Users className="h-8 w-8 text-orange-500" />}
              title="TALENTO HUMANO"
              isActive={pathname.startsWith("/dashboard/talento-humano")}
            />
          )}
        </div>
        
        {/* Estado de sesión */}
        <div className="mt-2 flex justify-center">
          <SessionStatus />
        </div>
      </div>
    </div>
  )
}
