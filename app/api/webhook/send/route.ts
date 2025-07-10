import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, formData } = body

    console.log("Sending webhook with data:", { documentId, formData })

    // Get webhook URL from environment
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      throw new Error("N8N_WEBHOOK_URL not configured")
    }

    // Prepare callback URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const callbackUrl = `${baseUrl}/api/webhook/callback`

    // Send to n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId,
        formData,
        callbackUrl,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.text()
    console.log("Webhook response:", result)

    return NextResponse.json({
      success: true,
      message: "Data sent to webhook successfully",
      documentId,
    })
  } catch (error) {
    console.error("Webhook send error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
