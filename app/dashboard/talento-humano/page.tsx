"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ModuleCard } from "@/components/modules/module-card"
import { DownloadableModuleCard } from "@/components/modules/downloadable-module-card"
import { TrendingUp, FileText, ClipboardList, Users } from "lucide-react"

export default function TalentoHumanoPage() {
  const modules = [
    {
      title: "Plan de acción por área",
      description: "Gestión de planes de acción por área",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/dashboard/talento-humano/plan-accion",
      color: "purple" as const,
      badge: "Conectado",
    },
    {
      title: "Proveedores",
      description: "Gestión documental de proveedores",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/talento-humano/proveedores",
      color: "blue" as const,
    },
    {
      title: "Prestación de servicio",
      description: "Gestión documental de prestación de servicios",
      icon: <Users className="h-6 w-6" />,
      href: "/dashboard/talento-humano/prestacion-servicio",
      color: "green" as const,
    },
  ]

  return (
    <RoleGuard allowedRoles={["ADMIN", "TALENTO_HUMANO"]}>
      <main className="min-h-screen">
        <ModuleHeader title="TALENTO HUMANO" />
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
            <DownloadableModuleCard
              title="Lista de Chequeo"
              description="Descarga la lista de chequeo en formato Excel"
              icon={<ClipboardList className="h-6 w-6" />}
              downloadUrl="/document/lista-de-chequeo.xlsx"
              fileName="lista-de-chequeo.xlsx"
              color="purple"
              badge="Descarga"
            />
          </div>
        </div>
      </main>
    </RoleGuard>
  )
}
