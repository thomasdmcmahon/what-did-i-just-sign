import {
  Clock,
  Cookie,
  Crosshair,
  Database,
  Fingerprint,
  Lock,
  Shield,
  Users,
} from "lucide-react"

const icons = [
  {
    Icon: Shield,
    className: "left-1/2 top-[18%] h-[5.25rem] w-[5.25rem] -translate-x-1/2 rounded-[30px] bg-gradient-to-br from-[#1c3557] to-[#5b3fe8] text-white shadow-[0_12px_34px_rgba(91,63,232,0.30)]",
    iconClass: "h-9 w-9",
  },
  {
    Icon: Users,
    className: "left-[24%] top-[17%] h-11 w-11 rounded-2xl border border-indigo-100 bg-indigo-50 text-[#5b3fe8]",
    iconClass: "h-5 w-5",
  },
  {
    Icon: Database,
    className: "right-[24%] top-[18%] h-12 w-12 rounded-2xl border border-slate-100 bg-white text-[#1c3557]",
    iconClass: "h-5 w-5",
  },
  {
    Icon: Crosshair,
    className: "left-[27%] top-[49%] h-10 w-10 rounded-2xl border border-red-100 bg-red-50 text-red-500",
    iconClass: "h-5 w-5",
  },
  {
    Icon: Clock,
    className: "right-[27%] top-[50%] h-10 w-10 rounded-2xl border border-amber-100 bg-amber-50 text-amber-500",
    iconClass: "h-5 w-5",
  },
  {
    Icon: Lock,
    className: "right-[21%] top-[65%] h-9 w-9 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600",
    iconClass: "h-4 w-4",
  },
  {
    Icon: Fingerprint,
    className: "left-[22%] top-[65%] h-11 w-11 rounded-2xl border border-purple-100 bg-purple-50 text-purple-500",
    iconClass: "h-5 w-5",
  },
  {
    Icon: Cookie,
    className: "left-1/2 top-[71%] h-10 w-10 -translate-x-1/2 rounded-2xl border border-orange-100 bg-white text-orange-500",
    iconClass: "h-5 w-5",
  },
]

const textRows = [
  "left-[12%] top-[9%] w-[31%]",
  "left-[12%] top-[15%] w-[22%]",
  "right-[12%] top-[10%] w-[28%]",
  "right-[12%] top-[16%] w-[19%]",
  "left-[8%] top-[31%] w-[28%]",
  "left-[8%] top-[37%] w-[20%]",
  "right-[8%] top-[32%] w-[30%]",
  "right-[8%] top-[38%] w-[23%]",
  "left-[11%] top-[56%] w-[24%]",
  "right-[11%] top-[57%] w-[25%]",
  "left-[18%] top-[83%] w-[23%]",
  "left-[45%] top-[86%] w-[17%]",
  "right-[17%] top-[83%] w-[21%]",
]

export default function PrivacyIconCloud({ className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-[2rem] ${className || "relative -mx-3 mb-5 h-64 w-[calc(100%+1.5rem)]"}`}
    >
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0">
        {textRows.map((rowClass, index) => (
          <div
            key={index}
            className={`absolute h-1.5 rounded-full bg-slate-300/45 ${rowClass}`}
          />
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
        <div className="absolute inset-x-0 h-px bg-[#5b3fe8]/70 shadow-[0_0_14px_4px_rgba(91,63,232,0.24)] [animation:scan-field_4.4s_ease-in-out_infinite]" />
        <div className="absolute inset-x-0 h-12 bg-gradient-to-b from-[#5b3fe8]/12 to-transparent [animation:scan-field-band_4.4s_ease-in-out_infinite]" />
      </div>
      {icons.map(({ Icon, className, iconClass }, index) => (
        <div
          key={index}
          className={`absolute flex items-center justify-center ${className}`}
        >
          <Icon className={iconClass} strokeWidth={1.7} />
        </div>
      ))}
    </div>
  )
}
