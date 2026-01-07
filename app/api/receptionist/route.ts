import { type NextRequest, NextResponse } from "next/server"

// PLACEHOLDER IMPLEMENTATION
// This is a mocked API endpoint for demonstration purposes
// TODO: Replace this with your actual n8n integration endpoint
// TODO: Connect scheduling to real calendar (Google Calendar, Calendly, etc.)
// TODO: Replace session memory with Redis for multi-user support

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, name, email, timezone, industry } = body

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const lowerMessage = message.toLowerCase()

    // Hours inquiry
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

    // Pricing inquiry
    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return NextResponse.json({
        ok: true,
        type: "faq",
        message: "Our consultation starts at $50 for a 30-minute session. Would you like to book an appointment?",
        suggestedActions: [
          { label: "Yes, book now", value: "Yes, I want to book an appointment" },
          { label: "Learn more", value: "Tell me more about your services" },
        ],
      })
    }

    // Appointment booking with phone-first logic
    if (lowerMessage.includes("book") || lowerMessage.includes("appointment") || lowerMessage.includes("schedule")) {
      // Check if message contains time information
      if (
        lowerMessage.match(/\d+\s*(am|pm|:)/i) ||
        lowerMessage.includes("tomorrow") ||
        lowerMessage.includes("monday") ||
        lowerMessage.includes("tuesday") ||
        lowerMessage.includes("wednesday") ||
        lowerMessage.includes("thursday") ||
        lowerMessage.includes("friday")
      ) {
        // Resolve date automatically based on timezone
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dateStr = tomorrow.toISOString().split("T")[0]

        // Ask only for missing information (name, phone, address)
        if (!name) {
          return NextResponse.json({
            ok: true,
            type: "clarify",
            message: "Great! Can I get your full name for the appointment?",
          })
        }

        return NextResponse.json({
          ok: true,
          type: "book_confirmed",
          message: `Perfect, ${name}! Just to confirm, I have you scheduled for ${tomorrow.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at 3:00 PM. You'll receive a confirmation email at ${email || "your email"}.`,
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
          { label: "Monday at 10 AM", value: "Monday at 10 AM" },
          { label: "Different time", value: "I need a different time" },
        ],
      })
    }

    // Escalation to human
    if (
      lowerMessage.includes("human") ||
      lowerMessage.includes("speak to someone") ||
      lowerMessage.includes("representative") ||
      lowerMessage.includes("person")
    ) {
      return NextResponse.json({
        ok: true,
        type: "escalate",
        message:
          "I understand you'd like to speak with someone from our team. Let me route this request. May I have your name and phone number?",
      })
    }

    // Contact information provided
    if (name && email && lowerMessage.includes("name is")) {
      return NextResponse.json({
        ok: true,
        type: "faq",
        message: `Thank you, ${name}! I've captured your information. A team member will reach out to ${email} within 24 hours. Is there anything else I can help you with?`,
      })
    }

    // Default receptionist response
    return NextResponse.json({
      ok: true,
      type: "faq",
      message:
        "I'm your AI receptionist. I can help answer questions, book appointments, and route requests to the right person. What can I help you with?",
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
