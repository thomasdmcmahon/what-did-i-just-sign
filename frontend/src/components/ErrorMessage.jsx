export default function ErrorMessage({ message }) {
  if (!message) {
    return null
  }

  return (
    <div className="rounded-3xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900">
      {message}
    </div>
  )
}
