import pytest
from backend.app.document_processing.parser import split_into_passages, extract_text
from backend.app.document_processing.differ import compute_document_diff

def test_split_into_passages():
    sample = (
        "Clause 1: Term of Agreement\nThis lease shall be valid for 11 months.\n\n"
        "Clause 2: Monthly Rent\nThe tenant shall pay Rs. 25,000 on the 5th of every month.\n\n"
        "Clause 3: Termination\nEither party may terminate giving 1 month notice."
    )
    passages = split_into_passages(sample)
    assert len(passages) == 3
    assert passages[0]["passage_index"] == 0
    assert "Term of Agreement" in passages[0]["heading"]
    assert "Monthly Rent" in passages[1]["heading"]

def test_contract_comparison_diff():
    v1 = (
        "The Monthly Rent is INR 20,000 payable on 5th.\n"
        "Security Deposit shall be INR 40,000.\n"
        "Notice period for termination shall be 30 days."
    )
    v2 = (
        "The Monthly Rent is INR 25,000 payable on 1st.\n"
        "Security Deposit shall be INR 80,000.\n"
        "Notice period for termination shall be 60 days.\n"
        "Tenant shall pay a late fee penalty of 10%."
    )
    diff = compute_document_diff(v1, v2)
    assert diff["added_lines"] >= 1
    assert diff["modified_lines"] >= 1
    assert "Wording or numerical thresholds in this category were modified" in diff["payment_changes"]
    assert "Wording or numerical thresholds in this category were modified" in diff["notice_changes"]
