import pytest
from backend.app.privacy.detector import detect_sensitive_information
from backend.app.privacy.redactor import apply_redactions, compute_content_hash
from backend.app.privacy.validator import perform_second_scan

def test_detect_indian_identifiers():
    sample_text = (
        "This agreement is between Shri Rajesh Kumar (Tenant), Aadhaar No: 3847 2910 4829, "
        "PAN: ABCDE1234F, having mobile +91 9876543210 and email rajesh.kumar@example.com. "
        "Bank Account No: 123456789012 with IFSC: SBIN0001234."
    )
    findings = detect_sensitive_information(sample_text)
    types_found = {f["entity_type"] for f in findings}

    assert "AADHAAR" in types_found
    assert "PAN" in types_found
    assert "PHONE" in types_found
    assert "EMAIL" in types_found
    assert "IFSC" in types_found
    assert "NAME" in types_found

def test_apply_redactions_removes_underlying_data():
    raw_text = "Tenant Aadhaar is 5544 3322 1100 and contact is 9876543210."
    findings = detect_sensitive_information(raw_text)
    sanitized, content_hash = apply_redactions(raw_text, findings)

    # Underlying sensitive data MUST NOT exist in sanitized output
    assert "5544 3322 1100" not in sanitized
    assert "9876543210" not in sanitized
    assert "[AADHAAR_1]" in sanitized or "[AADHAAR" in sanitized
    assert "[PHONE_1]" in sanitized or "[PHONE" in sanitized
    assert len(content_hash) == 64

def test_second_scan_clean_verification():
    raw_text = "Landlord PAN is ABCDE9876K and email is landlord@example.in."
    findings = detect_sensitive_information(raw_text)
    sanitized, _ = apply_redactions(raw_text, findings)

    # Second scan on clean sanitized text
    res = perform_second_scan(sanitized)
    assert res["is_clean"] is True
    assert res["residual_count"] == 0

def test_second_scan_detects_unredacted_residual():
    # Only partially redact text, leaving an Aadhaar unredacted
    leaked_text = "Here is an approved summary [NAME_1], but leaked Aadhaar is 9988 7766 5544."
    res = perform_second_scan(leaked_text)
    assert res["is_clean"] is False
    assert res["residual_count"] >= 1
    assert any(f["entity_type"] == "AADHAAR" for f in res["residual_findings"])
