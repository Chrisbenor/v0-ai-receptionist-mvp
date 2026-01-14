"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Volume2, VolumeX, Mic, MicOff, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { QuickReplies } from "@/components/quick-replies"
import { ContactForm } from "@/components/contact-form"
import { TypingIndicator } from "@/components/typing-indicator"
import { BookingConfirmation } from "@/components/booking-confirmation"
import { speak, stopSpeaking, initVoice } from "@/lib/voice"

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
  calendlyUrl?: string
}

function cleanStr(v: any) {
  if (typeof v !== "string") return ""
  // n8n a veces entrega "=booking" o "={{ ... }}"
  return v.replace(/^\s*=+\s*/g, "").trim()
}

function extractFirstUrl(text: string) {
  const t = cleanStr(text)
  if (!t) return ""
  const m = t.match(/https?:\/\/[^\s)]+/i)
  return (m?.[0] ?? "").trim()
}

function normalizeApiResponse(rawData: any) {
  // Soporta:
  // A) { replyText, action, metadata: { calendlyUrl } }
  // B) { reply, bookingLink, action }
  // C) [ { ... } ]
  const data = Array.isArray(rawData) ? rawData[0] : rawData

  const replyText =
    cleanStr(data?.replyText) ||
    cleanStr(data?.reply) ||
    cleanStr(data?.response) ||
    ""

  const action = cleanStr(data?.action || data?.meta?.action).toLowerCase()

  // ✅ calendly puede venir en metadata.calendlyUrl (tu caso)
  let calendlyUrl =
    cleanStr(data?.metadata?.calendlyUrl) ||
    cleanStr(data?.metadata?.calendlyURL) ||
    cleanStr(data?.metadata?.bookingLink) ||
    cleanStr(data?.bookingLink) ||
    cleanStr(data?.bookinglink) ||
    cleanStr(data?.booking_link) ||
    cleanStr(data?.calendlyUrl) ||
    cleanStr(data?.meta?.bookingLink) ||
    ""

  // ✅ fallback: si no llega en campo, lo sacamos del texto
  if (!calendlyUrl) {
    calendlyUrl = extractFirstUrl(replyText)
  }

  const intent = cleanStr(data?.intent).toLowerCase()

  const sessionId =
    cleanStr(data?.sessionId) ||
    cleanStr(data?.sessionID) ||
    cleanStr(data?.session_id) ||
    ""

  return { replyText, action, calendlyUrl, intent, sessionId, raw: data }
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const firstName = searchParams.get("firstName")
  const lastName = searchParams.get("lastName")
  const email = searchParams.get("email")
  const companyName = searchParams.get("companyName")
  const industry = searchParams.get("industry")

  const sessionId = useRef(crypto.randomUUID())

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: firstName
        ? `Hi ${firstName}! Thanks for trying AIGENCEE's AI Receptionist. I'm here to answer calls and messages, book appointments, and route requests for ${companyName || "your business"}. How can I help you today?`
        : "Hi! Thanks for trying AIGENCEE's AI Receptionist.\nI'm here to answer calls and messages, book appointments, and route requests for your business.\nHow can I help you today?",
      timestamp: new Date(),
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceMode, setVoiceMode] = useState(false)
  const [isHandoff, setIsHandoff] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: firstName && lastName ? `${firstName} ${lastName}` : "",
    email: email || "",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<{ startVoiceCapture: () => void } | null>(null)
  const isAISpeaking = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    initVoice()
  }, [])

  useEffect(() => {
    document.body.classList.add("overflow-hidden")
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [])

  useEffect(() => {
    if (!voiceMode || isLoading || isHandoff) return
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role !== "assistant") return

    const checkAndRestart = () => {
      if (voiceMode && !isLoading && !isHandoff && !isAISpeaking.current) {
        chatInputRef.current?.startVoiceCapture()
      } else if (isAISpeaking.current) {
        setTimeout(checkAndRestart, 500)
      }
    }

    const timer = setTimeout(checkAndRestart, 1000)
    return () => clearTimeout(timer)
  }, [voiceMode, isLoading, isHandoff, messages])

  const sendMessage = async (content: string, additionalInfo?: { name?: string; email?: string }) => {
    stopSpeaking()
    isAISpeaking.current = false

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          sessionId: sessionId.current,
          industry: industry || "Clinics",
          user: {
            name: additionalInfo?.name || userInfo.name || undefined,
            email: additionalInfo?.email || userInfo.email || undefined,
          },
        }),
      })

      if (!response.ok) {
        const t = await response.text().catch(() => "")
        console.error("[v0] API error:", response.status, t)
        throw new Error(`API returned ${response.status}`)
      }

      const raw = await response.text()
      let parsed: any
      try {
        parsed = JSON.parse(raw)
      } catch {
        console.error("[v0] Invalid JSON response:", raw)
        throw new Error("Server returned invalid JSON")
      }

      const normalized = normalizeApiResponse(parsed)
      console.log("[v0] normalized:", normalized)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: normalized.replyText || "Thanks! How can I help next?",
        timestamp: new Date(),
      }

      const isBooking =
        normalized.action === "booking" ||
        normalized.intent === "book_appointment" ||
        normalized.intent === "book_appointments" ||
        normalized.intent === "booking" ||
        normalized.intent === "book_appointment(s)" // por si llega raro

      // ✅ aquí se arma la burbuja
      if (isBooking && normalized.calendlyUrl) {
        assistantMessage.calendlyUrl = normalized.calendlyUrl
      }

      const isHandoffAction =
        normalized.action === "handoff" || normalized.intent === "human" || normalized.intent === "handoff"
      if (isHandoffAction) {
        setIsHandoff(true)
        assistantMessage.type = "escalate"
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (voiceEnabled && !isHandoff) {
        isAISpeaking.current = true
        speak(assistantMessage.content, () => {
          isAISpeaking.current = false
        })
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
      isAISpeaking.current = false
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

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking()
    setVoiceEnabled(!voiceEnabled)
  }

  const toggleVoiceMode = () => {
    const newVoiceMode = !voiceMode
    setVoiceMode(newVoiceMode)
    isAISpeaking.current = false

    if (!newVoiceMode) {
      stopSpeaking()
    } else {
      setTimeout(() => {
        chatInputRef.current?.startVoiceCapture?.()
      }, 300)
    }
  }

  const lastMessage = messages[messages.length - 1]
  const showQuickReplies = lastMessage?.role === "assistant" && lastMessage?.suggestedActions && !isLoading

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-gradient-to-br from-[#0f0520] via-[#1a0b2e] to-[#0f0520]">
      <ChatHeader />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-8 space-y-6">
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessage message={message} />
            {message.type === "book_confirmed" && message.event && <BookingConfirmation event={message.event} />}

            {message.role === "assistant" && message.calendlyUrl && (
              <div className="ml-12 mt-3">
                <Button
                  onClick={() => window.open(message.calendlyUrl, "_blank")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-full px-6 py-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Book appointment
                </Button>
              </div>
            )}
          </div>
        ))}

        {isLoading && <TypingIndicator />}

        {showContactForm && <ContactForm onSubmit={handleContactSubmit} onCancel={() => setShowContactForm(false)} />}

        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 z-20 w-full border-t border-purple-500/20 bg-gradient-to-r from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] backdrop-blur-xl shadow-2xl shadow-purple-900/30">
        {isHandoff && (
          <div className="px-4 pt-2 pb-1 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Connecting you to a human...
            </div>
          </div>
        )}

        <div className="px-4 pt-2 pb-1 flex justify-center gap-3 border-b border-purple-500/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleVoiceMode}
            className={`transition-all h-8 ${
              voiceMode
                ? "text-white bg-purple-500/30 hover:bg-purple-500/40"
                : "text-purple-300 hover:text-white hover:bg-purple-500/20"
            }`}
          >
            {voiceMode ? (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Voice mode on
              </>
            ) : (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Voice mode off
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleVoice}
            className="text-purple-300 hover:text-white hover:bg-purple-500/20 transition-all h-8"
          >
            {voiceEnabled ? (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Audio on
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                Audio off
              </>
            )}
          </Button>
        </div>

        {showQuickReplies && !isHandoff && <QuickReplies actions={lastMessage.suggestedActions!} onSelect={handleQuickReply} />}

        <div className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <ChatInput ref={chatInputRef} onSend={sendMessage} disabled={isLoading || isHandoff} voiceMode={voiceMode} />
        </div>
      </div>
    </div>
  )
}
