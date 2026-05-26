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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#12152a]/45 px-4 backdrop-blur-sm">
      <div className="max-h-[82vh] w-full max-w-[390px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 [animation:sheet-up_0.28s_ease]">
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>
        <h2 className="pt-4 text-xl font-black text-slate-950">Privacy concerns</h2>
        <p className="mt-2 text-sm text-slate-600">
          Select anything you want the analysis to flag.
        </p>

        <div className="mt-5 grid gap-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-800"
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
            className="w-full rounded-2xl bg-gradient-to-br from-[#1c3557] to-[#5b3fe8] px-5 py-3 text-sm font-black text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
