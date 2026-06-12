import { useState } from "react"
import { X } from "lucide-react"

import ErrorMessage from "../components/ErrorMessage.jsx"
import InputPanel from "../components/InputPanel.jsx"
import LanguageSelector from "../components/LanguageSelector.jsx"
import LoadingState from "../components/LoadingState.jsx"
import PrivacyIconCloud from "../components/PrivacyIconCloud.jsx"
import RiskCardGrid from "../components/RiskCardGrid.jsx"
import RiskCategoryModal from "../components/RiskCategoryModal.jsx"
import RotatingSubtitle from "../components/RotatingSubtitle.jsx"
import SummaryHeader from "../components/SummaryHeader.jsx"
import SummaryParagraph from "../components/SummaryParagraph.jsx"
import TraceabilityModal from "../components/TraceabilityModal.jsx"
import { useAnalyze } from "../hooks/useAnalyze.js"
import { cardSpacing, summaryPoints } from "../utils/formatters.js"
import { languages } from "../utils/languages.js"
import { getTranslations } from "../utils/translations.js"

const cardTargets = [
  {
    name: "Data Collection",
    labelKey: "dataCollection",
    aliases: ["Data Collection"],
  },
  {
    name: "Third Party Sharing",
    labelKey: "thirdParty",
    aliases: ["Third-Party Sharing", "Third Party Sharing"],
  },
  {
    name: "Retention",
    labelKey: "retention",
    aliases: ["Data Retention", "Retention"],
  },
  {
    name: "Tracking/Detection",
    labelKey: "tracking",
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

function recipientsFor(category, t) {
  const text = `${category.summary || ""} ${summaryPoints(category).join(" ")} ${
    category.clause?.simplified || ""
  }`.toLowerCase()
  const recipients = []

  if (text.includes("microsoft")) recipients.push("Microsoft")
  if (text.includes("google")) recipients.push("Google")
  if (text.includes("advertis")) recipients.push(t.advertisers)
  if (text.includes("analytic")) recipients.push(t.analytics)
  if (!recipients.length) recipients.push(t.partners)

  return recipients.slice(0, 3)
}

function buildDashboardCategories(result, t) {
  if (!result) {
    return []
  }

  const cards = cardTargets.map((target) => {
    const source = findCategory(result.categories, target.aliases) || {
      name: target.name,
      severity: "yellow",
      summary: t.categoryFallback,
    }
    const clause = findClause(result.clauses, source.name)
    const category = {
      ...source,
      name: target.name,
      displayName: t.categoryLabels[target.labelKey],
      clause,
      flags: result.flags,
    }

    return {
      ...category,
      recipients: target.name === "Third Party Sharing" ? recipientsFor(category, t) : [],
    }
  })

  return cards
}

function policyLabel(urlInput, textInput, inputMode, t) {
  if (inputMode === "url" && urlInput.trim()) {
    try {
      return new URL(urlInput).hostname.replace(/^www\./, "")
    } catch {
      return urlInput.trim()
    }
  }

  if (textInput.trim()) {
    return t.pastedPolicyText
  }

  return t.privacyPolicy
}

export default function Home() {
  const [inputMode, setInputMode] = useState("url")
  const [urlInput, setUrlInput] = useState("")
  const [textInput, setTextInput] = useState("")
  const [activeCategory, setActiveCategory] = useState(null)
  const [showTraceModal, setShowTraceModal] = useState(false)
  const [selectedClause, setSelectedClause] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])
  const [languageOpen, setLanguageOpen] = useState(false)
  const { analyze, result, loading, error, reset } = useAnalyze()
  const t = getTranslations(selectedLanguage.code)
  const dashboardCategories = buildDashboardCategories(result, t)
  const currentPolicyLabel = policyLabel(urlInput, textInput, inputMode, t)

  function analyzeCurrentPolicy() {
    setUploadOpen(false)
    setLanguageOpen(false)
    setActiveCategory(null)
    setSelectedClause(null)
    setShowTraceModal(false)
    analyze(
      {
        url: inputMode === "url" ? urlInput : null,
        text: inputMode === "text" ? textInput : null,
        preferences: [],
        language: selectedLanguage.value,
      },
      t.errorFallback,
    )
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

  const inputPanelProps = {
    inputMode,
    setInputMode,
    urlInput,
    setUrlInput,
    textInput,
    setTextInput,
    uploadOpen,
    setUploadOpen,
    uploadedFileName,
    setUploadedFileName,
    onSubmit: analyzeCurrentPolicy,
    loading,
    t,
  }

  return (
    <main className="min-h-screen bg-white">
      <section
        className={`${cardSpacing.page} relative min-h-screen w-full overflow-hidden bg-white lg:max-w-none`}
      >
        {!result && !loading ? (
          <div className="flex min-h-screen flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,46vw)] lg:items-center lg:gap-8 lg:px-12 lg:pb-7 lg:pt-7">
            <div className="flex flex-1 flex-col items-center justify-center px-8 pb-4 pt-8 text-center lg:order-2 lg:px-0 lg:pt-0">
              <PrivacyIconCloud className="relative mb-5 h-72 w-full max-w-[420px] lg:mb-0 lg:h-[min(58vh,460px)] lg:max-w-none" />
            </div>

            <div className="px-5 pb-10 lg:order-1 lg:px-0 lg:pb-0">
              <div className="mb-8 text-center lg:mb-7 lg:text-left">
                <h1 className="text-[1.85rem] font-black leading-tight text-[#12152a] lg:text-[clamp(3rem,5vw,5.8rem)]">
                  {t.appTitle}
                </h1>
                <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-[#5b3fe8]/70 lg:text-base">
                  {t.landingEyebrow}
                </p>
                <RotatingSubtitle t={t} />
                <div className="mt-5 flex justify-center lg:justify-start">
                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    setSelectedLanguage={setSelectedLanguage}
                    languageOpen={languageOpen}
                    setLanguageOpen={setLanguageOpen}
                    t={t}
                    align="left"
                  />
                </div>
              </div>

              <div className="mx-auto max-w-[420px] lg:mx-0 lg:max-w-xl">
                <InputPanel {...inputPanelProps} />
                <ErrorMessage message={error} />
              </div>
              <p className="mt-8 hidden max-w-lg text-sm font-medium leading-7 text-slate-500 lg:block">
                {t.aiFooter}
              </p>
            </div>
          </div>
        ) : null}

        {loading ? <LoadingState t={t} /> : null}

        {!loading && result ? (
          <div className="flex min-h-screen flex-1 flex-col overflow-y-auto px-5 pb-8 [scrollbar-width:none] lg:overflow-visible lg:px-12 lg:pb-7">
            <div className="flex items-center justify-between py-4 lg:pb-5 lg:pt-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  {t.policyScan}
                </p>
              </div>
              <button
                type="button"
                onClick={resetScan}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
                aria-label={t.clearScan}
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <ErrorMessage message={error} />

            <div className="grid gap-4 lg:grid-cols-[minmax(340px,390px)_minmax(0,1fr)] lg:items-start lg:gap-5">
              <div className="lg:sticky lg:top-6">
                <SummaryHeader
                  score={result.score}
                  verdict={result.verdict}
                  policyName={currentPolicyLabel}
                  t={t}
                />
              </div>
              <div className="grid gap-4 lg:min-w-0">
                <RiskCardGrid categories={dashboardCategories} onSelect={setActiveCategory} t={t} />
                <SummaryParagraph summary={result.summary} />
                <p className="px-4 text-center text-[11px] font-medium leading-5 text-slate-400 lg:px-0 lg:text-left">
                  {t.aiFooter}
                </p>
              </div>
            </div>
          </div>
        ) : null}

      <RiskCategoryModal
        category={activeCategory}
        onClose={() => setActiveCategory(null)}
        onShowTrace={showTraceForCategory}
        t={t}
      />
      {showTraceModal ? (
        <TraceabilityModal
          clause={selectedClause}
          onClose={() => setShowTraceModal(false)}
          t={t}
        />
      ) : null}
      </section>
    </main>
  )
}
