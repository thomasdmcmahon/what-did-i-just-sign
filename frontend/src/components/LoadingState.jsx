import { useEffect, useState } from "react"

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
    <div className="rounded-3xl border border-slate-300 bg-white p-5 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-300">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
      <p className="mt-4 text-base font-black text-slate-950">
        {loadingMessages[messageIndex]}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-500">
        This can take a few seconds for longer policies.
      </p>
    </div>
  )
}
