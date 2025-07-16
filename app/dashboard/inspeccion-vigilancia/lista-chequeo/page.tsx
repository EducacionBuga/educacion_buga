"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ListaChequeoProduccion } from "@/components/modules/lista-chequeo-produccion"

export default function ListaChequeoPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "INSPECCION_VIGILANCIA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="LISTA DE CHEQUEO" />
        <div className="container mx-auto">
          <ListaChequeoProduccion />
        </div>
      </main>
    </RoleGuard>
  )
}
