"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ModuleCard } from "@/components/modules/module-card"
import { TrendingUp, FileText, ClipboardList, Monitor } from "lucide-react"

export default function CoberturaInfraestructuraPage() {
  const modules = [
    {
      title: "Plan de acción por área",
      description: "Gestión de planes de acción por área",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/dashboard/cobertura-infraestructura/plan-accion",
      color: "green" as const,
      badge: "Conectado",
    },
    {
      title: "Proveedores",
      description: "Gestión documental de proveedores",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/cobertura-infraestructura/proveedores",
      color: "blue" as const,
    },
    {
      title: "Prestación de servicio",
      description: "Gestión documental de prestación de servicios",
      icon: <Monitor className="h-6 w-6" />,
      href: "/dashboard/cobertura-infraestructura/prestacion-servicio",
      color: "green" as const,
    },
    {
      title: "Lista de Chequeo",
      description: "Gestión y diligenciamiento de lista de chequeo contractual",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/dashboard/cobertura-infraestructura/lista-chequeo",
      color: "purple" as const,
    },
  ]

  return (
    <RoleGuard allowedRoles={["ADMIN", "COBERTURA_INFRAESTRUCTURA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="COBERTURA E INFRAESTRUCTURA" />
        <div className="container mx-auto">
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module, index) => (
              <ModuleCard
                key={index}
                title={module.title}
                description={module.description}
                icon={module.icon}
                href={module.href}
                color={module.color}
                badge={module.badge}
              />
            ))}
          </div>
        </div>
      </main>
    </RoleGuard>
  )
}
