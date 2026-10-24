import difflib
import json
import re
from typing import Dict, Any, List

def compute_document_diff(text1: str, text2: str) -> Dict[str, Any]:
    """
    Computes a detailed, structured diff between two contract texts,
    identifying additions, deletions, modifications, and domain-specific clause shifts.
    """
    lines1 = [line.strip() for line in text1.splitlines() if line.strip()]
    lines2 = [line.strip() for line in text2.splitlines() if line.strip()]
    
    matcher = difflib.SequenceMatcher(None, lines1, lines2)
    diff_chunks: List[Dict[str, Any]] = []
    
    added_lines_count = 0
    removed_lines_count = 0
    modified_lines_count = 0
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            diff_chunks.append({
                "type": "equal",
                "content": "\n".join(lines1[i1:i2]),
            })
        elif tag == "delete":
            removed_lines_count += (i2 - i1)
            diff_chunks.append({
                "type": "removed",
                "old_content": "\n".join(lines1[i1:i2]),
            })
        elif tag == "insert":
            added_lines_count += (j2 - j1)
            diff_chunks.append({
                "type": "added",
                "new_content": "\n".join(lines2[j1:j2]),
            })
        elif tag == "replace":
            old_count = i2 - i1
            new_count = j2 - j1
            common_mod = min(old_count, new_count)
            modified_lines_count += common_mod
            if new_count > old_count:
                added_lines_count += (new_count - old_count)
            elif old_count > new_count:
                removed_lines_count += (old_count - new_count)
            diff_chunks.append({
                "type": "modified",
                "old_content": "\n".join(lines1[i1:i2]),
                "new_content": "\n".join(lines2[j1:j2]),
            })

            
    # Domain specific clause change detection
    payment_changes = analyze_category_diff("Payment / Deposit / Rent", lines1, lines2, [
        r'rent', r'salary', r'deposit', r'inr', r'rs\.?', r'payment', r'fee', r'interest'
    ])
    
    termination_changes = analyze_category_diff("Termination / Cancellation", lines1, lines2, [
        r'terminat', r'cancel', r'lock-in', r'notice period', r'breach', r'forfeit'
    ])
    
    notice_changes = analyze_category_diff("Notice Period", lines1, lines2, [
        r'notice', r'days', r'intimation', r'registered post', r'email'
    ])
    
    liability_changes = analyze_category_diff("Liability & Indemnity", lines1, lines2, [
        r'liab', r'indemn', r'damage', r'penalty', r'dispute', r'jurisdiction'
    ])
    
    summary_parts = []
    if added_lines_count > 0:
        summary_parts.append(f"{added_lines_count} new section(s) added")
    if removed_lines_count > 0:
        summary_parts.append(f"{removed_lines_count} section(s) deleted")
    if modified_lines_count > 0:
        summary_parts.append(f"{modified_lines_count} clause(s) modified")
    if not summary_parts:
        summary_parts.append("No material differences detected between document versions.")
        
    summary_of_changes = "; ".join(summary_parts) + "."
    
    return {
        "summary_of_changes": summary_of_changes,
        "diff_json": json.dumps(diff_chunks),
        "added_lines": added_lines_count,
        "removed_lines": removed_lines_count,
        "modified_lines": modified_lines_count,
        "payment_changes": payment_changes,
        "termination_changes": termination_changes,
        "notice_changes": notice_changes,
        "liability_changes": liability_changes,
    }


def analyze_category_diff(category: str, lines1: List[str], lines2: List[str], keywords: List[str]) -> str:
    """Helper to detect if lines containing specific legal keywords were altered."""
    pattern = re.compile("|".join(keywords), re.IGNORECASE)
    cat_lines1 = [l for l in lines1 if pattern.search(l)]
    cat_lines2 = [l for l in lines2 if pattern.search(l)]
    
    if not cat_lines1 and not cat_lines2:
        return "No explicit terms found in this category."
        
    if cat_lines1 == cat_lines2:
        return "Terms in this category remain unchanged across both versions."
        
    changes = []
    if len(cat_lines1) > 0 and len(cat_lines2) == 0:
        changes.append("Clauses in this category were completely removed.")
    elif len(cat_lines1) == 0 and len(cat_lines2) > 0:
        changes.append("New clauses were introduced in this category.")
    else:
        changes.append("Wording or numerical thresholds in this category were modified.")
        
    return " ".join(changes)
