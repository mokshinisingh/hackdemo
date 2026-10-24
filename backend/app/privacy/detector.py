import re
from typing import List, Dict, Any, Optional

# Regex definitions for Indian identifiers & PII
PATTERNS = {
    "AADHAAR": re.compile(r'\b[2-9]{1}\d{3}[-\s]?\d{4}[-\s]?\d{4}\b'),
    "PAN": re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b'),
    "IFSC": re.compile(r'\b[A-Z]{4}0[A-Z0-9]{6}\b'),
    "PHONE": re.compile(r'(?:\+91[\-\s]?)?[6-9]\d{9}\b'),
    "EMAIL": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'),
    "PINCODE": re.compile(r'\b[1-9][0-9]{2}\s?[0-9]{3}\b'),
    "BANK_ACCOUNT": re.compile(r'(?:A/C|Account(?:\s+No\.?)?|Acc\.?)\s*[:#\-]?\s*(\d{9,18})\b', re.IGNORECASE),
    "SALARY_AMOUNT": re.compile(r'(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{2})?', re.IGNORECASE),
}

# Honorifics & Party contextual patterns for Indian names
NAME_PREFIX_PATTERN = re.compile(
    r'\b(?:Shri|Smt\.?|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Adv\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b'
)
PARTY_NAME_PATTERN = re.compile(
    r'(?:BETWEEN|AND|LESSOR|LESSEE|TENANT|LANDLORD|EMPLOYER|EMPLOYEE|FIRST PARTY|SECOND PARTY)\s*[:,\-]?\s*([A-Z][A-Za-z\s]{3,35})(?=\s*,\s*(?:son|daughter|wife|resident|having|aged|hereinafter))',
    re.IGNORECASE
)

def detect_sensitive_information(text: str, custom_terms: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """
    Detects Indian PII and sensitive identifiers in the provided text.
    Returns a sorted list of findings with offsets, entity types, and suggested placeholders.
    """
    findings = []
    seen_spans = set()

    def add_finding(entity_type: str, match_text: str, start: int, end: int, confidence: float = 1.0):
        span = (start, end)
        # Avoid overlapping duplicates
        for s, e in seen_spans:
            if not (end <= s or start >= e):
                return
        seen_spans.add(span)
        findings.append({
            "entity_type": entity_type,
            "detected_text": match_text,
            "start_offset": start,
            "end_offset": end,
            "confidence_score": confidence,
            "is_redacted": True,
        })

    # 1. Detect Aadhaar
    for m in PATTERNS["AADHAAR"].finditer(text):
        val = m.group()
        # Exclude common false positives (like year sequences 2021-2022)
        if not re.match(r'^(?:19|20)\d{2}', val):
            add_finding("AADHAAR", val, m.start(), m.end(), 0.95)

    # 2. Detect PAN
    for m in PATTERNS["PAN"].finditer(text):
        add_finding("PAN", m.group(), m.start(), m.end(), 0.99)

    # 3. Detect IFSC
    for m in PATTERNS["IFSC"].finditer(text):
        add_finding("IFSC", m.group(), m.start(), m.end(), 0.95)

    # 4. Detect Phone
    for m in PATTERNS["PHONE"].finditer(text):
        add_finding("PHONE", m.group(), m.start(), m.end(), 0.90)

    # 5. Detect Email
    for m in PATTERNS["EMAIL"].finditer(text):
        add_finding("EMAIL", m.group(), m.start(), m.end(), 0.99)

    # 6. Detect Bank Account
    for m in PATTERNS["BANK_ACCOUNT"].finditer(text):
        add_finding("BANK_ACCOUNT", m.group(1), m.start(1), m.end(1), 0.88)

    # 7. Detect Names via Prefix
    for m in NAME_PREFIX_PATTERN.finditer(text):
        full_match = m.group(1)
        add_finding("NAME", full_match, m.start(1), m.end(1), 0.85)

    # 8. Detect Names via Legal Party Clauses
    for m in PARTY_NAME_PATTERN.finditer(text):
        name_val = m.group(1).strip()
        if len(name_val) > 2 and not any(kw in name_val.upper() for kw in ["THE", "COMPANY", "LTD", "PVT", "AGREEMENT"]):
            add_finding("NAME", name_val, m.start(1), m.start(1) + len(name_val), 0.80)

    # 9. Custom User Terms
    if custom_terms:
        for term in custom_terms:
            if not term or len(term.strip()) < 2:
                continue
            for m in re.finditer(re.escape(term.strip()), text, re.IGNORECASE):
                add_finding("CUSTOM", m.group(), m.start(), m.end(), 1.0)

    # Sort findings by start offset
    findings.sort(key=lambda x: x["start_offset"])

    # Assign sequential readable placeholders
    type_counters: Dict[str, int] = {}
    for item in findings:
        etype = item["entity_type"]
        type_counters[etype] = type_counters.get(etype, 0) + 1
        item["placeholder"] = f"[{etype}_{type_counters[etype]}]"

    return findings
