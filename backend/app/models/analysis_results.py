import uuid
from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class ClauseExplanation(Base):
    __tablename__ = "clause_explanations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    analysis_id = Column(String(36), ForeignKey("document_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    passage_id = Column(String(36), ForeignKey("document_passages.id", ondelete="SET NULL"), nullable=True)
    clause_title = Column(String(255), nullable=False)
    raw_clause_text = Column(Text, nullable=False)
    plain_explanation = Column(Text, nullable=False)
    category = Column(String(100), default="obligations", nullable=False) # 'rights', 'obligations', 'penalties', 'termination', 'payment', 'confidentiality'
    impact_level = Column(String(50), default="medium", nullable=False) # 'high', 'medium', 'low', 'info'

    analysis = relationship("DocumentAnalysis", back_populates="clause_explanations")
    passage = relationship("DocumentPassage")


class PotentialConcern(Base):
    __tablename__ = "potential_concerns"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    analysis_id = Column(String(36), ForeignKey("document_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    passage_id = Column(String(36), ForeignKey("document_passages.id", ondelete="SET NULL"), nullable=True)
    issue_title = Column(String(255), nullable=False)
    concern_text = Column(Text, nullable=False)
    severity = Column(String(50), default="warning", nullable=False) # 'warning', 'caution', 'info'
    suggested_question = Column(Text, nullable=False) # Question to ask lawyer or other party
    legal_basis = Column(Text, nullable=True)

    analysis = relationship("DocumentAnalysis", back_populates="potential_concerns")
    passage = relationship("DocumentPassage")


class DocumentDeadline(Base):
    __tablename__ = "document_deadlines"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    analysis_id = Column(String(36), ForeignKey("document_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    passage_id = Column(String(36), ForeignKey("document_passages.id", ondelete="SET NULL"), nullable=True)
    deadline_title = Column(String(255), nullable=False)
    explicit_date_or_duration = Column(String(255), nullable=False) # e.g. "Within 15 days of notice"
    is_inferred = Column(Boolean, default=False, nullable=False)
    consequence_of_missing = Column(Text, nullable=False)
    reminder_suggested = Column(Boolean, default=True, nullable=False)

    analysis = relationship("DocumentAnalysis", back_populates="document_deadlines")
    passage = relationship("DocumentPassage")


class AnalysisSource(Base):
    __tablename__ = "analysis_sources"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    analysis_id = Column(String(36), ForeignKey("document_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    legal_source_id = Column(String(36), ForeignKey("legal_sources.id", ondelete="CASCADE"), nullable=False)
    relevance_summary = Column(Text, nullable=False)

    analysis = relationship("DocumentAnalysis", back_populates="analysis_sources")
    legal_source = relationship("LegalSource")
