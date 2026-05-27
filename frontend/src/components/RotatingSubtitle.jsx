import { useEffect, useState } from "react"

import { languages } from "../utils/languages.js"

export default function RotatingSubtitle({ t }) {
  const [languageIndex, setLanguageIndex] = useState(0)
  const activeLanguage = languages[languageIndex]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLanguageIndex((current) => (current + 1) % languages.length)
    }, 2200)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <p className="mx-auto mt-3 max-w-[285px] text-center text-sm font-medium leading-6 text-slate-500 lg:mx-0 lg:max-w-none lg:whitespace-nowrap lg:text-left">
      {t.rotatingSecondLinePrefix ? (
        <>
          <span className="block lg:inline">{t.rotatingPrefix}</span>{" "}
          <span className="block lg:inline">
            {t.rotatingSecondLinePrefix}{" "}
            <LanguageSlot activeLanguage={activeLanguage} languageIndex={languageIndex} />{" "}
            {t.rotatingSuffix}
          </span>
        </>
      ) : (
        <>
          <span className="block lg:inline">
            {t.rotatingPrefix}{" "}
            <LanguageSlot activeLanguage={activeLanguage} languageIndex={languageIndex} />
          </span>{" "}
          <span className="block lg:inline">{t.rotatingSuffix}</span>
        </>
      )}
    </p>
  )
}

function LanguageSlot({ activeLanguage, languageIndex }) {
  return (
    <span className="inline-flex min-w-[3.9rem] justify-center align-baseline">
      <span
        key={activeLanguage.code}
        className={`inline-block text-center font-black [animation:subtitle-rise_2.2s_ease-in-out] ${
          languageIndex % 2 === 0 ? "text-[#5b3fe8]" : "text-[#12152a]"
        }`}
      >
        {activeLanguage.subtitleName}
      </span>
    </span>
  )
}
