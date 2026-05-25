# What Did I Just Sign? — Implementation Plan
> Hi-fi prototype for COSE432 GA6. Target stack: React + Tailwind (Vite) · FastAPI · Qwen API · httpx + BeautifulSoup4

---

## 0. Project Bootstrap

### 0.1 Frontend
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios
```

`tailwind.config.js`:
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

`src/index.css` — add at top:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`.env.example`:
```
VITE_API_URL=http://localhost:8000
```

### 0.2 Backend
```bash
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

`.env.example`:
```
QWEN_API_KEY=your-dashscope-key
QWEN_API_BASE=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

### 0.3 .gitignore (root)
```
node_modules/
dist/
.env
__pycache__/
venv/
*.pyc
.DS_Store
```

---

## 1. Backend

### 1.1 `backend/models/schemas.py`
```python
from pydantic import BaseModel
from typing import Optional, List

class AnalyzeRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None
    preferences: Optional[List[str]] = []  # e.g. ["location", "third_party", "children"]

class Clause(BaseModel):
    title: str
    original: str
    simplified: str
    severity: str  # "red" | "yellow" | "green"

class Category(BaseModel):
    name: str          # e.g. "Data Collection"
    severity: str      # "red" | "yellow" | "green"
    summary: str

class AnalyzeResponse(BaseModel):
    summary: str
    score: int         # 0–100, lower = more invasive
    verdict: str       # e.g. "Moderately Invasive"
    categories: List[Category]
    clauses: List[Clause]
    flags: List[str]   # plain-English risk flags matching user preferences
```

---

### 1.2 `backend/services/fetcher.py`
```python
import httpx
from bs4 import BeautifulSoup

async def fetch_policy_text(url: str) -> str:
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url, headers=headers, follow_redirects=True)
        response.raise_for_status()
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Remove nav, footer, scripts, styles
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    
    text = soup.get_text(separator="\n", strip=True)
    return text
```

---

### 1.3 `backend/services/chunker.py`
```python
def chunk_text(text: str, max_chars: int = 12000) -> str:
    """Truncate to max_chars. For GA6 scope, truncation is acceptable."""
    return text[:max_chars] if len(text) > max_chars else text
```

---

### 1.4 `backend/services/ai.py`
```python
import json
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

QWEN_API_BASE = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

SYSTEM_PROMPT = """
You are a privacy policy analyst. Analyze the given privacy policy and return ONLY a valid JSON object — no markdown, no explanation, no preamble.

JSON schema:
{
  "summary": "2-3 sentence plain-English overview",
  "score": <integer 0-100, lower = more invasive>,
  "verdict": "<one of: 'Privacy-Friendly' | 'Acceptable' | 'Moderately Invasive' | 'Highly Invasive'>",
  "categories": [
    {
      "name": "<category name>",
      "severity": "<'red' | 'yellow' | 'green'>",
      "summary": "<1-2 sentence summary>"
    }
  ],
  "clauses": [
    {
      "title": "<short clause label>",
      "original": "<verbatim excerpt under 100 words>",
      "simplified": "<plain-English version>",
      "severity": "<'red' | 'yellow' | 'green'>"
    }
  ],
  "flags": ["<plain-English risk relevant to user preferences>"]
}

Categories to always include: Data Collection, Third-Party Sharing, Data Retention, User Rights, Cookies & Tracking.
Extract 4-7 notable clauses. Include 1-5 flags relevant to user preferences (empty array if no preferences given).
"""

async def analyze_policy(text: str, preferences: List[str]) -> dict:
    prefs_str = ", ".join(preferences) if preferences else "none specified"
    api_key = os.getenv("QWEN_API_KEY")
    if not api_key:
        raise RuntimeError("QWEN_API_KEY is not configured")
    
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=os.getenv("QWEN_API_BASE", QWEN_API_BASE),
    )

    response = await client.chat.completions.create(
        model="qwen-plus",
        max_tokens=2000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"User preferences (flag these if relevant): {prefs_str}\n\nPrivacy policy text:\n{text}"}
        ],
    )
    
    raw = response.choices[0].message.content.strip()
    # Strip markdown fences if model adds them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    
    return json.loads(raw.strip())
```

---

### 1.5 `backend/routes/analyze.py`
```python
from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.fetcher import fetch_policy_text
from services.chunker import chunk_text
from services.ai import analyze_policy

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    if not request.url and not request.text:
        raise HTTPException(status_code=400, detail="Provide either url or text")
    
    if request.url:
        try:
            raw_text = await fetch_policy_text(request.url)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to fetch URL: {str(e)}")
    else:
        raw_text = request.text
    
    truncated = chunk_text(raw_text)
    
    try:
        result = await analyze_policy(truncated, request.preferences or [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
    
    return result
```

---

### 1.6 `backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.analyze import router

load_dotenv()

app = FastAPI(title="What Did I Just Sign? API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
def health():
    return {"status": "ok"}
```

Run with:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

---

## 2. Frontend

### 2.1 `src/hooks/useAnalyze.js`
```js
import { useState } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

export function useAnalyze() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = async ({ url, text, preferences }) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await axios.post(`${API_URL}/analyze`, {
        url: url || null,
        text: text || null,
        preferences,
      })
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return { analyze, result, loading, error }
}
```

---

### 2.2 `src/utils/formatters.js`
```js
export const severityColor = {
  red: "text-red-500 bg-red-50 border-red-200",
  yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
  green: "text-green-600 bg-green-50 border-green-200",
}

export const severityEmoji = {
  red: "🔴",
  yellow: "🟡",
  green: "🟢",
}

export function scoreLabel(score) {
  if (score >= 75) return { label: "Privacy-Friendly", color: "text-green-600" }
  if (score >= 50) return { label: "Acceptable", color: "text-yellow-600" }
  if (score >= 25) return { label: "Moderately Invasive", color: "text-orange-500" }
  return { label: "Highly Invasive", color: "text-red-600" }
}
```

---

### 2.3 `src/components/PreferenceModal.jsx`
```jsx
// Props: onClose(preferences: string[]) => void
const OPTIONS = [
  { id: "location", label: "📍 Location tracking" },
  { id: "third_party", label: "🤝 Selling/sharing with third parties" },
  { id: "children", label: "👶 Children's data" },
  { id: "biometric", label: "🧬 Biometric data" },
  { id: "ads", label: "📢 Targeted advertising" },
  { id: "retention", label: "🗄️ Long data retention" },
]

import { useState } from "react"

export default function PreferenceModal({ onClose }) {
  const [selected, setSelected] = useState([])

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold mb-1">What do you care about?</h2>
        <p className="text-gray-500 text-sm mb-4">We'll flag anything relevant to you.</p>
        <div className="flex flex-col gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`text-left px-4 py-2 rounded-lg border transition-all ${
                selected.includes(opt.id)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onClose(selected)}
          className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Analyze Policy
        </button>
      </div>
    </div>
  )
}
```

---

### 2.4 `src/components/InputPanel.jsx`
```jsx
// Props: onSubmit({ url, text, preferences }) => void, loading: bool
import { useState } from "react"
import PreferenceModal from "./PreferenceModal"

export default function InputPanel({ onSubmit, loading }) {
  const [mode, setMode] = useState("url")  // "url" | "text"
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [showModal, setShowModal] = useState(false)

  const handleAnalyze = () => setShowModal(true)
  const handleModalClose = (preferences) => {
    setShowModal(false)
    onSubmit({ url: mode === "url" ? url : null, text: mode === "text" ? text : null, preferences })
  }

  const isValid = mode === "url" ? url.trim() !== "" : text.trim() !== ""

  return (
    <div className="max-w-2xl mx-auto">
      {showModal && <PreferenceModal onClose={handleModalClose} />}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("url")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${mode === "url" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Paste URL
        </button>
        <button onClick={() => setMode("text")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${mode === "text" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Paste Text
        </button>
      </div>
      {mode === "url" ? (
        <input
          type="url"
          placeholder="https://example.com/privacy"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <textarea
          placeholder="Paste privacy policy text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      )}
      <button
        onClick={handleAnalyze}
        disabled={!isValid || loading}
        className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Analyzing..." : "Analyze Policy →"}
      </button>
    </div>
  )
}
```

---

### 2.5 `src/components/SummaryCard.jsx`
```jsx
// Props: summary: string, score: number, verdict: string
import { scoreLabel } from "../utils/formatters"

export default function SummaryCard({ summary, score, verdict }) {
  const { label, color } = scoreLabel(score)
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Verdict</h2>
        <span className={`text-2xl font-black ${color}`}>{score}/100</span>
      </div>
      <p className={`text-sm font-semibold mb-2 ${color}`}>{label}</p>
      <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>
    </div>
  )
}
```

---

### 2.6 `src/components/CategoryBreakdown.jsx`
```jsx
// Props: categories: Category[]
import { severityEmoji, severityColor } from "../utils/formatters"

export default function CategoryBreakdown({ categories }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Category Breakdown</h2>
      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <div key={cat.name} className={`flex items-start gap-3 p-3 rounded-xl border ${severityColor[cat.severity]}`}>
            <span className="text-lg">{severityEmoji[cat.severity]}</span>
            <div>
              <p className="font-semibold text-sm">{cat.name}</p>
              <p className="text-xs mt-0.5 opacity-80">{cat.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### 2.7 `src/components/ClauseList.jsx`
```jsx
// Props: clauses: Clause[]
import { useState } from "react"
import { severityEmoji, severityColor } from "../utils/formatters"

export default function ClauseList({ clauses }) {
  const [expanded, setExpanded] = useState({})
  const toggle = (i) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Key Clauses</h2>
      <div className="flex flex-col gap-3">
        {clauses.map((clause, i) => (
          <div key={i} className={`border rounded-xl p-4 ${severityColor[clause.severity]}`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">{severityEmoji[clause.severity]} {clause.title}</p>
              <button onClick={() => toggle(i)} className="text-xs underline opacity-70 hover:opacity-100">
                {expanded[i] ? "Show simplified" : "Show original"}
              </button>
            </div>
            <p className="text-xs mt-2 opacity-80 leading-relaxed">
              {expanded[i] ? clause.original : clause.simplified}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### 2.8 `src/components/RiskFlags.jsx`
```jsx
// Props: flags: string[]
export default function RiskFlags({ flags }) {
  if (!flags || flags.length === 0) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-red-700 mb-3">⚠️ Flagged for You</h2>
      <ul className="flex flex-col gap-2">
        {flags.map((flag, i) => (
          <li key={i} className="text-sm text-red-700 flex items-start gap-2">
            <span>•</span><span>{flag}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### 2.9 `src/pages/Home.jsx`
```jsx
import { useState } from "react"
import InputPanel from "../components/InputPanel"
import { useAnalyze } from "../hooks/useAnalyze"
import SummaryCard from "../components/SummaryCard"
import CategoryBreakdown from "../components/CategoryBreakdown"
import ClauseList from "../components/ClauseList"
import RiskFlags from "../components/RiskFlags"

export default function Home() {
  const { analyze, result, loading, error } = useAnalyze()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-center mb-2">What Did I Just Sign?</h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Paste a privacy policy URL or text. Get a plain-English breakdown in seconds.
        </p>
        <InputPanel onSubmit={analyze} loading={loading} />
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {loading && (
          <div className="mt-10 text-center text-gray-400 text-sm animate-pulse">
            Reading the fine print for you...
          </div>
        )}
        {result && (
          <div className="mt-8 flex flex-col gap-4">
            <SummaryCard summary={result.summary} score={result.score} verdict={result.verdict} />
            {result.flags?.length > 0 && <RiskFlags flags={result.flags} />}
            <CategoryBreakdown categories={result.categories} />
            <ClauseList clauses={result.clauses} />
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### 2.10 `src/App.jsx`
```jsx
import Home from "./pages/Home"

export default function App() {
  return <Home />
}
```

---

## 3. Deployment

### Frontend → Vercel
1. Push repo to GitHub
2. Import project on vercel.com → set root to `frontend/`
3. Add env var: `VITE_API_URL=https://your-backend.railway.app`
4. Deploy

### Backend → Railway
1. New project → Deploy from GitHub → select repo
2. Set root directory to `backend/`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add env vars: `QWEN_API_KEY=your-dashscope-key` and `QWEN_API_BASE=https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
5. Deploy → copy the public URL → paste into Vercel env

---

## 4. Test Policies (reliable for demo)

| Policy | URL |
|---|---|
| Spotify | https://www.spotify.com/us/legal/privacy-policy/ |
| GitHub | https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement |
| Duolingo | https://www.duolingo.com/privacy |

Pre-test each before demo day. If URL fetch fails, have raw text pasted as fallback.

---

## 5. Known Edge Cases to Handle

| Issue | Fix |
|---|---|
| Policy behind JS render (SPA) | Fallback to paste-text mode |
| AI returns malformed JSON | Wrap `json.loads` in try/catch, return 500 with message |
| Text too long | `chunker.py` truncates to 12k chars — acceptable for demo |
| CORS error in dev | Confirm `allow_origins=["*"]` in FastAPI middleware |
| Vercel can't reach Railway | Check Railway public networking is enabled |
