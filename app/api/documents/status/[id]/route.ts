import { type NextRequest, NextResponse } from "next/server"
import { getDocumentStatus } from "@/lib/document-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id
    const status = getDocumentStatus(documentId)

    if (!status) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      ...status,
    })
  } catch (error) {
    console.error("Get document status error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
