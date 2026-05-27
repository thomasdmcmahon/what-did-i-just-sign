import { Check, Globe } from "lucide-react"

import { languages } from "../utils/languages.js"

export default function LanguageSelector({
  selectedLanguage,
  setSelectedLanguage,
  languageOpen,
  setLanguageOpen,
  t,
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setLanguageOpen(!languageOpen)}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 transition active:scale-95"
        aria-label={t.languageLabel}
      >
        <span className="text-base leading-none">{selectedLanguage.flag}</span>
        <span className="text-[11px] font-black tracking-wide text-slate-700">
          {selectedLanguage.code}
        </span>
        <Globe className="h-3 w-3 text-slate-400" />
      </button>

      {languageOpen ? (
        <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-[0_12px_36px_rgba(28,53,87,0.16)]">
          <div className="px-3 pb-1.5 pt-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {t.languageLabel}
            </p>
          </div>
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => {
                setSelectedLanguage(language)
                setLanguageOpen(false)
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-indigo-50 active:bg-indigo-100"
            >
              <span className="text-lg leading-none">{language.flag}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-black leading-tight text-slate-950">
                  {language.nativeName}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {language.englishName}
                </span>
              </span>
              {selectedLanguage.code === language.code ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-[#5b3fe8]" />
              ) : null}
            </button>
          ))}
          <div className="h-2" />
        </div>
      ) : null}
    </div>
  )
}
