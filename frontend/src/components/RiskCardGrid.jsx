import { Activity, ChevronRight, Clock, Crosshair, Eye, Users } from "lucide-react"

import { cardSeverityColor, severityBadge } from "../utils/formatters.js"

const icons = {
  "Data Collection": Eye,
  "Third Party Sharing": Users,
  "Third-Party Sharing": Users,
  Retention: Clock,
  "Data Retention": Clock,
  "Tracking/Detection": Crosshair,
  "Cookies & Tracking": Crosshair,
}

function shorten(text, fallback) {
  if (!text) {
    return fallback
  }

  const sentence = text.split(".")[0]
  return sentence.length > 56 ? `${sentence.slice(0, 53)}...` : sentence
}

export default function RiskCardGrid({ categories, onSelect, t }) {
  return (
    <section className="px-0">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {t.riskBreakdown}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const Icon = icons[category.name] || Activity

          return (
            <button
              key={category.name}
              type="button"
              onClick={() => onSelect(category)}
              className={`flex min-h-32 flex-col gap-2.5 rounded-2xl border p-4 text-left transition active:scale-[0.97] ${
                cardSeverityColor[category.severity] || cardSeverityColor.yellow
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/75">
                  <Icon className="h-4 w-4 text-slate-700" strokeWidth={2} />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    severityBadge[category.severity] || severityBadge.yellow
                  }`}
                >
                  {t.severityLabels[category.severity] || t.severityLabels.yellow}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-black leading-tight text-slate-950">
                  {category.displayName || category.name}
                </h2>
                <p className="mt-1 text-[11px] leading-snug text-slate-600">
                  {shorten(category.summary, t.tapForDetails)}
                </p>
              </div>
              <ChevronRight className="mt-auto h-3.5 w-3.5 self-end text-slate-400" />
            </button>
          )
        })}
      </div>
    </section>
  )
}
