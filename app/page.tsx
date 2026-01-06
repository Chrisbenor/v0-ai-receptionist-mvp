"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, Clock, Users, Send, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [activeTab, setActiveTab] = useState("home-services")
  const [showDialog, setShowDialog] = useState(false)
  const [step, setStep] = useState<"info" | "purpose">("info")
  const [userInfo, setUserInfo] = useState({ firstName: "", lastName: "", email: "", company: "" })
  const [isScrolled, setIsScrolled] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleStartTrial = () => {
    setShowDialog(true)
    setStep("info")
    setSubmitError("")
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/activecampaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          company: userInfo.company,
          isInitialSubmit: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit")
      }

      // On success, move to purpose selection
      setStep("purpose")
    } catch (error) {
      setSubmitError("We couldn't start your trial right now. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePurposeSelect = async (purpose: string) => {
    try {
      await fetch("/api/activecampaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          company: userInfo.company,
          industry: purpose, // Send industry as separate field
          isUpdate: true,
        }),
      })
    } catch (error) {
      console.error("[v0] Failed to update industry:", error)
    }

    // Redirect to chat with params
    const params = new URLSearchParams({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      company: userInfo.company,
      industry: purpose, // Pass industry in URL params
    })
    window.location.href = `/chat?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05030D] via-[#12071F] to-[#1A0B2E]">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gradient-to-br from-[#1a0b2e] to-[#0f0520] border-2 border-purple-500/30 text-white max-w-md shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-xl rounded-2xl animate-scale-in">
          {step === "info" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <button
                  onClick={() => setShowDialog(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-all p-2 hover:bg-white/10 rounded-lg hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-heading">
                  Start Your Trial
                </h3>
                <p className="text-white/70 text-sm">Experience the power of AI receptionist for your business</p>
              </div>
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white/90 font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      required
                      value={userInfo.firstName}
                      onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                      className="bg-white/5 border-purple-500/30 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-xl backdrop-blur-sm transition-all hover:border-purple-400/50"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white/90 font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      required
                      value={userInfo.lastName}
                      onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                      className="bg-white/5 border-purple-500/30 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-xl backdrop-blur-sm transition-all hover:border-purple-400/50"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="bg-white/5 border-purple-500/30 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-xl backdrop-blur-sm transition-all hover:border-purple-400/50"
                    placeholder="john@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-white/90 font-medium">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    required
                    value={userInfo.company}
                    onChange={(e) => setUserInfo({ ...userInfo, company: e.target.value })}
                    className="bg-white/5 border-purple-500/30 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-xl backdrop-blur-sm transition-all hover:border-purple-400/50"
                    placeholder="Your Business"
                  />
                </div>
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                    {submitError}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Continue"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <button
                  onClick={() => setShowDialog(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-all p-2 hover:bg-white/10 rounded-lg hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-heading">
                  Select Your Industry
                </h3>
                <p className="text-white/70">Choose the industry that best matches your business:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePurposeSelect("Home Services")}
                  className="group relative p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-purple-500/30 rounded-2xl hover:border-purple-400 transition-all hover:scale-105 active:scale-95 text-center overflow-hidden shadow-lg hover:shadow-purple-900/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all" />
                  <div className="relative">
                    <div className="text-4xl mb-3">🔧</div>
                    <div className="font-semibold text-white">Home Services</div>
                  </div>
                </button>
                <button
                  onClick={() => handlePurposeSelect("Pro Services")}
                  className="group relative p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-purple-500/30 rounded-2xl hover:border-purple-400 transition-all hover:scale-105 active:scale-95 text-center overflow-hidden shadow-lg hover:shadow-purple-900/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all" />
                  <div className="relative">
                    <div className="text-4xl mb-3">💼</div>
                    <div className="font-semibold text-white">Pro Services</div>
                  </div>
                </button>
                <button
                  onClick={() => handlePurposeSelect("Restaurants")}
                  className="group relative p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-purple-500/30 rounded-2xl hover:border-purple-400 transition-all hover:scale-105 active:scale-95 text-center overflow-hidden shadow-lg hover:shadow-purple-900/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all" />
                  <div className="relative">
                    <div className="text-4xl mb-3">🍽️</div>
                    <div className="font-semibold text-white">Restaurants</div>
                  </div>
                </button>
                <button
                  onClick={() => handlePurposeSelect("Clinics")}
                  className="group relative p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-purple-500/30 rounded-2xl hover:border-purple-400 transition-all hover:scale-105 active:scale-95 text-center overflow-hidden shadow-lg hover:shadow-purple-900/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all" />
                  <div className="relative">
                    <div className="text-4xl mb-3">🏥</div>
                    <div className="font-semibold text-white">Clinics</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0B0B14] border-b border-white/10 shadow-lg shadow-black/20"
            : "bg-transparent backdrop-blur-md border-b border-white/5"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/aigencee-logo.svg"
              alt="AIGENCEE"
              width={140}
              height={32}
              className="brightness-0 invert h-4 w-28"
            />
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="text-sm text-white/70 hover:text-purple-400 transition-colors hidden md:block"
            >
              How It Works
            </Link>
            <Link
              href="#industries"
              className="text-sm text-white/70 hover:text-purple-400 transition-colors hidden md:block"
            >
              Industries
            </Link>
            <Button
              onClick={handleStartTrial}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-900/30 transition-all hover:scale-105 active:scale-95 rounded-lg"
            >
              Try the AI Assistant
            </Button>
          </nav>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src="/professional-desk-hero.png" alt="" fill className="object-cover opacity-20" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#05030D] via-[#12071F]/95 to-[#1A0B2E] z-[1]" />

          <div className="absolute inset-0 z-[2] opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
              <div className="space-y-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-full text-sm backdrop-blur-sm shadow-lg shadow-purple-900/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                  <span className="text-white/90 font-medium">Early access — Be among the first to try AIGENCEE</span>
                </div>

                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] font-heading tracking-tight">
                  Never miss a{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 inline-block">
                    customer
                  </span>
                  <br />
                  <span className="text-white/90">again</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-xl">
                  Your AI receptionist answers questions, books appointments, and{" "}
                  <span className="text-purple-400 font-semibold border-b-2 border-purple-400/50">works 24/7</span> —{" "}
                  <span className="text-pink-400 font-semibold border-b-2 border-pink-400/50">even after hours</span>.
                </p>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleStartTrial}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-lg px-10 py-7 h-auto rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] border border-white/10 transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_60px_rgba(168,85,247,0.5)]"
                    >
                      Try It Free Now
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white/20 text-white hover:bg-white/10 font-semibold text-lg px-10 py-7 h-auto rounded-2xl backdrop-blur-sm bg-transparent transition-all hover:scale-105 active:scale-95"
                      onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      See How It Works
                    </Button>
                  </div>
                  <p className="text-sm text-pink-400 flex items-center gap-2 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
                    </span>
                    Limited beta access — No credit card required
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition" />
                <div className="relative bg-[#0a0a1a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                  <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 font-medium shadow-lg">
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
                            msg.role === "user"
                              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-900/30"
                              : "bg-white/10 text-white"
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
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
                        disabled
                      />
                      <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-3 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg shadow-purple-900/30">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section className="py-16 bg-gradient-to-b from-[#0a0a1a] to-[#1a0a2e] border-y border-white/5">
          <div className="container mx-auto px-4">
            <p className="text-center text-white/40 text-sm uppercase tracking-wider mb-8 font-mono">
              Trusted by leading businesses
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <div className="text-white/60 text-2xl font-bold">AUTODESK</div>
              <div className="text-white/60 text-2xl font-bold">INSTACART</div>
              <div className="text-white/60 text-2xl font-bold">MIRO</div>
              <div className="text-white/60 text-2xl font-bold">MONDAY</div>
              <div className="text-white/60 text-2xl font-bold">LYFT</div>
            </div>
          </div>
        </section> */}

        <section className="py-28 md:py-36 bg-[#1a0a2e] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white font-heading">
                Everything your business
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  needs to stay responsive
                </span>
              </h2>
              <p className="text-xl text-white/60 leading-relaxed">
                Stop losing customers to voicemail. Answer every inquiry instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="group bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm p-10 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="relative h-56 mb-8 rounded-2xl overflow-hidden">
                  <Image
                    src="/person-using-smartphone-to-chat-with-ai-receptioni.jpg"
                    alt="Natural conversation"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-pink-500/90 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm">
                    Less than 2 seconds Response
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="font-bold mb-4 text-2xl text-white font-heading">Natural Conversation</h3>
                <p className="text-base text-white/60 leading-relaxed mb-4">
                  Chat naturally without forms or menus. Just like texting a real person.
                </p>
                <p className="text-sm text-purple-400 font-mono">98% customer satisfaction</p>
              </div>

              <div className="group bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm p-10 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="relative h-56 mb-8 rounded-2xl overflow-hidden">
                  <Image
                    src="/hands-typing-on-laptop-with-analytics-dashboard-sh.jpg"
                    alt="Book appointments"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-purple-500/90 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm">
                    +40% Bookings
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="font-bold mb-4 text-2xl text-white font-heading">Book Appointments</h3>
                <p className="text-base text-white/60 leading-relaxed mb-4">
                  Schedule meetings in seconds. Automatic calendar sync and confirmations.
                </p>
                <p className="text-sm text-purple-400 font-mono">Avg. 15s to book</p>
              </div>

              <div className="group bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm p-10 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="relative h-56 mb-8 rounded-2xl overflow-hidden">
                  <Image
                    src="/modern-chat-interface-on-computer-screen-showing-c.jpg"
                    alt="Always available"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-pink-500/90 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm">
                    24/7 Online
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="font-bold mb-4 text-2xl text-white font-heading">Always Available</h3>
                <p className="text-base text-white/60 leading-relaxed mb-4">
                  Never miss another customer. Instant responses at 3 AM or 3 PM.
                </p>
                <p className="text-sm text-purple-400 font-mono">Zero missed calls</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-28 md:py-36 bg-[#0a0a1a]">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold text-center mb-6 text-white font-heading">
                Your digital
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  front desk
                </span>
              </h2>
              <p className="text-center text-white/60 mb-20 max-w-3xl mx-auto leading-relaxed text-xl">
                Aigencee's <span className="text-purple-400 font-semibold">AI receptionist</span> handles everything —{" "}
                <span className="underline decoration-pink-400/50 underline-offset-4">answer questions</span>,{" "}
                <span className="underline decoration-purple-400/50 underline-offset-4">schedule appointments</span>,
                and <span className="underline decoration-blue-400/50 underline-offset-4">route complex requests</span>{" "}
                to your team.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-pink-500/10 to-transparent p-8 rounded-3xl border border-pink-500/20 hover:border-pink-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500/30 to-pink-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-7 w-7 text-pink-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl font-heading">Start a Chat with AI</h3>
                  <p className="text-white/60 leading-relaxed">Answer customer questions instantly, any time of day.</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent p-8 rounded-3xl border border-purple-500/20 hover:border-purple-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Calendar className="h-7 w-7 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl font-heading">Schedule a Virtual Meeting</h3>
                  <p className="text-white/60 leading-relaxed">
                    Book time directly on your calendar with automatic confirmations.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-transparent p-8 rounded-3xl border border-blue-500/20 hover:border-blue-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Users className="h-7 w-7 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl font-heading">Contact a Human Assistant</h3>
                  <p className="text-white/60 leading-relaxed">
                    Route complex requests to your team when needed seamlessly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-28 md:py-36 bg-[#1a0a2e] relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold text-center mb-6 text-white font-heading">
                See it in
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  action
                </span>
              </h2>
              <p className="text-center text-white/60 mb-16 text-xl">
                Watch how the AI receptionist handles real customer interactions
              </p>

              <div className="flex justify-center gap-3 mb-12 flex-wrap">
                {[
                  { id: "home-services", label: "Home Services", icon: "🔧" },
                  { id: "pro-services", label: "Pro Services", icon: "💼" },
                  { id: "restaurants", label: "Restaurants", icon: "🍽️" },
                  { id: "clinics", label: "Clinics", icon: "🏥" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative max-w-4xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 rounded-3xl blur opacity-30" />
                <div className="relative bg-[#0a0a1a]/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                  <div className="relative h-[500px]">
                    <Image
                      src="/ai-receptionist-demo-video.jpg"
                      alt="AI Receptionist Demo"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <button className="h-24 w-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform group">
                        <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-white/80 mt-12 text-lg max-w-3xl mx-auto leading-relaxed">
                Capture urgent calls, <span className="text-pink-400 font-semibold">answer questions</span>, and{" "}
                <span className="text-purple-400 font-semibold">book jobs instantly</span> — even after hours.
              </p>

              <div className="flex justify-center mt-10">
                <Button
                  onClick={handleStartTrial}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg px-12 py-7 h-auto rounded-xl shadow-2xl shadow-purple-500/30"
                >
                  Try the AI Assistant
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="industries" className="py-28 md:py-36 bg-[#0a0a1a]">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold text-center mb-6 text-white font-heading">
                Industries We Serve
              </h2>
              <p className="text-center text-white/60 mb-20 max-w-3xl mx-auto leading-relaxed text-xl">
                Whether you're a local plumber, a busy clinic, or a thriving restaurant,{" "}
                <span className="text-purple-400 font-semibold">Aigencee</span> is built to scale with you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-pink-500/10 to-transparent p-8 rounded-3xl border border-pink-500/20 hover:border-pink-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500/30 to-pink-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-7 w-7 text-pink-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl font-heading">Home Services</h3>
                  <p className="text-white/60 leading-relaxed">
                    Manage appointment booking, service requests, and customer inquiries seamlessly.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent p-8 rounded-3xl border border-purple-500/20 hover:border-purple-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Calendar className="h-7 w-7 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl font-heading">Professional Services</h3>
                  <p className="text-white/60 leading-relaxed">
                    Streamline client intake, schedule consultations, and handle follow-ups efficiently.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-transparent p-8 rounded-3xl border border-blue-500/20 hover:border-blue-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Users className="h-7 w-7 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl font-heading">Restaurants & Cafes</h3>
                  <p className="text-white/60 leading-relaxed">
                    Take reservations, answer menu questions, and manage online orders with ease.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-transparent p-8 rounded-3xl border border-green-500/20 hover:border-green-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/30 to-green-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Clock className="h-7 w-7 text-green-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl font-heading">Clinics & Healthcare</h3>
                  <p className="text-white/60 leading-relaxed">
                    Schedule appointments, answer patient FAQs, and direct calls efficiently.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/10 to-transparent p-8 rounded-3xl border border-yellow-500/20 hover:border-yellow-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Clock className="h-7 w-7 text-yellow-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl font-heading">Retail & E-commerce</h3>
                  <p className="text-white/60 leading-relaxed">
                    Handle customer service inquiries, track orders, and provide product information.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-8 rounded-3xl border border-indigo-500/20 hover:border-indigo-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Users className="h-7 w-7 text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl font-heading">Real Estate</h3>
                  <p className="text-white/60 leading-relaxed">
                    Schedule property viewings, answer agent availability questions, and qualify leads.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-28 md:py-36 bg-gradient-to-b from-[#1a0a2e] to-[#0a0a1a] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight font-heading">
                Ready to try the
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  AI Receptionist?
                </span>
              </h2>
              <p className="text-2xl text-white/70 leading-relaxed max-w-2xl mx-auto">
                Start a live conversation and see how it works for your business.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-8 py-8">
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No credit card required
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Setup in 2 minutes
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cancel anytime
                </div>
              </div>

              <Button
                onClick={handleStartTrial}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xl px-16 py-8 h-auto rounded-xl shadow-2xl shadow-purple-500/40 border border-white/10"
              >
                Start Your Free Trial
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 bg-[#1a1a1a] opacity-100 bg-foreground">
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
