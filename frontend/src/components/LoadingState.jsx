import { useEffect, useState } from "react"
import { Shield } from "lucide-react"

const loadingMessages = [
  "Reading policy...",
  "Fetching info...",
  "Analyzing data collection...",
  "Checking third-party sharing...",
  "Reviewing retention details...",
  "Creating a privacy score...",
]

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingMessages.length)
    }, 1400)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-8 py-16 text-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-36 w-36 rounded-full border-2 border-indigo-300/30 [animation:ping-slow_2s_ease-in-out_infinite]" />
        <div className="absolute h-24 w-24 rounded-full border border-indigo-300/40 [animation:ping-slow_2s_ease-in-out_infinite_0.4s]" />
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#1c3557] to-[#5b3fe8] shadow-[0_8px_32px_rgba(91,63,232,0.30)]">
          <Shield className="h-9 w-9 text-white" strokeWidth={1.6} />
        </div>
      </div>

      <div>
        <p
          key={messageIndex}
          className="text-lg font-black text-[#12152a] [animation:fade-in-up_0.35s_ease]"
        >
          {loadingMessages[messageIndex]}
        </p>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Scanning for privacy risks...
        </p>
      </div>

      <div className="flex gap-2">
        {loadingMessages.map((message, index) => (
          <div
            key={message}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === messageIndex ? "w-6 bg-[#5b3fe8]" : "w-1.5 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
