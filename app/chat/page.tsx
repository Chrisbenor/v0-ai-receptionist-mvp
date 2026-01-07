"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Volume2, VolumeX, Mic, MicOff } from "lucide-react"
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
        ? `Hi ${firstName}! Thanks for trying AIGENCEE's AI Receptionist. I'm here to answer calls and messages, book appointments, and route requests for ${companyName || "your business"}. How can I help you today?`
        : "Hi! Thanks for trying AIGENCEE's AI Receptionist.\nI'm here to answer calls and messages, book appointments, and route requests for your business.\nHow can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceMode, setVoiceMode] = useState(false)
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

  useEffect(() => {
    initVoice()
  }, [])

  useEffect(() => {
    document.body.classList.add("overflow-hidden")
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [])

  const sendMessage = async (content: string, additionalInfo?: { name?: string; email?: string }) => {
    stopSpeaking()

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
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

        if (voiceEnabled) {
          setTimeout(() => {
            speak(data.message)
          }, 100)
        }

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

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking()
    }
    setVoiceEnabled(!voiceEnabled)
  }

  const toggleVoiceMode = () => {
    setVoiceMode(!voiceMode)
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
          </div>
        ))}

        {isLoading && <TypingIndicator />}

        {showContactForm && <ContactForm onSubmit={handleContactSubmit} onCancel={() => setShowContactForm(false)} />}

        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 z-20 w-full border-t border-purple-500/20 bg-gradient-to-r from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] backdrop-blur-xl shadow-2xl shadow-purple-900/30">
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

        {showQuickReplies && <QuickReplies actions={lastMessage.suggestedActions!} onSelect={handleQuickReply} />}

        <div className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <ChatInput onSend={sendMessage} disabled={isLoading} voiceMode={voiceMode} />
        </div>
      </div>
    </div>
  )
}
