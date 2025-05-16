"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { DocumentSection } from "@/components/modules/document-section"
import { TrendingUp } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Datos de ejemplo
const planAccionDocuments = {
  preContractual: [
    {
      id: "1",
      name: "Plan de Acción 2025 - Despacho",
      entity: "Despacho",
      date: "10/01/2025",
      type: "PDF",
      status: "approved",
    },
    {
      id: "2",
      name: "Objetivos Estratégicos",
      entity: "Despacho",
      date: "15/01/2025",
      type: "DOCX",
      status: "approved",
    },
  ],
  execution: [
    {
      id: "3",
      name: "Informe de Avance Q1",
      entity: "Despacho",
      date: "31/03/2025",
      type: "PDF",
      status: "pending",
    },
  ],
  closure: [],
}

export default function PlanAccionAreaPage() {
  const handleUpload = (file: File, type: string) => {
    toast({
      title: "Documento subido",
      description: `El archivo ${file.name} ha sido subido correctamente como documento ${type}.`,
    })
  }

  const handleDelete = (id: string, type: string) => {
    toast({
      title: "Documento eliminado",
      description: `El documento ha sido eliminado correctamente.`,
      variant: "destructive",
    })
  }

  const handleView = (id: string, type: string) => {
    toast({
      title: "Visualizando documento",
      description: `Abriendo documento ID: ${id}`,
    })
  }

  const handleDownload = (id: string, type: string) => {
    toast({
      title: "Descargando documento",
      description: `Descargando documento ID: ${id}`,
    })
  }

  return (
    <RoleGuard allowedRoles={["ADMIN", "DESPACHO"]}>
      <main className="min-h-screen">
        <ModuleHeader title="PLAN DE ACCIÓN POR ÁREA" />
        <div className="container mx-auto">
          <DocumentSection
            title="Plan de acción por área"
            description="Gestión de planes de acción por área"
            icon={<TrendingUp className="h-6 w-6" />}
            color="orange"
            documents={planAccionDocuments}
            linkedModule={{
              title: "Ver Matriz de Seguimiento",
              path: "/dashboard/planeacion/matriz-seguimiento",
            }}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onView={handleView}
            onDownload={handleDownload}
          />
        </div>
      </main>
    </RoleGuard>
  )
}
