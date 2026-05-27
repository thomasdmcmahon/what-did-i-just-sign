export default function ThirdPartyMap({ recipients, t }) {
  if (!recipients.length) {
    return null
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.dataPath}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
        <span className="rounded-full border border-slate-300 px-3 py-2">{t.userData}</span>
        {recipients.map((recipient) => (
          <span key={recipient} className="flex items-center gap-2">
            <span className="text-slate-400">→</span>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2">
              {recipient}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
