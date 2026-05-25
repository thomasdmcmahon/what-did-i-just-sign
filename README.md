# What Did I Just Sign?

Hi-fi prototype for COSE431 HCI: a privacy policy interpreter that accepts a URL or pasted policy text and returns a plain-English summary card with risk categories, key clauses, and user-specific flags.

## Project Goal

Most people agree to privacy policies without reading them. This app makes the fine print easier to understand by:

- Fetching a privacy policy from a URL or accepting pasted text
- Summarizing the policy in plain English
- Scoring how invasive the policy is from `0-100`
- Highlighting important clauses
- Flagging concerns based on user preferences, such as location tracking, third-party sharing, children's data, ads, biometrics, or data retention

## Planned Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: FastAPI, Uvicorn, Pydantic
- Policy fetching: httpx, BeautifulSoup4
- AI analysis: Qwen via DashScope's OpenAI-compatible API
- Deployment: Vercel for frontend, Railway for backend

## Current Prototype Status

The backend is ready for the prototype frontend. It can accept pasted policy text, send it to Qwen, and return structured JSON with a summary, privacy score, verdict, category breakdown, notable clauses, and plain-English preference flags.

URL fetching is implemented, but pasted-text mode is the safest path for the GA6 demo because it avoids live-site scraping failures.

## Repository Structure

```text
what-did-i-just-sign/
├── README.md
├── .gitignore
├── frontend/
│   ├── .env.example
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── utils/
└── backend/
    ├── .env.example
    ├── models/
    ├── routes/
    └── services/
```

## Folder Responsibilities

| Folder | Purpose |
|---|---|
| `frontend/` | React app built with Vite and Tailwind |
| `frontend/src/components/` | Reusable UI pieces like input panel, modal, summary card, clause list |
| `frontend/src/hooks/` | Custom React hooks, including API calls |
| `frontend/src/pages/` | Page-level views such as the home screen |
| `frontend/src/utils/` | Formatting helpers like score labels and severity colors |
| `backend/` | FastAPI app and AI analysis API |
| `backend/models/` | Pydantic request and response schemas |
| `backend/routes/` | API route handlers |
| `backend/services/` | Fetching, chunking, and AI analysis logic |

## Prerequisites

Install these before working on the project:

- Node.js 18 or newer
- npm
- Python 3.10 or newer
- A Qwen API key from DashScope Model Studio

## Frontend Setup

From the repository root:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios
```

Update `frontend/tailwind.config.js`:

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Add this to the top of `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Create `frontend/.env` from the example:

```bash
cp .env.example .env
```

Expected frontend env variable:

```env
VITE_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

## Backend Setup

From the repository root:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

On Windows, activate the virtual environment with:

```bash
venv\Scripts\activate
```

Create `backend/.env` from the example:

```bash
cp .env.example .env
```

Expected backend env variable:

```env
QWEN_API_KEY=your-dashscope-key
QWEN_API_BASE=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

Run the backend:

```bash
uvicorn main:app --reload --port 8000
```

Health check:

```text
GET http://localhost:8000/health
```

Analyze endpoint:

```text
POST http://localhost:8000/analyze
```

Example request body:

```json
{
  "url": "https://www.spotify.com/us/legal/privacy-policy/",
  "text": null,
  "preferences": ["location", "third_party", "ads"]
}
```

## Backend Verification

With the backend running, verify the health endpoint:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

Then verify the Qwen analysis flow with pasted text:

```bash
curl -s -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "We collect your name, email address, device information, location data, and usage activity. We may share this information with advertising partners and analytics providers. You may request deletion of your data by contacting support.",
    "preferences": ["location", "third_party", "ads"]
  }' | python -m json.tool
```

Expected result: formatted JSON containing `summary`, `score`, `verdict`, `categories`, `clauses`, and sentence-style `flags`.

## Core Backend Files To Build

| File | Status | Purpose |
|---|---|---|
| `backend/main.py` | Done | Create FastAPI app, configure CORS, include routes, expose `/health` |
| `backend/models/schemas.py` | Done | Define `AnalyzeRequest`, `AnalyzeResponse`, `Category`, and `Clause` |
| `backend/routes/analyze.py` | Done | Validate input, fetch or accept text, call AI service, return structured summary |
| `backend/services/fetcher.py` | Done | Fetch policy HTML and extract readable text |
| `backend/services/chunker.py` | Done | Truncate long policy text for prototype scope |
| `backend/services/ai.py` | Done | Send policy text to Qwen and parse JSON response |

## Core Frontend Files To Build

| File | Status | Purpose |
|---|---|---|
| `frontend/src/App.jsx` | To do | Render the home page |
| `frontend/src/pages/Home.jsx` | To do | Main user flow: input, loading, errors, result cards |
| `frontend/src/hooks/useAnalyze.js` | To do | Call the backend `/analyze` endpoint |
| `frontend/src/components/InputPanel.jsx` | To do | URL/text input and analyze button |
| `frontend/src/components/PreferenceModal.jsx` | To do | Let users choose privacy concerns before analysis |
| `frontend/src/components/SummaryCard.jsx` | To do | Show verdict, score, and overview |
| `frontend/src/components/CategoryBreakdown.jsx` | To do | Show category-level privacy risks |
| `frontend/src/components/ClauseList.jsx` | To do | Show simplified and original notable clauses |
| `frontend/src/components/RiskFlags.jsx` | To do | Show user-specific risk flags |
| `frontend/src/utils/formatters.js` | To do | Map scores and severities to display labels/styles |

## API Response Shape

The backend should return:

```json
{
  "summary": "2-3 sentence plain-English overview",
  "score": 62,
  "verdict": "Moderately Invasive",
  "categories": [
    {
      "name": "Data Collection",
      "severity": "yellow",
      "summary": "The service collects account, device, and usage data."
    }
  ],
  "clauses": [
    {
      "title": "Third-party sharing",
      "original": "Short excerpt from the original policy...",
      "simplified": "They may share some data with partners.",
      "severity": "yellow"
    }
  ],
  "flags": [
    "This policy includes targeted advertising practices."
  ]
}
```

## Demo Test Policies

Use these for development and demo prep:

| Policy | URL |
|---|---|
| Spotify | `https://www.spotify.com/us/legal/privacy-policy/` |
| GitHub | `https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement` |
| Duolingo | `https://www.duolingo.com/privacy` |

Pre-test each URL before demo day. If a site blocks fetching or needs JavaScript rendering, use paste-text mode as the fallback.

## Known Edge Cases

| Issue | Expected Handling |
|---|---|
| Policy page requires JavaScript rendering | Use paste-text mode |
| URL fetch fails | Return a clear error from the backend |
| AI returns malformed JSON | Catch parsing errors and return a helpful 500 response |
| Policy text is too long | Truncate to roughly 12,000 characters for prototype scope |
| CORS error in development | Confirm FastAPI CORS middleware allows the frontend origin |
| Vercel cannot reach Railway | Confirm Railway public networking and frontend `VITE_API_URL` |

## Deployment Plan

### Frontend: Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set the project root to `frontend/`.
4. Add `VITE_API_URL=https://your-backend.railway.app`.
5. Deploy.

### Backend: Railway

1. Create a Railway project from the GitHub repository.
2. Set the root directory to `backend/`.
3. Set the start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

4. Add `QWEN_API_KEY` and `QWEN_API_BASE`.
5. Deploy and copy the public URL into the Vercel frontend environment variables.

## Team Workflow

Recommended split:

- Backend teammate: schemas, fetcher, chunker, Qwen analysis service, `/analyze` route
- Frontend teammate: input panel, preference modal, summary/results UI
- Integration teammate: environment setup, error handling, demo test policies, deployment

Before demo day:

- Verify backend `/health`
- Test URL mode with at least one reliable policy
- Test paste-text fallback
- Test preference flags
- Confirm frontend `VITE_API_URL` points to the correct backend
- Save at least one pasted policy text sample in case a live URL fails
