export const severityColor = {
  red: "border-red-200 bg-red-50 text-red-900",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-900",
  green: "border-green-200 bg-green-50 text-green-900",
}

export const severityEmoji = {
  red: "🔴",
  yellow: "🟡",
  green: "🟢",
}

export function scoreLabel(score) {
  if (score >= 75) {
    return { label: "Privacy-Friendly", color: "text-green-700" }
  }

  if (score >= 50) {
    return { label: "Acceptable", color: "text-yellow-700" }
  }

  if (score >= 25) {
    return { label: "Moderately Invasive", color: "text-orange-700" }
  }

  return { label: "Highly Invasive", color: "text-red-700" }
}
