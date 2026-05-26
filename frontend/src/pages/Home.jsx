import { useState } from "react"
import { Shield, X } from "lucide-react"

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
import { cardSpacing } from "../utils/formatters.js"

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

  return cards
}

function policyLabel(urlInput, textInput, inputMode) {
  if (inputMode === "url" && urlInput.trim()) {
    try {
      return new URL(urlInput).hostname.replace(/^www\./, "")
    } catch {
      return urlInput.trim()
    }
  }

  if (textInput.trim()) {
    return "Pasted policy text"
  }

  return "Privacy policy"
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
  const { analyze, result, loading, error, reset } = useAnalyze()
  const dashboardCategories = buildDashboardCategories(result)
  const currentPolicyLabel = policyLabel(urlInput, textInput, inputMode)

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

  function resetScan() {
    setActiveCategory(null)
    setSelectedClause(null)
    setShowTraceModal(false)
    reset()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#dde1f0_0%,#eef0f7_50%,#e4e7f5_100%)] p-4 sm:p-8">
      <section
        className={`${cardSpacing.page} relative min-h-[780px] w-full overflow-hidden rounded-[2.5rem] bg-white shadow-[0_32px_80px_rgba(28,53,87,0.18),0_8px_24px_rgba(28,53,87,0.10),0_0_0_1px_rgba(28,53,87,0.06)]`}
      >
        <div className="flex items-center justify-between px-7 pb-1 pt-4">
          <span className="text-xs font-bold tracking-wide text-slate-400">9:41</span>
          <div className="flex h-2 w-4 items-center rounded-sm border border-slate-300 pl-0.5">
            <div className="h-1 w-2 rounded-[1px] bg-slate-400" />
          </div>
        </div>

        {!result && !loading ? (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-8 pb-4 pt-8 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 scale-[1.6] rounded-full bg-indigo-500/10 blur-2xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#1c3557] to-[#5b3fe8] shadow-[0_8px_32px_rgba(91,63,232,0.30)]">
                  <Shield className="h-9 w-9 text-white" strokeWidth={1.5} />
                  <div className="absolute inset-x-2 h-px bg-white/55 shadow-[0_0_8px_2px_rgba(255,255,255,0.35)] [animation:scanline_2.4s_ease-in-out_infinite]" />
                </div>
              </div>

              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#5b3fe8]/70">
                Privacy health check
              </p>
              <h1 className="mt-3 text-[1.75rem] font-black leading-tight text-[#12152a]">
                What Did I Just Sign?
              </h1>
              <p className="mt-3 max-w-[250px] text-sm font-medium leading-6 text-slate-500">
                Understand privacy policies before you agree. In plain English.
              </p>

              <div className="mt-6 flex gap-2">
                {["AI-powered", "Plain English", "30 seconds"].map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-[#1c3557]/75"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="px-5 pb-10">
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
              <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
                Supports URLs, plain text, or pasted policy documents
              </p>
            </div>
          </div>
        ) : null}

        {loading ? <LoadingState /> : null}

        {!loading && result ? (
          <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 [scrollbar-width:none]">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Policy scan
                </p>
              </div>
              <button
                type="button"
                onClick={resetScan}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
                aria-label="Clear active scan"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="grid gap-4">
              <ErrorMessage message={error} />
              <SummaryHeader
                score={result.score}
                verdict={result.verdict}
                policyName={currentPolicyLabel}
              />
              <RiskCardGrid categories={dashboardCategories} onSelect={setActiveCategory} />
              <SummaryParagraph summary={result.summary} />
              <p className="px-4 text-center text-[11px] font-medium leading-5 text-slate-400">
                Analysis powered by AI. Always read the full policy for legal decisions.
              </p>
            </div>
          </div>
        ) : null}

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
      </section>
    </main>
  )
}
