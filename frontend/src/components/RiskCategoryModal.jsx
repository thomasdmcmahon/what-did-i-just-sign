import { Activity, Clock, Crosshair, Eye, Users, X } from "lucide-react"

import ExplainedText from "./ExplainedText.jsx"
import ThirdPartyMap from "./ThirdPartyMap.jsx"
import {
  cardSeverityColor,
  inlineExplanations,
  severityBadge,
  severityDot,
  summaryPoints,
} from "../utils/formatters.js"

const icons = {
  "Data Collection": Eye,
  "Third Party Sharing": Users,
  Retention: Clock,
  "Tracking/Detection": Crosshair,
  "Overall Risk": Activity,
}

function findingsFromCategory(category, t) {
  const items = [...summaryPoints(category, t.tapForDetails, 4), ...(category.flags || [])].filter(Boolean)
  return items.slice(0, 4)
}

export default function RiskCategoryModal({ category, onClose, onShowTrace, keyTerms = [], t }) {
  if (!category) {
    return null
  }

  const isThirdParty = category.name.includes("Third") || category.displayName?.includes("Third")
  const findings = findingsFromCategory(category, t).slice(0, isThirdParty ? 3 : 4)
  const Icon = icons[category.name] || Activity
  const tooltipTerms = [...keyTerms, ...inlineExplanations(category.explanations)]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12152a]/45 px-4 py-6 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex max-h-[88vh] w-full max-w-[520px] flex-col overflow-hidden rounded-3xl bg-white px-5 py-5 shadow-[0_24px_70px_rgba(18,21,42,0.28)] [animation:sheet-up_0.22s_ease]">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                cardSeverityColor[category.severity] || cardSeverityColor.yellow
              }`}
            >
              <Icon className="h-5 w-5 text-slate-700" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-black leading-tight text-slate-950">
              {category.displayName || category.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"
            aria-label={t.closeDetails}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <span
          className={`inline-block rounded-full px-3 py-1.5 text-xs font-black ${
            severityBadge[category.severity] || severityBadge.yellow
          }`}
        >
          {t.severityLabels[category.severity] || t.severityLabels.yellow}
        </span>

        <div className="mt-4 min-h-0 shrink">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            {t.keyFindings}
          </p>
          <div className="grid gap-2.5">
            {findings.map((finding, index) => (
              <div
                key={`${finding}-${index}`}
                className={`flex items-start gap-3 rounded-2xl border p-3 ${
                  cardSeverityColor[category.severity] || cardSeverityColor.yellow
                }`}
              >
                <div
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    severityDot[category.severity] || severityDot.yellow
                  }`}
                />
                <p className="text-sm leading-6 text-slate-700">
                  <ExplainedText
                    text={finding}
                    terms={tooltipTerms}
                    severity={category.severity}
                  />
                </p>
              </div>
            ))}
          </div>
        </div>

        {isThirdParty ? <ThirdPartyMap recipients={category.recipients || []} t={t} /> : null}

        <button
          type="button"
          onClick={onShowTrace}
          className="mt-4 w-full shrink-0 rounded-2xl bg-gradient-to-br from-[#1c3557] to-[#5b3fe8] px-5 py-3.5 text-sm font-black text-white shadow-[0_4px_16px_rgba(91,63,232,0.28)] active:scale-[0.98]"
        >
          {t.showMeWhere}
        </button>
      </div>
    </div>
  )
}
