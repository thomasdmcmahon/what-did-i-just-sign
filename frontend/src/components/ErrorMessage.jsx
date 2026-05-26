export default function ErrorMessage({ message }) {
  if (!message) {
    return null
  }

  return (
    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-900">
      {message}
    </div>
  )
}
