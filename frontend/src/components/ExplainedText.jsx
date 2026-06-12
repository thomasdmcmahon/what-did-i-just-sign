const highlightStyles = {
  red: "text-red-900 decoration-red-500/70",
  yellow: "text-amber-900 decoration-amber-500/70",
  green: "text-emerald-900 decoration-emerald-500/70",
  light: "text-white decoration-white/80",
}

function normalize(value) {
  return `${value || ""}`.trim()
}

function capitalizeFirst(value) {
  const text = normalize(value)
  return text ? `${text.charAt(0).toLocaleUpperCase()}${text.slice(1)}` : text
}

function removeFinalPunctuation(value) {
  return `${value || ""}`.replace(/[.,;:!?，、。！？]+$/u, "")
}

function splitLastWord(text) {
  const match = `${text}`.match(/^(.*\s)(\S+)$/u)
  return match ? { prefix: match[1], lastWord: match[2] } : { prefix: "", lastWord: text }
}

function HighlightedPhrase({ className, text, punctuation, asButton = false, ariaLabel }) {
  const { prefix, lastWord } = splitLastWord(text)
  const Wrapper = asButton ? "button" : "span"
  const wrapperProps = asButton
    ? {
        type: "button",
        "aria-label": ariaLabel,
        className: "cursor-help break-words text-left focus:outline-none focus:ring-2 focus:ring-[#5b3fe8]/25",
      }
    : { className: "cursor-help break-words text-left" }

  return (
    <Wrapper {...wrapperProps}>
      {prefix ? <span className={className}>{prefix}</span> : null}
      <span className="whitespace-nowrap">
        <span className={className}>{lastWord}</span>
      </span>
    </Wrapper>
  )
}

function buildMatches(terms) {
  const definitionMatches = (terms || [])
    .map((item) => ({
      phrase: normalize(item.term),
      definition: normalize(item.definition),
      kind: "term",
    }))
    .filter((item) => item.phrase && item.definition)

  const byPhrase = new Map()
  definitionMatches.forEach((item) => {
    const key = item.phrase.toLowerCase()
    const existing = byPhrase.get(key)
    if (!existing || item.kind === "term") {
      byPhrase.set(key, item)
    }
  })

  return [...byPhrase.values()].sort((a, b) => b.phrase.length - a.phrase.length)
}

function splitText(text, matches) {
  const source = removeFinalPunctuation(text)
  const lowerSource = source.toLowerCase()
  const parts = []
  let position = 0

  while (position < source.length) {
    let nextMatch = null
    let nextIndex = -1

    matches.forEach((match) => {
      const index = lowerSource.indexOf(match.phrase.toLowerCase(), position)
      if (index !== -1 && (nextIndex === -1 || index < nextIndex)) {
        nextMatch = match
        nextIndex = index
      }
    })

    if (!nextMatch) {
      parts.push({ text: source.slice(position), match: null })
      break
    }

    if (nextIndex > position) {
      parts.push({ text: source.slice(position, nextIndex), match: null })
    }

    const end = nextIndex + nextMatch.phrase.length
    const matchedText = source.slice(nextIndex, end)
    const highlightedText = matchedText.replace(/[.,;:!?，、。！？]+$/u, "")
    const punctuation = matchedText.slice(highlightedText.length)

    if (highlightedText) {
      parts.push({ text: highlightedText, punctuation, match: nextMatch })
    } else if (punctuation) {
      parts.push({ text: punctuation, punctuation: "", match: null })
    }

    position = end
  }

  return parts
}

export default function ExplainedText({
  text,
  terms = [],
  severity = "yellow",
  interactive = true,
}) {
  const matches = buildMatches(terms)
  const displayText = removeFinalPunctuation(text)

  if (!matches.length) {
    return displayText
  }

  return splitText(displayText, matches).map((part, index) => {
    if (!part.match) {
      return <span key={`${part.text}-${index}`}>{part.text}</span>
    }

    const className = `font-bold underline decoration-dotted decoration-2 underline-offset-4 ${
      highlightStyles[severity] || highlightStyles.yellow
    }`

    if (!interactive) {
      return (
        <span key={`${part.text}-${index}`} className="group relative inline break-words">
          <HighlightedPhrase
            className={className}
            text={part.text}
            punctuation={part.punctuation}
          />
          <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 hidden min-h-28 w-48 max-w-[min(12rem,calc(100vw-2rem))] -translate-x-1/2 whitespace-normal rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-[11px] font-medium leading-4 text-slate-700 shadow-[0_12px_32px_rgba(28,53,87,0.18)] group-hover:block">
            <span className="mb-1 block font-black text-slate-950">{capitalizeFirst(part.text)}</span>
            {part.match.definition}
          </span>
        </span>
      )
    }

    return (
      <span key={`${part.text}-${index}`} className="group relative inline break-words">
        <HighlightedPhrase
          asButton
          className={className}
          text={part.text}
          punctuation={part.punctuation}
          aria-label={`${part.text}: ${part.match.definition}`}
        />
        <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 hidden min-h-28 w-48 max-w-[min(12rem,calc(100vw-2rem))] -translate-x-1/2 whitespace-normal rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-[11px] font-medium leading-4 text-slate-700 shadow-[0_12px_32px_rgba(28,53,87,0.18)] group-hover:block group-focus-within:block">
          <span className="mb-1 block font-black text-slate-950">{capitalizeFirst(part.text)}</span>
          {part.match.definition}
        </span>
      </span>
    )
  })
}
