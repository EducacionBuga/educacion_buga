"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { DocumentCategory, Document, Folder, FolderColor } from "@/types/documents"

export type AreaId = "calidad-educativa" | "inspeccion-vigilancia" | "cobertura-infraestructura" | "talento-humano"
export type ModuleType = "proveedores" | "prestacion-servicio"

export function useDocumentStoreGeneric(areaId: AreaId, moduleType: ModuleType) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar datos de Supabase al iniciar
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log(`Fetching data for area: ${areaId}, module: ${moduleType}`)

        // Cargar carpetas
        const foldersResponse = await fetch(`/api/folders?areaId=${areaId}&moduleType=${moduleType}`)
        console.log("Folders response status:", foldersResponse.status)

        if (!foldersResponse.ok) {
          // Clonar la respuesta antes de leerla
          const foldersResponseClone = foldersResponse.clone()

          let errorMessage = `Error fetching folders: ${foldersResponse.status}`
          try {
            const errorData = await foldersResponse.json()
            errorMessage += ` - ${JSON.stringify(errorData)}`
          } catch (e) {
            // Si no es JSON, intentar obtener el texto de la respuesta clonada
            const errorText = await foldersResponseClone.text()
            errorMessage += ` - ${errorText}`
          }
          console.error("Folders error response:", errorMessage)
          throw new Error(errorMessage)
        }

        const foldersData = await foldersResponse.json()
        console.log("Folders data:", foldersData)
        
        // La respuesta híbrida tiene estructura: { success: true, folders: [...] }
        if (foldersData.success && Array.isArray(foldersData.folders)) {
          setFolders(foldersData.folders)
        } else {
          setFolders(Array.isArray(foldersData) ? foldersData : [])
        }

        // Cargar documentos
        const documentsResponse = await fetch(`/api/documents?areaId=${areaId}&moduleType=${moduleType}`)
        console.log("Documents response status:", documentsResponse.status)

        if (!documentsResponse.ok) {
          // Clonar la respuesta antes de leerla
          const documentsResponseClone = documentsResponse.clone()

          let errorMessage = `Warning fetching documents: ${documentsResponse.status}`
          try {
            const errorData = await documentsResponse.json()
            errorMessage += ` - ${JSON.stringify(errorData)}`
          } catch (e) {
            // Si no es JSON, intentar obtener el texto de la respuesta clonada
            const errorText = await documentsResponseClone.text()
            errorMessage += ` - ${errorText}`
          }
          console.warn(errorMessage)
          setDocuments([])
        } else {
          const documentsData = await documentsResponse.json()
          console.log("Documents data:", documentsData)
          
          // La respuesta híbrida tiene estructura: { success: true, documents: [...] }
          if (documentsData.success && Array.isArray(documentsData.documents)) {
            setDocuments(documentsData.documents)
          } else {
            setDocuments(Array.isArray(documentsData) ? documentsData : [])
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        const errorMessage = error instanceof Error ? error.message : "Error al cargar los datos. Intente de nuevo."
        setError(errorMessage)
        toast({
          title: "Error al cargar datos",
          description: errorMessage,
          variant: "destructive",
        })
        // En caso de error, usar datos vacíos para que la interfaz funcione
        setFolders([])
        setDocuments([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [areaId, moduleType, toast])

  const addFolder = async (folderData: {
    name: string
    date: string
    category: DocumentCategory
    color: string
  }): Promise<Folder | null> => {
    setLoading(true)
    setError(null)

    try {
      console.log("Adding folder:", folderData)

      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...folderData,
          areaId,
          moduleType,
        }),
      })

      console.log("Add folder response status:", response.status)

      if (!response.ok) {
        // Clonar la respuesta antes de leerla
        const responseClone = response.clone()

        let errorMessage = `Error creating folder: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage += ` - ${JSON.stringify(errorData)}`
        } catch (e) {
          // Si no es JSON, intentar obtener el texto de la respuesta clonada
          const errorText = await responseClone.text()
          errorMessage += ` - ${errorText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("New folder result:", result)
      
      // La respuesta híbrida tiene estructura: { success: true, folder: {...} }
      const newFolder = result.success ? result.folder : result
      setFolders((prevFolders) => [...prevFolders, newFolder])

      toast({
        title: "Carpeta creada",
        description: `La carpeta "${newFolder.name}" ha sido creada exitosamente.`,
      })

      return newFolder
    } catch (error) {
      console.error("Error creating folder:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al crear la carpeta. Intente de nuevo."
      setError(errorMessage)
      toast({
        title: "Error al crear carpeta",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateFolder = async (
    folderId: string,
    folderData: {
      name: string
      date: string
      color: FolderColor
    },
  ): Promise<Folder | null> => {
    setLoading(true)
    setError(null)

    try {
      console.log("Updating folder:", folderId, folderData)

      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...folderData,
          areaId,
          moduleType,
        }),
      })

      console.log("Update folder response status:", response.status)

      if (!response.ok) {
        // Clonar la respuesta antes de leerla
        const responseClone = response.clone()

        let errorMessage = `Error updating folder: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage += ` - ${JSON.stringify(errorData)}`
        } catch (e) {
          // Si no es JSON, intentar obtener el texto de la respuesta clonada
          const errorText = await responseClone.text()
          errorMessage += ` - ${errorText}`
        }
        throw new Error(errorMessage)
      }

      const updatedFolder = await response.json()
      console.log("Updated folder:", updatedFolder)
      setFolders((prevFolders) => prevFolders.map((folder) => (folder.id === folderId ? updatedFolder : folder)))

      toast({
        title: "Carpeta actualizada",
        description: `La carpeta "${updatedFolder.name}" ha sido actualizada exitosamente.`,
      })

      return updatedFolder
    } catch (error) {
      console.error("Error updating folder:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar la carpeta. Intente de nuevo."
      setError(errorMessage)
      toast({
        title: "Error al actualizar carpeta",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteFolder = async (folderId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      console.log("Deleting folder:", folderId)

      const response = await fetch(`/api/folders/${folderId}?areaId=${areaId}&moduleType=${moduleType}`, {
        method: "DELETE",
      })

      console.log("Delete folder response status:", response.status)

      if (!response.ok) {
        // Clonar la respuesta antes de leerla
        const responseClone = response.clone()

        let errorMessage = `Error deleting folder: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage += ` - ${JSON.stringify(errorData)}`
        } catch (e) {
          // Si no es JSON, intentar obtener el texto de la respuesta clonada
          const errorText = await responseClone.text()
          errorMessage += ` - ${errorText}`
        }
        throw new Error(errorMessage)
      }

      // Actualizar el estado local de forma más robusta
      setFolders((prevFolders) => {
        const newFolders = prevFolders.filter((folder) => folder.id !== folderId)
        console.log(`Folders updated: ${prevFolders.length} -> ${newFolders.length}`)
        return newFolders
      })
      
      setDocuments((prevDocuments) => {
        const newDocuments = prevDocuments.filter((doc) => doc.folderId !== folderId)
        console.log(`Documents updated after folder deletion: ${prevDocuments.length} -> ${newDocuments.length}`)
        return newDocuments
      })

      toast({
        title: "Carpeta eliminada",
        description: "La carpeta ha sido eliminada exitosamente.",
      })

      return true
    } catch (error) {
      console.error("Error deleting folder:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar la carpeta. Intente de nuevo."
      setError(errorMessage)
      toast({
        title: "Error al eliminar carpeta",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      // Asegurar que setLoading siempre se ejecute con un pequeño delay
      setTimeout(() => {
        setLoading(false)
      }, 100)
    }
  }

  const addDocument = async (documentData: {
    name: string
    description: string
    folderId: string
    file: File
  }): Promise<Document | null> => {
    setLoading(true)
    setError(null)

    try {
      console.log("Adding document:", documentData.name, "to folder:", documentData.folderId)

      // Preparar FormData para la subida
      const formData = new FormData()
      formData.append("file", documentData.file)
      formData.append("areaId", areaId)
      formData.append("moduleType", moduleType)
      formData.append("folderId", documentData.folderId)
      formData.append("name", documentData.name)
      formData.append("description", documentData.description || "")

      // Enviar archivo mediante la API
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      console.log("Add document response status:", response.status)

      if (!response.ok) {
        // Clonar la respuesta antes de leerla
        const responseClone = response.clone()

        let errorMessage = `Error uploading document: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage += ` - ${JSON.stringify(errorData)}`
        } catch (e) {
          // Si no es JSON, intentar obtener el texto de la respuesta clonada
          const errorText = await responseClone.text()
          errorMessage += ` - ${errorText}`
        }
        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      console.log("Add document response:", responseData)
      
      // Handle new response format with success and document fields
      const newDocument = responseData.document || responseData
      setDocuments((prevDocuments) => [...prevDocuments, newDocument])

      toast({
        title: "Documento subido",
        description: `El documento "${newDocument.name}" ha sido subido exitosamente.`,
      })

      return newDocument
    } catch (error) {
      console.error("Error uploading document:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al subir el documento. Intente de nuevo."
      setError(errorMessage)
      toast({
        title: "Error al subir documento",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      console.log("Deleting document:", documentId)

      const document = documents.find((doc) => doc.id === documentId)
      if (!document) {
        throw new Error("Documento no encontrado")
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

      console.log("Delete document response status:", response.status)

      if (!response.ok) {
        let errorMessage = `Error deleting document: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage += ` - ${JSON.stringify(errorData)}`
        } catch (e) {
          // Si no es JSON, intentar obtener el texto
          const errorText = await response.text()
          errorMessage += ` - ${errorText}`
        }
        throw new Error(errorMessage)
      }

      // Actualizar el estado local de forma más robusta
      setDocuments((prevDocuments) => {
        const newDocuments = prevDocuments.filter((doc) => doc.id !== documentId)
        console.log(`Documents updated: ${prevDocuments.length} -> ${newDocuments.length}`)
        return newDocuments
      })

      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado exitosamente.",
      })

      return true
    } catch (error) {
      console.error("Error deleting document:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el documento. Intente de nuevo."
      setError(errorMessage)
      toast({
        title: "Error al eliminar documento",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      // Asegurar que setLoading siempre se ejecute con un pequeño delay
      setTimeout(() => {
        setLoading(false)
      }, 100)
    }
  }

  const downloadDocument = async (documentId: string): Promise<string | null> => {
    try {
      const document = documents.find((doc) => doc.id === documentId)
      if (!document || !document.filePath) {
        throw new Error("Documento no encontrado o sin ruta de archivo")
      }

      const response = await fetch(`/api/documents/download?path=${encodeURIComponent(document.filePath)}`)
      
      if (!response.ok) {
        throw new Error(`Error al generar URL de descarga: ${response.status}`)
      }

      const { fileUrl } = await response.json()
      return fileUrl
    } catch (error) {
      console.error("Error downloading document:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al descargar el documento."
      toast({
        title: "Error al descargar",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }

  return {
    folders,
    documents,
    loading,
    error,
    addFolder,
    updateFolder,
    deleteFolder,
    addDocument,
    deleteDocument,
    downloadDocument,
  }
}
