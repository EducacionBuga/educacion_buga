"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FolderList } from "./folder-list"
import { DocumentList } from "./document-list"
import { CreateFolderDialog } from "./create-folder-dialog"
import { AddDocumentDialog } from "./add-document-dialog"
import { useDocumentStore } from "@/hooks/use-document-store"
import { toast } from "@/components/ui/use-toast"
import type { Folder, Document, DocumentCategory } from "@/types/documents"
import { FolderPlus, FileUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DocumentManagerProps {
  title: string
  description?: string
  icon: React.ReactNode
  color?: "blue" | "green" | "orange" | "purple" | "default"
  moduleId: string
}

export function DocumentManager({ title, description, icon, color = "default", moduleId }: DocumentManagerProps) {
  const [activeTab, setActiveTab] = useState<DocumentCategory>("preContractual")
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false)

  const { folders, documents, createFolder, updateFolder, addDocument, removeDocument, isLoading } =
    useDocumentStore(moduleId)

  const filteredFolders = folders.filter((folder) => folder.category === activeTab)

  const handleCreateFolder = (newFolder: Omit<Folder, "id">) => {
    try {
      createFolder({
        ...newFolder,
        id: `folder-${Date.now()}`,
      })
      toast({
        title: "Carpeta creada",
        description: `La carpeta "${newFolder.name}" ha sido creada exitosamente.`,
      })
      setIsCreateFolderOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la carpeta. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder)
  }

  const handleBackToFolders = () => {
    setSelectedFolder(null)
  }

  const handleAddDocument = (document: Omit<Document, "id">) => {
    try {
      const newDocument = {
        ...document,
        id: `doc-${Date.now()}`,
      }

      addDocument(newDocument)

      toast({
        title: "Documento añadido",
        description: `El documento "${document.name}" ha sido añadido exitosamente.`,
      })
      setIsAddDocumentOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir el documento. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveDocument = (documentId: string) => {
    try {
      removeDocument(documentId)
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "green":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "orange":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "purple":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  return (
    <TooltipProvider>
      <Card className="dashboard-card overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${getColorClasses()}`}>{icon}</div>
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedFolder ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Carpetas de documentos</h3>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => setIsAddDocumentOpen(true)} variant="outline">
                        <FileUp className="mr-2 h-4 w-4" />
                        Agregar Documento
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sube un documento directamente a una carpeta existente</p>
                    </TooltipContent>
                  </Tooltip>

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
                </div>
              </div>

              <Tabs
                defaultValue="preContractual"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as DocumentCategory)}
              >
                <TabsList className="mb-4 w-full justify-start">
                  <TabsTrigger value="preContractual" className="flex-1 sm:flex-none">
                    Documentos Pre Contractuales
                  </TabsTrigger>
                  <TabsTrigger value="execution" className="flex-1 sm:flex-none">
                    Ejecución Contractual
                  </TabsTrigger>
                  <TabsTrigger value="closure" className="flex-1 sm:flex-none">
                    Cierre Contractual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  <FolderList folders={filteredFolders} onSelectFolder={handleFolderSelect} isLoading={isLoading} />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <DocumentList
              folder={selectedFolder}
              documents={documents.filter((doc) => doc.folderId === selectedFolder.id)}
              onBack={handleBackToFolders}
              onAddDocument={handleAddDocument}
              onRemoveDocument={handleRemoveDocument}
            />
          )}
        </CardContent>

        <CreateFolderDialog
          open={isCreateFolderOpen}
          onOpenChange={setIsCreateFolderOpen}
          onCreateFolder={handleCreateFolder}
          defaultCategory={activeTab}
        />

        <AddDocumentDialog
          open={isAddDocumentOpen}
          onOpenChange={setIsAddDocumentOpen}
          onAddDocument={handleAddDocument}
          folders={folders}
          activeCategory={activeTab}
        />
      </Card>
    </TooltipProvider>
  )
}
