import { type NextRequest, NextResponse } from "next/server"

// PLACEHOLDER IMPLEMENTATION
// This is a mocked API endpoint for demonstration purposes
// Replace this with your actual n8n integration endpoint

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, name, email } = body

    console.log("[v0] Received message:", { message, name, email })

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const lowerMessage = message.toLowerCase()

    // Mock response logic based on message content
    if (lowerMessage.includes("hours") || lowerMessage.includes("open")) {
      return NextResponse.json({
        ok: true,
        type: "faq",
        message: "We're open Monday to Friday, 9 AM to 5 PM. How else can I help you?",
        suggestedActions: [
          { label: "Book an appointment", value: "I want to book an appointment" },
          { label: "Ask another question", value: "I have another question" },
        ],
      })
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return NextResponse.json({
        ok: true,
        type: "faq",
        message: "Our consultation starts at $50 for a 30-minute session. Would you like to book an appointment?",
        suggestedActions: [
          { label: "Yes, book appointment", value: "Yes, I want to book an appointment" },
          { label: "Learn more", value: "Tell me more about your services" },
        ],
      })
    }

    if (lowerMessage.includes("book") || lowerMessage.includes("appointment") || lowerMessage.includes("schedule")) {
      // Check if message contains time information
      if (
        lowerMessage.match(/\d+\s*(am|pm|:)/i) ||
        lowerMessage.includes("tomorrow") ||
        lowerMessage.includes("monday") ||
        lowerMessage.includes("tuesday")
      ) {
        // Extract or generate booking details
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dateStr = tomorrow.toISOString().split("T")[0]

        return NextResponse.json({
          ok: true,
          type: "book_confirmed",
          message: "Great! Your appointment has been confirmed. You will receive a confirmation email shortly.",
          event: {
            date: dateStr,
            time: "3:00 PM",
            durationMinutes: 30,
          },
        })
      }

      return NextResponse.json({
        ok: true,
        type: "clarify",
        message: "I can help you book an appointment. What day and time works best for you?",
        suggestedActions: [
          { label: "Tomorrow at 3 PM", value: "Tomorrow at 3 PM" },
          { label: "Next Monday at 10 AM", value: "Next Monday at 10 AM" },
          { label: "Different time", value: "I need a different time" },
        ],
      })
    }

    if (
      lowerMessage.includes("human") ||
      lowerMessage.includes("speak to someone") ||
      lowerMessage.includes("representative")
    ) {
      return NextResponse.json({
        ok: true,
        type: "escalate",
        message:
          "I understand you'd like to speak with someone. A team member will follow up with you shortly. May I have your contact information?",
      })
    }

    if (name && email && lowerMessage.includes("name is")) {
      return NextResponse.json({
        ok: true,
        type: "faq",
        message: `Thank you, ${name}! We've received your information and someone will reach out to ${email} within 24 hours.`,
      })
    }

    // Default response
    return NextResponse.json({
      ok: true,
      type: "faq",
      message:
        "I'm here to help answer questions and book appointments. You can ask about our hours, services, pricing, or schedule a meeting.",
      suggestedActions: [
        { label: "What are your hours?", value: "What are your hours?" },
        { label: "Book appointment", value: "I want to book an appointment" },
        { label: "Speak to a person", value: "I need to speak to a human" },
      ],
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        ok: false,
        type: "error",
        message: "Sorry, something went wrong. Please try again.",
      },
      { status: 500 },
    )
  }
}
