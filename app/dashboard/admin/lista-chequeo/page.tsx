"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { ListaChequeoAdmin } from "@/components/admin/lista-chequeo-admin"

export default function ListaChequeoAdminPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <main className="min-h-screen">
        <ModuleHeader title="ADMINISTRACIÓN - LISTA DE CHEQUEO" />
        <div className="container mx-auto">
          <ListaChequeoAdmin />
        </div>
      </main>
    </RoleGuard>
  )
}
