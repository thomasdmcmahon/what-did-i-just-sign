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
    source_heading: str = ""
    source_context: str = ""


class KeyTerm(BaseModel):
    term: str
    definition: str


class InlineExplanation(BaseModel):
    phrase: str
    explanation: str


class Category(BaseModel):
    name: str
    severity: str
    summary: str
    summary_points: List[str] = Field(default_factory=list)
    highlight_phrases: List[str] = Field(default_factory=list)
    explanations: List[InlineExplanation] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    summary: str
    summary_highlights: List[str] = Field(default_factory=list)
    summary_explanations: List[InlineExplanation] = Field(default_factory=list)
    score: int
    verdict: str
    categories: List[Category]
    clauses: List[Clause]
    flags: List[str]
    key_terms: List[KeyTerm] = Field(default_factory=list)
