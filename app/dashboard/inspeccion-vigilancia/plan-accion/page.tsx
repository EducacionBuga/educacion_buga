"use client"

import { useState, useCallback, useEffect } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import PlanAccionAreaMejorado from "@/components/modules/plan-accion-area-mejorado"
import type { PlanAccionItem } from "@/types/plan-accion"

export default function PlanAccionAreaPage() {
  const [planAccionItems, setPlanAccionItems] = useState<PlanAccionItem[]>([])

  const handleItemsChange = useCallback((items: PlanAccionItem[]) => {
    setPlanAccionItems(items)

    // Opcional: Guardar en localStorage para persistencia
    localStorage.setItem("inspeccion-vigilancia-plan-accion", JSON.stringify(items))
  }, [])

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem("inspeccion-vigilancia-plan-accion")
      if (storedItems) {
        setPlanAccionItems(JSON.parse(storedItems))
      }
    } catch (error) {
      console.error("Error loading stored items:", error)
    }
  }, [])

  return (
    <RoleGuard allowedRoles={["ADMIN", "INSPECCION_VIGILANCIA"]}>
      <main className="min-h-screen bg-gray-50">
        <ModuleHeader title="PLAN DE ACCIÓN - INSPECCIÓN Y VIGILANCIA" />
        <div className="container mx-auto p-4 md:p-8">
          <PlanAccionAreaMejorado
            title="Plan de Acción - Inspección y Vigilancia"
            description="Gestión de planes de acción del área de inspección y vigilancia"
            area="Inspección y Vigilancia"
            color="blue"
            initialItems={planAccionItems}
            onItemsChange={handleItemsChange}
          />
        </div>
      </main>
    </RoleGuard>
  )
}
