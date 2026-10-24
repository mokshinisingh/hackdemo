from pydantic import BaseModel, Field
from typing import List, Optional

class CompareRequest(BaseModel):
    source_text: str = Field(..., description="Original document text")
    target_text: str = Field(..., description="Modified or new document text")
    source_title: Optional[str] = "Version 1"
    target_title: Optional[str] = "Version 2"

class CompareResponse(BaseModel):
    summary_of_changes: str
    diff_json: str
    added_lines: int
    removed_lines: int
    modified_lines: int
    payment_changes: str
    termination_changes: str
    notice_changes: str
    liability_changes: str
