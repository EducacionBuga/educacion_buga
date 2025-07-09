"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ListaChequeoNew } from "@/components/modules/lista-chequeo-new"

export default function ListaChequeoPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "INSPECCION_VIGILANCIA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="LISTA DE CHEQUEO" />
        <div className="container mx-auto">
          <ListaChequeoNew />
        </div>
      </main>
    </RoleGuard>
  )
}
