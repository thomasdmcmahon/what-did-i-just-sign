import { useState } from "react"

import CategoryBreakdown from "../components/CategoryBreakdown.jsx"
import ClauseList from "../components/ClauseList.jsx"
import InputPanel from "../components/InputPanel.jsx"
import PreferenceModal from "../components/PreferenceModal.jsx"
import RiskFlags from "../components/RiskFlags.jsx"
import SummaryCard from "../components/SummaryCard.jsx"
import { useAnalyze } from "../hooks/useAnalyze.js"

export default function Home() {
  const [inputMode, setInputMode] = useState("url")
  const [urlInput, setUrlInput] = useState("")
  const [textInput, setTextInput] = useState("")
  const [preferences, setPreferences] = useState([])
  const [showModal, setShowModal] = useState(false)
  const { analyze, result, loading, error } = useAnalyze()

  function openPreferenceModal() {
    setShowModal(true)
  }

  function closePreferenceModal(selectedPreferences) {
    setPreferences(selectedPreferences)
    setShowModal(false)
    analyze({
      url: inputMode === "url" ? urlInput : null,
      text: inputMode === "text" ? textInput : null,
      preferences: selectedPreferences,
    })
  }

  return (
    <main className="mx-auto max-w-5xl px-8 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">What Did I Just Sign?</h1>
        <p className="mt-2 text-sm text-slate-600">
          Paste a privacy policy or enter a policy URL to get a plain-English analysis.
        </p>
      </header>

      <div className="grid gap-5">
        <InputPanel
          inputMode={inputMode}
          setInputMode={setInputMode}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          textInput={textInput}
          setTextInput={setTextInput}
          onSubmit={openPreferenceModal}
          loading={loading}
        />

        {error ? (
          <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {error}
          </div>
        ) : null}

        {loading ? <p className="text-sm font-medium text-slate-700">Analyzing...</p> : null}

        {result ? (
          <>
            <SummaryCard
              summary={result.summary}
              score={result.score}
              verdict={result.verdict}
            />
            <RiskFlags flags={result.flags} />
            <CategoryBreakdown categories={result.categories} />
            <ClauseList clauses={result.clauses} />
          </>
        ) : null}
      </div>

      {showModal ? <PreferenceModal onClose={closePreferenceModal} /> : null}
    </main>
  )
}
