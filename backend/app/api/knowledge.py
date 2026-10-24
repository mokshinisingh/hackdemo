import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.jurisdiction_and_knowledge import KnowledgeArticle
from backend.app.schemas.knowledge import KnowledgeArticleItem
from backend.app.legal_retrieval.search import search_knowledge_articles

router = APIRouter(prefix="/legal-guides", tags=["Legal Knowledge Centre"])

def parse_article(art: KnowledgeArticle) -> KnowledgeArticleItem:
    try:
        kp = json.loads(art.key_points) if isinstance(art.key_points, str) and art.key_points.startswith("[") else [art.key_points]
    except Exception:
        kp = [art.key_points]

    try:
        faqs = json.loads(art.faqs) if isinstance(art.faqs, str) and art.faqs.startswith("[") else []
    except Exception:
        faqs = []

    try:
        chk = json.loads(art.practical_checklist) if isinstance(art.practical_checklist, str) and art.practical_checklist.startswith("[") else [art.practical_checklist]
    except Exception:
        chk = [art.practical_checklist]

    return KnowledgeArticleItem(
        id=art.id,
        slug=art.slug,
        title=art.title,
        category=art.category,
        plain_language_intro=art.plain_language_intro,
        key_points=kp,
        everyday_examples=art.everyday_examples,
        faqs=faqs,
        practical_checklist=chk,
        disclaimer=art.disclaimer,
        verified_at=art.verified_at.strftime("%Y-%m-%d") if art.verified_at else None,
        is_published=art.is_published
    )

@router.get("", response_model=List[KnowledgeArticleItem])
def get_articles(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieves curated plain-language legal awareness guides."""
    articles = search_knowledge_articles(db, query=q or "", category=category, limit=20)
    return [parse_article(a) for a in articles]

@router.get("/{slug}", response_model=KnowledgeArticleItem)
def get_article_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieves an individual legal guide by its unique slug."""
    art = db.query(KnowledgeArticle).filter(KnowledgeArticle.slug == slug).first()
    if not art:
        raise HTTPException(status_code=404, detail="Legal guide not found.")
    return parse_article(art)
