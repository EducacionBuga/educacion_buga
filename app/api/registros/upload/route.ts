import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { createClient, createAdminClient } from "@/lib/supabase-client"
import { getAreaUUID } from "@/lib/area-mapping"

let S3Client: any
let PutObjectCommand: any

try {
  const AWS = require("@aws-sdk/client-s3")
  S3Client = AWS.S3Client
  PutObjectCommand = AWS.PutObjectCommand
} catch (error) {
  console.error("AWS SDK not available:", error)
}

export async function POST(request: NextRequest) {
  try {
    if (!S3Client || !PutObjectCommand) {
      return NextResponse.json({ error: "AWS SDK not available" }, { status: 500 })
    }

    const r2Client = new S3Client({
      region: process.env.R2_REGION || "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
      forcePathStyle: true,
    })

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const areaId = formData.get("areaId") as string
    const date = formData.get("date") as string
    const location = formData.get("location") as string

    if (!file || !title || !areaId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convert area key to UUID if needed
    const areaUUID = getAreaUUID(areaId)
    console.log('Upload: Converting areaId:', areaId, 'to UUID:', areaUUID)

    // Validar tipo de archivo para registros fotográficos
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed for photos" }, { status: 400 })
    }

    const maxSize = 50 * 1024 * 1024 // 50MB para fotos
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large" }, { status: 400 })
    }

    const fileId = uuidv4()
    const extension = file.name.split(".").pop() || ""
    const filePath = `registros/${areaUUID}/${fileId}.${extension}`
    const thumbnailPath = `registros/${areaUUID}/thumbnails/${fileId}.${extension}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir imagen original
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    })

    await r2Client.send(command)

    // Subir thumbnail (por ahora usamos la misma imagen, en producción se podría redimensionar)
    const thumbnailCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: thumbnailPath,
      Body: buffer,
      ContentType: file.type,
    })

    await r2Client.send(thumbnailCommand)

    const fileUrl = `/api/registros/download?path=${encodeURIComponent(filePath)}`
    const thumbnailUrl = `/api/registros/download?path=${encodeURIComponent(thumbnailPath)}`

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("registros_fotograficos")
      .insert([
        {
          id: fileId,
          title,
          description,
          file_url: fileUrl,
          file_type: file.type,
          file_size: file.size,
          file_path: filePath,
          thumbnail_url: thumbnailUrl,
          area_id: areaUUID,
          date,
          location,
        },
      ])
      .select(`
        *,
        areas (
          codigo,
          nombre
        )
      `)
      .single()

    if (error) {
      console.error("Error saving registro metadata:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error uploading registro:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload registro",
      },
      { status: 500 },
    )
  }
}
