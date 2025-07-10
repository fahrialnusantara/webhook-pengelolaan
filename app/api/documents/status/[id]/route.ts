import { type NextRequest, NextResponse } from "next/server"
import { documentStore } from "@/lib/document-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id
    console.log(`=== CHECKING STATUS FOR ${documentId} ===`)

    // Check if we have a status update from the callback
    const storedStatus = documentStore.getDocument(documentId)

    if (storedStatus) {
      console.log("Found stored status:", storedStatus)
      return NextResponse.json({
        success: true,
        documentId,
        status: storedStatus.status,
        mainDocumentId: storedStatus.mainDocumentId,
        notaPengantarId: storedStatus.notaPengantarId,
        mainDownloadLink: storedStatus.mainDownloadLink,
        notaPengantarLink: storedStatus.notaPengantarLink,
        error: storedStatus.error,
        updatedAt: storedStatus.updatedAt,
      })
    }

    console.log("No stored status found, returning processing")
    // If no stored status, return processing
    return NextResponse.json({
      success: true,
      documentId,
      status: "processing",
      message: "Document is still being processed",
    })
  } catch (error) {
    console.error("Document status error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get document status",
      },
      { status: 500 },
    )
  }
}
