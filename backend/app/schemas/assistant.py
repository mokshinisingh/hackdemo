from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class QueryRequest(BaseModel):
    query_text: str = Field(..., min_length=3, description="User legal query")
    jurisdiction_code: Optional[str] = Field("IN-CENTRAL", description="Jurisdiction code e.g. IN-CENTRAL, IN-KA, IN-MH")
    category: Optional[str] = Field("general", description="Legal topic category")
    session_id: Optional[str] = Field(None, description="Active user session ID")

class NextStepItem(BaseModel):
    title: str
    description: str
    rationale: Optional[str] = None
    required_information: Optional[str] = None
    is_completed: bool = False
    is_verified_requirement: bool = True

class SourceItem(BaseModel):
    act_title: str
    short_title: str
    citation: Optional[str] = None
    section_number: str
    section_title: str
    official_url: str
    issuing_organization: str
    plain_summary: str
    content_snippet: str
    is_verified: bool = True

class ResourceItem(BaseModel):
    id: str
    name: str
    organization: str
    resource_type: str
    official_url: str
    contact_phone: Optional[str] = None
    description: str
    referral_reason: str

class QueryResponse(BaseModel):
    query_id: str
    simple_explanation: str
    legal_information: str
    conditions_and_exceptions: str
    professional_help_advice: str
    confidence_level: str
    ai_model: str
    disclaimer: str
    next_steps: List[NextStepItem]
    sources: List[SourceItem]
    resources: List[ResourceItem]
