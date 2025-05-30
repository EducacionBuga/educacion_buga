import { type NextRequest, NextResponse } from "next/server"
import { HybridDocumentService } from "@/lib/hybrid-document-service"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, date, color, description } = body

    if (!name || !color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Actualizar la carpeta en Supabase
    const updatedFolder = await HybridDocumentService.updateFolder(id, {
      name,
      date,
      color,
      description,
    })

    return NextResponse.json({
      success: true,
      folder: updatedFolder,
    })
  } catch (error) {
    console.error("Error updating folder:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update folder",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    console.log(`Eliminando carpeta híbrida: ${id}`)

    // Eliminar la carpeta y todos sus documentos usando el servicio híbrido
    await HybridDocumentService.deleteFolder(id)

    console.log(`Carpeta eliminada exitosamente: ${id}`)

    return NextResponse.json({ 
      success: true, 
      message: "Carpeta eliminada exitosamente"
    })
  } catch (error) {
    console.error("Error en DELETE /api/folders/[id]:", error)
    
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Carpeta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al eliminar carpeta",
      },
      { status: 500 },
    )
  }
}
