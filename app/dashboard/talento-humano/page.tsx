"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ModuleGrid } from "@/components/modules/module-grid"
import { TrendingUp, FileText, ClipboardList, Users } from "lucide-react"

export default function TalentoHumanoPage() {
  const modules = [
    {
      title: "Plan de acción por área",
      description: "Gestión de planes de acción por área",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/dashboard/talento-humano/plan-accion",
      color: "purple",
      badge: "Conectado",
    },
    {
      title: "Proveedores",
      description: "Gestión documental de proveedores",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/talento-humano/proveedores",
      color: "blue",
    },
    {
      title: "Prestación de servicio",
      description: "Gestión documental de prestación de servicios",
      icon: <Users className="h-6 w-6" />,
      href: "/dashboard/talento-humano/prestacion-servicio",
      color: "green",
    },
    {
      title: "Lista de Chequeo",
      description: "Gestión documental contractual",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/dashboard/talento-humano/lista-chequeo",
      color: "purple",
    },
  ]

  return (
    <RoleGuard allowedRoles={["ADMIN", "TALENTO_HUMANO"]}>
      <main className="min-h-screen">
        <ModuleHeader title="TALENTO HUMANO" />
        <div className="container mx-auto">
          <ModuleGrid modules={modules} />
        </div>
      </main>
    </RoleGuard>
  )
}
