import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Webhook test received:", body)

    // Test actual n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "N8N_WEBHOOK_URL not configured",
        },
        { status: 500 },
      )
    }

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          message: "Test webhook from BMN Tools",
          timestamp: new Date().toISOString(),
        }),
      })

      if (!n8nResponse.ok) {
        throw new Error(`n8n webhook returned ${n8nResponse.status}`)
      }

      const n8nResult = await n8nResponse.text()
      console.log("n8n response:", n8nResult)

      return NextResponse.json({
        success: true,
        message: "Webhook test successful - n8n responded",
        timestamp: new Date().toISOString(),
        n8nResponse: n8nResult,
      })
    } catch (n8nError) {
      console.error("n8n webhook error:", n8nError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to reach n8n webhook: ${n8nError.message}`,
          webhookUrl: n8nWebhookUrl,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Webhook test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Webhook test failed",
      },
      { status: 500 },
    )
  }
}
