import { severityColor, severityEmoji, summaryPoints } from "../utils/formatters.js"

export default function CategoryBreakdown({ categories }) {
  return (
    <section className="border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Category breakdown</h2>
      <div className="mt-4 grid gap-3">
        {categories.map((category) => {
          const points = summaryPoints(category, "No specific detail was returned for this category.")

          return (
            <div
              key={category.name}
              className={`border p-4 ${severityColor[category.severity] || severityColor.yellow}`}
            >
              <div className="flex items-center gap-2 font-semibold">
                <span>{severityEmoji[category.severity] || severityEmoji.yellow}</span>
                <span>{category.name}</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {points.map((point, index) => (
                  <li key={`${point}-${index}`} className="flex gap-2 text-sm leading-6">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
