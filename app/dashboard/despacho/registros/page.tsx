"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { UniversalUpload } from "@/components/ui/universal-upload"
import { useToast } from "@/components/ui/use-toast"
import { useRegistrosManager } from "@/hooks/use-registros-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Calendar, MapPin, Eye, Trash2, Image, Camera } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Constante para el área de despacho
const AREA_ID = "9850c4bd-119a-444d-831f-2f410bbbaf8b" // ID del área Despacho

export default function RegistrosFotograficosPage() {
  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  // Estado para el diálogo de vista previa
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedRegistroTitle, setSelectedRegistroTitle] = useState("")

  // Usar el hook real de registros con R2
  const { 
    registros, 
    loading, 
    error, 
    addRegistro, 
    deleteRegistro, 
    refetch 
  } = useRegistrosManager(AREA_ID)

  const { toast } = useToast()

  // Filtrar registros basado en el término de búsqueda
  const filteredRegistros = registros.filter(
    (registro) =>
      registro.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (registro.description && registro.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Manejar la carga exitosa
  const handleUploadSuccess = (result: any) => {
    toast({
      title: "Registro fotográfico cargado con éxito",
      description: `El registro "${result.title}" ha sido subido correctamente.`,
    })
    
    // Refrescar la lista de registros
    refetch()
  }

  // Manejar errores de carga
  const handleUploadError = (error: string) => {
    toast({
      title: "Error al cargar el registro fotográfico",
      description: error,
      variant: "destructive",
    })
  }

  // Visualizar un registro
  const handleViewRegistro = (registro: any) => {
    setPreviewUrl(registro.file_url)
    setSelectedRegistroTitle(registro.title)
    setPreviewDialogOpen(true)
  }

  // Eliminar un registro
  const handleDelete = async (registroId: string) => {
    if (window.confirm("¿Está seguro que desea eliminar este registro fotográfico?")) {
      const success = await deleteRegistro(registroId)
      if (success) {
        toast({
          title: "Registro eliminado",
          description: "El registro fotográfico ha sido eliminado con éxito",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el registro fotográfico",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <RoleGuard allowedRoles={["ADMIN", "DESPACHO"]}>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ModuleHeader title="REGISTROS FOTOGRÁFICOS" />
        <div className="container mx-auto p-4 md:p-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Subir Registro Fotográfico</CardTitle>
            </CardHeader>
            <CardContent>
              <UniversalUpload 
                type="registro"
                areaId={AREA_ID}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                className="mt-4"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Registros Fotográficos ({filteredRegistros.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar registros..."
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
              ) : filteredRegistros.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRegistros.map((registro) => (
                      <div
                        key={registro.id}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                          <img 
                            src={registro.file_url} 
                            alt={registro.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Mostrar icono en caso de error
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium truncate">{registro.title}</h4>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Calendar className="mr-1 h-3.5 w-3.5" />
                            <span>
                              {format(new Date(registro.date || registro.created_at), "PPP", {
                                locale: es,
                              })}
                            </span>
                          </div>
                          {registro.location && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="mr-1 h-3.5 w-3.5" />
                              <span className="truncate">{registro.location}</span>
                            </div>
                          )}
                          <div className="flex justify-end space-x-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewRegistro(registro)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(registro.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No hay registros fotográficos
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    {searchTerm 
                      ? "No se encontraron registros que coincidan con tu búsqueda."
                      : "Aún no se han subido registros fotográficos. Utiliza el formulario superior para cargar el primer registro."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diálogo para vista previa de imágenes */}
          <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
            <DialogContent className="sm:max-w-[900px] h-[80vh]">
              <DialogHeader>
                <DialogTitle>{selectedRegistroTitle}</DialogTitle>
              </DialogHeader>
              <div className="h-full w-full flex items-center justify-center overflow-hidden">
                {previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt={selectedRegistroTitle}
                    className="max-w-full max-h-full object-contain"
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
