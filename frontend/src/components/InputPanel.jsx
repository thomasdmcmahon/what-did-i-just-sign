import { ArrowRight, Plus } from "lucide-react"

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

      <div className="flex items-center gap-2 rounded-2xl border border-indigo-200 bg-[#f0f2fa] p-2 shadow-[0_4px_20px_rgba(91,63,232,0.08)]">
        <button
          type="button"
          onClick={() => setUploadOpen(!uploadOpen)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-95"
          aria-label="Upload policy text"
        >
          <Plus className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setInputMode(inputMode === "url" ? "text" : "url")}
            className="rounded-full border border-indigo-100 bg-white/70 px-2.5 py-1 text-[11px] font-bold text-[#1c3557]"
          >
            {inputMode === "url" ? "URL" : "Text"}
          </button>

          {inputMode === "url" ? (
            <input
              type="url"
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder="Paste URL..."
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          ) : (
            <input
              type="text"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              placeholder="Paste policy text..."
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          )}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!hasInput || loading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1c3557] to-[#5b3fe8] text-white transition active:scale-95 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
          aria-label="Analyze policy"
        >
          {loading ? "..." : <ArrowRight className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
