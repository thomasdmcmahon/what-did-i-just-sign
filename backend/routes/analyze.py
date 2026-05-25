from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.ai import analyze_policy
from services.chunker import chunk_text
from services.fetcher import fetch_policy_text

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    if request.url:
        try:
            raw_text = await fetch_policy_text(str(request.url))
        except Exception as exc:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to fetch URL: {exc}",
            ) from exc
    else:
        raw_text = request.text or ""

    text = chunk_text(raw_text)

    try:
        result = await analyze_policy(text, request.preferences)
        return AnalyzeResponse.model_validate(result)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI response did not match the expected schema: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to analyze policy: {exc}",
        ) from exc
