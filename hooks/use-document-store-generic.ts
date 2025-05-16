"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { DocumentCategory, Document, Folder, FolderColor } from "@/types/documents"

export type AreaId = "calidad-educativa" | "inspeccion-vigilancia" | "cobertura-infraestructura" | "talento-humano"
export type ModuleType = "proveedores" | "prestacion-servicio"

export function useDocumentStoreGeneric(areaId: AreaId, moduleType: ModuleType) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const storedFolders = localStorage.getItem(`${areaId}-${moduleType}-folders`)
    const storedDocuments = localStorage.getItem(`${areaId}-${moduleType}-documents`)

    if (storedFolders) {
      try {
        setFolders(JSON.parse(storedFolders))
      } catch (error) {
        console.error("Error parsing stored folders:", error)
      }
    }

    if (storedDocuments) {
      try {
        setDocuments(JSON.parse(storedDocuments))
      } catch (error) {
        console.error("Error parsing stored documents:", error)
      }
    }
  }, [areaId, moduleType])

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(`${areaId}-${moduleType}-folders`, JSON.stringify(folders))
  }, [folders, areaId, moduleType])

  useEffect(() => {
    localStorage.setItem(`${areaId}-${moduleType}-documents`, JSON.stringify(documents))
  }, [documents, areaId, moduleType])

  const addFolder = (folderData: {
    name: string
    date: string
    category: DocumentCategory
    color: string
  }): Folder => {
    const newFolder: Folder = {
      id: uuidv4(),
      name: folderData.name,
      date: folderData.date,
      category: folderData.category,
      color: folderData.color as FolderColor,
    }

    setFolders((prevFolders) => [...prevFolders, newFolder])
    return newFolder
  }

  const updateFolder = (
    folderId: string,
    folderData: {
      name: string
      date: string
      color: FolderColor
    },
  ) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              name: folderData.name,
              date: folderData.date,
              color: folderData.color,
            }
          : folder,
      ),
    )
  }

  const deleteFolder = (folderId: string) => {
    setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== folderId))
  }

  const addDocument = (documentData: {
    name: string
    description: string
    folderId: string
    file: File
  }): Document => {
    // Crear una URL para el archivo
    const fileUrl = URL.createObjectURL(documentData.file)

    const newDocument: Document = {
      id: uuidv4(),
      name: documentData.name,
      description: documentData.description,
      folderId: documentData.folderId,
      fileUrl: fileUrl,
      fileName: documentData.file.name,
      fileType: documentData.file.type,
      fileSize: documentData.file.size,
      uploadDate: new Date().toISOString(),
    }

    setDocuments((prevDocuments) => [...prevDocuments, newDocument])
    return newDocument
  }

  const deleteDocument = (documentId: string) => {
    // Encontrar el documento para liberar la URL del objeto
    const document = documents.find((doc) => doc.id === documentId)
    if (document && document.fileUrl) {
      URL.revokeObjectURL(document.fileUrl)
    }

    setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== documentId))
  }

  return {
    folders,
    documents,
    addFolder,
    updateFolder,
    deleteFolder,
    addDocument,
    deleteDocument,
  }
}
