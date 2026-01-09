"use client"

import type React from "react"
import { useState, useEffect, useRef, useImperativeHandle, forwardRef, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, MicOff } from "lucide-react"
import { startListening, stopListening, isVoiceSupported, initVoice } from "@/lib/voice"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  voiceMode?: boolean
  isSpeaking?: boolean
}

export const ChatInput = forwardRef<{ startVoiceCapture: () => void }, ChatInputProps>(
  ({ onSend, disabled, voiceMode = false, isSpeaking = false }, ref) => {
    const [input, setInput] = useState("")
    const [isListening, setIsListening] = useState(false)
    const [voiceSupported, setVoiceSupported] = useState(false)
    const isListeningRef = useRef(false)

    useEffect(() => {
      initVoice()
      setVoiceSupported(isVoiceSupported())
    }, [])

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      if (input.trim() && !disabled) {
        onSend(input.trim())
        setInput("")
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    }

    const startVoiceCapture = () => {
      if (isListeningRef.current || isSpeaking || disabled) {
        return
      }

      isListeningRef.current = true
      setIsListening(true)

      startListening({
        onResult: (transcript) => {
          setInput(transcript)
          setIsListening(false)
          isListeningRef.current = false

          if (transcript.trim()) {
            setTimeout(() => {
              onSend(transcript.trim())
              setInput("")
            }, 100)
          }
        },
        onError: (error) => {
          console.error("[v0] Voice error:", error)
          setIsListening(false)
          isListeningRef.current = false
        },
        onEnd: () => {
          setIsListening(false)
          isListeningRef.current = false
        },
      })
    }

    useImperativeHandle(ref, () => ({
      startVoiceCapture,
    }))

    const handleVoiceToggle = () => {
      if (isListening || isListeningRef.current) {
        stopListening()
        setIsListening(false)
        isListeningRef.current = false
      } else {
        startVoiceCapture()
      }
    }

    useEffect(() => {
      if (!voiceMode && (isListening || isListeningRef.current)) {
        stopListening()
        setIsListening(false)
        isListeningRef.current = false
      }
    }, [voiceMode])

    return (
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
          <div className="flex-1 min-w-0 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Speak or type your request…"}
              disabled={disabled || isListening}
              className="min-h-[48px] max-h-[200px] resize-none bg-[#0f0520]/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 pr-12 backdrop-blur-sm shadow-inner w-full"
              rows={1}
            />
            {isListening && (
              <div className="absolute right-4 top-3">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-pink-500 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {voiceSupported && (
              <Button
                type="button"
                size="lg"
                onClick={handleVoiceToggle}
                disabled={disabled}
                className={`h-12 px-4 sm:px-6 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex-1 sm:flex-initial ${
                  isListening
                    ? "bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 animate-pulse"
                    : "bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500"
                } text-white font-semibold shadow-purple-900/30`}
              >
                {isListening ? <MicOff className="h-5 w-5 sm:mr-2" /> : <Mic className="h-5 w-5 sm:mr-2" />}
                <span className="hidden sm:inline">{isListening ? "Stop" : "Voice"}</span>
              </Button>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={disabled || !input.trim()}
              className="h-12 px-4 sm:px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex-1 sm:flex-initial"
            >
              <Send className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-purple-400/50 text-center mt-2">Voice demo — real phone calls coming next</p>
      </form>
    )
  },
)

ChatInput.displayName = "ChatInput"
