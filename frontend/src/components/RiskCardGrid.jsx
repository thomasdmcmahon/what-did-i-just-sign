import { Activity, ChevronRight, Clock, Crosshair, Eye, Users } from "lucide-react"

import ExplainedText from "./ExplainedText.jsx"
import {
  cardSeverityColor,
  inlineExplanations,
  severityBadge,
  summaryPoints,
} from "../utils/formatters.js"

const icons = {
  "Data Collection": Eye,
  "Third Party Sharing": Users,
  "Third-Party Sharing": Users,
  Retention: Clock,
  "Data Retention": Clock,
  "Tracking/Detection": Crosshair,
  "Cookies & Tracking": Crosshair,
}

export default function RiskCardGrid({ categories, keyTerms = [], onSelect, t }) {
  return (
    <section className="flex min-h-[23rem] flex-col px-0 lg:h-[34rem]">
      <p className="sr-only">
        {t.riskBreakdown}
      </p>
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-3">
        {categories.map((category) => {
          const Icon = icons[category.name] || Activity
          const points = summaryPoints(category, t.tapForDetails, 6)
          const tooltipTerms = [...keyTerms, ...inlineExplanations(category.explanations)]

          return (
            <button
              key={category.name}
              type="button"
              onClick={() => onSelect(category)}
              className={`flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden rounded-2xl border p-4 text-left transition active:scale-[0.97] ${
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
              <div className="min-w-0 overflow-hidden">
                <h2 className="truncate text-sm font-black leading-tight text-slate-950">
                  {category.displayName || category.name}
                </h2>
                <ul className="mt-2 grid gap-1.5 overflow-hidden">
                  {points.map((point, index) => (
                    <li
                      key={`${point}-${index}`}
                      className="flex min-h-0 gap-1.5 text-[11px] leading-snug text-slate-600"
                    >
                      <span className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      <span className="line-clamp-2 min-w-0 overflow-hidden">
                        <ExplainedText
                          text={point}
                          terms={tooltipTerms}
                          severity={category.severity}
                          interactive={false}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <ChevronRight className="mt-auto h-3.5 w-3.5 self-end text-slate-400" />
            </button>
          )
        })}
      </div>
    </section>
  )
}
