from typing import List, Optional

from pydantic import BaseModel, Field, model_validator


class AnalyzeRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None
    preferences: List[str] = Field(default_factory=list)
    language: str = "english"

    @model_validator(mode="after")
    def require_url_or_text(self):
        if not self.url and not self.text:
            raise ValueError("Provide either url or text")
        return self


class Clause(BaseModel):
    title: str
    original: str
    simplified: str
    severity: str


class Category(BaseModel):
    name: str
    severity: str
    summary: str


class AnalyzeResponse(BaseModel):
    summary: str
    score: int
    verdict: str
    categories: List[Category]
    clauses: List[Clause]
    flags: List[str]
