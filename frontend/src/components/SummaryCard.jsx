import { scoreLabel } from "../utils/formatters.js"

export default function SummaryCard({ summary, score, verdict }) {
  const scoreInfo = scoreLabel(score)

  return (
    <section className="border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{verdict}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{summary}</p>
        </div>
        <div className="min-w-32 text-right">
          <div className={`text-5xl font-bold ${scoreInfo.color}`}>{score}</div>
          <div className={`mt-1 text-sm font-semibold ${scoreInfo.color}`}>
            {scoreInfo.label}
          </div>
        </div>
      </div>
    </section>
  )
}
