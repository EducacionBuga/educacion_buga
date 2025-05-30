import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return new NextResponse("URL parameter is required", { status: 400 })
  }

  try {
    // Fetch the document from the provided URL
    const response = await fetch(url)

    if (!response.ok) {
      return new NextResponse("Failed to fetch document", { status: response.status })
    }

    // Get the document content and content type
    const blob = await response.blob()
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    // Return the document with appropriate headers
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error proxying document:", error)
    return new NextResponse("Error fetching document", { status: 500 })
  }
}
