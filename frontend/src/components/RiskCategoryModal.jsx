import { Activity, Clock, Crosshair, Eye, Users, X } from "lucide-react"

import ThirdPartyMap from "./ThirdPartyMap.jsx"
import {
  cardSeverityColor,
  severityBadge,
  severityDot,
  severityLabel,
} from "../utils/formatters.js"

const icons = {
  "Data Collection": Eye,
  "Third Party Sharing": Users,
  Retention: Clock,
  "Tracking/Detection": Crosshair,
  "Overall Risk": Activity,
}

function findingsFromCategory(category) {
  const items = [category.summary, ...(category.flags || [])].filter(Boolean)
  return items.slice(0, 4)
}

export default function RiskCategoryModal({ category, onClose, onShowTrace }) {
  if (!category) {
    return null
  }

  const findings = findingsFromCategory(category)
  const isThirdParty = category.name.includes("Third") || category.displayName?.includes("Third")
  const Icon = icons[category.name] || Activity

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#12152a]/45 px-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="max-h-[82vh] w-full max-w-[390px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 [animation:sheet-up_0.28s_ease]">
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                cardSeverityColor[category.severity] || cardSeverityColor.yellow
              }`}
            >
              <Icon className="h-4 w-4 text-slate-700" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-black text-slate-950">
              {category.displayName || category.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
            aria-label="Close details"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <span
          className={`inline-block rounded-full px-3 py-1 text-[11px] font-black ${
            severityBadge[category.severity] || severityBadge.yellow
          }`}
        >
          {severityLabel[category.severity] || severityLabel.yellow}
        </span>

        <p className="mt-4 text-sm leading-6 text-slate-700">{category.summary}</p>

        <div className="mt-5">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Key findings
          </p>
          <div className="grid gap-2">
            {findings.map((finding, index) => (
              <div
                key={`${finding}-${index}`}
                className={`flex items-start gap-3 rounded-xl border p-3 ${
                  cardSeverityColor[category.severity] || cardSeverityColor.yellow
                }`}
              >
                <div
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    severityDot[category.severity] || severityDot.yellow
                  }`}
                />
                <p className="text-xs leading-snug text-slate-700">{finding}</p>
              </div>
            ))}
          </div>
        </div>

        {isThirdParty ? <ThirdPartyMap recipients={category.recipients || []} /> : null}

        <button
          type="button"
          onClick={onShowTrace}
          className="mt-5 w-full rounded-2xl bg-gradient-to-br from-[#1c3557] to-[#5b3fe8] px-5 py-3.5 text-sm font-black text-white shadow-[0_4px_16px_rgba(91,63,232,0.28)] active:scale-[0.98]"
        >
          Show Me Where
        </button>
      </div>
    </div>
  )
}
