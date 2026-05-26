import { cardSeverityColor, severityEmoji } from "../utils/formatters.js"

const icons = {
  "Data Collection": "◎",
  "Third Party Sharing": "↗",
  "Third-Party Sharing": "↗",
  Retention: "⌛",
  "Data Retention": "⌛",
  "Tracking/Detection": "⌁",
  "Cookies & Tracking": "⌁",
  "Overall Risk": "!",
}

function shorten(text) {
  if (!text) {
    return "Tap for details."
  }

  const sentence = text.split(".")[0]
  return sentence.length > 58 ? `${sentence.slice(0, 55)}...` : sentence
}

export default function RiskCardGrid({ categories, onSelect }) {
  return (
    <section className="grid grid-cols-2 gap-3">
      {categories.map((category) => (
        <button
          key={category.name}
          type="button"
          onClick={() => onSelect(category)}
          className={`min-h-32 rounded-3xl border p-4 text-left ${
            cardSeverityColor[category.severity] || cardSeverityColor.yellow
          } ${category.name === "Overall Risk" ? "col-span-2 min-h-24" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-current text-lg font-black">
              {icons[category.name] || "•"}
            </span>
            <span className="text-lg">{severityEmoji[category.severity] || severityEmoji.yellow}</span>
          </div>
          <h2 className="mt-3 text-base font-black leading-tight text-slate-950">
            {category.displayName || category.name}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-700">{shorten(category.summary)}</p>
        </button>
      ))}
    </section>
  )
}
