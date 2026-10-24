from fastapi import APIRouter, HTTPException
from backend.app.schemas.comparison import CompareRequest, CompareResponse
from backend.app.document_processing.differ import compute_document_diff

router = APIRouter(prefix="/documents", tags=["Document Comparison"])

@router.post("/compare", response_model=CompareResponse)
def compare_contract_versions(req: CompareRequest):
    """
    Compares two document texts or revisions, identifying clause changes,
    additions, removals, and contractual shifts in payment, termination, notice, and liability.
    """
    if not req.source_text or not req.target_text:
        raise HTTPException(status_code=400, detail="Both source and target document texts must be provided.")

    diff_result = compute_document_diff(req.source_text, req.target_text)

    return CompareResponse(
        summary_of_changes=diff_result["summary_of_changes"],
        diff_json=diff_result["diff_json"],
        added_lines=diff_result["added_lines"],
        removed_lines=diff_result["removed_lines"],
        modified_lines=diff_result["modified_lines"],
        payment_changes=diff_result["payment_changes"],
        termination_changes=diff_result["termination_changes"],
        notice_changes=diff_result["notice_changes"],
        liability_changes=diff_result["liability_changes"],
    )
