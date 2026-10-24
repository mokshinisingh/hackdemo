from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from backend.app.models.jurisdiction_and_knowledge import (
    LegalSource, 
    LegalProvision, 
    KnowledgeArticle, 
    Jurisdiction
)

def search_legal_sources(
    db: Session, 
    query: str, 
    jurisdiction_code: Optional[str] = None, 
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Retrieves grounded legal sources and statutory provisions matching the user query.
    Filters by jurisdiction code if provided (e.g., IN-CENTRAL or specific state).
    """
    terms = [term.strip().lower() for term in query.split() if len(term.strip()) > 2]
    if not terms:
        terms = [query.lower()]

    # Base query for provisions
    q = db.query(LegalProvision).join(LegalSource)
    
    if jurisdiction_code:
        # Match specific jurisdiction or Central jurisdiction
        jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.code == jurisdiction_code).first()
        central = db.query(Jurisdiction).filter(Jurisdiction.code == "IN-CENTRAL").first()
        allowed_jids = []
        if jurisdiction:
            allowed_jids.append(jurisdiction.id)
        if central and central.id not in allowed_jids:
            allowed_jids.append(central.id)
            
        if allowed_jids:
            q = q.filter(or_(LegalSource.jurisdiction_id.in_(allowed_jids), LegalSource.jurisdiction_id == None))

    # Construct search filter across provision title, content, summary, and source title
    conditions = []
    for term in terms[:4]:
        pattern = f"%{term}%"
        conditions.append(or_(
            LegalProvision.title.ilike(pattern),
            LegalProvision.content.ilike(pattern),
            LegalProvision.plain_summary.ilike(pattern),
            LegalProvision.tags.ilike(pattern),
            LegalSource.title.ilike(pattern),
            LegalSource.short_title.ilike(pattern),
        ))
        
    if conditions:
        q = q.filter(or_(*conditions))

    provisions = q.limit(limit).all()
    results = []
    
    for p in provisions:
        src = p.legal_source
        results.append({
            "source_id": src.id,
            "provision_id": p.id,
            "act_title": src.title,
            "short_title": src.short_title,
            "citation": src.citation,
            "section_number": p.section_number,
            "section_title": p.title,
            "official_url": src.official_url,
            "issuing_organization": src.issuing_organization,
            "plain_summary": p.plain_summary,
            "content_snippet": p.content[:280] + ("..." if len(p.content) > 280 else ""),
            "is_verified": src.is_verified,
        })
        
    return results


def search_knowledge_articles(
    db: Session,
    query: str,
    category: Optional[str] = None,
    limit: int = 6
) -> List[KnowledgeArticle]:
    """
    Searches curated knowledge guides by category or keywords.
    """
    q = db.query(KnowledgeArticle).filter(KnowledgeArticle.is_published == True)
    
    if category and category != "All":
        q = q.filter(KnowledgeArticle.category == category)
        
    if query:
        pattern = f"%{query.strip()}%"
        q = q.filter(or_(
            KnowledgeArticle.title.ilike(pattern),
            KnowledgeArticle.plain_language_intro.ilike(pattern),
            KnowledgeArticle.category.ilike(pattern)
        ))
        
    return q.limit(limit).all()
