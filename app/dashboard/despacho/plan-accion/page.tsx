"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { UniversalUpload } from "@/components/ui/universal-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Calendar, Download, Eye, Trash2, FileText, FolderOpen } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"

// Constante para el área de despacho
const AREA_ID = "9850c4bd-119a-444d-831f-2f410bbbaf8b" // ID del área Despacho

// Definir interfaz para adjuntos del plan de acción
interface PlanAccionAdjunto {
  id: string
  nombre: string
  descripcion?: string
  tipo_archivo: string
  tamano: number
  ruta_archivo: string
  url_publica: string
  actividad_id: string
  area_id: string
  estado: string
  created_at: string
  updated_at: string
}

export default function PlanAccionAreaPage() {
  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  // Estado para el diálogo de vista previa
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState("")
  // Estados para adjuntos
  const [adjuntos, setAdjuntos] = useState<PlanAccionAdjunto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("documentos")
  const [actividadId, setActividadId] = useState("plan-accion-general")
  
  const { toast } = useToast()
  
  useEffect(() => {
    // Cargar adjuntos del plan de acción
    const fetchAdjuntos = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/plan-accion/adjuntos?areaId=${AREA_ID}`)
        if (response.ok) {
          const data = await response.json()
          setAdjuntos(data)
        } else {
          console.error("Error al cargar adjuntos:", await response.text())
          toast({
            title: "Error",
            description: "No se pudieron cargar los documentos adjuntos",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAdjuntos()
  }, [toast])
  
  // Filtrar adjuntos basado en el término de búsqueda
  const filteredAdjuntos = adjuntos.filter(
    (adjunto) =>
      adjunto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (adjunto.descripcion && adjunto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Manejar la carga exitosa
  const handleUploadSuccess = (result: any) => {
    toast({
      title: "Documento adjunto cargado con éxito",
      description: `El documento "${result.nombre}" ha sido subido correctamente.`,
    })
    
    // Añadir el nuevo adjunto a la lista
    setAdjuntos((prev) => [result, ...prev])
  }

  // Manejar errores de carga
  const handleUploadError = (error: string) => {
    toast({
      title: "Error al cargar el documento",
      description: error,
      variant: "destructive",
    })
  }

  // Visualizar un documento
  const handleViewDocument = (adjunto: PlanAccionAdjunto) => {
    setPreviewUrl(adjunto.url_publica)
    setSelectedDocumentTitle(adjunto.nombre)
    setPreviewDialogOpen(true)
  }

  // Descargar un documento
  const handleDownload = (adjunto: PlanAccionAdjunto) => {
    window.open(adjunto.url_publica, '_blank')
  }

  // Eliminar un adjunto
  const handleDelete = async (adjuntoId: string) => {
    if (window.confirm("¿Está seguro que desea eliminar este documento?")) {
      try {
        const response = await fetch(`/api/plan-accion/adjuntos/${adjuntoId}`, {
          method: "DELETE",
        })
        
        if (response.ok) {
          toast({
            title: "Documento eliminado",
            description: "El documento ha sido eliminado con éxito",
          })
          // Actualizar la lista de adjuntos
          setAdjuntos((prev) => prev.filter(adj => adj.id !== adjuntoId))
        } else {
          toast({
            title: "Error",
            description: "No se pudo eliminar el documento",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al intentar eliminar el documento",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <RoleGuard allowedRoles={["ADMIN", "DESPACHO"]}>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ModuleHeader title="PLAN DE ACCIÓN - DESPACHO" />
        <div className="container mx-auto p-4 md:p-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Subir Documento al Plan de Acción</CardTitle>
            </CardHeader>
            <CardContent>
              <UniversalUpload 
                type="plan-accion"
                areaId={AREA_ID}
                activityId={actividadId}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                className="mt-4"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Documentos del Plan de Acción</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
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
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {filteredAdjuntos.length > 0 ? filteredAdjuntos.map((adjunto) => (
                      <div
                        key={adjunto.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-orange-100 p-2 rounded-full dark:bg-orange-900/30">
                            <FileText className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{adjunto.nombre}</h4>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="mr-1 h-3.5 w-3.5" />
                              <span>
                                {format(new Date(adjunto.created_at), "PPP", {
                                  locale: es,
                                })}
                              </span>
                            </div>
                            {adjunto.descripcion && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {adjunto.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDocument(adjunto)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(adjunto)}>
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Descargar</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(adjunto.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10">
                        <FolderOpen className="mx-auto h-10 w-10 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                          No se encontraron documentos
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Comience subiendo su primer documento al plan de acción.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Diálogo para vista previa de documentos */}
          <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
            <DialogContent className="sm:max-w-[900px] h-[80vh]">
              <DialogHeader>
                <DialogTitle>{selectedDocumentTitle}</DialogTitle>
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
