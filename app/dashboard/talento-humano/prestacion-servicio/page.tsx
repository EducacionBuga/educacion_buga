"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import DocumentManagerGeneric from "@/components/modules/document-manager-generic"

export default function PrestacionServicioPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "TALENTO_HUMANO"]}>
      <main className="min-h-screen">
        <ModuleHeader title="PRESTACIÓN DE SERVICIO" />
        <DocumentManagerGeneric
          title="Gestión de Prestación de Servicios"
          description="Administre documentos relacionados con la prestación de servicios educativos."
          areaId="talento-humano"
          moduleType="prestacion-servicio"
        />
      </main>
    </RoleGuard>
  )
}
