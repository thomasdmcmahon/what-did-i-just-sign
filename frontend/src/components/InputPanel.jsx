import UploadPopover from "./UploadPopover.jsx"

export default function InputPanel({
  inputMode,
  setInputMode,
  urlInput,
  setUrlInput,
  textInput,
  setTextInput,
  uploadOpen,
  setUploadOpen,
  uploadedFileName,
  setUploadedFileName,
  onSubmit,
  loading,
}) {
  const hasInput = inputMode === "url" ? urlInput.trim() : textInput.trim()

  function handleUploadText(text, fileName) {
    setInputMode("text")
    setTextInput(text)
    setUploadedFileName(fileName)
  }

  return (
    <div className="relative">
      {uploadOpen ? (
        <UploadPopover
          selectedFilename={uploadedFileName}
          onFileText={handleUploadText}
        />
      ) : null}

      <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white p-2">
        <button
          type="button"
          onClick={() => setUploadOpen(!uploadOpen)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 text-2xl leading-none text-slate-700"
          aria-label="Upload policy text"
        >
          +
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setInputMode(inputMode === "url" ? "text" : "url")}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            {inputMode === "url" ? "URL" : "Text"}
          </button>

          {inputMode === "url" ? (
            <input
              type="url"
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder="Paste policy URL"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400"
            />
          ) : (
            <input
              type="text"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              placeholder="Paste policy text"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400"
            />
          )}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!hasInput || loading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label="Analyze policy"
        >
          {loading ? "..." : "→"}
        </button>
      </div>
    </div>
  )
}
