from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.user_and_query import LegalAidResource
from backend.app.schemas.knowledge import LegalAidResourceItem


router = APIRouter(prefix="/resources", tags=["Legal Aid & Helplines"])

@router.get("", response_model=List[LegalAidResourceItem])
def get_resources(
    resource_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns verified official government portals, statutory helplines,
    and legal aid clinics across India.
    """
    q = db.query(LegalAidResource)
    if resource_type and resource_type != "All":
        q = q.filter(LegalAidResource.resource_type == resource_type)

    resources = q.order_by(LegalAidResource.name).all()
    return [
        LegalAidResourceItem(
            id=r.id,
            name=r.name,
            organization=r.organization,
            resource_type=r.resource_type,
            official_url=r.official_url,
            contact_phone=r.contact_phone,
            email=r.email,
            address=r.address,
            description=r.description
        )
        for r in resources
    ]
