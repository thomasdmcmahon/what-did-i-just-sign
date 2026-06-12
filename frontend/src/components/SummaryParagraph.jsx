import ExplainedText from "./ExplainedText.jsx"
import { inlineExplanations } from "../utils/formatters.js"

function trimSummary(summary) {
  return summary
    .split(/(?<=[.!?。！？])\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .join(" ")
}

export default function SummaryParagraph({
  summary,
  keyTerms = [],
  explanations = [],
}) {
  const tooltipTerms = [...keyTerms, ...inlineExplanations(explanations)]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm leading-6 text-slate-600">
        <ExplainedText
          text={trimSummary(summary)}
          terms={tooltipTerms}
          severity="yellow"
        />
      </p>
    </section>
  )
}
