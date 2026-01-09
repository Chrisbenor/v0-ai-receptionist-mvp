import { type NextRequest, NextResponse } from "next/server"

/**
 * Required environment variables:
 * - N8N_CHAT_WEBHOOK_URL: The n8n webhook endpoint (default: https://n8n-lqu2.onrender.com/webhook/aigencee/chat)
 * - N8N_API_KEY: API key for authenticating with n8n (e.g., aigencee_webhook_2026_secure_key_9fA2x!)
 */

interface ChatRequest {
  message: string
  sessionId?: string
  industry?: string
  businessName?: string
  user?: {
    name?: string
    email?: string
    phone?: string
  }
  history?: Array<{ role: string; content: string }>
}

interface N8NResponse {
  replyText?: string
  reply?: string
  response?: string
  message?: string
  intent?: string | null
  action?: "info" | "booking" | "handoff"
  metadata?: {
    calendlyUrl?: string
    [key: string]: any
  }
}

interface NormalizedResponse {
  replyText: string
  action: "info" | "booking" | "handoff"
  metadata: {
    calendlyUrl?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, sessionId, industry, businessName, user, history } = body

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        {
          replyText: "Please provide a message.",
          action: "info",
          metadata: {},
        },
        { status: 400 },
      )
    }

    // Check environment variables
    const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL || "https://n8n-lqu2.onrender.com/webhook/aigencee/chat"
    const apiKey = process.env.N8N_API_KEY

    if (!apiKey) {
      console.error("Missing n8n API key")
      return NextResponse.json({
        replyText: "Sorry — I'm having trouble right now. Please try again in a moment.",
        action: "info",
        metadata: {},
      })
    }

    const payload = {
      sessionId: sessionId || `web-${Date.now()}`,
      industry: industry || "Clinics",
      businessName: businessName || "AIGENCEE Demo",
      user: user || { name: "Web User" },
      message,
      history: history || [],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`n8n webhook failed with status ${response.status}: ${errorBody}`)
      return NextResponse.json({
        replyText: "Sorry — I'm having trouble right now. Please try again in a moment.",
        action: "info",
        metadata: {},
      })
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("n8n returned non-JSON response:", text.substring(0, 200))
      return NextResponse.json({
        replyText: "Sorry — I'm having trouble right now. Please try again in a moment.",
        action: "info",
        metadata: {},
      })
    }

    const data: N8NResponse = await response.json()

    const normalized: NormalizedResponse = {
      replyText:
        data.replyText || data.response || data.reply || data.message || "I'm here to help. How can I assist you?",
      action: data.action || "info",
      metadata: data.metadata || {},
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error("Chat API error:", error)

    return NextResponse.json({
      replyText: "Sorry — I'm having trouble right now. Please try again in a moment.",
      action: "info",
      metadata: {},
    })
  }
}
