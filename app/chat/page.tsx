"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { QuickReplies } from "@/components/quick-replies"
import { ContactForm } from "@/components/contact-form"
import { TypingIndicator } from "@/components/typing-indicator"
import { BookingConfirmation } from "@/components/booking-confirmation"

export type MessageType = "faq" | "clarify" | "book_confirmed" | "book_unavailable" | "escalate" | "error"

export interface SuggestedAction {
  label: string
  value: string
}

export interface BookingEvent {
  date: string
  time: string
  durationMinutes: number
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  type?: MessageType
  event?: BookingEvent
  suggestedActions?: SuggestedAction[]
  timestamp: Date
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const firstName = searchParams.get("firstName")
  const lastName = searchParams.get("lastName")
  const email = searchParams.get("email")
  const companyName = searchParams.get("companyName")
  const industry = searchParams.get("industry")

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: firstName
        ? `Hi ${firstName}! Thanks for trying out AIGENCEE's AI Receptionist. I'm here to help you experience how we can assist ${companyName || "your business"} in the ${industry || "your"} industry. How can I help you today?`
        : "Hi! I'm the virtual receptionist. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: firstName && lastName ? `${firstName} ${lastName}` : "",
    email: email || "",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const sendMessage = async (content: string, additionalInfo?: { name?: string; email?: string }) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/receptionist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "web",
          message: content,
          name: additionalInfo?.name || userInfo.name || undefined,
          email: additionalInfo?.email || userInfo.email || undefined,
          timezone: "America/Los_Angeles",
          industry: industry || undefined,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          type: data.type,
          event: data.event,
          suggestedActions: data.suggestedActions,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Show contact form if escalated and no user info
        if (data.type === "escalate" && !userInfo.name && !additionalInfo?.name) {
          setShowContactForm(true)
        }
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        type: "error",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReply = (value: string) => {
    sendMessage(value)
  }

  const handleContactSubmit = (name: string, email: string, details: string) => {
    setUserInfo({ name, email })
    setShowContactForm(false)
    const message = `My name is ${name}, my email is ${email}.${details ? ` Additional details: ${details}` : ""}`
    sendMessage(message, { name, email })
  }

  const lastMessage = messages[messages.length - 1]
  const showQuickReplies = lastMessage?.role === "assistant" && lastMessage?.suggestedActions && !isLoading

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0f0520] via-[#1a0b2e] to-[#0f0520]">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessage message={message} />
            {message.type === "book_confirmed" && message.event && <BookingConfirmation event={message.event} />}
          </div>
        ))}

        {isLoading && <TypingIndicator />}

        {showContactForm && <ContactForm onSubmit={handleContactSubmit} onCancel={() => setShowContactForm(false)} />}

        <div ref={messagesEndRef} />
      </div>

      {showQuickReplies && <QuickReplies actions={lastMessage.suggestedActions!} onSelect={handleQuickReply} />}

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
