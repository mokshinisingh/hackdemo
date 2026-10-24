import pytest
import uuid
from backend.app.database import SessionLocal, Base, engine
from backend.app.models.document_and_privacy import Document, DocumentVersion, ProcessingConsent
from backend.app.privacy.redactor import compute_content_hash
from backend.app.privacy.consent import (
    verify_processing_consent,
    record_processing_consent,
    revoke_processing_consent,
)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_consent_blocked_when_no_consent_record(db_session):
    dummy_version_id = str(uuid.uuid4())
    content = "This is a sanitized contract text."
    
    is_ok, reason = verify_processing_consent(db_session, dummy_version_id, content)
    assert is_ok is False
    assert "Explicit user consent has not been recorded" in reason

def test_consent_blocked_on_content_hash_mismatch(db_session):
    # Setup document version
    doc = Document(session_id="test-session", title="Test Doc")
    db_session.add(doc)
    db_session.flush()

    orig_content = "Approved sanitized contract text."
    orig_hash = compute_content_hash(orig_content)

    version = DocumentVersion(
        document_id=doc.id,
        version_number=1,
        original_filename="test.txt",
        raw_text=orig_content,
        sanitized_text=orig_content,
        content_hash=orig_hash
    )
    db_session.add(version)
    db_session.commit()

    # Grant consent for orig_content
    record_processing_consent(
        db=db_session,
        version_id=version.id,
        content_hash=orig_hash,
        ip_or_session="test-session",
        user_affirmation=True
    )

    # 1. Verification on exact content must SUCCEED
    is_ok, err = verify_processing_consent(db_session, version.id, orig_content)
    assert is_ok is True
    assert err is None

    # 2. Tampered / modified content must FAIL strictly
    tampered_content = orig_content + " Extra unauthorized clause added."
    is_ok2, err2 = verify_processing_consent(db_session, version.id, tampered_content)
    assert is_ok2 is False
    assert "Content hash mismatch" in err2

def test_consent_blocked_after_revocation(db_session):
    doc = Document(session_id="test-session-2", title="Revocation Test")
    db_session.add(doc)
    db_session.flush()

    content = "Text for revocation test."
    content_hash = compute_content_hash(content)

    version = DocumentVersion(
        document_id=doc.id,
        version_number=1,
        original_filename="rev.txt",
        raw_text=content,
        sanitized_text=content,
        content_hash=content_hash
    )
    db_session.add(version)
    db_session.commit()

    record_processing_consent(
        db=db_session,
        version_id=version.id,
        content_hash=content_hash,
        ip_or_session="test-session-2",
        user_affirmation=True
    )

    # Verify active
    is_ok, _ = verify_processing_consent(db_session, version.id, content)
    assert is_ok is True

    # Revoke
    revoke_processing_consent(db_session, version.id)

    # Must now be blocked
    is_ok_after, err_after = verify_processing_consent(db_session, version.id, content)
    assert is_ok_after is False
