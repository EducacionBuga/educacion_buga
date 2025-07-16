"use client"

import { useState, useCallback } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import PlanAccionAreaMejorado from "@/components/modules/plan-accion-area-mejorado"
import type { PlanAccionItem } from "@/types/plan-accion"

export default function PlanAccionAreaPage() {
  const [planAccionItems, setPlanAccionItems] = useState<PlanAccionItem[]>([])

  const handleItemsChange = useCallback((items: PlanAccionItem[]) => {
    setPlanAccionItems(items)

    // Opcional: Guardar en localStorage para persistencia
    localStorage.setItem("cobertura-infraestructura-plan-accion", JSON.stringify(items))
  }, [])

  // Cargar datos del localStorage al iniciar
  useState(() => {
    try {
      const storedItems = localStorage.getItem("cobertura-infraestructura-plan-accion")
      if (storedItems) {
        setPlanAccionItems(JSON.parse(storedItems))
      }
    } catch (error) {
      console.error("Error loading stored items:", error)
    }
  })

  return (
    <RoleGuard allowedRoles={["ADMIN", "COBERTURA_INFRAESTRUCTURA"]}>
      <main className="min-h-screen bg-gray-50">
        <ModuleHeader title="PLAN DE ACCIÓN - COBERTURA E INFRAESTRUCTURA" />
        <div className="container mx-auto p-4 md:p-8">
          <PlanAccionAreaMejorado
            title="Plan de Acción - Cobertura e Infraestructura"
            description="Gestión de planes de acción del área de cobertura e infraestructura"
            area="Cobertura e Infraestructura"
            color="green"
            initialItems={planAccionItems}
            onItemsChange={handleItemsChange}
          />
        </div>
      </main>
    </RoleGuard>
  )
}
