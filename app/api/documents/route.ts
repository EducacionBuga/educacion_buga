import { NextRequest, NextResponse } from "next/server"
import { HybridDocumentService } from "@/lib/hybrid-document-service"
import type { AreaId, ModuleType } from "@/hooks/use-document-store-generic"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const areaId = url.searchParams.get("areaId") as AreaId
    const moduleType = url.searchParams.get("moduleType") as ModuleType
    const folderId = url.searchParams.get("folderId") || undefined

    if (!areaId || !moduleType) {
      return NextResponse.json(
        { error: "areaId and moduleType are required" },
        { status: 400 }
      )
    }

    const documents = await HybridDocumentService.listDocuments(areaId, moduleType, folderId)
    
    return NextResponse.json({
      success: true,
      documents,
    })
  } catch (error) {
    console.error("Error in documents GET:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const documentId = url.searchParams.get("documentId")

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      )
    }

    await HybridDocumentService.deleteDocument(documentId)
    
    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    })
  } catch (error) {
    console.error("Error in documents DELETE:", error)
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}