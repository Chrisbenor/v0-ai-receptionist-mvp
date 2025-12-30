export function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-4xl mx-auto">
      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-muted text-muted-foreground">
        AI
      </div>
      <div className="flex-1 rounded-lg px-4 py-3 bg-muted mr-12">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
        </div>
      </div>
    </div>
  )
}
