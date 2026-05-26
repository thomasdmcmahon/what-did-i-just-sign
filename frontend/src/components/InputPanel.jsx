export default function InputPanel({
  inputMode,
  setInputMode,
  urlInput,
  setUrlInput,
  textInput,
  setTextInput,
  onSubmit,
  loading,
}) {
  const hasInput = inputMode === "url" ? urlInput.trim() : textInput.trim()

  return (
    <section className="border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode("url")}
          className={`px-4 py-2 text-sm font-medium ${
            inputMode === "url"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={`px-4 py-2 text-sm font-medium ${
            inputMode === "text"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Text
        </button>
      </div>

      {inputMode === "url" ? (
        <input
          type="url"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          placeholder="https://example.com/privacy"
          className="w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700"
        />
      ) : (
        <textarea
          rows={8}
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder="Paste privacy policy text here..."
          className="w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700"
        />
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!hasInput || loading}
        className="mt-4 bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "Analyzing..." : "Analyze Policy"}
      </button>
    </section>
  )
}
