import { type NextRequest, NextResponse } from "next/server"
import { HybridDocumentService } from "@/lib/hybrid-document-service"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params

    if (!documentId) {
      return NextResponse.json({ error: "ID del documento es requerido" }, { status: 400 })
    }

    console.log(`Eliminando documento híbrido: ${documentId}`)

    // Usar hybrid document service para eliminar el documento
    await HybridDocumentService.deleteDocument(documentId)

    console.log(`Documento eliminado exitosamente: ${documentId}`)

    return NextResponse.json({ 
      success: true, 
      message: "Documento eliminado exitosamente"
    })

  } catch (error) {
    console.error("Error en DELETE /api/documents/[documentId]:", error)
    
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al eliminar documento",
      },
      { status: 500 }
    )
  }
}
