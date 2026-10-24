from pydantic import BaseModel
from typing import List, Optional

class KnowledgeArticleItem(BaseModel):
    id: str
    slug: str
    title: str
    category: str
    plain_language_intro: str
    key_points: List[str]
    everyday_examples: str
    faqs: List[dict]
    practical_checklist: List[str]
    disclaimer: str
    verified_at: Optional[str] = None
    is_published: bool = True

class LegalAidResourceItem(BaseModel):
    id: str
    name: str
    organization: str
    resource_type: str
    official_url: str
    contact_phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    description: str

class JurisdictionItem(BaseModel):
    id: str
    code: str
    name: str
    country: str
    state_or_region: Optional[str] = None
    is_active: bool = True
