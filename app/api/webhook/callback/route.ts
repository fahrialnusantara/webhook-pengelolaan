import { type NextRequest, NextResponse } from "next/server"
import { documentStore } from "@/lib/document-store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("=== CALLBACK RECEIVED ===")
    console.log("Full callback body:", JSON.stringify(body, null, 2))
    console.log("Headers:", Object.fromEntries(request.headers.entries()))

    const { documentId, mainDocumentId, notaPengantarId, status, error } = body

    if (!documentId) {
      console.error("No documentId provided in callback")
      return NextResponse.json(
        {
          success: false,
          error: "Document ID is required",
        },
        { status: 400 },
      )
    }

    // Store the document status with both document IDs
    const documentStatus = {
      documentId,
      mainDocumentId,
      notaPengantarId,
      status: status || "completed",
      error,
      mainDownloadLink: mainDocumentId
        ? `https://docs.google.com/document/d/${mainDocumentId}/export?format=doc`
        : null,
      notaPengantarLink: notaPengantarId
        ? `https://docs.google.com/document/d/${notaPengantarId}/export?format=doc`
        : null,
    }

    documentStore.setDocument(documentId, documentStatus)

    console.log("=== DOCUMENT STATUS UPDATED ===")
    console.log("Document ID:", documentId)
    console.log("Status:", status)
    console.log("Main Document ID:", mainDocumentId)
    console.log("Nota Pengantar ID:", notaPengantarId)
    console.log("Main Download Link:", documentStatus.mainDownloadLink)
    console.log("Nota Pengantar Link:", documentStatus.notaPengantarLink)

    return NextResponse.json({
      success: true,
      message: "Callback processed successfully",
      documentId,
      status: status || "completed",
      mainDocumentId,
      notaPengantarId,
      mainDownloadLink: documentStatus.mainDownloadLink,
      notaPengantarLink: documentStatus.notaPengantarLink,
    })
  } catch (error) {
    console.error("=== CALLBACK ERROR ===")
    console.error("Error processing callback:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process callback",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// GET endpoint to check all documents (for debugging)
export async function GET() {
  try {
    const allDocs = documentStore.getAllDocuments()
    console.log("=== ALL DOCUMENTS ===")
    console.log(JSON.stringify(allDocs, null, 2))

    return NextResponse.json({
      success: true,
      documents: allDocs,
      count: allDocs.length,
    })
  } catch (error) {
    console.error("Error getting all documents:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get documents",
      },
      { status: 500 },
    )
  }
}
