import { type NextRequest, NextResponse } from "next/server"
import { updateDocumentStatus } from "@/lib/document-store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received callback:", body)

    const { documentId, mainDocumentId, notaPengantarId, status } = body

    if (!documentId) {
      return NextResponse.json({ success: false, error: "documentId is required" }, { status: 400 })
    }

    // Update document status in storage
    updateDocumentStatus(documentId, {
      status: status || "completed",
      mainDocumentId,
      notaPengantarId,
      mainDownloadLink: mainDocumentId
        ? `https://docs.google.com/document/d/${mainDocumentId}/export?format=doc`
        : undefined,
      notaPengantarLink: notaPengantarId
        ? `https://docs.google.com/document/d/${notaPengantarId}/export?format=doc`
        : undefined,
    })

    console.log(`Document ${documentId} status updated to ${status || "completed"}`)

    return NextResponse.json({
      success: true,
      message: "Document status updated successfully",
      documentId,
    })
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
