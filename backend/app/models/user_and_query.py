import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from backend.app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class AppUser(Base):
    __tablename__ = "app_users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=True, index=True)
    session_token = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    queries = relationship("LegalQuery", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    user_jurisdictions = relationship("UserJurisdiction", back_populates="user", cascade="all, delete-orphan")


class LegalQuery(Base):
    __tablename__ = "legal_queries"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("app_users.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(String(255), nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    category = Column(String(100), default="general", nullable=False)
    jurisdiction_id = Column(String(36), ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("AppUser", back_populates="queries")
    jurisdiction = relationship("Jurisdiction")
    responses = relationship("AiResponse", back_populates="query", cascade="all, delete-orphan")


class AiResponse(Base):
    __tablename__ = "ai_responses"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    query_id = Column(String(36), ForeignKey("legal_queries.id", ondelete="CASCADE"), nullable=False, index=True)
    simple_explanation = Column(Text, nullable=False)
    legal_information = Column(Text, nullable=False)
    conditions_and_exceptions = Column(Text, nullable=False)
    professional_help_advice = Column(Text, nullable=False)
    confidence_level = Column(String(50), default="high", nullable=False)
    ai_model = Column(String(100), default="Legaly-Engine-v1", nullable=False)
    disclaimer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    query = relationship("LegalQuery", back_populates="responses")
    next_steps = relationship("NextStep", back_populates="response", cascade="all, delete-orphan")
    response_sources = relationship("ResponseSource", back_populates="response", cascade="all, delete-orphan")
    resource_referrals = relationship("ResourceReferral", back_populates="response", cascade="all, delete-orphan")


class NextStep(Base):
    __tablename__ = "next_steps"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    response_id = Column(String(36), ForeignKey("ai_responses.id", ondelete="CASCADE"), nullable=False, index=True)
    step_order = Column(Integer, default=1, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    required_information = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    is_verified_requirement = Column(Boolean, default=True, nullable=False)

    response = relationship("AiResponse", back_populates="next_steps")


class ResponseSource(Base):
    __tablename__ = "response_sources"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    response_id = Column(String(36), ForeignKey("ai_responses.id", ondelete="CASCADE"), nullable=False, index=True)
    legal_source_id = Column(String(36), ForeignKey("legal_sources.id", ondelete="CASCADE"), nullable=False)
    citation_text = Column(String(500), nullable=False)
    relevance_explanation = Column(Text, nullable=True)

    response = relationship("AiResponse", back_populates="response_sources")
    legal_source = relationship("LegalSource")


class LegalAidResource(Base):
    __tablename__ = "legal_aid_resources"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=False) # 'legal_aid', 'helpline', 'ombudsman', 'tribunal', 'portal'
    official_url = Column(String(500), nullable=False)
    contact_phone = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    jurisdiction_id = Column(String(36), ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True)
    address = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    description = Column(Text, nullable=False)

    jurisdiction = relationship("Jurisdiction")


class ResourceReferral(Base):
    __tablename__ = "resource_referrals"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    response_id = Column(String(36), ForeignKey("ai_responses.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("legal_aid_resources.id", ondelete="CASCADE"), nullable=False)
    referral_reason = Column(Text, nullable=False)

    response = relationship("AiResponse", back_populates="resource_referrals")
    resource = relationship("LegalAidResource")
