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
   "summary": "2-3 sentence plain-language overview in the requested output language",
   "score": <integer 0-100, lower = more invasive>,
   "verdict": "<one of: 'Privacy-Friendly' | 'Acceptable' | 'Moderately Invasive' | 'Highly Invasive'>",
   "categories": [
    {
       "name": "<category name>",
       "severity": "<'red' | 'yellow' | 'green'>",
       "summary": "<one short sentence overview in the requested output language>",
       "summary_points": [
          "<short bullet point in the requested output language>",
          "<short bullet point in the requested output language>"
       ]
    }
  ],
   "clauses": [
    {
       "title": "<short clause label in the requested output language>",
       "original": "<verbatim excerpt under 100 words>",
       "simplified": "<plain-language version in the requested output language>",
       "severity": "<'red' | 'yellow' | 'green'>"
    }
  ],
   "flags": ["<complete sentence in the requested output language describing a risk relevant to user preferences>"]
}

Categories to always include: Data Collection, Third-Party Sharing, Data Retention, User Rights, Cookies & Tracking.
For every category, include 2-4 concise summary_points. Each point should be a short standalone statement, not a paragraph.
Extract 4-7 notable clauses. Include 1-5 flags relevant to user preferences (empty array if no preferences given).
The flags array must contain complete sentences in the requested output language. Do not return raw preference labels such as "location", "third_party", or "ads".
Keep JSON keys exactly as shown.
Keep category name values exactly as the English category names listed above.
Keep severity values in English as "red", "yellow", or "green".
Keep verdict as one of the English enum values.
Keep each "original" field as a verbatim excerpt from the source policy.
All other generated user-facing text MUST be written in the requested output language, including summary, category summaries, summary_points, clause titles, simplified clauses, and flags.
"""

LANGUAGE_NAMES = {
    "english": "English",
    "chinese": "Simplified Chinese",
    "korean": "Korean",
    "norwegian": "Norwegian Bokmal",
}


async def analyze_policy(text: str, preferences: List[str], language: str = "english") -> dict:
    prefs_str = ", ".join(preferences) if preferences else "none specified"
    output_language = LANGUAGE_NAMES.get(language.lower(), "English")
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
            {
                "role": "user",
                "content": (
                    f"Output language for every generated user-facing text field: {output_language}\n"
                    "Do not use English for summary, category summaries, summary_points, clause titles, simplified clauses, or flags unless the output language is English.\n"
                    f"User preferences (flag these if relevant): {prefs_str}\n\n"
                    f"Privacy policy text:\n{text}"
                ),
            }
        ]
    )
    
    raw = response.choices[0].message.content.strip()
    
    # Strip markdown fences if the model adds them anyway
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
            
    return json.loads(raw.strip())
