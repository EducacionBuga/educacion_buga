"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import DocumentManagerGeneric from "@/components/modules/document-manager-generic"

export default function ProveedoresPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "COBERTURA_INFRAESTRUCTURA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="PROVEEDORES" />
        <DocumentManagerGeneric
          title="Gestión de Proveedores"
          description="Administre documentos relacionados con proveedores y contratos."
          areaId="cobertura-infraestructura"
          moduleType="proveedores"
        />
      </main>
    </RoleGuard>
  )
}
