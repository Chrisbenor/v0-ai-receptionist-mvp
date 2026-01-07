import Link from "next/link"
import Image from "next/image"
import { MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChatHeader() {
  return (
    <header className="border-b border-purple-500/20 bg-gradient-to-r from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] backdrop-blur-xl shadow-lg shadow-purple-900/20">
      <div className="w-full px-4 pt-4 pb-3 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Row 1: Back button + Logo + Online badge (always visible) */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:bg-purple-500/20 transition-all">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Button>
            </Link>

            {/* Logo area with flex-1 and truncation */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Image
                src="/aigencee-logo.svg"
                alt="AIGENCEE"
                width={100}
                height={24}
                className="h-6 w-auto invert shrink-0"
              />
              <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-purple-500/50 to-transparent shrink-0" />

              {/* Desktop: Title inline with logo */}
              <div className="hidden sm:flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 shrink-0">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-white text-lg truncate">AI Receptionist</span>
                  <span className="text-xs text-purple-300/70 truncate">Voice & Chat Assistant</span>
                </div>
              </div>
            </div>

            {/* Online badge - always visible, shrink-0 to prevent overlap */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 shrink-0">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-400 whitespace-nowrap">Online</span>
            </div>
          </div>

          {/* Row 2: Title (mobile only, below logo) */}
          <div className="flex sm:hidden items-center gap-2 pl-12">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 shrink-0">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-white text-sm truncate">AI Receptionist</span>
              <span className="text-xs text-purple-300/70 truncate">Voice & Chat Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
