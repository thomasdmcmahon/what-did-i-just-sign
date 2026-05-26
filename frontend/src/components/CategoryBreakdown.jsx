import { severityColor, severityEmoji } from "../utils/formatters.js"

export default function CategoryBreakdown({ categories }) {
  return (
    <section className="border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Category breakdown</h2>
      <div className="mt-4 grid gap-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`border p-4 ${severityColor[category.severity] || severityColor.yellow}`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <span>{severityEmoji[category.severity] || severityEmoji.yellow}</span>
              <span>{category.name}</span>
            </div>
            <p className="mt-2 text-sm leading-6">{category.summary}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
