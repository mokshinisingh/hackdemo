from datetime import datetime
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from backend.app.models.document_and_privacy import ProcessingConsent
from backend.app.privacy.redactor import compute_content_hash

class ConsentViolationError(Exception):
    """Raised when external AI processing is attempted without valid affirmative consent."""
    pass

def verify_processing_consent(
    db: Session, 
    version_id: str, 
    content_to_process: str
) -> Tuple[bool, Optional[str]]:
    """
    Strict backend authorization rule:
    Ensures that:
    1. A consent record exists for this document version.
    2. The consent has not been revoked.
    3. The content hash recorded in the consent record EXACTLY matches 
       the SHA-256 hash of the content currently requested for processing.
    """
    if not content_to_process:
        return False, "Cannot process empty document content."

    current_hash = compute_content_hash(content_to_process)

    consent = db.query(ProcessingConsent).filter(
        ProcessingConsent.version_id == version_id,
        ProcessingConsent.is_revoked == False,
    ).order_by(ProcessingConsent.granted_at.desc()).first()

    if not consent:
        return False, "Processing blocked: Explicit user consent has not been recorded."

    if not consent.user_affirmation:
        return False, "Processing blocked: User declined processing consent."

    if consent.content_hash != current_hash:
        return False, (
            f"Processing blocked: Content hash mismatch. Document was modified after consent was granted. "
            f"Expected hash {consent.content_hash}, but received {current_hash}."
        )

    return True, None


def record_processing_consent(
    db: Session,
    version_id: str,
    content_hash: str,
    ip_or_session: str,
    user_affirmation: bool = True,
    destination_service: str = "Legaly-AI-Engine",
    purpose: str = "Document Plain-Language Simplification and Clause Analysis",
    retention_limitations: str = "Zero-knowledge ephemeral processing. Data is never used for AI training."
) -> ProcessingConsent:
    """Records an affirmative consent record bound to a specific document version and content hash."""
    consent = ProcessingConsent(
        version_id=version_id,
        content_hash=content_hash,
        destination_service=destination_service,
        purpose=purpose,
        retention_limitations=retention_limitations,
        user_affirmation=user_affirmation,
        ip_or_session=ip_or_session,
        is_revoked=False,
        granted_at=datetime.utcnow()
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent


def revoke_processing_consent(db: Session, version_id: str) -> bool:
    """Revokes active processing consent for a document version."""
    consents = db.query(ProcessingConsent).filter(
        ProcessingConsent.version_id == version_id,
        ProcessingConsent.is_revoked == False
    ).all()

    for c in consents:
        c.is_revoked = True
        c.revoked_at = datetime.utcnow()

    db.commit()
    return True
