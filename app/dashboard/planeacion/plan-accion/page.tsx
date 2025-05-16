"use client"

import { ModuleHeader } from "@/components/dashboard/module-header"
import { RoleGuard } from "@/components/auth/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, FileText } from "lucide-react"
import { usePlanAccion } from "@/hooks/use-plan-accion"
import { PlanAccionInfo } from "@/components/plan-accion/plan-accion-info"
import { PlanAccionUpload } from "@/components/plan-accion/plan-accion-upload"
import { PlanAccionViewer } from "@/components/plan-accion/plan-accion-viewer"

export default function PlanAccionPage() {
  const {
    items,
    documento,
    selectedFile,
    isViewerOpen,
    isUploading,
    handleFileChange,
    handleUpload,
    openDocumentViewer,
    setIsViewerOpen,
    handleDownload,
  } = usePlanAccion()

  return (
    <RoleGuard allowedRoles={["ADMIN", "PLANEACION"]}>
      <main className="min-h-screen bg-gray-50">
        <ModuleHeader title="PLAN DE ACCIÓN" />
        <div className="container mx-auto p-4 md:p-8">
          <Card className="mb-8">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Plan de Acción Municipal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <PlanAccionInfo documento={documento} onView={openDocumentViewer} onDownload={handleDownload} />

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-800">Información importante</h3>
                        <p className="text-sm text-amber-700">
                          Este documento contiene el Plan de Acción oficial de la Secretaría de Educación. Cualquier
                          actualización reemplazará la versión actual.
                        </p>
                      </div>
                    </div>
                  </div>

                  <PlanAccionUpload
                    selectedFile={selectedFile}
                    isUploading={isUploading}
                    onFileChange={handleFileChange}
                    onUpload={handleUpload}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <PlanAccionViewer
          isOpen={isViewerOpen}
          onOpenChange={setIsViewerOpen}
          items={items}
          documentoNombre={documento.nombre}
          documentoFecha={documento.fecha}
          onDownload={handleDownload}
        />
      </main>
    </RoleGuard>
  )
}
