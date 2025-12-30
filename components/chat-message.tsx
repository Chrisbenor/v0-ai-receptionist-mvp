import type { Message } from "@/app/chat/page"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3 max-w-4xl mx-auto", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
          isUser ? "bg-[#E1F404] text-[#232323]" : "bg-[#31A6A7] text-white",
        )}
      >
        {isUser ? "U" : "AI"}
      </div>
      <div
        className={cn(
          "flex-1 rounded-lg px-4 py-3 text-sm",
          isUser ? "bg-[#E1F404] text-[#232323] ml-12" : "bg-[#232323]/80 text-white mr-12",
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}
