"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ModuleGrid } from "@/components/modules/module-grid"
import { BarChart, FileText, ClipboardList } from "lucide-react"

export default function DespachoPage() {
  const modules = [
    {
      title: "Informes de ejecución",
      description: "Gestión documental de informes",
      icon: <BarChart className="h-6 w-6" />,
      href: "/dashboard/despacho/informes",
      color: "blue" as const,
    },
    {
      title: "Registros fotográficos",
      description: "Gestión documental de registros",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/despacho/registros",
      color: "green" as const,
    },
    {
      title: "Lista de Chequeo",
      description: "Gestión documental contractual",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/dashboard/despacho/lista-chequeo",
      color: "purple" as const,
    },
  ]

  return (
    <RoleGuard allowedRoles={["ADMIN", "DESPACHO"]}>
      <main className="min-h-screen">
        <ModuleHeader title="DESPACHO" />
        <div className="container mx-auto">
          <ModuleGrid modules={modules} />
        </div>
      </main>
    </RoleGuard>
  )
}
