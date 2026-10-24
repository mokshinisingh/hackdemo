from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.jurisdiction_and_knowledge import Jurisdiction
from backend.app.schemas.knowledge import JurisdictionItem

router = APIRouter(prefix="/jurisdictions", tags=["Jurisdictions"])

@router.get("", response_model=List[JurisdictionItem])
def list_jurisdictions(db: Session = Depends(get_db)):
    """Returns active Indian central and state jurisdictions."""
    records = db.query(Jurisdiction).filter(Jurisdiction.is_active == True).order_by(Jurisdiction.name).all()
    return [
        JurisdictionItem(
            id=j.id,
            code=j.code,
            name=j.name,
            country=j.country,
            state_or_region=j.state_or_region,
            is_active=j.is_active
        )
        for j in records
    ]
