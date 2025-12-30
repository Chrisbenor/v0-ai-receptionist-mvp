import { Calendar, Clock, Timer } from "lucide-react"
import type { BookingEvent } from "@/app/chat/page"

interface BookingConfirmationProps {
  event: BookingEvent
}

export function BookingConfirmation({ event }: BookingConfirmationProps) {
  return (
    <div className="max-w-4xl mx-auto mt-3 ml-11">
      <div className="mr-12 rounded-lg border border-border bg-card p-4 space-y-3">
        <h4 className="font-semibold text-sm">Appointment Details</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span>{event.durationMinutes} minutes</span>
          </div>
        </div>
      </div>
    </div>
  )
}
