"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ModuleCard } from "@/components/modules/module-card"
import { DownloadableModuleCard } from "@/components/modules/downloadable-module-card"
import { TrendingUp, FileText, ClipboardList } from "lucide-react"

export default function CalidadEducativaPage() {
  const modules = [
    {
      title: "Plan de acción por área",
      description: "Gestión de planes de acción por área educativa",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/dashboard/calidad-educativa/plan-accion",
      color: "orange" as const,
      badge: "Conectado",
    },
    {
      title: "Proveedores",
      description: "Gestión documental de proveedores",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/calidad-educativa/proveedores",
      color: "blue" as const,
    },
    {
      title: "Prestación de servicio",
      description: "Gestión documental de prestación de servicios",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/calidad-educativa/prestacion-servicio",
      color: "green" as const,
    },
  ]

  return (
    <RoleGuard allowedRoles={["ADMIN", "CALIDAD_EDUCATIVA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="CALIDAD EDUCATIVA" />
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
