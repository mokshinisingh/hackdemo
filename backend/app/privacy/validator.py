import re
from typing import Dict, Any, List
from backend.app.privacy.detector import detect_sensitive_information

PLACEHOLDER_REGEX = re.compile(r'\[(?:AADHAAR|PAN|IFSC|PHONE|EMAIL|PINCODE|BANK_ACCOUNT|NAME|CUSTOM|SENSITIVE)_\d+\]')

def perform_second_scan(sanitized_text: str) -> Dict[str, Any]:
    """
    Validates that the sanitized document text has no residual leaked PII
    or partial sensitive strings.
    """
    raw_findings = detect_sensitive_information(sanitized_text)

    # Filter out findings that correspond to intentionally applied placeholders
    residual_findings: List[Dict[str, Any]] = []
    for f in raw_findings:
        detected = f["detected_text"]
        if PLACEHOLDER_REGEX.fullmatch(detected):
            continue
        # Also check if wrapped in brackets
        if detected.startswith("[") and detected.endswith("]"):
            continue
        f["scan_stage"] = "second_scan"
        residual_findings.append(f)

    is_clean = len(residual_findings) == 0

    return {
        "is_clean": is_clean,
        "residual_count": len(residual_findings),
        "residual_findings": residual_findings,
        "message": "Verification passed: No residual unredacted identifiers detected." if is_clean else f"Warning: {len(residual_findings)} residual sensitive pattern(s) detected. Please review."
    }
