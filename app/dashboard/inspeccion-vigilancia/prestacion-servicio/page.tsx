"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import DocumentManagerGeneric from "@/components/modules/document-manager-generic"

export default function PrestacionServicioPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "INSPECCION_VIGILANCIA"]}>
      <main className="min-h-screen">
        <ModuleHeader title="PRESTACIÓN DE SERVICIO" />
        <DocumentManagerGeneric
          title="Gestión de Prestación de Servicios"
          description="Administre documentos relacionados con la prestación de servicios educativos."
          areaId="inspeccion-vigilancia"
          moduleType="prestacion-servicio"
        />
      </main>
    </RoleGuard>
  )
}
