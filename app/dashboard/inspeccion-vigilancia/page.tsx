"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ModuleGrid } from "@/components/modules/module-grid"
import { TrendingUp, FileText, ClipboardList, Eye } from "lucide-react"

export default function InspeccionVigilanciaPage() {
  const modules = [
    {
      title: "Plan de acción por área",
      description: "Gestión de planes de acción por área",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/dashboard/inspeccion-vigilancia/plan-accion",
      color: "blue",
      badge: "Conectado",
    },
    {
      title: "Proveedores",
      description: "Gestión documental de proveedores",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/inspeccion-vigilancia/proveedores",
      color: "blue",
    },
    {
      title: "Prestación de servicio",
      description: "Gestión documental de prestación de servicios",
      icon: <Eye className="h-6 w-6" />,
      href: "/dashboard/inspeccion-vigilancia/prestacion-servicio",
      color: "green",
    },
    {
      title: "Lista de Chequeo",
      description: "Gestión documental contractual",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/dashboard/inspeccion-vigilancia/lista-chequeo",
      color: "purple",
    },
  ]

  return (
    <RoleGuard allowedRoles={["ADMIN", "INSPECCION_VIGILANCIA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="INSPECCIÓN Y VIGILANCIA" />
        <div className="container mx-auto">
          <ModuleGrid modules={modules} />
        </div>
      </main>
    </RoleGuard>
  )
}
