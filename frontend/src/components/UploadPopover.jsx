export default function UploadPopover({ selectedFilename, onFileText }) {
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
    <div className="absolute bottom-16 left-0 w-64 rounded-2xl border border-slate-300 bg-white p-3 text-sm text-slate-700">
      <label className="block cursor-pointer rounded-xl border border-dashed border-slate-300 px-3 py-3 text-center font-medium">
        Choose text file
        <input
          type="file"
          accept=".txt,.md,.text"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <p className="mt-2 truncate text-xs text-slate-500">
        {selectedFilename || "No file selected"}
      </p>
    </div>
  )
}
