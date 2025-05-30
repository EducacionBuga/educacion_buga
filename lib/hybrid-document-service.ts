import { v4 as uuidv4 } from "uuid"
import { uploadR2Document, deleteR2Document } from "./r2-document-service"
import { createAdminClient } from "./supabase-client"
import type { AreaId, ModuleType } from "@/hooks/use-document-store-generic"

export interface HybridDocument {
  id: string
  name: string
  description?: string
  fileType: string
  fileSize: number
  filePath: string
  fileUrl: string
  folderId: string
  areaId: string
  moduleType: string
  createdAt: string
  updatedAt: string
}

export interface HybridFolder {
  id: string
  name: string
  description?: string
  color: string
  category: string
  date: string
  areaId: string
  moduleType: string
  createdAt: string
  updatedAt: string
}

// Service for hybrid document management (R2 + Supabase)
export class HybridDocumentService {
  private static supabase = createAdminClient()

  // Create folder in Supabase and R2
  static async createFolder(data: {
    name: string
    description?: string
    color: string
    category: string
    date: string
    areaId: AreaId
    moduleType: ModuleType
  }): Promise<HybridFolder> {
    const folderId = uuidv4()
    const folderData: HybridFolder = {
      id: folderId,
      name: data.name,
      description: data.description || "",
      color: data.color,
      category: data.category,
      date: data.date,
      areaId: data.areaId,
      moduleType: data.moduleType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save folder metadata to Supabase
    const { error } = await this.supabase
      .from("carpetas")
      .insert({
        id: folderData.id,
        nombre: folderData.name,
        descripcion: folderData.description,
        color: folderData.color,
        categoria: folderData.category,
        fecha: folderData.date,
        area_id: folderData.areaId,
        modulo: folderData.moduleType,
        created_at: folderData.createdAt,
        updated_at: folderData.updatedAt,
      })

    if (error) {
      console.error("Error creating folder in Supabase:", error)
      throw new Error(`Error creating folder: ${error.message}`)
    }

    console.log(`Folder created successfully: ${folderData.id}`)
    return folderData
  }

  // List folders from Supabase
  static async listFolders(areaId: AreaId, moduleType: ModuleType): Promise<HybridFolder[]> {
    const { data, error } = await this.supabase
      .from("carpetas")
      .select("*")
      .eq("area_id", areaId)
      .eq("modulo", moduleType)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error listing folders from Supabase:", error)
      throw new Error(`Error listing folders: ${error.message}`)
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.nombre,
      description: row.descripcion || "",
      color: row.color,
      category: row.categoria,
      date: row.fecha,
      areaId: row.area_id,
      moduleType: row.modulo,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  // Update folder in Supabase
  static async updateFolder(
    folderId: string,
    updates: Partial<{
      name: string
      description: string
      color: string
      category: string
      date: string
    }>
  ): Promise<HybridFolder> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.name) updateData.nombre = updates.name
    if (updates.description) updateData.descripcion = updates.description
    if (updates.color) updateData.color = updates.color
    if (updates.category) updateData.categoria = updates.category
    if (updates.date) updateData.fecha = updates.date

    const { data, error } = await this.supabase
      .from("carpetas")
      .update(updateData)
      .eq("id", folderId)
      .select()
      .single()

    if (error) {
      console.error("Error updating folder in Supabase:", error)
      throw new Error(`Error updating folder: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.nombre,
      description: data.descripcion || "",
      color: data.color,
      category: data.categoria,
      date: data.fecha,
      areaId: data.area_id,
      moduleType: data.modulo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  // Delete folder from Supabase and R2
  static async deleteFolder(folderId: string): Promise<void> {
    // First, delete all documents in this folder
    await this.deleteDocumentsByFolder(folderId)

    // Then delete the folder from Supabase
    const { error } = await this.supabase.from("carpetas").delete().eq("id", folderId)

    if (error) {
      console.error("Error deleting folder from Supabase:", error)
      throw new Error(`Error deleting folder: ${error.message}`)
    }

    console.log(`Folder deleted successfully: ${folderId}`)
  }
  // Upload document to R2 and save metadata to Supabase
  static async uploadDocument(data: {
    name: string
    description?: string
    file: File
    folderId: string
    areaId: AreaId
    moduleType: ModuleType
  }): Promise<HybridDocument> {
    // Upload file to R2
    const r2Document = await uploadR2Document(
      data.file,
      data.areaId,
      data.moduleType,
      {
        name: data.name,
        description: data.description || "",
        folderId: data.folderId
      }
    )

    const documentData: HybridDocument = {
      id: r2Document.id,
      name: data.name,
      description: data.description || "",
      fileType: data.file.type,
      fileSize: data.file.size,
      filePath: r2Document.fileUrl, // R2Document usa fileUrl como ruta
      fileUrl: r2Document.fileUrl,
      folderId: data.folderId,
      areaId: data.areaId,
      moduleType: data.moduleType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save document metadata to Supabase
    const { error } = await this.supabase
      .from("documentos")
      .insert({
        id: documentData.id,
        nombre: documentData.name,
        descripcion: documentData.description,
        tipo_archivo: documentData.fileType,
        tamano: documentData.fileSize,
        ruta_archivo: documentData.filePath,
        url_archivo: documentData.fileUrl,
        carpeta_id: documentData.folderId,
        area_id: documentData.areaId,        modulo: documentData.moduleType,
        created_at: documentData.createdAt,
        updated_at: documentData.updatedAt,
      });

    if (error) {
      // If Supabase save fails, clean up R2 file
      try {
        await deleteR2Document(documentData.id, data.areaId, data.moduleType)
      } catch (cleanupError) {
        console.error("Error cleaning up R2 file after Supabase failure:", cleanupError)
      }
      console.error("Error saving document metadata to Supabase:", error)
      throw new Error(`Error saving document: ${error.message}`)
    }

    console.log(`Document uploaded successfully: ${documentData.id}`)
    return documentData
  }

  // List documents from Supabase (with R2 URLs)
  static async listDocuments(areaId: AreaId, moduleType: ModuleType, folderId?: string): Promise<HybridDocument[]> {
    let query = this.supabase
      .from("documentos")
      .select("*")
      .eq("area_id", areaId)
      .eq("modulo", moduleType)
      .order("created_at", { ascending: true })

    if (folderId) {
      query = query.eq("carpeta_id", folderId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error listing documents from Supabase:", error)
      throw new Error(`Error listing documents: ${error.message}`)
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.nombre,
      description: row.descripcion || "",
      fileType: row.tipo_archivo,
      fileSize: row.tamano,
      filePath: row.ruta_archivo,
      fileUrl: row.url_archivo,
      folderId: row.carpeta_id,
      areaId: row.area_id,
      moduleType: row.modulo,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }
  // Delete document from R2 and Supabase
  static async deleteDocument(documentId: string): Promise<void> {
    // Get document metadata first
    const { data, error: fetchError } = await this.supabase
      .from("documentos")
      .select("ruta_archivo, area_id, modulo")
      .eq("id", documentId)
      .single()

    if (fetchError) {
      console.error("Error fetching document for deletion:", fetchError)
      throw new Error(`Error finding document: ${fetchError.message}`)
    }

    // Delete from R2
    try {
      await deleteR2Document(documentId, data.area_id, data.modulo)
    } catch (r2Error) {
      console.error("Error deleting from R2:", r2Error)
      // Continue with Supabase deletion even if R2 fails
    }

    // Delete from Supabase
    const { error } = await this.supabase.from("documentos").delete().eq("id", documentId)

    if (error) {
      console.error("Error deleting document from Supabase:", error)
      throw new Error(`Error deleting document: ${error.message}`)
    }

    console.log(`Document deleted successfully: ${documentId}`)
  }
  // Delete all documents in a folder
  private static async deleteDocumentsByFolder(folderId: string): Promise<void> {
    // Get all documents in folder
    const { data, error: fetchError } = await this.supabase
      .from("documentos")
      .select("id, ruta_archivo, area_id, modulo")
      .eq("carpeta_id", folderId)

    if (fetchError) {
      console.error("Error fetching documents for folder deletion:", fetchError)
      return
    }

    // Delete each document
    for (const doc of data || []) {
      try {
        await deleteR2Document(doc.id, doc.area_id, doc.modulo)
      } catch (r2Error) {
        console.error(`Error deleting R2 file ${doc.ruta_archivo}:`, r2Error)
      }
    }

    // Delete all documents from Supabase
    const { error } = await this.supabase.from("documentos").delete().eq("carpeta_id", folderId)

    if (error) {
      console.error("Error deleting documents from Supabase:", error)
    }
  }

  // Generate download URL for document
  static async getDownloadUrl(documentId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("documentos")
      .select("url_archivo, nombre")
      .eq("id", documentId)
      .single()

    if (error) {
      console.error("Error getting download URL:", error)
      throw new Error(`Error getting download URL: ${error.message}`)
    }

    return data.url_archivo
  }
}
