import Link from "next/link"
import Image from "next/image"
import { MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChatHeader() {
  return (
    <header className="border-b border-purple-500/20 bg-gradient-to-r from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] backdrop-blur-xl px-4 py-4 shadow-lg shadow-purple-900/20">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-purple-500/20 transition-all">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Image src="/aigencee-logo.svg" alt="AIGENCEE" width={100} height={24} className="h-6 w-auto invert" />
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-white text-lg">AI Receptionist</span>
              </div>
              <span className="text-xs text-purple-300/70 ml-10">Voice & Chat Assistant</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-400">Online</span>
        </div>
      </div>
    </header>
  )
}
