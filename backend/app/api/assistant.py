import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user_and_query import (
    LegalQuery, 
    AiResponse, 
    NextStep, 
    ResponseSource, 
    ResourceReferral
)
from backend.app.models.jurisdiction_and_knowledge import Jurisdiction
from backend.app.schemas.assistant import QueryRequest, QueryResponse
from backend.app.ai.orchestrator import generate_legal_assistant_response

router = APIRouter(prefix="/legal-assistant", tags=["Legal Assistant"])

@router.post("", response_model=QueryResponse)
def ask_legal_assistant(req: QueryRequest, db: Session = Depends(get_db)):
    """
    Submits a user legal query and generates an authoritative,
    grounded 6-part legal awareness response.
    """
    if not req.query_text or len(req.query_text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Query text is too short.")

    session_id = req.session_id or f"session-{uuid.uuid4().hex[:8]}"

    # Look up jurisdiction
    jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.code == req.jurisdiction_code).first()
    jurisdiction_id = jurisdiction.id if jurisdiction else None

    # Persist query
    query_record = LegalQuery(
        session_id=session_id,
        query_text=req.query_text.strip(),
        category=req.category or "general",
        jurisdiction_id=jurisdiction_id,
    )
    db.add(query_record)
    db.commit()
    db.refresh(query_record)

    # Generate response
    ai_result = generate_legal_assistant_response(
        db=db,
        query_text=req.query_text,
        jurisdiction_code=req.jurisdiction_code,
        category=req.category
    )

    # Persist response
    response_record = AiResponse(
        query_id=query_record.id,
        simple_explanation=ai_result["simple_explanation"],
        legal_information=ai_result["legal_information"],
        conditions_and_exceptions=ai_result["conditions_and_exceptions"],
        professional_help_advice=ai_result["professional_help_advice"],
        confidence_level=ai_result["confidence_level"],
        ai_model=ai_result["ai_model"],
        disclaimer=ai_result["disclaimer"]
    )
    db.add(response_record)
    db.commit()
    db.refresh(response_record)

    # Persist next steps
    for idx, step in enumerate(ai_result.get("next_steps", [])):
        ns = NextStep(
            response_id=response_record.id,
            step_order=idx + 1,
            title=step["title"],
            description=step["description"],
            rationale=step.get("rationale"),
            required_information=step.get("required_information"),
            is_completed=False,
            is_verified_requirement=step.get("is_verified_requirement", True)
        )
        db.add(ns)

    # Persist sources
    for src in ai_result.get("sources", []):
        if "source_id" in src:
            rs = ResponseSource(
                response_id=response_record.id,
                legal_source_id=src["source_id"],
                citation_text=f"{src['act_title']} - {src['section_number']}",
                relevance_explanation=src.get("plain_summary")
            )
            db.add(rs)

    # Persist referrals
    for res in ai_result.get("resources", []):
        if "id" in res:
            rr = ResourceReferral(
                response_id=response_record.id,
                resource_id=res["id"],
                referral_reason=res.get("referral_reason", "Statutory assistance organization.")
            )
            db.add(rr)

    db.commit()

    return QueryResponse(
        query_id=query_record.id,
        simple_explanation=response_record.simple_explanation,
        legal_information=response_record.legal_information,
        conditions_and_exceptions=response_record.conditions_and_exceptions,
        professional_help_advice=response_record.professional_help_advice,
        confidence_level=response_record.confidence_level,
        ai_model=response_record.ai_model,
        disclaimer=response_record.disclaimer,
        next_steps=ai_result["next_steps"],
        sources=ai_result["sources"],
        resources=ai_result["resources"]
    )
