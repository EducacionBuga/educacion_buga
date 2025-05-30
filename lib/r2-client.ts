import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Crear y configurar el cliente S3 para Cloudflare R2
export const getR2Client = () => {
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

// Generar una URL prefirmada para descargar un archivo
export async function getPresignedUrl(filePath: string, expiresIn = 3600) {
  try {
    const client = getR2Client()
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: filePath,
    })

    const url = await getSignedUrl(client, command, { expiresIn })
    return url
  } catch (error) {
    console.error("Error generando URL prefirmada:", error)
    throw error
  }
}

// Subir un archivo a R2
export async function uploadFileToR2(buffer: Buffer, filePath: string, contentType: string) {
  try {
    const client = getR2Client()
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: filePath,
      Body: buffer,
      ContentType: contentType,
    })

    console.log(`Subiendo archivo a R2: ${filePath}`)
    const result = await client.send(command)
    console.log(`Archivo subido exitosamente a R2: ${filePath}`)
    return result
  } catch (error) {
    console.error(`Error al subir archivo a R2: ${filePath}`, error)
    throw error
  }
}

// Eliminar un archivo de R2
export async function deleteFileFromR2(filePath: string) {
  try {
    const client = getR2Client()
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: filePath,
    })

    console.log(`Eliminando archivo de R2: ${filePath}`)
    const result = await client.send(command)
    console.log(`Archivo eliminado exitosamente de R2: ${filePath}`)
    return result
  } catch (error) {
    console.error(`Error al eliminar archivo de R2: ${filePath}`, error)
    throw error
  }
}

// Verificar si un archivo existe en R2
export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    const client = getR2Client()
    const command = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: filePath,
    })

    await client.send(command)
    return true
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false
    }
    console.error(`Error verificando archivo en R2: ${filePath}`, error)
    throw error
  }
}

// Obtener información de un archivo en R2
export async function getFileInfo(filePath: string) {
  try {
    const client = getR2Client()
    const command = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: filePath,
    })

    const response = await client.send(command)
    return {
      size: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      etag: response.ETag,
    }
  } catch (error) {
    console.error(`Error obteniendo información del archivo en R2: ${filePath}`, error)
    throw error
  }
}

// Obtener una URL de descarga directa (para uso interno)
export function getDownloadUrl(filePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
  return `${baseUrl}/api/documents/download?path=${encodeURIComponent(filePath)}`
}
