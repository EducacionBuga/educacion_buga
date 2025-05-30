"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FolderPlus, FileUp, Folder, AlertCircle, RefreshCw, ArrowLeft, FileText, Download, Trash2, MoreVertical } from "lucide-react"
import { useDocumentStoreGeneric, type AreaId, type ModuleType } from "@/hooks/use-document-store-generic"
import type { DocumentCategory } from "@/types/documents"
import { CreateFolderDialog } from "@/components/providers/create-folder-dialog"
import { AddDocumentDialog } from "@/components/providers/add-document-dialog"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface DocumentManagerGenericProps {
  title: string
  description?: string
  areaId: AreaId
  moduleType: ModuleType
}

const DocumentManagerGeneric = ({ title, description, areaId, moduleType }: DocumentManagerGenericProps) => {
  const [activeTab, setActiveTab] = useState("preContractual")
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showDocuments, setShowDocuments] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Para forzar re-renders
  
  // Estados para confirmaciones de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{type: 'folder' | 'document', id: string, name: string} | null>(null)
  
  const { toast } = useToast()
  const { folders, documents, loading, error, addFolder, addDocument, deleteFolder, deleteDocument } = useDocumentStoreGeneric(areaId, moduleType)

  const handleCreateFolder = async (data: any) => {
    setIsCreatingFolder(true)
    try {
      const result = await addFolder({
        name: data.name,
        date: data.date,
        category: data.category,
        color: data.color,
      })

      if (result) {
        setIsCreateFolderOpen(false)
      }
    } catch (error) {
      console.error("Error creating folder:", error)
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleAddDocument = async (data: {
    name: string
    description: string
    folderId: string
    file: File
  }) => {
    try {
      const result = await addDocument(data)
      if (result) {
        setIsAddDocumentOpen(false)
      }
    } catch (error) {
      console.error("Error adding document:", error)
    }
  }

  // Función para confirmar eliminación
  const confirmDelete = (type: 'folder' | 'document', id: string, name: string) => {
    setItemToDelete({ type, id, name })
    setDeleteConfirmOpen(true)
  }

  // Función para ejecutar la eliminación
  const executeDelete = async () => {
    if (!itemToDelete) return

    // Crear una copia del item antes de limpiarlo
    const itemToDeleteCopy = { ...itemToDelete }
    
    // Limpiar el estado del diálogo inmediatamente para evitar problemas
    setDeleteConfirmOpen(false)
    setItemToDelete(null)

    try {
      if (itemToDeleteCopy.type === 'folder') {
        const success = await deleteFolder(itemToDeleteCopy.id)
        if (success) {
          // Si estamos viendo documentos de esta carpeta, volver a la vista de carpetas
          if (selectedFolder === itemToDeleteCopy.id) {
            setSelectedFolder(null)
            setShowDocuments(false)
          }
          // Forzar re-render para asegurar reactividad
          setRefreshKey(prev => prev + 1)
        }
      } else {
        const success = await deleteDocument(itemToDeleteCopy.id)
        if (success) {
          // Forzar re-render para asegurar reactividad
          setRefreshKey(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      // Solo mostrar toast de error si hay un problema
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar ${itemToDeleteCopy.type === 'folder' ? 'la carpeta' : 'el documento'}. Intente de nuevo.`,
        variant: "destructive",
      })
    }
  }

  // Función para descargar documento
  const handleDownloadDocument = async (documentId: string, documentName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      
      if (!response.ok) {
        throw new Error('Error al obtener URL de descarga')
      }
      
      const data = await response.json()
      
      if (data.success && data.downloadUrl) {
        // Crear un enlace temporal para descargar
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = documentName
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: "Descarga iniciada",
          description: `Se ha iniciado la descarga de "${documentName}".`,
        })
      } else {
        throw new Error('No se pudo obtener la URL de descarga')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el documento. Intente de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleFolderClick = (folderId: string) => {
    setSelectedFolder(folderId)
    setShowDocuments(true)
  }

  const handleBackToFolders = () => {
    setSelectedFolder(null)
    setShowDocuments(false)
  }

  const getDocumentsInFolder = (folderId: string) => {
    return documents.filter(doc => doc.folderId === folderId)
  }

  const getSelectedFolderName = () => {
    if (!selectedFolder) return ""
    const folder = folders.find(f => f.id === selectedFolder)
    return folder?.name || ""
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold">Error al cargar datos</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-6 w-6" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent key={refreshKey}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preContractual">Pre-Contractual</TabsTrigger>
              <TabsTrigger value="execution">Ejecución Contractual</TabsTrigger>
              <TabsTrigger value="closure">Cierre Contractual</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {!showDocuments ? (
                // Vista de carpetas
                <>
                  <div className="flex gap-2 mb-4">
                    <Button 
                      onClick={() => setIsCreateFolderOpen(true)} 
                      disabled={loading || isCreatingFolder}
                    >
                      {isCreatingFolder ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <FolderPlus className="mr-2 h-4 w-4" />
                          Nueva Carpeta
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDocumentOpen(true)}>
                      <FileUp className="mr-2 h-4 w-4" />
                      Subir Documento
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
                      <h3 className="text-lg font-semibold">Cargando datos</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Por favor espere mientras cargamos la información...
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {folders.length > 0 ? (
                        folders
                          .filter(folder => folder.category === activeTab)
                          .map(folder => {
                            const documentCount = getDocumentsInFolder(folder.id).length
                            return (
                              <Card 
                                key={folder.id} 
                                className="hover:shadow-md transition-shadow relative group"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div 
                                      className="flex items-center gap-2 flex-1 cursor-pointer"
                                      onClick={() => handleFolderClick(folder.id)}
                                    >
                                      <Folder className="h-5 w-5 text-blue-500" />
                                      <span className="font-medium">{folder.name}</span>
                                    </div>
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            confirmDelete('folder', folder.id, folder.name)
                                          }}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Eliminar carpeta
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  
                                  <div 
                                    className="cursor-pointer"
                                    onClick={() => handleFolderClick(folder.id)}
                                  >
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {folder.date ? new Date(folder.date).toLocaleDateString() : 'Sin fecha'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {documentCount} {documentCount === 1 ? 'documento' : 'documentos'}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })
                      ) : (
                        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors col-span-full">
                          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <Folder className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No hay carpetas en esta categoría
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setIsCreateFolderOpen(true)}
                            >
                              Crear primera carpeta
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </>
              ) : (
                // Vista de documentos dentro de una carpeta
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBackToFolders}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver a Carpetas
                    </Button>
                    <h3 className="text-lg font-semibold">
                      Documentos en: {getSelectedFolderName()}
                    </h3>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Button variant="outline" onClick={() => setIsAddDocumentOpen(true)}>
                      <FileUp className="mr-2 h-4 w-4" />
                      Subir Documento
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
                      <h3 className="text-lg font-semibold">Cargando documentos</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Por favor espere mientras cargamos los documentos...
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedFolder && getDocumentsInFolder(selectedFolder).length > 0 ? (
                        getDocumentsInFolder(selectedFolder).map(document => (
                          <Card key={document.id} className="hover:shadow-md transition-shadow relative group">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-5 w-5 text-green-500" />
                                  <span className="font-medium">{document.name}</span>
                                </div>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => handleDownloadDocument(document.id, document.name)}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Descargar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => confirmDelete('document', document.id, document.name)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              {document.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {document.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'Sin fecha'}
                                </p>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleDownloadDocument(document.id, document.name)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors col-span-full">
                          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No hay documentos en esta carpeta
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setIsAddDocumentOpen(true)}
                            >
                              Subir primer documento
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog para crear carpetas */}
      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onCreateFolder={handleCreateFolder}
        defaultCategory={activeTab as DocumentCategory}
      />

      {/* Dialog para subir documentos */}
      <AddDocumentDialog
        open={isAddDocumentOpen}
        onOpenChange={setIsAddDocumentOpen}
        folders={folders.filter(folder => folder.category === activeTab)}
        onAddDocument={handleAddDocument}
        defaultFolderId={showDocuments ? selectedFolder || undefined : undefined}
      />

      {/* Confirmación de eliminación */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'folder' 
                ? `¿Estás seguro de que deseas eliminar la carpeta "${itemToDelete.name}"? Esta acción eliminará también todos los documentos que contiene y no se puede deshacer.`
                : `¿Estás seguro de que deseas eliminar el documento "${itemToDelete?.name}"? Esta acción no se puede deshacer.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {itemToDelete?.type === 'folder' ? 'Eliminar carpeta' : 'Eliminar documento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DocumentManagerGeneric
