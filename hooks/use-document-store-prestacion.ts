"use client"

import { useState, useEffect } from "react"
import type { Folder, Document, DocumentCategory, FolderColor } from "@/types/documents"

export function useDocumentStorePrestacion() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const loadData = () => {
      try {
        const storedFolders = localStorage.getItem("prestacion-servicio-folders")
        const storedDocuments = localStorage.getItem("prestacion-servicio-documents")

        if (storedFolders) {
          try {
            setFolders(JSON.parse(storedFolders))
          } catch (error) {
            console.error("Error al analizar carpetas:", error)
          }
        }

        if (storedDocuments) {
          try {
            setDocuments(JSON.parse(storedDocuments))
          } catch (error) {
            console.error("Error al analizar documentos:", error)
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Simular carga de datos
    const timer = setTimeout(() => {
      loadData()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("prestacion-servicio-folders", JSON.stringify(folders))
    }
  }, [folders, isLoading])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("prestacion-servicio-documents", JSON.stringify(documents))
    }
  }, [documents, isLoading])

  // Agregar una nueva carpeta
  const addFolder = (folderData: {
    name: string
    date: string
    category: DocumentCategory
    color: string
  }) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: folderData.name,
      date: folderData.date,
      category: folderData.category,
      color: folderData.color as FolderColor,
      documentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setFolders((prev) => [...prev, newFolder])
    return newFolder // Devolver la carpeta creada para poder seleccionarla
  }

  // Actualizar una carpeta existente
  const updateFolder = (folderId: string, folderData: Partial<Folder>) => {
    setFolders((prev) =>
      prev.map((folder) => {
        if (folder.id === folderId) {
          return {
            ...folder,
            ...folderData,
            updatedAt: new Date().toISOString(),
          }
        }
        return folder
      }),
    )
  }

  // Eliminar una carpeta
  const deleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((folder) => folder.id !== folderId))
  }

  // Agregar un nuevo documento
  const addDocument = (documentData: {
    name: string
    description: string
    folderId: string
    file: File
  }) => {
    // Convertir el archivo a una URL de datos (base64)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        const newDocument: Document = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: documentData.name,
          description: documentData.description || "",
          folderId: documentData.folderId,
          fileUrl: e.target.result as string,
          fileType: documentData.file.type,
          fileSize: documentData.file.size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        setDocuments((prev) => [...prev, newDocument])

        // Actualizar el contador de documentos en la carpeta
        const folder = folders.find((f) => f.id === documentData.folderId)
        if (folder) {
          updateFolder(folder.id, {
            documentCount: (folder.documentCount || 0) + 1,
          })
        }
      }
    }

    reader.readAsDataURL(documentData.file)
  }

  // Eliminar un documento
  const deleteDocument = (documentId: string) => {
    const document = documents.find((d) => d.id === documentId)

    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))

    // Actualizar el contador de documentos en la carpeta
    if (document) {
      const folder = folders.find((f) => f.id === document.folderId)
      if (folder && folder.documentCount && folder.documentCount > 0) {
        updateFolder(folder.id, {
          documentCount: folder.documentCount - 1,
        })
      }
    }
  }

  return {
    folders,
    documents,
    isLoading,
    addFolder,
    updateFolder,
    deleteFolder,
    addDocument,
    deleteDocument,
  }
}
