from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/checklists", tags=["Action Checklists"])

CHECKLISTS_DATA = [
    {
        "id": "tenant-rental",
        "title": "Tenant Move-In & Rental Agreement Checklist",
        "category": "Housing & Tenancy",
        "description": "Essential safeguards before signing a rent agreement and paying a security deposit in India.",
        "items": [
            {
                "id": "tr-1",
                "title": "Verify Ownership / Title Documents",
                "description": "Ask to see the property tax receipt, electricity bill, or sale deed matching the Landlord's name.",
                "importance": "High",
                "law_reference": "Model Tenancy Act, 2021"
            },
            {
                "id": "tr-2",
                "title": "Inspect & Document Existing Premises Conditions",
                "description": "Take dated photos/videos of all fixtures, switches, plumbing, and wall conditions prior to moving in.",
                "importance": "High",
                "law_reference": "Indian Contract Act, 1872 (Section 73)"
            },
            {
                "id": "tr-3",
                "title": "Cap Security Deposit Terms in Writing",
                "description": "Ensure deposit is capped at a maximum of 2 months' rent for residential premises and specify a 15-day refund window.",
                "importance": "High",
                "law_reference": "Model Tenancy Act (Section 11)"
            },
            {
                "id": "tr-4",
                "title": "Confirm Notice Period & Lock-in Clause",
                "description": "Verify whether 1-month notice is acceptable and that no unfair forfeiture applies after the lock-in period.",
                "importance": "Medium",
                "law_reference": "Specific Relief Act, 1963"
            },
            {
                "id": "tr-5",
                "title": "Pay via Verifiable Banking Channel",
                "description": "Always pay deposit and rent via NEFT/UPI/Cheque to ensure an immutable bank transaction record. Never pay cash without a signed receipt.",
                "importance": "High",
                "law_reference": "Income Tax Act & RBI Guidelines"
            }
        ]
    },
    {
        "id": "workplace-resignation",
        "title": "Workplace Resignation & Settlement Checklist",
        "category": "Employment & Workplace",
        "description": "Step-by-step checklist to ensure prompt release of unpaid salary, experience letter, and PF transfer.",
        "items": [
            {
                "id": "wr-1",
                "title": "Submit Written Resignation via Registered Company Email",
                "description": "Clearly state the proposed last working day (LWD) in strict alignment with your offer letter's notice period.",
                "importance": "High",
                "law_reference": "Industrial Disputes Act, 1947"
            },
            {
                "id": "wr-2",
                "title": "Download Personal Payslips & Form 16",
                "description": "Save copies of your past 6 months' salary slips, Form 16, and appraisal letters to personal storage before IT access is revoked.",
                "importance": "High",
                "law_reference": "Income Tax Rules"
            },
            {
                "id": "wr-3",
                "title": "Complete Written Asset Handover",
                "description": "Obtain signed physical or email acknowledgement from IT/Admin confirming return of laptop, ID card, and company property.",
                "importance": "High",
                "law_reference": "Payment of Wages Act, 1936"
            },
            {
                "id": "wr-4",
                "title": "Demand Full & Final (F&F) Settlement within Statutory Window",
                "description": "Under the Code on Wages, final dues must be settled within two working days of departure. Reconcile leave encashment and gratuity.",
                "importance": "High",
                "law_reference": "Code on Wages, 2019 / Gratuity Act, 1972"
            },
            {
                "id": "wr-5",
                "title": "Review Non-Compete Scope",
                "description": "Note that post-employment covenants prohibiting you from working with competitors are void under Section 27 of the Indian Contract Act.",
                "importance": "Medium",
                "law_reference": "Indian Contract Act, 1872 (Section 27)"
            }
        ]
    },
    {
        "id": "consumer-grievance",
        "title": "Consumer Complaint & Notice Checklist",
        "category": "Consumer Protection",
        "description": "Actions to escalate defective goods, deficient services, or refused refunds under Indian consumer law.",
        "items": [
            {
                "id": "cg-1",
                "title": "Collect Tax Invoice & Warranty Card",
                "description": "Ensure you have the official GST invoice indicating seller GSTIN, transaction date, and product serial number.",
                "importance": "High",
                "law_reference": "Consumer Protection Act, 2019"
            },
            {
                "id": "cg-2",
                "title": "Lodge Written Ticket with Grievance Officer",
                "description": "Contact customer support and note down the formal complaint reference / ticket ID.",
                "importance": "Medium",
                "law_reference": "E-Commerce Rules, 2020"
            },
            {
                "id": "cg-3",
                "title": "Register with National Consumer Helpline (NCH 1915)",
                "description": "Call 1915 or lodge grievance on consumerhelpline.gov.in. NCH provides fast government mediation.",
                "importance": "High",
                "law_reference": "Ministry of Consumer Affairs"
            },
            {
                "id": "cg-4",
                "title": "Issue 15-Day Formal Legal Notice",
                "description": "Send a formal notice via registered speed post or email demanding refund or replacement within 15 calendar days.",
                "importance": "High",
                "law_reference": "Consumer Protection Act (Section 35)"
            },
            {
                "id": "cg-5",
                "title": "File Online e-Daakhil Petition",
                "description": "If unresolved, file an electronic petition on edaakhil.nic.in with District Consumer Commission.",
                "importance": "High",
                "law_reference": "e-Daakhil Portal Procedures"
            }
        ]
    }
]

@router.get("", response_model=List[Dict[str, Any]])
def get_all_checklists():
    """Returns curated practical action checklists for legal workflows."""
    return CHECKLISTS_DATA
