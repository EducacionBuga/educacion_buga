"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ModuleGrid } from "@/components/modules/module-grid"
import { TrendingUp, FileText, ClipboardList, Monitor } from "lucide-react"

export default function CoberturaInfraestructuraPage() {
  const modules = [
    {
      title: "Plan de acción por área",
      description: "Gestión de planes de acción por área",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/dashboard/cobertura-infraestructura/plan-accion",
      color: "green",
      badge: "Conectado",
    },
    {
      title: "Proveedores",
      description: "Gestión documental de proveedores",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/cobertura-infraestructura/proveedores",
      color: "blue",
    },
    {
      title: "Prestación de servicio",
      description: "Gestión documental de prestación de servicios",
      icon: <Monitor className="h-6 w-6" />,
      href: "/dashboard/cobertura-infraestructura/prestacion-servicio",
      color: "green",
    },
    {
      title: "Lista de Chequeo",
      description: "Gestión documental contractual",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/dashboard/cobertura-infraestructura/lista-chequeo",
      color: "purple",
    },
  ]

  return (
    <RoleGuard allowedRoles={["ADMIN", "COBERTURA_INFRAESTRUCTURA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="COBERTURA E INFRAESTRUCTURA" />
        <div className="container mx-auto">
          <ModuleGrid modules={modules} />
        </div>
      </main>
    </RoleGuard>
  )
}
