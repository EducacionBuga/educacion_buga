import { type NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase-client"

let S3Client: any
let DeleteObjectCommand: any

try {
  const AWS = require("@aws-sdk/client-s3")
  S3Client = AWS.S3Client
  DeleteObjectCommand = AWS.DeleteObjectCommand
} catch (error) {
  console.error("AWS SDK not available:", error)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("path")
    const thumbnailPath = searchParams.get("thumbnailPath")

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    if (!S3Client || !DeleteObjectCommand) {
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

    // Eliminar imagen original
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: filePath,
    })

    await r2Client.send(command)

    // Eliminar thumbnail si existe
    if (thumbnailPath) {
      const thumbnailCommand = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET || "educacion-buga",
        Key: thumbnailPath,
      })

      await r2Client.send(thumbnailCommand)
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from("registros_fotograficos").delete().eq("id", id)

    if (error) {
      console.error("Error deleting registro metadata:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting registro:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete registro",
      },
      { status: 500 },
    )
  }
}
