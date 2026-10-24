from pydantic import BaseModel, Field
from typing import List, Optional

class ClauseExplanationItem(BaseModel):
    clause_title: str
    raw_clause_text: str
    plain_explanation: str
    category: str
    impact_level: str

class PotentialConcernItem(BaseModel):
    issue_title: str
    concern_text: str
    severity: str
    suggested_question: str
    legal_basis: Optional[str] = None

class DocumentDeadlineItem(BaseModel):
    deadline_title: str
    explicit_date_or_duration: str
    is_inferred: bool
    consequence_of_missing: str
    reminder_suggested: bool

class AnalyzeDocumentRequest(BaseModel):
    version_id: str
    content_hash: str
    sanitized_text: str
    document_type: Optional[str] = "agreement"

class DocumentAnalysisResponse(BaseModel):
    analysis_id: str
    version_id: str
    overview: str
    plain_summary: str
    clause_explanations: List[ClauseExplanationItem]
    potential_concerns: List[PotentialConcernItem]
    document_deadlines: List[DocumentDeadlineItem]
    questions_for_lawyer: List[str]
    suggested_next_steps: List[str]
    disclaimer: str

class DocumentUploadResponse(BaseModel):
    document_id: str
    version_id: str
    title: str
    original_filename: str
    page_count: int
    char_count: int
    raw_content_hash: str
    raw_text: str
