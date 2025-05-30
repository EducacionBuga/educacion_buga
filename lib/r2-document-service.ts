import { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"

// Cliente R2 centralizado
const getR2Client = () => {
  return new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
  })
}

export interface R2Document {
  id: string
  name: string
  description: string
  folderId: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: string
  updatedAt: string
  areaId: string
  moduleType: string
}

// Función para listar documentos desde R2
export async function listR2Documents(
  areaId: string, 
  moduleType: string, 
  folderId?: string
): Promise<R2Document[]> {
  const client = getR2Client()
  
  try {
    let prefix: string
    
    if (folderId) {
      // Listar documentos de una carpeta específica
      prefix = `documentos/${areaId}/${moduleType}/${folderId}/`
    } else {
      // Listar todos los documentos del módulo
      prefix = `documentos/${areaId}/${moduleType}/`
    }
    
    const response = await client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Prefix: prefix,
    }))

    const documents: R2Document[] = []

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key && !object.Key.endsWith('.folder-metadata.json') && !object.Key.endsWith('/')) {
          // Extraer información del path del archivo
          const pathParts = object.Key.split('/')
          // documentos/areaId/moduleType/folderId/fileId.extension
          
          if (pathParts.length >= 5) {
            const extractedFolderId = pathParts[3]
            const fileName = pathParts[4]
            const fileId = fileName.split('.')[0]
            const extension = fileName.split('.').pop() || ''
            
            // Generar URL de descarga
            const fileUrl = `/api/documents/download?path=${encodeURIComponent(object.Key)}`
            
            documents.push({
              id: fileId,
              name: fileName,
              description: `Documento ${fileName}`,
              folderId: extractedFolderId,
              fileUrl,
              fileType: getFileTypeFromExtension(extension),
              fileSize: object.Size || 0,
              createdAt: object.LastModified?.toISOString() || new Date().toISOString(),
              updatedAt: object.LastModified?.toISOString() || new Date().toISOString(),
              areaId,
              moduleType,
            })
          }
        }
      }
    }

    console.log(`Se encontraron ${documents.length} documentos en R2 para ${areaId}/${moduleType}${folderId ? `/${folderId}` : ''}`)
    return documents
  } catch (error) {
    console.error("Error listando documentos desde R2:", error)
    return []
  }
}

// Función para obtener tipo de archivo por extensión
function getFileTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase()
  
  if (['pdf'].includes(ext)) return 'application/pdf'
  if (['doc', 'docx'].includes(ext)) return 'application/msword'
  if (['xls', 'xlsx'].includes(ext)) return 'application/vnd.ms-excel'
  if (['ppt', 'pptx'].includes(ext)) return 'application/vnd.ms-powerpoint'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return `image/${ext}`
  if (['txt'].includes(ext)) return 'text/plain'
  if (['zip', 'rar'].includes(ext)) return 'application/zip'
  
  return 'application/octet-stream'
}

// Función para obtener documentos de una carpeta específica
export async function getR2DocumentsByFolder(
  areaId: string,
  moduleType: string,
  folderId: string
): Promise<R2Document[]> {
  return listR2Documents(areaId, moduleType, folderId)
}

// Función para eliminar un documento de R2
export async function deleteR2Document(
  documentId: string,
  areaId: string,
  moduleType: string
): Promise<boolean> {
  const client = getR2Client()
  
  try {
    // Primero buscar el documento para obtener su ruta exacta
    const documentsPrefix = `documentos/${areaId}/${moduleType}/`
    
    const listResponse = await client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Prefix: documentsPrefix,
    }))

    const documentFiles = listResponse.Contents?.filter(obj => 
      obj.Key?.includes(`/${documentId}.`) && !obj.Key.includes('.metadata.json')
    ) || []

    const metadataFiles = listResponse.Contents?.filter(obj => 
      obj.Key?.includes(`/${documentId}.metadata.json`)
    ) || []

    // Eliminar archivo del documento
    for (const file of documentFiles) {
      if (file.Key) {
        await client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET || "educacion-buga",
          Key: file.Key,
        }))
        console.log(`Archivo de documento eliminado de R2: ${file.Key}`)
      }
    }

    // Eliminar archivo de metadatos
    for (const file of metadataFiles) {
      if (file.Key) {
        await client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET || "educacion-buga",
          Key: file.Key,
        }))
        console.log(`Metadatos de documento eliminados de R2: ${file.Key}`)
      }
    }

    if (documentFiles.length === 0 && metadataFiles.length === 0) {
      throw new Error(`Documento ${documentId} no encontrado`)
    }

    return true
  } catch (error) {
    console.error("Error eliminando documento de R2:", error)
    return false
  }
}

// Función para verificar si un documento existe en R2
export async function documentExistsInR2(
  areaId: string,
  moduleType: string,
  folderId: string,
  documentId: string,
  extension: string
): Promise<boolean> {
  const client = getR2Client()
  const filePath = `documentos/${areaId}/${moduleType}/${folderId}/${documentId}.${extension}`
  
  try {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Prefix: filePath,
      MaxKeys: 1,
    }))

    return response.Contents !== undefined && response.Contents.length > 0
  } catch (error) {
    console.error("Error verificando existencia de documento en R2:", error)
    return false
  }
}

// Función para subir documento a R2
export async function uploadR2Document(
  file: File,
  areaId: string,
  moduleType: string,
  options: {
    name: string
    description: string
    folderId?: string
  }
): Promise<R2Document> {
  const client = getR2Client()
  
  // Generar ID único para el documento
  const documentId = uuidv4()
  const folderId = options.folderId || "root"
  
  // Obtener la extensión del archivo
  const extension = file.name.split('.').pop() || 'bin'
  
  // Crear la ruta del archivo
  const filePath = `documentos/${areaId}/${moduleType}/${folderId}/${documentId}.${extension}`
  
  try {
    // Subir archivo a R2
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        'original-name': options.name,
        'description': options.description,
        'area-id': areaId,
        'module-type': moduleType,
        'folder-id': folderId,
        'document-id': documentId,
        'uploaded-at': new Date().toISOString(),
      }
    }))

    // Crear URL pública
    const fileUrl = `${process.env.R2_PUBLIC_URL || 'https://pub-your-r2-domain.r2.dev'}/${filePath}`

    // Crear objeto documento
    const document: R2Document = {
      id: documentId,
      name: options.name,
      description: options.description,
      folderId,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      areaId,
      moduleType,
    }

    // También guardar metadatos del documento en R2
    const metadataPath = `documentos/${areaId}/${moduleType}/${folderId}/${documentId}.metadata.json`
    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: metadataPath,
      Body: JSON.stringify(document),
      ContentType: 'application/json',
    }))

    console.log(`Documento subido exitosamente: ${filePath}`)
    return document

  } catch (error) {
    console.error("Error subiendo documento a R2:", error)
    throw new Error(`Error al subir documento: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}
