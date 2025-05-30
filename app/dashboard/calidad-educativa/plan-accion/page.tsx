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
    localStorage.setItem("calidad-educativa-plan-accion", JSON.stringify(items))
  }, [])

  // Cargar datos del localStorage al iniciar
  useState(() => {
    try {
      const storedItems = localStorage.getItem("calidad-educativa-plan-accion")
      if (storedItems) {
        setPlanAccionItems(JSON.parse(storedItems))
      }
    } catch (error) {
      console.error("Error loading stored items:", error)
    }
  })

  return (
    <RoleGuard allowedRoles={["ADMIN", "CALIDAD_EDUCATIVA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="PLAN DE ACCIÓN POR ÁREA" />
        <div className="container mx-auto">
          <PlanAccionArea
            title="Plan de acción por área"
            description="Gestión de planes de acción por área educativa"
            area="Calidad Educativa"
            color="orange"
            initialItems={planAccionItems}
            onItemsChange={handleItemsChange}
          />
        </div>
      </main>
    </RoleGuard>
  )
}
