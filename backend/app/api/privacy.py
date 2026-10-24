import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.privacy import (
    DetectRequest,
    DetectResponse,
    SensitiveFindingItem,
    RedactRequest,
    RedactResponse,
    SecondScanRequest,
    SecondScanResponse,
    ConsentRequest,
    ConsentResponse,
)
from backend.app.privacy.detector import detect_sensitive_information
from backend.app.privacy.redactor import apply_redactions, compute_content_hash
from backend.app.privacy.validator import perform_second_scan
from backend.app.privacy.consent import record_processing_consent, revoke_processing_consent
from backend.app.models.document_and_privacy import PrivacyReview, SensitiveFinding, RedactionAction

router = APIRouter(prefix="/privacy", tags=["Privacy & Redaction"])

@router.post("/detect", response_model=DetectResponse)
def detect_privacy_issues(req: DetectRequest):
    """
    Detects Indian PII and sensitive identifiers in raw document text.
    Returns detected findings with byte/char offsets and default placeholders.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    raw_hash = compute_content_hash(req.text)
    findings = detect_sensitive_information(req.text, custom_terms=req.custom_terms)

    finding_items = [
        SensitiveFindingItem(
            id=str(uuid.uuid4()),
            entity_type=f["entity_type"],
            detected_text=f["detected_text"],
            start_offset=f["start_offset"],
            end_offset=f["end_offset"],
            confidence_score=f["confidence_score"],
            is_redacted=f["is_redacted"],
            placeholder=f["placeholder"],
            scan_stage="initial"
        )
        for f in findings
    ]

    return DetectResponse(
        findings_count=len(finding_items),
        findings=finding_items,
        raw_content_hash=raw_hash
    )

@router.post("/redact", response_model=RedactResponse)
def apply_redaction(req: RedactRequest):
    """
    Applies redaction replacements to document text.
    Produces sanitized text and computes cryptographic SHA-256 content hash.
    """
    findings_dicts = [f.dict() for f in req.findings]
    sanitized, content_hash = apply_redactions(
        req.text, 
        findings=findings_dicts, 
        custom_replacements=req.custom_replacements
    )

    applied_count = len([f for f in req.findings if f.is_redacted])

    return RedactResponse(
        sanitized_text=sanitized,
        content_hash=content_hash,
        redactions_applied=applied_count
    )

@router.post("/second-scan", response_model=SecondScanResponse)
def run_second_scan(req: SecondScanRequest):
    """
    Runs an exhaustive verification scan on the sanitized text
    to ensure no residual sensitive identifiers or unredacted patterns leak.
    """
    result = perform_second_scan(req.sanitized_text)
    residual_items = [
        SensitiveFindingItem(
            id=str(uuid.uuid4()),
            entity_type=f["entity_type"],
            detected_text=f["detected_text"],
            start_offset=f["start_offset"],
            end_offset=f["end_offset"],
            confidence_score=f["confidence_score"],
            is_redacted=True,
            placeholder=f.get("placeholder", "[RESIDUAL_PII]"),
            scan_stage="second_scan"
        )
        for f in result.get("residual_findings", [])
    ]

    return SecondScanResponse(
        is_clean=result["is_clean"],
        residual_count=result["residual_count"],
        residual_findings=residual_items,
        message=result["message"]
    )

@router.post("/consent", response_model=ConsentResponse)
def grant_consent(req: ConsentRequest, db: Session = Depends(get_db)):
    """
    Records affirmative user consent cryptographically bound to the exact content hash.
    Any modification to the document will invalidate this consent.
    """
    if not req.user_affirmation:
        raise HTTPException(status_code=400, detail="Consent must be affirmatively granted.")

    consent_record = record_processing_consent(
        db=db,
        version_id=req.version_id,
        content_hash=req.content_hash,
        ip_or_session=req.session_id or "guest-session",
        user_affirmation=req.user_affirmation,
        destination_service=req.destination_service or "Legaly-AI-Engine",
        purpose=req.purpose or "Document Plain-Language Simplification and Clause Analysis"
    )

    return ConsentResponse(
        consent_id=consent_record.id,
        version_id=consent_record.version_id,
        content_hash=consent_record.content_hash,
        is_valid=not consent_record.is_revoked,
        granted_at=consent_record.granted_at.isoformat(),
        message="Affirmative processing consent recorded and bound to content hash."
    )

@router.post("/revoke-consent")
def revoke_consent(version_id: str, db: Session = Depends(get_db)):
    """Revokes active processing consent for a document version."""
    revoke_processing_consent(db, version_id=version_id)
    return {"message": "Processing consent has been revoked.", "version_id": version_id}
