"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ModuleGrid } from "@/components/modules/module-grid"
import { TrendingUp, FileText, ClipboardList } from "lucide-react"

export default function CalidadEducativaPage() {
  const modules = [
    {
      title: "Plan de acción por área",
      description: "Gestión de planes de acción por área educativa",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/dashboard/calidad-educativa/plan-accion",
      color: "orange",
      badge: "Conectado",
    },
    {
      title: "Proveedores",
      description: "Gestión documental de proveedores",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/calidad-educativa/proveedores",
      color: "blue",
    },
    {
      title: "Prestación de servicio",
      description: "Gestión documental de prestación de servicios",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/calidad-educativa/prestacion-servicio",
      color: "green",
    },
    {
      title: "Lista de Chequeo",
      description: "Gestión documental contractual",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/dashboard/calidad-educativa/lista-chequeo",
      color: "purple",
    },
  ]

  return (
    <RoleGuard allowedRoles={["ADMIN", "CALIDAD_EDUCATIVA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="CALIDAD EDUCATIVA" />
        <div className="container mx-auto">
          <ModuleGrid modules={modules} />
        </div>
      </main>
    </RoleGuard>
  )
}
