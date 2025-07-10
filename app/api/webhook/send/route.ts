import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { documentId, formData } = await request.json()

    console.log("=== SENDING TO N8N ===")
    console.log("Document ID:", documentId)
    console.log("Form Data:", JSON.stringify(formData, null, 2))

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    console.log("N8N Webhook URL:", n8nWebhookUrl)
    console.log("Callback URL:", `${baseUrl}/api/webhook/callback`)

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "N8N_WEBHOOK_URL not configured",
        },
        { status: 500 },
      )
    }

    const payload = {
      documentId,
      formData,
      callbackUrl: `${baseUrl}/api/webhook/callback`,
      timestamp: new Date().toISOString(),
    }

    console.log("Sending payload to n8n:", JSON.stringify(payload, null, 2))

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      console.log("N8N Response Status:", response.status)
      console.log("N8N Response:", responseText)

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status} - ${responseText}`)
      }

      return NextResponse.json({
        success: true,
        documentId,
        message: "Data sent to processing pipeline",
        n8nResponse: responseText,
        callbackUrl: `${baseUrl}/api/webhook/callback`,
      })
    } catch (webhookError) {
      console.error("=== N8N WEBHOOK ERROR ===")
      console.error("Error:", webhookError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send data to n8n: ${webhookError.message}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("=== WEBHOOK SEND ERROR ===")
    console.error("Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send data",
      },
      { status: 500 },
    )
  }
}
