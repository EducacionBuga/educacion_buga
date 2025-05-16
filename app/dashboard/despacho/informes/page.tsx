"use client"

import { useState, useCallback } from "react"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { RoleGuard } from "@/components/auth/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Report } from "@/types/reports"
import { AREAS } from "@/constants/areas"
import { useReportsManager } from "@/hooks/use-reports-manager"
import { UploadArea } from "@/components/reports/upload-area"
import { FilterControls } from "@/components/reports/filter-controls"
import { ReportList } from "@/components/reports/report-list"
import { ReportForm } from "@/components/reports/report-form"

export default function InformesEjecucionPage() {
  const [showForm, setShowForm] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null)

  const { filteredReports, selectedAreas, toggleAreaFilter, clearFilters, addReport, removeReport, isUploading } =
    useReportsManager({
      onSuccess: () => {
        setShowForm(false)
        setCurrentFile(null)
      },
    })

  const handleFileSelected = useCallback((file: File) => {
    setCurrentFile(file)
    setShowForm(true)
  }, [])

  const handleFormSubmit = useCallback(
    async (data: { name: string; area: string; date: string }) => {
      if (!currentFile) return

      await addReport(currentFile, {
        ...data,
        type: currentFile.type,
      })
    },
    [currentFile, addReport],
  )

  const handleViewReport = useCallback((report: Report) => {
    // Implementar visualización del informe
    console.log("Ver informe:", report)
    // En una implementación real, aquí se abriría un visor de PDF o similar

    // Generar URL para vista previa si es necesario
    // Esto podría ser una URL a un blob, un objeto URL, o una URL de API
    const fileUrl = URL.createObjectURL(report.file)

    // Actualizar el estado con la URL del archivo actual
    setCurrentFileUrl(fileUrl)

    // Resto de la lógica existente...
  }, [])

  const handleDownloadReport = useCallback((report: Report) => {
    // Implementar descarga del informe
    console.log("Descargar informe:", report)

    // Crear un objeto URL para el archivo
    const url = URL.createObjectURL(report.file)

    // Crear un enlace temporal
    const a = document.createElement("a")
    a.href = url
    a.download = report.name

    // Simular clic en el enlace
    document.body.appendChild(a)
    a.click()

    // Limpiar
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  return (
    <RoleGuard allowedRoles={["ADMIN", "DESPACHO"]}>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ModuleHeader title="INFORMES DE EJECUCIÓN" />
        <div className="container mx-auto p-4 md:p-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Subir Informes</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadArea onFileSelected={handleFileSelected} isUploading={isUploading} />
            </CardContent>
          </Card>

          {filteredReports.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-row items-center justify-between">
                  <CardTitle>Informes Subidos</CardTitle>
                  <div className="text-sm text-gray-500">{filteredReports.length} informes</div>
                </div>
              </CardHeader>
              <CardContent>
                <FilterControls
                  areas={AREAS}
                  selectedAreas={selectedAreas}
                  onToggleArea={toggleAreaFilter}
                  onClearFilters={clearFilters}
                />

                <ReportList
                  reports={filteredReports}
                  onDelete={removeReport}
                  onView={handleViewReport}
                  onDownload={handleDownloadReport}
                  fileUrl={currentFileUrl}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Información del Informe</DialogTitle>
              <DialogDescription>Complete la información del informe para subirlo al sistema.</DialogDescription>
            </DialogHeader>
            {currentFile && (
              <ReportForm
                file={currentFile}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                isSubmitting={isUploading}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </RoleGuard>
  )
}
