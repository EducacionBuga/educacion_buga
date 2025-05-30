"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { DocumentCategory, Document, Folder, FolderColor } from "@/types/documents"

export function useDocumentStore() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    const storedFolders = localStorage.getItem("folders")
    const storedDocuments = localStorage.getItem("documents")

    if (storedFolders) {
      setFolders(JSON.parse(storedFolders))
    }

    if (storedDocuments) {
      setDocuments(JSON.parse(storedDocuments))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders))
  }, [folders])

  useEffect(() => {
    localStorage.setItem("documents", JSON.stringify(documents))
  }, [documents])

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
