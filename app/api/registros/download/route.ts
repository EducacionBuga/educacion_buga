import { type NextRequest, NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getR2Client } from "@/lib/r2-upload-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 })
    }

    const r2Client = getR2Client()

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      Key: path,
    })

    const response = await r2Client.send(command)

    if (!response.Body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Convertir el stream a buffer
    const chunks = []
    for await (const chunk of response.Body as any) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Determinar el tipo de contenido
    const contentType = response.ContentType || "application/octet-stream"

    // Devolver el archivo
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.split("/").pop()}"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error downloading file from R2:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error downloading file" },
      { status: 500 },
    )
  }
}
