from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class SensitiveFindingItem(BaseModel):
    id: Optional[str] = None
    entity_type: str
    detected_text: str
    start_offset: int
    end_offset: int
    confidence_score: float
    is_redacted: bool = True
    placeholder: str
    scan_stage: str = "initial"

class DetectRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Document raw text")
    custom_terms: Optional[List[str]] = Field(default=None, description="Custom terms to detect and redact")

class DetectResponse(BaseModel):
    findings_count: int
    findings: List[SensitiveFindingItem]
    raw_content_hash: str

class RedactRequest(BaseModel):
    text: str
    findings: List[SensitiveFindingItem]
    custom_replacements: Optional[Dict[str, str]] = None # finding_id -> replacement text

class RedactResponse(BaseModel):
    sanitized_text: str
    content_hash: str
    redactions_applied: int

class SecondScanRequest(BaseModel):
    sanitized_text: str

class SecondScanResponse(BaseModel):
    is_clean: bool
    residual_count: int
    residual_findings: List[SensitiveFindingItem]
    message: str

class ConsentRequest(BaseModel):
    version_id: str
    content_hash: str
    user_affirmation: bool = True
    destination_service: Optional[str] = "Legaly-AI-Engine"
    purpose: Optional[str] = "Document Plain-Language Simplification and Clause Analysis"
    session_id: Optional[str] = "session-guest"

class ConsentResponse(BaseModel):
    consent_id: str
    version_id: str
    content_hash: str
    is_valid: bool
    granted_at: str
    message: str
