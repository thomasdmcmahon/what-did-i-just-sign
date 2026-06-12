export const severityColor = {
  red: "border-red-200 bg-red-50 text-red-950",
  yellow: "border-amber-200 bg-amber-50 text-amber-950",
  green: "border-emerald-200 bg-emerald-50 text-emerald-950",
}

export const severityEmoji = {
  red: "🔴",
  yellow: "🟡",
  green: "🟢",
}

export function summaryPoints(category, fallback, limit = 4) {
  const points = Array.isArray(category?.summary_points)
    ? category.summary_points
    : Array.isArray(category?.summaryPoints)
      ? category.summaryPoints
      : []

  const cleaned = points
    .map((point) => `${point}`.trim())
    .filter(Boolean)

  if (cleaned.length) {
    return cleaned.slice(0, limit)
  }

  const summary = category?.summary?.trim()
  if (!summary) {
    return [fallback].filter(Boolean)
  }

  return summary
    .split(/(?<=[.!?。！？])\s+/)
    .map((point) => point.trim())
    .filter(Boolean)
    .slice(0, limit)
}

export function inlineExplanations(items = []) {
  return items
    .map((item) => ({
      term: item.term || item.phrase,
      definition: item.definition || item.explanation,
    }))
    .filter((item) => item.term && item.definition)
}

export function scoreLabel(score) {
  if (score >= 80) {
    return { label: "Privacy-Friendly", color: "text-green-700" }
  }

  if (score >= 60) {
    return { label: "Acceptable", color: "text-yellow-700" }
  }

  if (score >= 40) {
    return { label: "Moderately Invasive", color: "text-orange-700" }
  }

  return { label: "Highly Invasive", color: "text-red-700" }
}

export function scoreSeverity(score) {
  if (score >= 80) {
    return "green"
  }

  if (score >= 40) {
    return "yellow"
  }

  return "red"
}

export const cardSeverityColor = {
  red: "border-red-200 bg-red-50",
  yellow: "border-amber-200 bg-amber-50",
  green: "border-emerald-200 bg-emerald-50",
}

export const severityBadge = {
  red: "bg-red-100 text-red-700",
  yellow: "bg-amber-100 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
}

export const severityDot = {
  red: "bg-red-500",
  yellow: "bg-amber-500",
  green: "bg-emerald-500",
}

export const severityLabel = {
  red: "High Risk",
  yellow: "Moderate",
  green: "Low Risk",
}

export const modalHighlight = "bg-pink-100 text-slate-950 px-1"

export const cardSpacing = {
  page: "mx-auto flex min-h-screen max-w-[420px] flex-col",
  card: "rounded-3xl border p-4",
  sectionGap: "gap-3",
}
