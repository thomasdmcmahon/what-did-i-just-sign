function trimSummary(summary) {
  return summary
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .join(" ")
}

export default function SummaryParagraph({ summary }) {
  return (
    <section className="rounded-3xl border border-slate-300 bg-white p-4">
      <p className="text-base leading-7 text-slate-800">{trimSummary(summary)}</p>
    </section>
  )
}
