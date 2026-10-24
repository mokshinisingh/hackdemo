import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Jurisdiction(Base):
    __tablename__ = "jurisdictions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True) # e.g. IN-CENTRAL, IN-KA, IN-MH
    name = Column(String(100), nullable=False) # e.g. India (Central), Karnataka, Maharashtra
    country = Column(String(100), default="India", nullable=False)
    state_or_region = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    user_jurisdictions = relationship("UserJurisdiction", back_populates="jurisdiction", cascade="all, delete-orphan")
    legal_sources = relationship("LegalSource", back_populates="jurisdiction")
    knowledge_articles = relationship("KnowledgeArticle", back_populates="jurisdiction")


class UserJurisdiction(Base):
    __tablename__ = "user_jurisdictions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("app_users.id", ondelete="CASCADE"), nullable=False, index=True)
    jurisdiction_id = Column(String(36), ForeignKey("jurisdictions.id", ondelete="CASCADE"), nullable=False, index=True)
    is_primary = Column(Boolean, default=True, nullable=False)

    user = relationship("AppUser", back_populates="user_jurisdictions")
    jurisdiction = relationship("Jurisdiction", back_populates="user_jurisdictions")


class LegalSource(Base):
    __tablename__ = "legal_sources"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(255), nullable=False) # e.g. "The Consumer Protection Act, 2019"
    short_title = Column(String(100), nullable=False) # e.g. "CPA 2019"
    citation = Column(String(255), nullable=True) # e.g. "Act No. 35 of 2019"
    issuing_organization = Column(String(255), nullable=False) # "Parliament of India"
    official_url = Column(String(500), nullable=False)
    jurisdiction_id = Column(String(36), ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True)
    enacted_date = Column(DateTime, nullable=True)
    last_amended_date = Column(DateTime, nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)

    jurisdiction = relationship("Jurisdiction", back_populates="legal_sources")
    versions = relationship("SourceVersion", back_populates="legal_source", cascade="all, delete-orphan")
    provisions = relationship("LegalProvision", back_populates="legal_source", cascade="all, delete-orphan")
    article_sources = relationship("ArticleSource", back_populates="legal_source", cascade="all, delete-orphan")


class SourceVersion(Base):
    __tablename__ = "source_versions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    legal_source_id = Column(String(36), ForeignKey("legal_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    version_label = Column(String(100), nullable=False)
    effective_from = Column(DateTime, nullable=True)
    full_text_url = Column(String(500), nullable=True)
    summary = Column(Text, nullable=True)

    legal_source = relationship("LegalSource", back_populates="versions")


class LegalProvision(Base):
    __tablename__ = "legal_provisions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    legal_source_id = Column(String(36), ForeignKey("legal_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    section_number = Column(String(100), nullable=False) # e.g. "Section 2(7)"
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    plain_summary = Column(Text, nullable=False)
    tags = Column(String(255), nullable=True)

    legal_source = relationship("LegalSource", back_populates="provisions")


class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # 'Tenant Rights', 'Workplace Rights', 'Consumer Protection', etc.
    jurisdiction_id = Column(String(36), ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True)
    plain_language_intro = Column(Text, nullable=False)
    key_points = Column(Text, nullable=False) # JSON list
    everyday_examples = Column(Text, nullable=False)
    faqs = Column(Text, nullable=False) # JSON list of {question, answer}
    practical_checklist = Column(Text, nullable=False) # JSON list
    disclaimer = Column(Text, nullable=False)
    verified_at = Column(DateTime, nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)

    jurisdiction = relationship("Jurisdiction", back_populates="knowledge_articles")
    article_sources = relationship("ArticleSource", back_populates="article", cascade="all, delete-orphan")


class ArticleSource(Base):
    __tablename__ = "article_sources"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    article_id = Column(String(36), ForeignKey("knowledge_articles.id", ondelete="CASCADE"), nullable=False, index=True)
    legal_source_id = Column(String(36), ForeignKey("legal_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    specific_section = Column(String(100), nullable=True)

    article = relationship("KnowledgeArticle", back_populates="article_sources")
    legal_source = relationship("LegalSource", back_populates="article_sources")
