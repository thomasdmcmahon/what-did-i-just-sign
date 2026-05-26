import { useState } from "react"

const options = [
  { value: "location", label: "Location tracking" },
  { value: "third_party", label: "Selling/sharing with third parties" },
  { value: "children", label: "Children's data" },
  { value: "biometric", label: "Biometric data" },
  { value: "ads", label: "Targeted advertising" },
  { value: "retention", label: "Long data retention" },
]

export default function PreferenceModal({ onClose }) {
  const [selected, setSelected] = useState([])

  function togglePreference(value) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60">
      <div className="w-[520px] border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-950">Privacy concerns</h2>
        <p className="mt-2 text-sm text-slate-600">
          Select anything you want the analysis to flag.
        </p>

        <div className="mt-5 grid gap-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 border border-slate-200 px-3 py-2 text-sm text-slate-800"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => togglePreference(option.value)}
                className="h-4 w-4"
              />
              {option.label}
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => onClose(selected)}
            className="bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
