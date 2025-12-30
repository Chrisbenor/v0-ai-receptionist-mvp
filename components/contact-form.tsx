"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ContactFormProps {
  onSubmit: (name: string, email: string, details: string) => void
  onCancel: () => void
}

export function ContactForm({ onSubmit, onCancel }: ContactFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [details, setDetails] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim() && email.trim()) {
      onSubmit(name.trim(), email.trim(), details.trim())
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="ml-11 mr-12 rounded-lg border border-border bg-card p-4">
        <h4 className="font-semibold mb-3 text-sm">Contact Information</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="details" className="text-sm">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Any additional information..."
              rows={2}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" size="sm">
              Submit
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
