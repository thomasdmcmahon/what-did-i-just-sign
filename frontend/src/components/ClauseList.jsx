import { useState } from "react"

import { severityEmoji } from "../utils/formatters.js"

export default function ClauseList({ clauses }) {
  const [openOriginals, setOpenOriginals] = useState({})

  function toggleClause(index) {
    setOpenOriginals((current) => ({
      ...current,
      [index]: !current[index],
    }))
  }

  return (
    <section className="border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Notable clauses</h2>
      <div className="mt-4 grid gap-4">
        {clauses.map((clause, index) => {
          const showingOriginal = Boolean(openOriginals[index])

          return (
            <article key={`${clause.title}-${index}`} className="border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-slate-950">
                  {severityEmoji[clause.severity] || severityEmoji.yellow} {clause.title}
                </h3>
                <button
                  type="button"
                  onClick={() => toggleClause(index)}
                  className="border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {showingOriginal ? "Show simplified" : "Show original"}
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {showingOriginal ? clause.original : clause.simplified}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
