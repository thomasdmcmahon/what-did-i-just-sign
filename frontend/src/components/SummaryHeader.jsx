import { useState } from "react"

import { scoreLabel } from "../utils/formatters.js"

const scoreTiers = [
  {
    range: "0-40",
    label: "Highly Invasive",
    description: "Major privacy risks appear. The policy may collect, track, share, or retain data in ways that deserve caution.",
    color: "border-red-300 bg-red-50 text-red-950",
  },
  {
    range: "40-60",
    label: "Moderately Invasive",
    description: "Some privacy protections exist, but the policy still has meaningful tradeoffs.",
    color: "border-orange-300 bg-orange-50 text-orange-950",
  },
  {
    range: "60-80",
    label: "Acceptable",
    description: "The policy looks manageable, though a few areas still deserve attention.",
    color: "border-yellow-300 bg-yellow-50 text-yellow-950",
  },
  {
    range: "80-100",
    label: "Privacy-Friendly",
    description: "Lower-risk practices, clearer rights, and stronger limits on data use.",
    color: "border-green-300 bg-green-50 text-green-950",
  },
]

export default function SummaryHeader({ score, verdict, title }) {
  const [showScoreInfo, setShowScoreInfo] = useState(false)
  const scoreInfo = scoreLabel(score)

  return (
    <section className="rounded-3xl border border-slate-300 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{verdict}</h1>
        </div>
        <div className="text-right">
          <div className={`text-5xl font-black leading-none ${scoreInfo.color}`}>{score}</div>
          <p className="mt-1 text-xs font-bold text-slate-500">Policy score</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-800 opacity-85">
          Higher score = better privacy. Lower score = more invasive.
        </p>
        <button
          type="button"
          onClick={() => setShowScoreInfo(true)}
          className="mt-2 text-sm font-black text-slate-950 underline underline-offset-4"
        >
          How we calculate the score
        </button>
      </div>

      {showScoreInfo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="max-h-[82vh] w-full max-w-[390px] overflow-y-auto rounded-3xl border border-slate-300 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Score guide</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Higher is safer
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowScoreInfo(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg"
                aria-label="Close score guide"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              The score estimates how privacy-friendly the policy is. We look at data collection,
              third-party sharing, tracking, retention, and user rights.
            </p>

            <div className="mt-4 grid gap-2">
              {scoreTiers.map((tier) => (
                <div key={tier.range} className={`rounded-2xl border p-3 ${tier.color}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-black">{tier.range}</span>
                    <span className="text-sm font-black">{tier.label}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
