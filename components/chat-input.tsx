"use client"

import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, MicOff } from "lucide-react"
import { startListening, stopListening, isVoiceSupported, initVoice } from "@/lib/voice"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)

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

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
    } else {
      startListening({
        onResult: (transcript) => {
          setInput(transcript)
          setIsListening(false)
          // Auto-send the transcribed message
          setTimeout(() => {
            onSend(transcript)
            setInput("")
          }, 100)
        },
        onError: (error) => {
          setIsListening(false)
        },
        onEnd: () => {
          setIsListening(false)
        },
      })
      setIsListening(true)
    }
  }

  return (
    <div className="border-t border-purple-500/20 bg-gradient-to-r from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] backdrop-blur-xl px-4 py-4 shadow-2xl shadow-purple-900/30">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Speak or type your request…"}
              disabled={disabled || isListening}
              className="min-h-[52px] max-h-[200px] resize-none bg-[#0f0520]/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 pr-12 backdrop-blur-sm shadow-inner"
              rows={1}
            />
            {isListening && (
              <div className="absolute right-4 top-4">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-pink-500 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            )}
          </div>
          {voiceSupported && (
            <Button
              type="button"
              size="lg"
              onClick={handleVoiceToggle}
              disabled={disabled}
              className={`h-[52px] px-6 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
                isListening
                  ? "bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 animate-pulse"
                  : "bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500"
              } text-white font-semibold shadow-purple-900/30`}
            >
              {isListening ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
              {isListening ? "Stop" : "Voice"}
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={disabled || !input.trim()}
            className="h-[52px] px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-5 w-5 mr-2" />
            Send
          </Button>
        </div>
        <p className="text-xs text-purple-400/50 text-center mt-2">Voice demo — real phone calls coming next</p>
      </form>
    </div>
  )
}
