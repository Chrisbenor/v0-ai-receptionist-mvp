"use client"

import { Button } from "@/components/ui/button"
import type { SuggestedAction } from "@/app/chat/page"

interface QuickRepliesProps {
  actions: SuggestedAction[]
  onSelect: (value: string) => void
}

export function QuickReplies({ actions, onSelect }: QuickRepliesProps) {
  return (
    <div className="px-4 py-3 border-b border-purple-500/10">
      <p className="text-xs text-purple-400/70 mb-2">Quick replies:</p>
      <div className="w-full overflow-x-auto overscroll-x-contain pb-1">
        <div className="flex gap-2 whitespace-nowrap">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSelect(action.value)}
              className="h-11 px-4 rounded-xl text-sm border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-white hover:text-white transition-all hover:scale-105 flex-shrink-0"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
