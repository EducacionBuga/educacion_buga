import { type NextRequest, NextResponse } from "next/server"
import { getPresignedUrl } from "@/lib/r2-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("path")

    if (!filePath) {
      return NextResponse.json({ error: "La ruta del archivo es requerida" }, { status: 400 })
    }

    console.log(`Generando URL de descarga para: ${filePath}`)

    // Generar URL prefirmada para acceso directo al archivo en R2
    const presignedUrl = await getPresignedUrl(filePath, 3600) // 1 hora de expiración

    console.log(`URL prefirmada generada exitosamente`)

    // Redirigir al usuario a la URL prefirmada
    return NextResponse.redirect(presignedUrl)
  } catch (error) {
    console.error("Error al descargar documento:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al descargar documento",
      },
      { status: 500 },
    )
  }
}
