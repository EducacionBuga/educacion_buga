"use client"

import { useState } from "react"
import { ModuleGrid } from "@/components/modules/module-grid"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ClipboardList, BarChart3 } from "lucide-react"

export default function PlaneacionPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const modules = [
    {
      title: "Plan de Acción",
      description: "Gestión y seguimiento del plan de acción institucional",
      icon: <ClipboardList className="h-5 w-5" />,
      href: "/dashboard/planeacion/plan-accion",
      color: "blue",
    },
    {
      title: "Matriz de Seguimiento",
      description: "Seguimiento a indicadores y metas institucionales",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/dashboard/planeacion/matriz-seguimiento",
      color: "green",
    },
  ]

  const filteredModules = modules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <ModuleHeader
        title="Planeación"
        description="Gestión estratégica y seguimiento a planes institucionales"
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />
      <ModuleGrid modules={filteredModules} columns={2} />
    </div>
  )
}
