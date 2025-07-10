import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()
    console.log("=== TESTING CALLBACK ===")
    console.log("Document ID:", documentId)

    // Simulate a successful callback from n8n with both documents
    const mockMainDocId = `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
    const mockNotaDocId = `1AbcDEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEf`

    const callbackData = {
      documentId: documentId || `doc_${Date.now()}`,
      mainDocumentId: mockMainDocId,
      notaPengantarId: mockNotaDocId,
      status: "completed",
    }

    console.log("Sending test callback:", callbackData)

    // Send callback to our own callback endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const callbackUrl = `${baseUrl}/api/webhook/callback`

    console.log("Callback URL:", callbackUrl)

    const callbackResponse = await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callbackData),
    })

    const result = await callbackResponse.json()
    console.log("Callback response:", result)

    return NextResponse.json({
      success: true,
      message: "Test callback sent successfully",
      callbackData,
      callbackResult: result,
      callbackUrl,
    })
  } catch (error) {
    console.error("Test callback error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test callback",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
