export default function UploadPopover({ selectedFilename, onFileText, t }) {
  function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => onFileText(String(reader.result || ""), file.name)
    reader.readAsText(file)
  }

  return (
    <div className="absolute bottom-16 left-0 z-20 w-64 rounded-2xl border border-indigo-100 bg-white p-3 text-sm text-slate-700 shadow-[0_12px_36px_rgba(28,53,87,0.16)]">
      <label className="block cursor-pointer rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 px-3 py-3 text-center font-bold text-[#1c3557]">
        {t.chooseTextFile}
        <input
          type="file"
          accept=".txt,.md,.text"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <p className="mt-2 truncate text-xs text-slate-500">
        {selectedFilename || t.noFileSelected}
      </p>
    </div>
  )
}
