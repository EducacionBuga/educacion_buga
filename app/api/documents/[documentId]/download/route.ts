import { NextRequest, NextResponse } from "next/server"
import { HybridDocumentService } from "@/lib/hybrid-document-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await params

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      )
    }

    const downloadUrl = await HybridDocumentService.getDownloadUrl(documentId)
    
    return NextResponse.json({
      success: true,
      downloadUrl,
    })
  } catch (error) {
    console.error("Error getting download URL:", error)
    return NextResponse.json(
      { error: "Failed to get download URL" },
      { status: 500 }
    )
  }
}
