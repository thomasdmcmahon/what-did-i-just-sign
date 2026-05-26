import { useState } from "react"
import { Info, X } from "lucide-react"

import { scoreLabel } from "../utils/formatters.js"

const scoreTiers = [
  {
    range: "80-100",
    label: "Privacy-Friendly",
    description: "Minimal data collection, clear opt-outs, and transparent practices.",
    dot: "bg-emerald-500",
  },
  {
    range: "60-80",
    label: "Acceptable",
    description: "Standard practices with some concerns worth reviewing.",
    dot: "bg-yellow-500",
  },
  {
    range: "40-60",
    label: "Moderately Invasive",
    description: "Significant data sharing or retention. Proceed with caution.",
    dot: "bg-amber-500",
  },
  {
    range: "0-40",
    label: "Highly Invasive",
    description: "Broad collection, extensive sharing, or limited user rights.",
    dot: "bg-red-500",
  },
]

function ScoreRing({ score }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const strokeColor =
    score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f59e0b" : "#ef4444"

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
          <circle cx="68" cy="68" r={radius} fill="none" stroke="#e8ebf5" strokeWidth="10" />
          <circle
            cx="68"
            cy="68"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black leading-none" style={{ color: strokeColor }}>
            {score}
          </span>
          <span className="mt-0.5 text-xs font-bold text-white/55">/ 100</span>
        </div>
      </div>
    </div>
  )
}

export default function SummaryHeader({ score, verdict, policyName }) {
  const [showScoreInfo, setShowScoreInfo] = useState(false)
  const overallMessage =
    score < 40
      ? "Overall risk is high. Review the flagged areas before agreeing."
      : score < 60
        ? "Overall risk is moderate. A few privacy tradeoffs need attention."
        : score < 80
          ? "Overall risk is manageable. Still review any yellow or red cards."
          : "Overall risk is low. The policy appears more privacy-friendly."

  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#1c3557] to-[#2a3f6e] p-4 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">
            Policy score
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight">{verdict}</h1>
          <p className="mt-1 max-w-[190px] truncate text-xs font-medium text-white/55">
            {policyName || "Privacy policy"}
          </p>
        </div>
        <ScoreRing score={score} />
      </div>

      <div className="mt-2 text-center">
        <div className="mb-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
            Overall risk
          </p>
          <p className="mt-1 text-sm font-semibold leading-5 text-white/85">
            {overallMessage}
          </p>
        </div>
        <p className="text-xs font-semibold leading-5 text-white/60">
          Higher score = better privacy. Lower score = more invasive.
        </p>
        <button
          type="button"
          onClick={() => setShowScoreInfo(true)}
          className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-white/70 underline-offset-4 hover:text-white"
        >
          <Info className="h-3.5 w-3.5" />
          How we calculate the score
        </button>
      </div>

      {showScoreInfo ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#12152a]/45 px-4 backdrop-blur-sm">
          <div className="max-h-[82vh] w-full max-w-[390px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 text-slate-900 [animation:sheet-up_0.28s_ease]">
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Score guide</p>
                <h2 className="text-xl font-black text-slate-950">Higher is safer</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowScoreInfo(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
                aria-label="Close score guide"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              We weigh data collection, third-party sharing, tracking, retention, and user rights.
              Lower scores mean the policy favors the company more than you.
            </p>
            <div className="mt-5 grid gap-3">
              {scoreTiers.map((tier) => (
                <div
                  key={tier.range}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tier.dot}`} />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-slate-950">{tier.label}</span>
                      <span className="text-xs font-semibold text-slate-500">{tier.range}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{tier.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
