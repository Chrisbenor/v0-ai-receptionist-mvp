import type { Message } from "@/app/chat/page"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex gap-4 max-w-4xl mx-auto animate-in fade-in-50 slide-in-from-bottom-5",
        isUser && "flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
          isUser
            ? "bg-gradient-to-br from-purple-600 to-pink-600"
            : "bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-purple-400/30",
        )}
      >
        {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
      </div>
      <div
        className={cn(
          "flex-1 rounded-2xl px-5 py-3.5 text-sm backdrop-blur-sm border shadow-lg",
          isUser
            ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white ml-12 border-purple-400/30 shadow-purple-900/30"
            : "bg-[#1a0b2e]/60 text-white mr-12 border-purple-500/20 shadow-purple-900/10",
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}
