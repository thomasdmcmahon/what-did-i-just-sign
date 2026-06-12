import json
import os
from pathlib import Path
from json import JSONDecodeError
from typing import List

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

QWEN_API_BASE = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

SYSTEM_PROMPT = """You are a privacy policy analyst. Analyze the given privacy policy and return ONLY a compact valid JSON object — no markdown, no explanation, no preamble, no pretty printing.

JSON schema:
{
   "summary": "1-2 sentence plain-language overview in the requested output language",
   "summary_highlights": [
      "<important risk phrase copied exactly from summary>",
      "<important risk phrase copied exactly from summary>"
   ],
   "summary_explanations": [
    {
       "phrase": "<word or phrase copied exactly from summary>",
       "explanation": "<expanded plain-language explanation in the requested output language>"
    }
  ],
   "score": <integer 0-100, lower = more invasive>,
   "verdict": "<one of: 'Privacy-Friendly' | 'Acceptable' | 'Moderately Invasive' | 'Highly Invasive'>",
   "categories": [
    {
       "name": "<category name>",
       "severity": "<'red' | 'yellow' | 'green'>",
       "summary": "<one short sentence overview in the requested output language, 20 words or fewer>",
       "summary_points": [
          "<short bullet point in the requested output language, 10 words or fewer>",
          "<short bullet point in the requested output language, 10 words or fewer>",
          "<short bullet point in the requested output language, 10 words or fewer>",
          "<short bullet point in the requested output language, 10 words or fewer>"
       ],
       "highlight_phrases": [
          "<important risk phrase copied from summary or summary_points>",
          "<important risk phrase copied from summary or summary_points>"
       ],
       "explanations": [
          {
             "phrase": "<word or phrase copied exactly from summary_points>",
             "explanation": "<expanded plain-language explanation in the requested output language>"
          }
       ]
    }
  ],
   "clauses": [
    {
       "title": "<short clause label in the requested output language>",
       "original": "<verbatim excerpt under 60 words>",
       "simplified": "<plain-language version in the requested output language, 20 words or fewer>",
       "severity": "<'red' | 'yellow' | 'green'>",
       "source_heading": "<nearest Section heading from the input, or empty string if unknown>",
       "source_context": "<full Context path from the input, or source_heading if no full context is available>"
    }
  ],
   "flags": ["<complete sentence in the requested output language describing a risk relevant to user preferences>"],
   "key_terms": [
    {
       "term": "<difficult privacy/legal/technical term found in the analysis>",
       "definition": "<plain-language definition in the requested output language>"
    }
  ]
}

Categories to always include: Data Collection, Third-Party Sharing, Data Retention, User Rights, Cookies & Tracking.
Include 1-2 summary_highlights copied exactly from summary_explanations phrase values.
Include 1-2 summary_explanations for difficult or important phrases copied exactly from the summary. Keep each explanation under 22 words.
For every category, include exactly 4 concise summary_points. Each point should be a short standalone statement, not a paragraph.
For every category, include 1-2 highlight_phrases copied exactly from that category's explanations phrase values.
For every category, include exactly 1 explanation for a difficult or important word, phrase, or short sentence fragment copied exactly from that category's summary_points. Keep each explanation under 22 words.
Include exactly 3 key_terms for difficult privacy, legal, or technical concepts that appear in the analysis, such as retention period, behavioral data, targeted advertising, third-party sharing, anonymized data, or consent. Keep each definition under 22 words.
Extract exactly 4 notable clauses. Include up to 3 flags relevant to user preferences (empty array if no preferences given).
The input may contain repeated blocks formatted as Section, Context, and Text. For each clause, copy source_heading from the nearest Section value and source_context from the nearest Context value for the Text you quote.
The flags array must contain complete sentences in the requested output language. Do not return raw preference labels such as "location", "third_party", or "ads".
Keep JSON keys exactly as shown.
Keep category name values exactly as the English category names listed above.
Keep severity values in English as "red", "yellow", or "green".
Keep verdict as one of the English enum values.
Keep each "original" field as a verbatim excerpt from the source policy.
Keep source_heading and source_context in the same language as they appear in the source policy.
All other generated user-facing text MUST be written in the requested output language, including summary, summary_explanations, category summaries, summary_points, explanations, key_terms, clause titles, simplified clauses, and flags.
"""

LANGUAGE_NAMES = {
    "english": "English",
    "chinese": "Simplified Chinese",
    "korean": "Korean",
    "norwegian": "Norwegian Bokmal",
}


class AIResponseTruncated(RuntimeError):
    pass


def parse_ai_json(raw: str, finish_reason: str | None = None) -> dict:
    cleaned = raw.strip()

    # Strip markdown fences if the model adds them anyway
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except JSONDecodeError as exc:
        if finish_reason == "length" or not cleaned.endswith("}"):
            raise AIResponseTruncated(
                "AI response was truncated before valid JSON was complete. "
                "Try again; if it repeats, reduce the policy text length."
            ) from exc

        raise RuntimeError(f"AI returned invalid JSON: {exc}") from exc


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
    
    for attempt, policy_text in enumerate((text, text[:8000])):
        response = await client.chat.completions.create(
            model="qwen-plus",  # Fast, cost-effective for prototypes
            max_tokens=5000,
            response_format={"type": "json_object"},  # Forces valid JSON output
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Output language for every generated user-facing text field: {output_language}\n"
                        "Do not use English for summary, summary_explanations, category summaries, summary_points, explanations, key_terms, clause titles, simplified clauses, or flags unless the output language is English.\n"
                        f"User preferences (flag these if relevant): {prefs_str}\n\n"
                        f"Privacy policy text:\n{policy_text}"
                    ),
                }
            ]
        )

        choice = response.choices[0]
        raw = choice.message.content or ""

        try:
            return parse_ai_json(raw, choice.finish_reason)
        except AIResponseTruncated:
            if attempt == 0:
                continue
            raise

    raise RuntimeError("AI analysis did not return a valid response")
