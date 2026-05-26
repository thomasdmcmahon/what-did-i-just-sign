export default function RiskFlags({ flags }) {
  if (!flags.length) {
    return null
  }

  return (
    <section className="border border-red-200 bg-red-50 p-6 text-red-950 shadow-sm">
      <h2 className="text-lg font-semibold">Risk flags</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
        {flags.map((flag, index) => (
          <li key={`${flag}-${index}`}>{flag}</li>
        ))}
      </ul>
    </section>
  )
}
