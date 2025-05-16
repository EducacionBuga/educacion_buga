"use client"

import { useState, useCallback } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import PlanAccionArea, { type PlanAccionItem } from "@/components/modules/plan-accion-area"

export default function PlanAccionAreaPage() {
  const [planAccionItems, setPlanAccionItems] = useState<PlanAccionItem[]>([])

  const handleItemsChange = useCallback((items: PlanAccionItem[]) => {
    setPlanAccionItems(items)

    // Opcional: Guardar en localStorage para persistencia
    localStorage.setItem("talento-humano-plan-accion", JSON.stringify(items))
  }, [])

  // Cargar datos del localStorage al iniciar
  useState(() => {
    try {
      const storedItems = localStorage.getItem("talento-humano-plan-accion")
      if (storedItems) {
        setPlanAccionItems(JSON.parse(storedItems))
      }
    } catch (error) {
      console.error("Error loading stored items:", error)
    }
  })

  return (
    <RoleGuard allowedRoles={["ADMIN", "TALENTO_HUMANO"]}>
      <main className="min-h-screen">
        <ModuleHeader title="PLAN DE ACCIÓN POR ÁREA" />
        <div className="container mx-auto">
          <PlanAccionArea
            title="Plan de acción por área"
            description="Gestión de planes de acción por área de talento humano"
            area="Talento Humano"
            color="purple"
            initialItems={planAccionItems}
            onItemsChange={handleItemsChange}
          />
        </div>
      </main>
    </RoleGuard>
  )
}
