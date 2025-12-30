import Link from "next/link"
import Image from "next/image"
import { MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChatHeader() {
  return (
    <header className="border-b border-[#31A6A7]/20 bg-[#232323] px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#E1F404]/10">
              <ArrowLeft className="h-4 w-4 text-white" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Image src="/aigencee-logo.svg" alt="AIGENCEE" width={100} height={24} className="h-6 w-auto invert" />
            <div className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-[#31A6A7]" />
              <span className="font-semibold">AI Receptionist</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#E1F404]" />
          <span className="text-sm text-gray-400">Online</span>
        </div>
      </div>
    </header>
  )
}
