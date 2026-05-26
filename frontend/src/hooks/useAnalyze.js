import { useState } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export function useAnalyze() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function analyze(payload) {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/analyze`, payload)
      setResult(response.data)
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong while analyzing the policy.")
    } finally {
      setLoading(false)
    }
  }

  return { analyze, result, loading, error }
}
