// Voice utilities for browser-based speech recognition and text-to-speech
// TODO: Replace with Twilio Voice API for production phone calls
// TODO: Replace TTS with cloud-based voice service (e.g., ElevenLabs, Google Cloud)

export interface VoiceRecognitionOptions {
  onResult: (transcript: string) => void
  onError: (error: string) => void
  onEnd: () => void
}

let recognition: any = null
let synthesis: SpeechSynthesis | null = null

export function initVoice() {
  if (typeof window === "undefined") return

  // Initialize speech recognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (SpeechRecognition) {
    recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"
  }

  // Initialize speech synthesis
  synthesis = window.speechSynthesis
}

export function isVoiceSupported(): boolean {
  if (typeof window === "undefined") return false
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  return !!(SpeechRecognition && window.speechSynthesis)
}

export function startListening(options: VoiceRecognitionOptions): void {
  if (!recognition) {
    options.onError("Speech recognition not supported in this browser")
    return
  }

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    options.onResult(transcript)
  }

  recognition.onerror = (event: any) => {
    // no-speech is common when user doesn't speak - treat as silent cancellation
    if (event.error === "no-speech") {
      options.onEnd()
    } else {
      // Only show errors for actual problems
      options.onError(event.error)
    }
  }

  recognition.onend = () => {
    options.onEnd()
  }

  try {
    recognition.start()
  } catch (error) {
    options.onError("Failed to start speech recognition")
  }
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop()
  }
}

export function speak(text: string, onEnd?: () => void): void {
  if (!synthesis) {
    console.warn("[v0] Speech synthesis not available")
    return
  }

  // Cancel any ongoing speech
  synthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.volume = 1.0
  utterance.lang = "en-US"

  const voices = synthesis.getVoices()
  const englishVoice =
    voices.find((voice) => voice.lang.startsWith("en-") && voice.name.includes("Google")) ||
    voices.find((voice) => voice.lang.startsWith("en-"))

  if (englishVoice) {
    utterance.voice = englishVoice
  }

  if (onEnd) {
    utterance.onend = onEnd
  }

  synthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (synthesis) {
    synthesis.cancel()
  }
}
