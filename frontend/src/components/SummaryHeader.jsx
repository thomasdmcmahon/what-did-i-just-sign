import { useEffect, useRef, useState } from "react"
import { Info, X } from "lucide-react"

import ExplainedText from "./ExplainedText.jsx"
import { inlineExplanations } from "../utils/formatters.js"

const scoreTiers = [
  {
    range: "80-100",
    dot: "bg-emerald-500",
  },
  {
    range: "60-80",
    dot: "bg-yellow-500",
  },
  {
    range: "40-60",
    dot: "bg-amber-500",
  },
  {
    range: "0-40",
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

function trimSummary(summary) {
  return `${summary || ""}`
    .split(/(?<=[.!?。！？])\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .join(" ")
}

export default function SummaryHeader({
  score,
  verdict,
  policyName,
  summary,
  keyTerms = [],
  explanations = [],
  t,
}) {
  const [showScoreInfo, setShowScoreInfo] = useState(false)
  const summaryRef = useRef(null)
  const [summaryScroll, setSummaryScroll] = useState({ height: 100, top: 0 })
  const displayVerdict = t.verdictLabels[verdict] || verdict
  const tooltipTerms = [...keyTerms, ...inlineExplanations(explanations)]
  const overallMessage =
    score < 40
      ? t.overallMessages.high
      : score < 60
        ? t.overallMessages.moderate
        : score < 80
          ? t.overallMessages.manageable
          : t.overallMessages.low

  function updateSummaryScroll() {
    const element = summaryRef.current
    if (!element) {
      return
    }

    const maxScroll = element.scrollHeight - element.clientHeight
    if (maxScroll <= 0) {
      setSummaryScroll({ height: 100, top: 0 })
      return
    }

    const height = Math.max(18, (element.clientHeight / element.scrollHeight) * 100)
    const top = (element.scrollTop / maxScroll) * (100 - height)
    setSummaryScroll({ height, top })
  }

  useEffect(() => {
    updateSummaryScroll()
    window.addEventListener("resize", updateSummaryScroll)
    return () => window.removeEventListener("resize", updateSummaryScroll)
  }, [summary])

  return (
    <section className="flex h-full min-h-[23rem] min-w-0 flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c3557] to-[#2a3f6e] p-4 text-white lg:h-[34rem]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">
            {t.policyScore}
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight">{displayVerdict}</h1>
          <p className="mt-1 max-w-[190px] truncate text-xs font-medium text-white/55">
            {policyName || t.privacyPolicy}
          </p>
        </div>
        <ScoreRing score={score} />
      </div>

      <div className="mt-2 text-center">
        <div className="mb-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
            {t.overallRisk}
          </p>
          <p className="mt-1 text-sm font-semibold leading-5 text-white/85">
            {overallMessage}
          </p>
        </div>
        <p className="text-xs font-semibold leading-5 text-white/60">
          {t.higherScore}
        </p>
        <button
          type="button"
          onClick={() => setShowScoreInfo(true)}
          className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-white/70 underline-offset-4 hover:text-white"
        >
          <Info className="h-3.5 w-3.5" />
          {t.scoreGuideButton}
        </button>
      </div>

      {summary ? (
        <div className="relative mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
            {t.generalSummary}
          </p>
          <p
            ref={summaryRef}
            onScroll={updateSummaryScroll}
            className="mt-2 min-h-0 max-w-full flex-1 overflow-y-scroll pr-5 text-sm font-medium leading-6 text-white/82 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ExplainedText
              text={trimSummary(summary)}
              terms={tooltipTerms}
              severity="light"
            />
          </p>
          <div className="pointer-events-none absolute bottom-3 right-3 top-10 w-1.5 rounded-full bg-white/15">
            <div
              className="absolute left-0 w-1.5 rounded-full bg-white/60"
              style={{
                height: `${summaryScroll.height}%`,
                top: `${summaryScroll.top}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {showScoreInfo ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#12152a]/45 px-4 backdrop-blur-sm">
          <div className="max-h-[82vh] w-full max-w-[390px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 text-slate-900 [animation:sheet-up_0.28s_ease]">
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{t.scoreGuideTitle}</p>
                <h2 className="text-xl font-black text-slate-950">{t.higherIsSafer}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowScoreInfo(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
                aria-label={t.closeDetails}
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {t.scoreGuideDescription}
            </p>
            <div className="mt-5 grid gap-3">
              {scoreTiers.map((tier, index) => (
                <div
                  key={t.scoreTiers[index][0]}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tier.dot}`} />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-slate-950">
                        {t.scoreTiers[index][1]}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {t.scoreTiers[index][0]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {t.scoreTiers[index][2]}
                    </p>
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
