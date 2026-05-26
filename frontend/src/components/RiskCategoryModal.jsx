import ThirdPartyMap from "./ThirdPartyMap.jsx"
import { severityColor, severityEmoji } from "../utils/formatters.js"

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="max-h-[82vh] w-full max-w-[390px] overflow-y-auto rounded-3xl border border-slate-300 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {severityEmoji[category.severity] || severityEmoji.yellow} Risk detail
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {category.displayName || category.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg"
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <div className={`mt-4 rounded-2xl border p-3 ${severityColor[category.severity] || severityColor.yellow}`}>
          <p className="text-sm leading-6">{category.summary}</p>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-black text-slate-950">Extracted findings</h3>
          <ol className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
            {findings.map((finding, index) => (
              <li key={`${finding}-${index}`} className="rounded-2xl border border-slate-200 p-3">
                {finding}
              </li>
            ))}
          </ol>
        </div>

        {isThirdParty ? <ThirdPartyMap recipients={category.recipients || []} /> : null}

        <button
          type="button"
          onClick={onShowTrace}
          className="mt-5 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
        >
          Show Me Where
        </button>
      </div>
    </div>
  )
}
