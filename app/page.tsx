"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, Clock, Users, Video, Send, ChevronDown, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [activeTab, setActiveTab] = useState("home-services")
  const [showDialog, setShowDialog] = useState(false)
  const [step, setStep] = useState<"info" | "purpose">("info")
  const [userInfo, setUserInfo] = useState({ firstName: "", lastName: "", email: "", company: "" })

  const [heroChatMessages, setHeroChatMessages] = useState([{ role: "assistant", text: "Hi! How can I help today?" }])
  const [isHeroTyping, setIsHeroTyping] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    const runAnimation = () => {
      // Reset messages
      setHeroChatMessages([{ role: "assistant", text: "Hi! How can I help today?" }])
      setIsHeroTyping(false)

      // Step 1: Show typing
      const timer1 = setTimeout(() => {
        setIsHeroTyping(true)
      }, 2000)

      // Step 2: Add user message
      const timer2 = setTimeout(() => {
        setIsHeroTyping(false)
        setHeroChatMessages((prev) => [...prev, { role: "user", text: "Do you have availability tomorrow?" }])
      }, 3500)

      // Step 3: Show typing again
      const timer3 = setTimeout(() => {
        setIsHeroTyping(true)
      }, 4500)

      // Step 4: Add assistant response
      const timer4 = setTimeout(() => {
        setIsHeroTyping(false)
        setHeroChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Yes! I can book you at 2 PM or 4 PM. Which works better?" },
        ])
      }, 6000)

      // Step 5: Restart animation after pause
      const timer5 = setTimeout(() => {
        setAnimationKey((prev) => prev + 1)
      }, 10000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
        clearTimeout(timer5)
      }
    }

    return runAnimation()
  }, [animationKey])

  const handleStartTrial = () => {
    setShowDialog(true)
    setStep("info")
  }

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("purpose")
  }

  const handlePurposeSelect = (purpose: string) => {
    setUserInfo({ ...userInfo, company: purpose })
    // Redirect to chat with params
    const params = new URLSearchParams({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      company: purpose,
    })
    window.location.href = `/chat?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-[#232323]">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#232323] border border-white/20 text-white max-w-md">
          {step === "info" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[#E1F404] font-heading">Start Your Trial</h3>
                <button onClick={() => setShowDialog(false)} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white/80">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      required
                      value={userInfo.firstName}
                      onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white focus:border-[#E1F404]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white/80">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      required
                      value={userInfo.lastName}
                      onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white focus:border-[#E1F404]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="bg-white/10 border-white/20 text-white focus:border-[#E1F404]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-white/80">
                    Company
                  </Label>
                  <Input
                    id="company"
                    required
                    value={userInfo.company}
                    onChange={(e) => setUserInfo({ ...userInfo, company: e.target.value })}
                    className="bg-white/10 border-white/20 text-white focus:border-[#E1F404]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#E1F404] hover:bg-[#E1F404]/90 text-[#232323] font-semibold"
                >
                  Continue
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[#E1F404] font-heading">Select Your Purpose</h3>
                <button onClick={() => setShowDialog(false)} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-white/70">Choose the purpose that best matches your business:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePurposeSelect("Home Services")}
                  className="p-6 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:border-[#E1F404] transition-all text-center"
                >
                  <div className="text-3xl mb-2">🔧</div>
                  <div className="font-semibold">Home Services</div>
                </button>
                <button
                  onClick={() => handlePurposeSelect("Pro Services")}
                  className="p-6 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:border-[#E1F404] transition-all text-center"
                >
                  <div className="text-3xl mb-2">💼</div>
                  <div className="font-semibold">Pro Services</div>
                </button>
                <button
                  onClick={() => handlePurposeSelect("Restaurants")}
                  className="p-6 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:border-[#E1F404] transition-all text-center"
                >
                  <div className="text-3xl mb-2">🍽️</div>
                  <div className="font-semibold">Restaurants</div>
                </button>
                <button
                  onClick={() => handlePurposeSelect("Clinics")}
                  className="p-6 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:border-[#E1F404] transition-all text-center"
                >
                  <div className="text-3xl mb-2">🏥</div>
                  <div className="font-semibold">Clinics</div>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <header className="border-b border-white/10 bg-[#232323]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/aigencee-logo.svg"
              alt="AIGENCEE"
              width={140}
              height={32}
              className="w-auto brightness-0 invert h-4"
            />
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="text-sm text-white/70 hover:text-[#E1F404] transition-colors hidden md:block"
            >
              How It Works
            </Link>
            <Link
              href="#industries"
              className="text-sm text-white/70 hover:text-[#E1F404] transition-colors hidden md:block"
            >
              Industries
            </Link>
            <Button
              onClick={handleStartTrial}
              size="sm"
              className="bg-[#E1F404] hover:bg-[#E1F404]/90 text-[#232323] font-semibold"
            >
              Try the AI Assistant
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src="/professional-desk-hero.png" alt="" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/95 via-[#1a0a2e]/90 to-[#0a0a0f]/85 z-[1]" />

          <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
              <div className="space-y-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight font-heading">
                  AI Receiptionist
                  <br />
                  <span className="text-[#E1F404]">for Small Businesses</span>
                </h1>
                <p className="text-xl text-white/80 leading-relaxed">
                  Ask questions or book appointments through a simple chat.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={handleStartTrial}
                    size="lg"
                    className="bg-[#E1F404] hover:bg-[#E1F404]/90 text-[#232323] font-semibold text-lg px-8 py-6 h-auto"
                  >
                    Try the AI Assistant
                  </Button>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#31A6A7] text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 font-medium">
                      <MessageSquare className="h-3 w-3" />
                      AI
                    </div>
                    <Image
                      src="/aigencee-logo.svg"
                      alt="AIGENCEE"
                      width={80}
                      height={18}
                      className="h-4 w-auto brightness-0 invert opacity-60"
                    />
                  </div>
                  <button className="text-white/40 hover:text-white/70">
                    <span className="text-lg">⋯</span>
                  </button>
                </div>
                <div className="p-6 space-y-4 h-72">
                  {heroChatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`${
                          msg.role === "user" ? "bg-[#E1F404] text-[#232323]" : "bg-white/10 text-white"
                        } backdrop-blur-sm rounded-2xl px-5 py-3 max-w-xs`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isHeroTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3">
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-white/10 p-4 bg-white/5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#E1F404]"
                      disabled
                    />
                    <button className="bg-[#E1F404] hover:bg-[#E1F404]/90 text-[#232323] p-3 rounded-xl">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <ChevronDown className="h-8 w-8 text-white/40" />
          </div>
        </section>

        <section className="py-20 md:py-28 bg-[#1a1a1a]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white font-heading">
              Everything Your Business Needs to Stay Responsive
            </h2>
            <p className="text-center text-white/60 mb-16 max-w-2xl mx-auto">
              Never miss a customer again with 24/7 AI-powered assistance
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 text-center group hover:bg-white/10 transition-all">
                <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src="/person-using-smartphone-to-chat-with-ai-receptioni.jpg"
                    alt="Natural conversation"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#232323] to-transparent" />
                </div>
                <div className="h-14 w-14 rounded-xl bg-[#E1F404]/20 flex items-center justify-center mb-4 mx-auto">
                  <MessageSquare className="h-7 w-7 text-[#E1F404]" />
                </div>
                <h3 className="font-semibold mb-3 text-xl text-white font-heading">Natural Conversation</h3>
                <p className="text-sm text-white/70 leading-relaxed">Chat naturally without forms or menus.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 text-center group hover:bg-white/10 transition-all">
                <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src="/hands-typing-on-laptop-with-analytics-dashboard-sh.jpg"
                    alt="Book appointments"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#232323] to-transparent" />
                </div>
                <div className="h-14 w-14 rounded-xl bg-[#31A6A7]/20 flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="h-7 w-7 text-[#31A6A7]" />
                </div>
                <h3 className="font-semibold mb-3 text-xl text-white font-heading">Book Appointments</h3>
                <p className="text-sm text-white/70 leading-relaxed">Schedule meetings in seconds.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 text-center group hover:bg-white/10 transition-all">
                <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src="/modern-chat-interface-on-computer-screen-showing-c.jpg"
                    alt="Always available"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#232323] to-transparent" />
                </div>
                <div className="h-14 w-14 rounded-xl bg-[#E1F404]/20 flex items-center justify-center mb-4 mx-auto">
                  <Clock className="h-7 w-7 text-[#E1F404]" />
                </div>
                <h3 className="font-semibold mb-3 text-xl text-white font-heading">Always Available</h3>
                <p className="text-sm text-white/70 leading-relaxed">24/7 instant responses to inquiries.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-[#232323]">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white font-heading">
                A Simple Digital Front Desk
              </h2>
              <p className="text-center text-white/70 mb-16 max-w-3xl mx-auto leading-relaxed text-lg">
                Aigencee's <span className="text-[#E1F404] font-semibold">AI receptionist</span> helps your business
                answer common questions, schedule appointments, and route complex requests to your team when needed.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-[#31A6A7]/50 transition-all group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-[#31A6A7]/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-6 w-6 text-[#31A6A7]" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-lg font-heading">Start a Chat with AI</h3>
                  <p className="text-sm text-white/70 leading-relaxed">Answer customer questions instantly.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-[#31A6A7]/50 transition-all group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-[#31A6A7]/20 flex items-center justify-center flex-shrink-0">
                      <Video className="h-6 w-6 text-[#31A6A7]" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-lg font-heading">Schedule a Virtual Meeting</h3>
                  <p className="text-sm text-white/70 leading-relaxed">Book time directly on your calendar.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-[#31A6A7]/50 transition-all group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-[#31A6A7]/20 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-[#31A6A7]" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-lg font-heading">Contact a Human Assistant</h3>
                  <p className="text-sm text-white/70 leading-relaxed">Route complex requests to your team.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-[#1a1a1a]" id="how-it-works">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white font-heading">
                How the AI Receptionist Works
              </h2>

              <div className="flex flex-wrap justify-center gap-3 mb-12">
                <button
                  onClick={() => setActiveTab("home-services")}
                  className={`px-8 py-3 rounded-xl font-medium transition-all ${
                    activeTab === "home-services"
                      ? "bg-[#E1F404] text-[#232323]"
                      : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  Home Services
                </button>
                <button
                  onClick={() => setActiveTab("pro-services")}
                  className={`px-8 py-3 rounded-xl font-medium transition-all ${
                    activeTab === "pro-services"
                      ? "bg-[#E1F404] text-[#232323]"
                      : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  Pro Services
                </button>
                <button
                  onClick={() => setActiveTab("restaurants")}
                  className={`px-8 py-3 rounded-xl font-medium transition-all ${
                    activeTab === "restaurants"
                      ? "bg-[#E1F404] text-[#232323]"
                      : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  Restaurants
                </button>
                <button
                  onClick={() => setActiveTab("clinics")}
                  className={`px-8 py-3 rounded-xl font-medium transition-all ${
                    activeTab === "clinics"
                      ? "bg-[#E1F404] text-[#232323]"
                      : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  Clinics
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-12 relative border border-white/10 overflow-hidden">
                <div className="relative w-full aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    poster={
                      activeTab === "home-services"
                        ? "/professional-plumber-or-electrician-working-on-hom.jpg"
                        : activeTab === "pro-services"
                          ? "/professional-business-consultant-meeting-with-clie.jpg"
                          : activeTab === "restaurants"
                            ? "/busy-restaurant-interior-with-customers-dining.jpg"
                            : "/modern-medical-clinic-reception-area-with-friendly.jpg"
                    }
                  >
                    <source src="/ai-receptionist-demo-video.jpg" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  <div className="absolute bottom-6 right-6 bg-[#232323] border border-white/20 rounded-2xl shadow-2xl w-80 z-10">
                    <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#31A6A7] text-white px-3 py-1 rounded-lg text-xs font-medium">AI</div>
                        <Image
                          src="/aigencee-logo.svg"
                          alt="AIGENCEE"
                          width={60}
                          height={14}
                          className="h-3 w-auto brightness-0 invert opacity-60"
                        />
                      </div>
                      <button className="text-white/40">⋯</button>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-start">
                        <div className="bg-white/10 rounded-2xl px-4 py-3 max-w-[260px]">
                          <p className="text-xs text-white font-mono leading-relaxed">
                            {activeTab === "home-services" &&
                              "AI: I've set your plumbing appointment for tomorrow at 2PM. Need anything else?"}
                            {activeTab === "pro-services" &&
                              "AI: Your consultation is scheduled for Wednesday at 10 AM. I'll send a calendar invite."}
                            {activeTab === "restaurants" && "AI: Table for 4 reserved tomorrow at 7 PM. See you then!"}
                            {activeTab === "clinics" &&
                              "AI: Your appointment with Dr. Smith is confirmed for Friday at 3 PM."}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-white/10 p-3 bg-white/5 rounded-b-2xl">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-white/40"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-white/70 text-lg mb-10 font-mono">
                Capture urgent calls, answer questions, and book jobs instantly — even after hours.
              </p>

              <div className="text-center">
                <Button
                  onClick={handleStartTrial}
                  size="lg"
                  className="bg-[#E1F404] hover:bg-[#E1F404]/90 text-[#232323] font-semibold text-lg px-10 py-6 h-auto rounded-xl"
                >
                  Try the AI Assistant
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32 bg-gradient-to-br from-[#232323] via-[#1a1a1a] to-[#232323]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight font-heading">
                Ready to Try the AI Receptionist?
              </h2>
              <p className="text-xl text-white/70 leading-relaxed">
                Start a live conversation and see how it works for your business.
              </p>
              <div className="pt-6">
                <Button
                  onClick={handleStartTrial}
                  size="lg"
                  className="bg-[#E1F404] hover:bg-[#E1F404]/90 text-[#232323] font-semibold text-lg px-12 py-7 h-auto rounded-xl"
                >
                  Try the AI Assistant
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="/aigencee-logo.svg"
                alt="AIGENCEE"
                width={120}
                height={28}
                className="w-auto brightness-0 invert h-5"
              />
            </div>
            <p className="text-sm text-white/50">&copy; 2025 Aigencee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
