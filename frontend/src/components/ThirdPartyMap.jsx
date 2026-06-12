export default function ThirdPartyMap({ recipients, t }) {
  if (!recipients.length) {
    return null
  }

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t.dataPath}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-800">
        <span className="rounded-full border border-slate-300 px-2.5 py-1.5">{t.userData}</span>
        {recipients.map((recipient) => (
          <span key={recipient} className="flex items-center gap-1.5">
            <span className="text-slate-400">→</span>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1.5">
              {recipient}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
