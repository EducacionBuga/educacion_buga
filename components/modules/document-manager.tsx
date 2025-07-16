"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderPlus, Upload, Folder } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CreateFolderDialog } from "@/components/providers/create-folder-dialog"
import { EditFolderDialog } from "@/components/providers/edit-folder-dialog"
import { AddDocumentDialog } from "@/components/providers/add-document-dialog"
import { FolderList } from "@/components/providers/folder-list"
import { DocumentList } from "@/components/providers/document-list"
import { useDocumentStore } from "@/hooks/use-document-store"
import type { DocumentCategory, Folder as FolderType, FolderColor } from "@/types/documents"

export function DocumentManager() {
  const [activeTab, setActiveTab] = useState<DocumentCategory>("preContractual")
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false)
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [folderToEdit, setFolderToEdit] = useState<FolderType | null>(null)
  const { toast } = useToast()

  const { folders, documents, addFolder, updateFolder, deleteFolder, addDocument, deleteDocument } = useDocumentStore()

  const filteredFolders = folders.filter((folder) => folder.category === activeTab)

  const selectedFolder = selectedFolderId ? folders.find((folder) => folder.id === selectedFolderId) : null
  const filteredDocuments = selectedFolderId ? documents.filter((doc) => doc.folderId === selectedFolderId) : []

  const handleCreateFolder = (folderData: {
    name: string
    date: string
    category: DocumentCategory
    color: string
  }) => {
    const newFolder = addFolder(folderData)

    // Navegar automáticamente a la categoría donde se creó la carpeta
    setActiveTab(folderData.category)

    // Cerrar el diálogo
    setIsCreateFolderOpen(false)

    // Mostrar mensaje de éxito
    toast({
      title: "Carpeta creada",
      description: `La carpeta "${folderData.name}" ha sido creada exitosamente.`,
    })

    // Pequeño retraso para asegurar que la UI se actualice correctamente
    setTimeout(() => {
      // Seleccionar la carpeta recién creada
      setSelectedFolderId(newFolder.id)
    }, 100)
  }

  const handleEditFolder = (folder: FolderType) => {
    setFolderToEdit(folder)
    setIsEditFolderOpen(true)
  }

  const handleUpdateFolder = (
    folderId: string,
    folderData: {
      name: string
      date: string
      color: FolderColor
    },
  ) => {
    updateFolder(folderId, folderData)

    toast({
      title: "Carpeta actualizada",
      description: `La carpeta "${folderData.name}" ha sido actualizada exitosamente.`,
    })
  }

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId)

    if (selectedFolderId === folderId) {
      setSelectedFolderId(null)
    }

    const folder = folders.find((f) => f.id === folderId)
    if (folder) {
      toast({
        title: "Carpeta eliminada",
        description: `La carpeta "${folder.name}" ha sido eliminada exitosamente.`,
      })
    }
  }

  const handleAddDocument = (documentData: {
    name: string
    description: string
    folderId: string
    file: File
  }) => {
    // Añadir el documento
    addDocument(documentData)

    // Cerrar el diálogo
    setIsAddDocumentOpen(false)

    // Encontrar la carpeta donde se añadió el documento
    const targetFolder = folders.find((f) => f.id === documentData.folderId)

    if (targetFolder) {
      // Navegar a la categoría de la carpeta
      setActiveTab(targetFolder.category)

      // Seleccionar la carpeta donde se añadió el documento
      setSelectedFolderId(targetFolder.id)
    }

    // Mostrar mensaje de éxito
    toast({
      title: "Documento agregado",
      description: `El documento "${documentData.name}" ha sido agregado exitosamente.`,
    })
  }

  const handleDeleteDocument = (documentId: string, documentName: string) => {
    if (confirm(`¿Está seguro que desea eliminar el documento "${documentName}"?`)) {
      deleteDocument(documentId)

      toast({
        title: "Documento eliminado",
        description: `El documento "${documentName}" ha sido eliminado exitosamente.`,
      })
    }
  }

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId === selectedFolderId ? null : folderId)
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Gestión de Documentos</h1>
          <p className="text-muted-foreground">Administra los documentos de tu sistema educativo.</p>
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setIsCreateFolderOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Nueva Carpeta
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Crea una nueva carpeta para organizar documentos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => setIsAddDocumentOpen(true)} disabled={folders.length === 0}>
                  <Upload className="mr-2 h-4 w-4" />
                  Agregar Documento
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sube un documento directamente a una carpeta existente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="preContractual" className="text-xs">Documentos Pre Contractuales</TabsTrigger>
              <TabsTrigger value="execution" className="text-xs">Documentos de Ejecución Contractual</TabsTrigger>
              <TabsTrigger value="closure" className="text-xs">Documentos de Cierre Contractual</TabsTrigger>
            </TabsList>

            <TabsContent value="preContractual" className="mt-0 space-y-6">
              {filteredFolders.length > 0 ? (
                <FolderList
                  folders={filteredFolders}
                  onSelectFolder={handleSelectFolder}
                  selectedFolderId={selectedFolderId}
                  onEditFolder={handleEditFolder}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Folder className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay carpetas</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    No se encontraron carpetas para documentos pre contractuales. Cree una carpeta para comenzar.
                  </p>
                  <Button onClick={() => setIsCreateFolderOpen(true)} className="mt-4">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Nueva Carpeta
                  </Button>
                </div>
              )}

              {selectedFolder && (
                <div className="mt-8 border-t pt-6">
                  <DocumentList
                    folder={selectedFolder}
                    documents={filteredDocuments}
                    onDeleteDocument={handleDeleteDocument}
                    onAddDocument={() => setIsAddDocumentOpen(true)}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="execution" className="mt-0 space-y-6">
              {filteredFolders.length > 0 ? (
                <FolderList
                  folders={filteredFolders}
                  onSelectFolder={handleSelectFolder}
                  selectedFolderId={selectedFolderId}
                  onEditFolder={handleEditFolder}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Folder className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay carpetas</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    No se encontraron carpetas para documentos de ejecución contractual. Cree una carpeta para comenzar.
                  </p>
                  <Button onClick={() => setIsCreateFolderOpen(true)} className="mt-4">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Nueva Carpeta
                  </Button>
                </div>
              )}

              {selectedFolder && (
                <div className="mt-8 border-t pt-6">
                  <DocumentList
                    folder={selectedFolder}
                    documents={filteredDocuments}
                    onDeleteDocument={handleDeleteDocument}
                    onAddDocument={() => setIsAddDocumentOpen(true)}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="closure" className="mt-0 space-y-6">
              {filteredFolders.length > 0 ? (
                <FolderList
                  folders={filteredFolders}
                  onSelectFolder={handleSelectFolder}
                  selectedFolderId={selectedFolderId}
                  onEditFolder={handleEditFolder}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Folder className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay carpetas</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    No se encontraron carpetas para documentos de cierre contractual. Cree una carpeta para comenzar.
                  </p>
                  <Button onClick={() => setIsCreateFolderOpen(true)} className="mt-4">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Nueva Carpeta
                  </Button>
                </div>
              )}

              {selectedFolder && (
                <div className="mt-8 border-t pt-6">
                  <DocumentList
                    folder={selectedFolder}
                    documents={filteredDocuments}
                    onDeleteDocument={handleDeleteDocument}
                    onAddDocument={() => setIsAddDocumentOpen(true)}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onCreateFolder={handleCreateFolder}
        defaultCategory={activeTab}
      />

      <EditFolderDialog
        open={isEditFolderOpen}
        onOpenChange={setIsEditFolderOpen}
        folder={folderToEdit}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <AddDocumentDialog
        open={isAddDocumentOpen}
        onOpenChange={setIsAddDocumentOpen}
        folders={folders}
        onAddDocument={handleAddDocument}
        defaultFolderId={selectedFolderId}
      />
    </div>
  )
}
