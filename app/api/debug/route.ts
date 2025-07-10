import { NextResponse } from "next/server"
import { documentStore } from "@/lib/document-store"

export async function GET() {
  try {
    const allDocs = documentStore.getAllDocuments()

    return NextResponse.json({
      success: true,
      message: "Debug information",
      environment: {
        N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL ? "✅ Set" : "❌ Not set",
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
      documents: allDocs,
      documentCount: allDocs.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Debug failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
