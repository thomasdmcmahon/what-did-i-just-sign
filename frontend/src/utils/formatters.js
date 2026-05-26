export const severityColor = {
  red: "border-red-300 bg-red-50 text-red-950",
  yellow: "border-orange-300 bg-orange-50 text-orange-950",
  green: "border-green-300 bg-green-50 text-green-950",
}

export const severityEmoji = {
  red: "🔴",
  yellow: "🟡",
  green: "🟢",
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
  red: "border-red-300 bg-red-50",
  yellow: "border-orange-300 bg-orange-50",
  green: "border-green-300 bg-green-50",
}

export const modalHighlight = "bg-pink-100 text-slate-950 px-1"

export const cardSpacing = {
  page: "mx-auto flex min-h-screen max-w-[420px] flex-col px-4 py-5",
  card: "rounded-3xl border p-4",
  sectionGap: "gap-3",
}
