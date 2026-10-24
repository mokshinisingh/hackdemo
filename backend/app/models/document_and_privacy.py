import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from backend.app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("app_users.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    document_type = Column(String(100), default="general_agreement", nullable=False) # e.g. rental_agreement, employment_contract, notice
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("AppUser", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, default=1, nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), default="text/plain", nullable=False)
    raw_text = Column(Text, nullable=False)
    sanitized_text = Column(Text, nullable=True) # Text after redactions
    content_hash = Column(String(64), nullable=True, index=True) # SHA-256 of sanitized text
    raw_content_hash = Column(String(64), nullable=True) # SHA-256 of raw text
    char_count = Column(Integer, default=0, nullable=False)
    page_count = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="uploaded", nullable=False) # 'uploaded', 'redacted', 'consent_granted', 'analyzed', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="versions")
    passages = relationship("DocumentPassage", back_populates="version", cascade="all, delete-orphan")
    privacy_reviews = relationship("PrivacyReview", back_populates="version", cascade="all, delete-orphan")
    processing_consents = relationship("ProcessingConsent", back_populates="version", cascade="all, delete-orphan")
    analyses = relationship("DocumentAnalysis", back_populates="version", cascade="all, delete-orphan")


class DocumentPassage(Base):
    __tablename__ = "document_passages"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    version_id = Column(String(36), ForeignKey("document_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    passage_index = Column(Integer, default=0, nullable=False)
    start_char = Column(Integer, nullable=False)
    end_char = Column(Integer, nullable=False)
    heading = Column(String(255), nullable=True)
    text_content = Column(Text, nullable=False)

    version = relationship("DocumentVersion", back_populates="passages")


class PrivacyReview(Base):
    __tablename__ = "privacy_reviews"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    version_id = Column(String(36), ForeignKey("document_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    initial_findings_count = Column(Integer, default=0, nullable=False)
    residual_findings_count = Column(Integer, default=0, nullable=False)
    review_status = Column(String(50), default="pending", nullable=False) # 'pending', 'reviewed', 'verified_clean', 'flagged'
    second_scan_clean = Column(Boolean, default=False, nullable=False)
    reviewed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    version = relationship("DocumentVersion", back_populates="privacy_reviews")
    findings = relationship("SensitiveFinding", back_populates="review", cascade="all, delete-orphan")
    redactions = relationship("RedactionAction", back_populates="review", cascade="all, delete-orphan")


class SensitiveFinding(Base):
    __tablename__ = "sensitive_findings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    review_id = Column(String(36), ForeignKey("privacy_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False) # 'AADHAAR', 'PAN', 'PHONE', 'EMAIL', 'BANK_ACCOUNT', 'IFSC', 'NAME', 'ADDRESS', 'CUSTOM'
    detected_text = Column(String(500), nullable=False)
    start_offset = Column(Integer, nullable=False)
    end_offset = Column(Integer, nullable=False)
    confidence_score = Column(Float, default=1.0, nullable=False)
    is_redacted = Column(Boolean, default=True, nullable=False)
    placeholder = Column(String(100), nullable=False) # e.g. [REDACTED_AADHAAR_1]
    scan_stage = Column(String(50), default="initial", nullable=False) # 'initial', 'second_scan'

    review = relationship("PrivacyReview", back_populates="findings")
    redaction_actions = relationship("RedactionAction", back_populates="finding")


class RedactionAction(Base):
    __tablename__ = "redaction_actions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    review_id = Column(String(36), ForeignKey("privacy_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    finding_id = Column(String(36), ForeignKey("sensitive_findings.id", ondelete="SET NULL"), nullable=True)
    action_type = Column(String(50), default="replace_placeholder", nullable=False) # 'replace_placeholder', 'mask_stars', 'custom_text', 'restore'
    original_value = Column(String(500), nullable=False)
    replacement_value = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    review = relationship("PrivacyReview", back_populates="redactions")
    finding = relationship("SensitiveFinding", back_populates="redaction_actions")


class ProcessingConsent(Base):
    __tablename__ = "processing_consents"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    version_id = Column(String(36), ForeignKey("document_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    content_hash = Column(String(64), nullable=False, index=True) # Cryptographic binding to exact sanitized content
    destination_service = Column(String(100), default="Legaly-Engine", nullable=False)
    purpose = Column(String(255), default="Document Plain-Language Simplification and Clause Analysis", nullable=False)
    retention_limitations = Column(Text, default="Zero-knowledge ephemeral processing. Text is not retained by third-party AI models.", nullable=False)
    user_affirmation = Column(Boolean, default=True, nullable=False)
    ip_or_session = Column(String(255), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime, nullable=True)

    version = relationship("DocumentVersion", back_populates="processing_consents")


class DocumentAnalysis(Base):
    __tablename__ = "document_analyses"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    version_id = Column(String(36), ForeignKey("document_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    overview = Column(Text, nullable=False)
    plain_summary = Column(Text, nullable=False)
    status = Column(String(50), default="completed", nullable=False) # 'pending', 'completed', 'failed'
    processing_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    version = relationship("DocumentVersion", back_populates="analyses")
    clause_explanations = relationship("ClauseExplanation", back_populates="analysis", cascade="all, delete-orphan")
    potential_concerns = relationship("PotentialConcern", back_populates="analysis", cascade="all, delete-orphan")
    document_deadlines = relationship("DocumentDeadline", back_populates="analysis", cascade="all, delete-orphan")
    analysis_sources = relationship("AnalysisSource", back_populates="analysis", cascade="all, delete-orphan")


class DocumentComparison(Base):
    __tablename__ = "document_comparisons"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    source_version_id = Column(String(36), ForeignKey("document_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    target_version_id = Column(String(36), ForeignKey("document_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    summary_of_changes = Column(Text, nullable=False)
    diff_json = Column(Text, nullable=False) # Serialized JSON of diff chunks
    payment_changes = Column(Text, nullable=True)
    termination_changes = Column(Text, nullable=True)
    notice_changes = Column(Text, nullable=True)
    liability_changes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    source_version = relationship("DocumentVersion", foreign_keys=[source_version_id])
    target_version = relationship("DocumentVersion", foreign_keys=[target_version_id])
