"use client"

import { Button } from "@/components/ui/button"
import type { SuggestedAction } from "@/app/chat/page"

interface QuickRepliesProps {
  actions: SuggestedAction[]
  onSelect: (value: string) => void
}

export function QuickReplies({ actions, onSelect }: QuickRepliesProps) {
  return (
    <div className="px-4 py-3 border-t border-border bg-card/50">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button key={index} variant="outline" size="sm" onClick={() => onSelect(action.value)} className="text-sm">
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
