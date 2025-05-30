import { v4 as uuidv4 } from "uuid"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Tipos de módulos para documentos
export type ModuleType = "proveedores" | "prestacion-servicio" | "informes-de-ejecucion" | "registros-fotograficos"

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

// Función para subir documentos (con carpetas)
export async function uploadDocument(file: File, areaId: string, moduleType: ModuleType, folderId: string) {
  const fileId = uuidv4()
  const extension = file.name.split(".").pop() || ""
  const filePath = `documentos/${areaId}/${moduleType}/${folderId}/${fileId}.${extension}`

  await uploadFileToR2(file, filePath)

  const fileUrl = `/api/documents/download?path=${encodeURIComponent(filePath)}`

  return { fileId, filePath, fileUrl }
}

// Función para subir informes (sin carpetas)
export async function uploadInforme(file: File, areaId: string) {
  const fileId = uuidv4()
  const extension = file.name.split(".").pop() || ""
  const filePath = `informes/${areaId}/${fileId}.${extension}`

  await uploadFileToR2(file, filePath)

  const fileUrl = `/api/informes/download?path=${encodeURIComponent(filePath)}`

  return { fileId, filePath, fileUrl }
}

// Función para subir registros fotográficos (sin carpetas)
export async function uploadRegistro(file: File, areaId: string, options?: { generateThumbnail?: boolean }) {
  const fileId = uuidv4()
  const extension = file.name.split(".").pop() || ""
  const filePath = `registros/${areaId}/${fileId}.${extension}`

  await uploadFileToR2(file, filePath)

  let thumbnailUrl = ""

  // Si se solicita generar thumbnail
  if (options?.generateThumbnail) {
    const thumbnailPath = `registros/${areaId}/thumbnails/${fileId}.${extension}`
    await uploadFileToR2(file, thumbnailPath)
    thumbnailUrl = `/api/registros/download?path=${encodeURIComponent(thumbnailPath)}`
  }

  const fileUrl = `/api/registros/download?path=${encodeURIComponent(filePath)}`

  return { fileId, filePath, fileUrl, thumbnailUrl }
}

// Función para subir adjuntos de plan de acción
export async function uploadPlanAccionAttachment(file: File, areaId: string, activityId: string) {
  const fileId = uuidv4()
  const extension = file.name.split(".").pop() || ""
  const filePath = `plan-accion/${areaId}/${activityId}/${fileId}.${extension}`

  await uploadFileToR2(file, filePath)

  const fileUrl = `/api/plan-accion/download?path=${encodeURIComponent(filePath)}`

  return { fileId, filePath, fileUrl }
}

// Función interna para subir archivos a R2
async function uploadFileToR2(file: File, filePath: string) {
  const r2Client = getR2Client()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET || "educacion-buga",
    Key: filePath,
    Body: buffer,
    ContentType: file.type,
  })

  try {
    console.log(`Subiendo archivo a R2: ${filePath}`)
    const result = await r2Client.send(command)
    console.log(`Archivo subido exitosamente a R2: ${filePath}`, result)
    return result
  } catch (error) {
    console.error(`Error al subir archivo a R2: ${filePath}`, error)
    throw error
  }
}

export { getR2Client }
