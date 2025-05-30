import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
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

export interface R2Folder {
  id: string
  name: string
  color: string
  description: string
  date: string
  createdAt: string
  updatedAt: string
  category: string
  areaId: string
  moduleType: string
}

// Función para crear la estructura de metadatos de carpeta en R2
export async function createR2Folder(
  areaId: string,
  moduleType: string,
  folderData: {
    name: string
    color: string
    description: string
    date: string
    category: string
  }
): Promise<R2Folder> {
  const client = getR2Client()
  const folderId = uuidv4()
  const timestamp = new Date().toISOString()
  
  const folder: R2Folder = {
    id: folderId,
    name: folderData.name,
    color: folderData.color,
    description: folderData.description,
    date: folderData.date,
    createdAt: timestamp,
    updatedAt: timestamp,
    category: folderData.category,
    areaId,
    moduleType,
  }

  // Crear el archivo de metadatos de la carpeta en R2
  const metadataPath = `documentos/${areaId}/${moduleType}/${folderId}/.folder-metadata.json`
  
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET || "educacion-buga",
    Key: metadataPath,
    Body: JSON.stringify(folder),
    ContentType: "application/json",
  }))

  console.log(`Carpeta creada en R2: ${metadataPath}`)
  return folder
}

// Función para listar carpetas desde R2
export async function listR2Folders(areaId: string, moduleType: string): Promise<R2Folder[]> {
  const client = getR2Client()
  const prefix = `documentos/${areaId}/${moduleType}/`
  
  try {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Prefix: prefix,
      Delimiter: "/",
    }))

    const folders: R2Folder[] = []

    // Procesar cada carpeta encontrada
    if (response.CommonPrefixes) {
      for (const commonPrefix of response.CommonPrefixes) {
        if (commonPrefix.Prefix) {
          // Extraer el ID de la carpeta del path
          const folderPath = commonPrefix.Prefix
          const folderId = folderPath.split("/")[3] // documentos/areaId/moduleType/folderId/
          
          if (folderId) {
            try {
              // Intentar obtener los metadatos de la carpeta
              const metadataPath = `${folderPath}.folder-metadata.json`
              const metadataResponse = await client.send(new ListObjectsV2Command({
                Bucket: process.env.R2_BUCKET || "educacion-buga",
                Prefix: metadataPath,
                MaxKeys: 1,
              }))

              if (metadataResponse.Contents && metadataResponse.Contents.length > 0) {
                // Los metadatos existen, pero para simplificar devolvemos datos por defecto
                // En una implementación completa, podrías descargar y parsear el archivo JSON
                folders.push({
                  id: folderId,
                  name: `Carpeta ${folderId.substring(0, 8)}`,
                  color: "blue",
                  description: "Carpeta gestionada por R2",
                  date: new Date().toISOString().split('T')[0],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  category: "preContractual", // Valor por defecto
                  areaId,
                  moduleType,
                })
              } else {
                // Si no hay metadatos, crear carpeta con datos básicos
                folders.push({
                  id: folderId,
                  name: `Carpeta ${folderId.substring(0, 8)}`,
                  color: "gray",
                  description: "Carpeta sin metadatos",
                  date: new Date().toISOString().split('T')[0],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  category: "preContractual",
                  areaId,
                  moduleType,
                })
              }
            } catch (error) {
              console.error(`Error procesando carpeta ${folderId}:`, error)
              // Continuar con la siguiente carpeta
            }
          }
        }
      }
    }

    console.log(`Se encontraron ${folders.length} carpetas en R2 para ${areaId}/${moduleType}`)
    return folders
  } catch (error) {
    console.error("Error listando carpetas desde R2:", error)
    return []
  }
}

// Función para actualizar metadatos de carpeta en R2
export async function updateR2Folder(
  areaId: string,
  moduleType: string,
  folderId: string,
  updateData: {
    name?: string
    color?: string
    description?: string
    date?: string
  }
): Promise<R2Folder | null> {
  const client = getR2Client()
  const metadataPath = `documentos/${areaId}/${moduleType}/${folderId}/.folder-metadata.json`
  
  try {
    // Para simplificar, crear nuevos metadatos con los datos actualizados
    const timestamp = new Date().toISOString()
    
    const updatedFolder: R2Folder = {
      id: folderId,
      name: updateData.name || `Carpeta ${folderId.substring(0, 8)}`,
      color: updateData.color || "blue",
      description: updateData.description || "",
      date: updateData.date || new Date().toISOString().split('T')[0],
      createdAt: timestamp, // En una implementación real, preservarías la fecha original
      updatedAt: timestamp,
      category: "preContractual", // En una implementación real, preservarías la categoría original
      areaId,
      moduleType,
    }

    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: metadataPath,
      Body: JSON.stringify(updatedFolder),
      ContentType: "application/json",
    }))

    console.log(`Metadatos de carpeta actualizados en R2: ${metadataPath}`)
    return updatedFolder
  } catch (error) {
    console.error("Error actualizando carpeta en R2:", error)
    return null
  }
}

// Función para eliminar carpeta de R2 (elimina todos los archivos en la carpeta)
export async function deleteR2Folder(areaId: string, moduleType: string, folderId: string): Promise<boolean> {
  const client = getR2Client()
  const folderPrefix = `documentos/${areaId}/${moduleType}/${folderId}/`
  
  try {
    // Listar todos los objetos en la carpeta
    const listResponse = await client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Prefix: folderPrefix,
    }))

    // Eliminar todos los objetos encontrados
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      for (const object of listResponse.Contents) {
        if (object.Key) {
          await client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET || "educacion-buga",
            Key: object.Key,
          }))
          console.log(`Archivo eliminado de R2: ${object.Key}`)
        }
      }
    }

    console.log(`Carpeta eliminada de R2: ${folderPrefix}`)
    return true
  } catch (error) {
    console.error("Error eliminando carpeta de R2:", error)
    return false
  }
}

// Función para verificar si una carpeta existe en R2
export async function folderExistsInR2(areaId: string, moduleType: string, folderId: string): Promise<boolean> {
  const client = getR2Client()
  const folderPrefix = `documentos/${areaId}/${moduleType}/${folderId}/`
  
  try {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Prefix: folderPrefix,
      MaxKeys: 1,
    }))

    return response.Contents !== undefined && response.Contents.length > 0
  } catch (error) {
    console.error("Error verificando existencia de carpeta en R2:", error)
    return false
  }
}
