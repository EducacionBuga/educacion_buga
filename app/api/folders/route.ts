import { NextRequest, NextResponse } from "next/server"
import { HybridDocumentService } from "@/lib/hybrid-document-service"
import type { AreaId, ModuleType } from "@/hooks/use-document-store-generic"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const areaId = url.searchParams.get("areaId") as AreaId
    const moduleType = url.searchParams.get("moduleType") as ModuleType

    if (!areaId || !moduleType) {
      return NextResponse.json(
        { error: "areaId and moduleType are required" },
        { status: 400 }
      )
    }

    const folders = await HybridDocumentService.listFolders(areaId, moduleType)
    
    return NextResponse.json({
      success: true,
      folders,
    })
  } catch (error) {
    console.error("Error in folders GET:", error)
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, category, date, areaId, moduleType } = body

    if (!name || !color || !category || !date || !areaId || !moduleType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const folder = await HybridDocumentService.createFolder({
      name,
      description,
      color,
      category,
      date,
      areaId,
      moduleType,
    })

    return NextResponse.json({
      success: true,
      folder,
    })
  } catch (error) {
    console.error("Error in folders POST:", error)
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    )
  }
}