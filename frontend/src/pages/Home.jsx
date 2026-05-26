import { useState } from "react"

import ErrorMessage from "../components/ErrorMessage.jsx"
import InputPanel from "../components/InputPanel.jsx"
import LoadingState from "../components/LoadingState.jsx"
import PreferenceModal from "../components/PreferenceModal.jsx"
import RiskCardGrid from "../components/RiskCardGrid.jsx"
import RiskCategoryModal from "../components/RiskCategoryModal.jsx"
import SummaryHeader from "../components/SummaryHeader.jsx"
import SummaryParagraph from "../components/SummaryParagraph.jsx"
import TraceabilityModal from "../components/TraceabilityModal.jsx"
import { useAnalyze } from "../hooks/useAnalyze.js"
import { cardSpacing, scoreSeverity } from "../utils/formatters.js"

const cardTargets = [
  {
    name: "Data Collection",
    displayName: "Data Collection",
    aliases: ["Data Collection"],
  },
  {
    name: "Third Party Sharing",
    displayName: "Third Party",
    aliases: ["Third-Party Sharing", "Third Party Sharing"],
  },
  {
    name: "Retention",
    displayName: "Retention",
    aliases: ["Data Retention", "Retention"],
  },
  {
    name: "Tracking/Detection",
    displayName: "Tracking",
    aliases: ["Cookies & Tracking", "Tracking", "Cookies"],
  },
]

function findCategory(categories, aliases) {
  return categories.find((category) =>
    aliases.some((alias) => category.name.toLowerCase().includes(alias.toLowerCase())),
  )
}

function findClause(clauses, categoryName) {
  const normalized = categoryName.toLowerCase()
  const directMatch = clauses.find((clause) => {
    const haystack = `${clause.title} ${clause.simplified} ${clause.original}`.toLowerCase()
    return normalized
      .split(/[ /-]/)
      .filter((word) => word.length > 4)
      .some((word) => haystack.includes(word))
  })

  return directMatch || clauses[0] || null
}

function recipientsFor(category) {
  const text = `${category.summary || ""} ${(category.clause?.simplified || "")}`.toLowerCase()
  const recipients = []

  if (text.includes("microsoft")) recipients.push("Microsoft")
  if (text.includes("google")) recipients.push("Google")
  if (text.includes("advertis")) recipients.push("Advertisers")
  if (text.includes("analytic")) recipients.push("Analytics")
  if (!recipients.length) recipients.push("Partners")

  return recipients.slice(0, 3)
}

function buildDashboardCategories(result) {
  if (!result) {
    return []
  }

  const cards = cardTargets.map((target) => {
    const source = findCategory(result.categories, target.aliases) || {
      name: target.name,
      severity: "yellow",
      summary: "No specific detail was returned for this category.",
    }
    const clause = findClause(result.clauses, source.name)
    const category = {
      ...source,
      name: target.name,
      displayName: target.displayName,
      clause,
      flags: result.flags,
    }

    return {
      ...category,
      recipients: target.name === "Third Party Sharing" ? recipientsFor(category) : [],
    }
  })

  cards.push({
    name: "Overall Risk",
    displayName: "Overall Risk",
    severity: scoreSeverity(result.score),
    summary: `Policy score: ${result.score}/100. Higher scores mean better privacy.`,
    clause: result.clauses[0] || null,
    flags: result.flags,
    recipients: [],
  })

  return cards
}

export default function Home() {
  const [inputMode, setInputMode] = useState("url")
  const [urlInput, setUrlInput] = useState("")
  const [textInput, setTextInput] = useState("")
  const [preferences, setPreferences] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [showTraceModal, setShowTraceModal] = useState(false)
  const [selectedClause, setSelectedClause] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const { analyze, result, loading, error } = useAnalyze()
  const dashboardCategories = buildDashboardCategories(result)

  function openPreferenceModal() {
    setUploadOpen(false)
    setShowModal(true)
  }

  function closePreferenceModal(selectedPreferences) {
    setPreferences(selectedPreferences)
    setShowModal(false)
    setActiveCategory(null)
    setSelectedClause(null)
    setShowTraceModal(false)
    analyze({
      url: inputMode === "url" ? urlInput : null,
      text: inputMode === "text" ? textInput : null,
      preferences: selectedPreferences,
    })
  }

  function showTraceForCategory() {
    if (!activeCategory?.clause) {
      return
    }

    setSelectedClause(activeCategory.clause)
    setShowTraceModal(true)
  }

  return (
    <main className={cardSpacing.page}>
      {!result && !loading ? (
        <div className="flex flex-1 flex-col justify-between pb-[18vh] pt-8">
          <header className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Privacy health check
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950">
              What Did I Just Sign?
            </h1>
          </header>

          <InputPanel
            inputMode={inputMode}
            setInputMode={setInputMode}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            textInput={textInput}
            setTextInput={setTextInput}
            uploadOpen={uploadOpen}
            setUploadOpen={setUploadOpen}
            uploadedFileName={uploadedFileName}
            setUploadedFileName={setUploadedFileName}
            onSubmit={openPreferenceModal}
            loading={loading}
          />
        </div>
      ) : (
        <div className="grid gap-3">
          <InputPanel
            inputMode={inputMode}
            setInputMode={setInputMode}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            textInput={textInput}
            setTextInput={setTextInput}
            uploadOpen={uploadOpen}
            setUploadOpen={setUploadOpen}
            uploadedFileName={uploadedFileName}
            setUploadedFileName={setUploadedFileName}
            onSubmit={openPreferenceModal}
            loading={loading}
          />

          <ErrorMessage message={error} />
          {loading ? <LoadingState /> : null}

          {result ? (
            <>
              <SummaryHeader
                score={result.score}
                verdict={result.verdict}
                title="Policy scan"
              />
              <RiskCardGrid
                categories={dashboardCategories}
                onSelect={setActiveCategory}
              />
              <SummaryParagraph summary={result.summary} />
            </>
          ) : null}
        </div>
      )}

      {showModal ? <PreferenceModal onClose={closePreferenceModal} /> : null}
      <RiskCategoryModal
        category={activeCategory}
        onClose={() => setActiveCategory(null)}
        onShowTrace={showTraceForCategory}
      />
      {showTraceModal ? (
        <TraceabilityModal
          clause={selectedClause}
          onClose={() => setShowTraceModal(false)}
        />
      ) : null}
    </main>
  )
}
