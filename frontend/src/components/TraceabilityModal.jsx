import { modalHighlight } from "../utils/formatters.js"

export default function TraceabilityModal({ clause, onClose }) {
  if (!clause) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4">
      <div className="max-h-[82vh] w-full max-w-[390px] overflow-y-auto rounded-3xl border border-slate-300 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Source evidence</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{clause.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg"
            aria-label="Close evidence"
          >
            ×
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-8 text-slate-800">
          <span className={modalHighlight}>{clause.original}</span>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Plain English</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{clause.simplified}</p>
        </div>
      </div>
    </div>
  )
}
