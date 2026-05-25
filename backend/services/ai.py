import json
import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

QWEN_API_BASE = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

SYSTEM_PROMPT = """You are a privacy policy analyst. Analyze the given privacy policy and return ONLY a valid JSON object — no markdown, no explanation, no preamble.

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
The flags array must contain complete plain-English sentences. Do not return raw preference labels such as "location", "third_party", or "ads".
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
        model="qwen-plus",  # Fast, cost-effective for prototypes
        max_tokens=2000,
        response_format={"type": "json_object"},  # Forces valid JSON output
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"User preferences (flag these if relevant): {prefs_str}\n\nPrivacy policy text:\n{text}"}
        ]
    )
    
    raw = response.choices[0].message.content.strip()
    
    # Strip markdown fences if the model adds them anyway
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
            
    return json.loads(raw.strip())
