import hashlib
from typing import List, Dict, Any, Optional, Tuple

def compute_content_hash(text: str) -> str:
    """Computes standard SHA-256 hash of text content."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def apply_redactions(
    text: str, 
    findings: List[Dict[str, Any]], 
    custom_replacements: Optional[Dict[str, str]] = None
) -> Tuple[str, str]:
    """
    Applies redaction replacements to the text.
    Sorts findings in reverse order so that string offsets remain accurate.
    
    Returns:
        (sanitized_text, content_hash)
    """
    if not text:
        return "", compute_content_hash("")

    custom_map = custom_replacements or {}
    
    # Filter to only active redactions
    active_findings = [f for f in findings if f.get("is_redacted", True)]
    
    # Sort descending by start_offset
    sorted_findings = sorted(active_findings, key=lambda x: x["start_offset"], reverse=True)

    sanitized = text
    for f in sorted_findings:
        start = f["start_offset"]
        end = f["end_offset"]
        entity_type = f.get("entity_type", "SENSITIVE")
        
        # Check custom replacement override, otherwise use assigned placeholder
        finding_id = str(f.get("id", ""))
        placeholder = custom_map.get(finding_id) or f.get("placeholder", f"[{entity_type}]")
        
        # Perform replacement safely in text slice
        sanitized = sanitized[:start] + placeholder + sanitized[end:]

    content_hash = compute_content_hash(sanitized)
    return sanitized, content_hash
