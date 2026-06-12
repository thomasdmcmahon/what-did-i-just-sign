import { useState } from "react"
import { Check, ChevronRight, Copy, X } from "lucide-react"

import { modalHighlight } from "../utils/formatters.js"

export default function TraceabilityModal({ clause, onClose, t }) {
  const [copied, setCopied] = useState(false)

  if (!clause) {
    return null
  }

  const sourceHeading = clause.source_heading || clause.sourceHeading || ""
  const sourceContext = clause.source_context || clause.sourceContext || sourceHeading

  async function copyExcerpt() {
    if (!clause.original) {
      return
    }

    try {
      await navigator.clipboard.writeText(clause.original)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#12152a]/50 px-4 backdrop-blur-sm">
      <div className="max-h-[82vh] w-full max-w-[390px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 [animation:sheet-up_0.28s_ease]">
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center gap-3 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100"
            aria-label={t.back}
          >
            <ChevronRight className="h-4 w-4 rotate-180 text-slate-500" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {t.policyExcerpt}
            </p>
            <h2 className="text-lg font-black text-slate-950">{clause.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
            aria-label={t.closeEvidence}
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {sourceHeading || sourceContext ? (
          <div className="mb-5 grid gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            {sourceHeading ? (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {t.foundUnder}
                </p>
                <p className="mt-1 text-sm font-black leading-5 text-slate-950">
                  {sourceHeading}
                </p>
              </div>
            ) : null}
            {sourceContext && sourceContext !== sourceHeading ? (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {t.sourceContext}
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                  {sourceContext}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            {t.sourceText}
          </p>
          <button
            type="button"
            onClick={copyExcerpt}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-600 transition hover:bg-slate-50 active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t.copiedExcerpt : t.copyExcerpt}
          </button>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-slate-800">
          <span className={modalHighlight}>{clause.original}</span>
        </div>
        <p className="mt-3 text-xs font-medium leading-5 text-slate-500">
          {t.searchTip}
        </p>

        <p className="mb-3 mt-5 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          {t.plainEnglish}
        </p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-700">{clause.simplified}</p>
        </div>
      </div>
    </div>
  )
}
