"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ListaChequeoDemo } from "@/components/modules/lista-chequeo-demo"

export default function ListaChequeoPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "CALIDAD_EDUCATIVA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="LISTA DE CHEQUEO" />
        <div className="container mx-auto">
          <ListaChequeoDemo />
        </div>
      </main>
    </RoleGuard>
  )
}
