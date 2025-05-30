"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FolderList } from "./folder-list"
import { DocumentList } from "./document-list"
import { CreateFolderDialog } from "./create-folder-dialog"
import { AddDocumentDialog } from "./add-document-dialog"
import { toast } from "@/components/ui/use-toast"
import type { Folder, Document, DocumentCategory } from "@/types/documents"
import { FolderPlus, FileUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SupabaseService } from "@/lib/supabase-service"
import { useAuth } from "@/context/auth-context"

interface DocumentManagerProps {
  title: string
  description?: string
  icon: React.ReactNode
  color?: "blue" | "green" | "orange" | "purple" | "default"
  moduleId: string
  areaId: string
}

export function DocumentManager({
  title,
  description,
  icon,
  color = "default",
  moduleId,
  areaId,
}: DocumentManagerProps) {
  const [activeTab, setActiveTab] = useState<DocumentCategory>("preContractual")
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Cargar carpetas y documentos desde Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Cargar carpetas
        const { data: foldersData, error: foldersError } = await SupabaseService.read<Folder>("carpetas", {
          filters: {
            area_id: areaId,
            modulo: moduleId,
          },
        })

        if (foldersError) throw new Error(foldersError.message)

        if (foldersData) {
          setFolders(foldersData)

          // Si hay carpetas, cargar documentos
          if (foldersData.length > 0) {
            const folderIds = foldersData.map((folder) => folder.id)

            const { data: documentsData, error: documentsError } = await SupabaseService.read<Document>("documentos", {
              filters: {
                carpeta_id: { in: folderIds },
                estado: "activo",
              },
            })

            if (documentsError) throw new Error(documentsError.message)

            if (documentsData) {
              setDocuments(documentsData)
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos. Intente nuevamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Suscribirse a cambios en tiempo real
    const unsubscribeFolders = SupabaseService.subscribeToChanges("carpetas", (payload) => {
      if (payload.new && payload.new.area_id === areaId && payload.new.modulo === moduleId) {
        if (payload.eventType === "INSERT") {
          setFolders((prev) => [...prev, payload.new])
        } else if (payload.eventType === "UPDATE") {
          setFolders((prev) => prev.map((folder) => (folder.id === payload.new.id ? payload.new : folder)))
        } else if (payload.eventType === "DELETE") {
          setFolders((prev) => prev.filter((folder) => folder.id !== payload.old.id))
        }
      }
    })

    const unsubscribeDocuments = SupabaseService.subscribeToChanges("documentos", (payload) => {
      const folderIds = folders.map((folder) => folder.id)

      if (payload.new && folderIds.includes(payload.new.carpeta_id)) {
        if (payload.eventType === "INSERT") {
          setDocuments((prev) => [...prev, payload.new])
        } else if (payload.eventType === "UPDATE") {
          setDocuments((prev) => prev.map((doc) => (doc.id === payload.new.id ? payload.new : doc)))
        } else if (payload.eventType === "DELETE") {
          setDocuments((prev) => prev.filter((doc) => doc.id !== payload.old.id))
        }
      }
    })

    return () => {
      unsubscribeFolders()
      unsubscribeDocuments()
    }
  }, [areaId, moduleId])

  const handleCreateFolder = async (newFolder: Omit<Folder, "id">) => {
    try {
      if (!user) throw new Error("Usuario no autenticado")

      const { data, error } = await SupabaseService.create<Folder>("carpetas", {
        nombre: newFolder.name,
        descripcion: newFolder.description || "",
        color: newFolder.color,
        categoria: activeTab,
        area_id: areaId,
        modulo: moduleId,
        creado_por: user.id,
      })

      if (error) throw new Error(error.message)

      toast({
        title: "Carpeta creada",
        description: `La carpeta "${newFolder.name}" ha sido creada exitosamente.`,
      })

      setIsCreateFolderOpen(false)
    } catch (error) {
      console.error("Error creating folder:", error)
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

  const handleAddDocument = async (document: Omit<Document, "id">) => {
    setIsAddDocumentOpen(false)
    // La subida real se maneja en el componente DocumentUploader
  }

  const handleRemoveDocument = async (documentId: string) => {
    try {
      // Actualizar estado del documento a 'eliminado' en lugar de borrarlo
      const { error } = await SupabaseService.update("documentos", documentId, {
        estado: "eliminado",
      })

      if (error) throw new Error(error.message)

      // Actualizar estado local
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))

      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado exitosamente.",
      })
    } catch (error) {
      console.error("Error removing document:", error)
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

  const filteredFolders = folders.filter((folder) => folder.categoria === activeTab)

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
              onAddDocument={() => setIsAddDocumentOpen(true)}
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
          areaId={areaId}
          moduleId={moduleId}
        />
      </Card>
    </TooltipProvider>
  )
}
