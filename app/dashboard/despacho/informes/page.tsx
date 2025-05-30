"use client"

import { useState, useEffect } from "react"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { RoleGuard } from "@/components/auth/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AREAS } from "@/constants/areas"
import { UniversalUpload } from "@/components/ui/universal-upload"
import { InformesManager } from "@/components/modules/informes-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Download, Eye, Trash2, Calendar, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { useInformesManager } from "@/hooks/use-informes-manager"

// Constante para el área de despacho
const AREA_ID = "9850c4bd-119a-444d-831f-2f410bbbaf8b" // ID del área Despacho

export default function InformesEjecucionPage() {
  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  // Estado para el diálogo de vista previa
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedInformeTitle, setSelectedInformeTitle] = useState("")

  // Usar el hook real de informes con R2
  const { 
    informes, 
    loading, 
    error, 
    addInforme, 
    deleteInforme, 
    refetch 
  } = useInformesManager(AREA_ID)

  const { toast } = useToast()

  // Filtrar informes basado en el término de búsqueda
  const filteredInformes = informes.filter(
    (informe) =>
      informe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (informe.description && informe.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Manejar la carga exitosa
  const handleUploadSuccess = (result: any) => {
    toast({
      title: "Informe cargado con éxito",
      description: `El informe "${result.name}" ha sido subido correctamente.`,
    })
    
    // Refrescar la lista de informes
    refetch()
  }

  // Manejar errores de carga
  const handleUploadError = (error: string) => {
    toast({
      title: "Error al cargar el informe",
      description: error,
      variant: "destructive",
    })
  }

  // Visualizar un informe
  const handleViewInforme = (informe: any) => {
    setPreviewUrl(informe.file_url)
    setSelectedInformeTitle(informe.name)
    setPreviewDialogOpen(true)
  }

  // Descargar un informe
  const handleDownload = (informe: any) => {
    window.open(informe.file_url, '_blank')
  }

  // Eliminar un informe
  const handleDelete = async (informeId: string) => {
    if (window.confirm("¿Está seguro que desea eliminar este informe?")) {
      const success = await deleteInforme(informeId)
      if (success) {
        toast({
          title: "Informe eliminado",
          description: "El informe ha sido eliminado con éxito",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el informe",
          variant: "destructive",
        })
      }
    }
  }

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
              <UniversalUpload 
                type="informe"
                areaId={AREA_ID}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Informes Subidos ({filteredInformes.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar informes..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : filteredInformes.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {filteredInformes.map((informe) => (
                      <div
                        key={informe.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-orange-100 p-2 rounded-full dark:bg-orange-900/30">
                            <FileText className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{informe.name}</h4>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="mr-1 h-3.5 w-3.5" />
                              <span>
                                {format(new Date(informe.date || informe.created_at), "PPP", {
                                  locale: es,
                                })}
                              </span>
                            </div>
                            {informe.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {informe.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewInforme(informe)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(informe)}>
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Descargar</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(informe.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No hay informes
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    {searchTerm 
                      ? "No se encontraron informes que coincidan con tu búsqueda."
                      : "Aún no se han subido informes. Utiliza el formulario superior para cargar el primer informe."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diálogo para vista previa de documentos */}
          <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
            <DialogContent className="sm:max-w-[900px] h-[80vh]">
              <DialogHeader>
                <DialogTitle>{selectedInformeTitle}</DialogTitle>
              </DialogHeader>
              <div className="h-full w-full overflow-hidden">
                {previewUrl && (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Vista previa del documento"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </RoleGuard>
  )
}
