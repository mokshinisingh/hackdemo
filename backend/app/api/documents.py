import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.database import get_db
from backend.app.models.document_and_privacy import (
    Document,
    DocumentVersion,
    DocumentPassage,
    DocumentAnalysis,
)
from backend.app.models.analysis_results import (
    ClauseExplanation,
    PotentialConcern,
    DocumentDeadline,
)
from backend.app.schemas.document import (
    AnalyzeDocumentRequest,
    DocumentAnalysisResponse,
    DocumentUploadResponse,
    ClauseExplanationItem,
    PotentialConcernItem,
    DocumentDeadlineItem,
)
from backend.app.document_processing.parser import extract_text, split_into_passages
from backend.app.privacy.redactor import compute_content_hash
from backend.app.privacy.consent import verify_processing_consent
from backend.app.ai.orchestrator import analyze_document_content
from backend.app.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: Optional[UploadFile] = File(None),
    pasted_text: Optional[str] = Form(None),
    title: Optional[str] = Form("Legal Document"),
    session_id: Optional[str] = Form("session-guest"),
    db: Session = Depends(get_db)
):
    """
    Accepts PDF, DOCX, or pasted text. Validates size and format,
    extracts plain text, segments passages, and initializes a DocumentVersion record.
    """
    if file:
        file_bytes = await file.read()
        if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds 10MB upload limit.")
        filename = file.filename or "uploaded_document"
        raw_text, page_count, mime_type = extract_text(file_bytes, filename)
    elif pasted_text and pasted_text.strip():
        raw_text = pasted_text.strip()
        filename = "pasted_text.txt"
        page_count = max(1, (len(raw_text.split()) // 400) + 1)
        mime_type = "text/plain"
    else:
        raise HTTPException(status_code=400, detail="Must provide either an uploaded file or pasted text.")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Document contains no readable text.")

    raw_hash = compute_content_hash(raw_text)

    # Create Document record
    doc = Document(
        session_id=session_id or "session-guest",
        title=title or filename,
        document_type="agreement",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Create DocumentVersion record
    version = DocumentVersion(
        document_id=doc.id,
        version_number=1,
        original_filename=filename,
        mime_type=mime_type,
        raw_text=raw_text,
        sanitized_text=None,
        raw_content_hash=raw_hash,
        char_count=len(raw_text),
        page_count=page_count,
        status="uploaded"
    )
    db.add(version)
    db.commit()
    db.refresh(version)

    # Split into indexed passages
    passages_data = split_into_passages(raw_text)
    for p in passages_data:
        passage = DocumentPassage(
            version_id=version.id,
            passage_index=p["passage_index"],
            start_char=p["start_char"],
            end_char=p["end_char"],
            heading=p["heading"],
            text_content=p["text_content"],
        )
        db.add(passage)
    db.commit()

    return DocumentUploadResponse(
        document_id=doc.id,
        version_id=version.id,
        title=doc.title,
        original_filename=version.original_filename,
        page_count=version.page_count,
        char_count=version.char_count,
        raw_content_hash=raw_hash,
        raw_text=raw_text
    )

@router.post("/analyze", response_model=DocumentAnalysisResponse)
def analyze_document(req: AnalyzeDocumentRequest, db: Session = Depends(get_db)):
    """
    CRITICAL SECURITY GATE:
    Verifies backend affirmative consent bound to exact content hash before
    sending any document content for analysis.
    """
    # 1. Verify consent strictly
    is_authorized, reason = verify_processing_consent(
        db=db,
        version_id=req.version_id,
        content_to_process=req.sanitized_text
    )

    if not is_authorized:
        raise HTTPException(
            status_code=403, 
            detail=f"Consent authorization failure: {reason}"
        )

    # 2. Retrieve version
    version = db.query(DocumentVersion).filter(DocumentVersion.id == req.version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Document version not found.")

    # 3. Save sanitized text & hash to version
    version.sanitized_text = req.sanitized_text
    version.content_hash = req.content_hash
    version.status = "analyzed"
    db.commit()

    # 4. Generate structured analysis on sanitized text
    analysis_data = analyze_document_content(
        sanitized_text=req.sanitized_text,
        document_type=req.document_type or "agreement"
    )

    # 5. Persist DocumentAnalysis
    analysis_record = DocumentAnalysis(
        version_id=version.id,
        overview=analysis_data["overview"],
        plain_summary=analysis_data["plain_summary"],
        status="completed",
        processing_notes="Sanitized text successfully analyzed after cryptographic consent verification."
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    # 6. Persist clause explanations
    for c in analysis_data["clause_explanations"]:
        ce = ClauseExplanation(
            analysis_id=analysis_record.id,
            clause_title=c["clause_title"],
            raw_clause_text=c["raw_clause_text"],
            plain_explanation=c["plain_explanation"],
            category=c.get("category", "obligations"),
            impact_level=c.get("impact_level", "medium"),
        )
        db.add(ce)

    # 7. Persist potential concerns
    for pc in analysis_data["potential_concerns"]:
        concern = PotentialConcern(
            analysis_id=analysis_record.id,
            issue_title=pc["issue_title"],
            concern_text=pc["concern_text"],
            severity=pc.get("severity", "warning"),
            suggested_question=pc["suggested_question"],
            legal_basis=pc.get("legal_basis"),
        )
        db.add(concern)

    # 8. Persist deadlines
    for dl in analysis_data["document_deadlines"]:
        deadline = DocumentDeadline(
            analysis_id=analysis_record.id,
            deadline_title=dl["deadline_title"],
            explicit_date_or_duration=dl["explicit_date_or_duration"],
            is_inferred=dl.get("is_inferred", False),
            consequence_of_missing=dl["consequence_of_missing"],
            reminder_suggested=dl.get("reminder_suggested", True),
        )
        db.add(deadline)

    db.commit()

    return DocumentAnalysisResponse(
        analysis_id=analysis_record.id,
        version_id=version.id,
        overview=analysis_record.overview,
        plain_summary=analysis_record.plain_summary,
        clause_explanations=[ClauseExplanationItem(**c) for c in analysis_data["clause_explanations"]],
        potential_concerns=[PotentialConcernItem(**pc) for pc in analysis_data["potential_concerns"]],
        document_deadlines=[DocumentDeadlineItem(**dl) for dl in analysis_data["document_deadlines"]],
        questions_for_lawyer=analysis_data["questions_for_lawyer"],
        suggested_next_steps=analysis_data["suggested_next_steps"],
        disclaimer=analysis_data["disclaimer"]
    )
