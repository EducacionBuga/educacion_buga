import { NextResponse } from "next/server"

// Importar el SDK solo en el servidor
let S3Client: any
let ListObjectsV2Command: any

try {
  const AWS = require("@aws-sdk/client-s3")
  S3Client = AWS.S3Client
  ListObjectsV2Command = AWS.ListObjectsV2Command
} catch (error) {
  console.error("AWS SDK not available:", error)
}

// Función para verificar la conexión
async function testConnection(): Promise<boolean> {
  try {
    if (!S3Client || !ListObjectsV2Command) {
      console.error("AWS SDK not available for connection test")
      return false
    }

    // Configuración del cliente R2
    const r2Client = new S3Client({
      region: process.env.R2_REGION || "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
      forcePathStyle: true,
    })

    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET || "educacion-buga",
      MaxKeys: 1,
    })

    await r2Client.send(command)
    console.log("R2 connection test successful")
    return true
  } catch (error) {
    console.error("R2 connection test failed:", error)
    return false
  }
}

export async function GET() {
  try {
    // Verificar variables de entorno
    const envVars = {
      R2_REGION: process.env.R2_REGION,
      R2_ENDPOINT: process.env.R2_ENDPOINT,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID
        ? `✅ ${process.env.R2_ACCESS_KEY_ID.substring(0, 8)}...`
        : "❌ Falta",
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY
        ? `✅ ${process.env.R2_SECRET_ACCESS_KEY.substring(0, 8)}...`
        : "❌ Falta",
      R2_BUCKET: process.env.R2_BUCKET,
      AWS_SDK_AVAILABLE: S3Client && ListObjectsV2Command ? "✅ Disponible" : "❌ No disponible",
    }

    console.log("🔍 Verificando configuración R2:", envVars)

    // Probar conexión
    const isConnected = await testConnection()

    return NextResponse.json({
      status: isConnected ? "✅ Conexión exitosa a Cloudflare R2" : "❌ Error de conexión",
      environment: envVars,
      timestamp: new Date().toISOString(),
      message: isConnected ? "¡Perfecto! R2 está configurado correctamente" : "Revisa las credenciales en .env.local",
    })
  } catch (error) {
    console.error("❌ R2 test error:", error)
    return NextResponse.json(
      {
        status: "❌ Error de configuración",
        error: error instanceof Error ? error.message : "Unknown error",
        environment: {
          R2_REGION: process.env.R2_REGION || "❌ No configurado",
          R2_ENDPOINT: process.env.R2_ENDPOINT || "❌ No configurado",
          R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? "✅ Configurado" : "❌ Falta",
          R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? "✅ Configurado" : "❌ Falta",
          R2_BUCKET: process.env.R2_BUCKET || "❌ No configurado",
          AWS_SDK_AVAILABLE: S3Client && ListObjectsV2Command ? "✅ Disponible" : "❌ No disponible",
        },
        message: "Verifica que las credenciales estén correctamente configuradas en .env.local",
      },
      { status: 500 },
    )
  }
}
