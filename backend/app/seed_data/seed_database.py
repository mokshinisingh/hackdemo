import json
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, Base, engine
from backend.app.models.jurisdiction_and_knowledge import (
    Jurisdiction,
    LegalSource,
    SourceVersion,
    LegalProvision,
    KnowledgeArticle,
    ArticleSource,
)
from backend.app.models.user_and_query import LegalAidResource

def seed_database(db: Session):
    """Populates the relational database with curated, verified Indian legal materials."""
    
    # 1. Jurisdictions
    if db.query(Jurisdiction).count() == 0:
        jurisdictions_data = [
            {"code": "IN-CENTRAL", "name": "India (Central)", "country": "India", "state_or_region": None},
            {"code": "IN-KA", "name": "Karnataka", "country": "India", "state_or_region": "Karnataka"},
            {"code": "IN-MH", "name": "Maharashtra", "country": "India", "state_or_region": "Maharashtra"},
            {"code": "IN-DL", "name": "Delhi (NCT)", "country": "India", "state_or_region": "Delhi"},
            {"code": "IN-TN", "name": "Tamil Nadu", "country": "India", "state_or_region": "Tamil Nadu"},
            {"code": "IN-TS", "name": "Telangana", "country": "India", "state_or_region": "Telangana"},
            {"code": "IN-UP", "name": "Uttar Pradesh", "country": "India", "state_or_region": "Uttar Pradesh"},
            {"code": "IN-WB", "name": "West Bengal", "country": "India", "state_or_region": "West Bengal"},
            {"code": "IN-GJ", "name": "Gujarat", "country": "India", "state_or_region": "Gujarat"},
        ]
        jurisdiction_map = {}
        for j in jurisdictions_data:
            rec = Jurisdiction(**j)
            db.add(rec)
            db.flush()
            jurisdiction_map[j["code"]] = rec.id
        db.commit()
    else:
        jurisdiction_map = {j.code: j.id for j in db.query(Jurisdiction).all()}

    central_id = jurisdiction_map.get("IN-CENTRAL")

    # 2. Legal Sources & Provisions
    if db.query(LegalSource).count() == 0:
        # CPA 2019
        cpa = LegalSource(
            title="The Consumer Protection Act, 2019",
            short_title="Consumer Protection Act, 2019",
            citation="Act No. 35 of 2019",
            issuing_organization="Parliament of India",
            official_url="https://consumeraffairs.nic.in/acts-and-rules/consumer-protection",
            jurisdiction_id=central_id,
            enacted_date=datetime(2019, 8, 9),
            last_amended_date=datetime(2021, 12, 30),
            is_verified=True,
        )
        db.add(cpa)
        db.flush()

        db.add(LegalProvision(
            legal_source_id=cpa.id,
            section_number="Section 2(7)",
            title="Definition of Consumer",
            content="A consumer is any person who buys goods or hires services for consideration, but does not include a person who obtains goods for resale or commercial purpose.",
            plain_summary="Protects individuals who purchase goods or services for personal use, whether through physical shops or online e-commerce platforms.",
            tags="consumer, definition, eligibility, ecommerce"
        ))
        db.add(LegalProvision(
            legal_source_id=cpa.id,
            section_number="Section 35",
            title="Manner in which complaint shall be made",
            content="A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by the consumer.",
            plain_summary="Allows any aggrieved consumer to file a formal complaint online via e-Daakhil or physically before the District Commission with nominal fees.",
            tags="consumer, complaint, district commission, filing, edaakhil"
        ))
        db.add(LegalProvision(
            legal_source_id=cpa.id,
            section_number="Section 2(47)",
            title="Unfair Trade Practice",
            content="Unfair trade practice means a trade practice which, for the purpose of promoting the sale, use or supply of any goods or service, adopts any unfair method or deceptive practice.",
            plain_summary="Prohibits false advertising, refusing lawful returns, charging above MRP, or concealing major defects.",
            tags="unfair trade practice, misleading ads, refunds, defect"
        ))

        # Model Tenancy Act
        mta = LegalSource(
            title="The Model Tenancy Act, 2021",
            short_title="Model Tenancy Act, 2021",
            citation="Ministry of Housing and Urban Affairs Guidelines, 2021",
            issuing_organization="Ministry of Housing and Urban Affairs, Government of India",
            official_url="https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf",
            jurisdiction_id=central_id,
            enacted_date=datetime(2021, 6, 2),
            is_verified=True,
        )
        db.add(mta)
        db.flush()

        db.add(LegalProvision(
            legal_source_id=mta.id,
            section_number="Section 11",
            title="Security Deposit",
            content="The security deposit to be paid by the tenant in advance shall not exceed two months' rent in case of residential premises, and a minimum of one month and maximum of six months' rent in case of non-residential premises.",
            plain_summary="Statutorily limits residential rental security deposits to a maximum of two months' rent, payable back within one month of vacating.",
            tags="rent, security deposit, refund, landlord, tenant"
        ))
        db.add(LegalProvision(
            legal_source_id=mta.id,
            section_number="Section 15",
            title="Entry into premises",
            content="The landlord or property manager shall not enter the premises without giving written notice or notice through electronic mode to the tenant at least twenty-four hours in advance.",
            plain_summary="Guarantees tenant privacy. Landlords are forbidden from unannounced entry and must provide at least 24 hours prior written or digital notice.",
            tags="tenant rights, privacy, landlord inspection, notice"
        ))
        db.add(LegalProvision(
            legal_source_id=mta.id,
            section_number="Section 20",
            title="Withholding of Essential Services",
            content="No landlord or property manager shall withhold any essential supply or service in the premises occupied by the tenant.",
            plain_summary="Strictly prohibits landlords from cutting off water, electricity, or elevator access, even during rent disputes.",
            tags="essential supplies, electricity, water, dispute, eviction"
        ))

        # Indian Contract Act 1872
        ica = LegalSource(
            title="The Indian Contract Act, 1872",
            short_title="Indian Contract Act, 1872",
            citation="Act No. 9 of 1872",
            issuing_organization="Parliament of India",
            official_url="https://www.indiacode.nic.in/handle/123456789/2187",
            jurisdiction_id=central_id,
            enacted_date=datetime(1872, 4, 25),
            is_verified=True,
        )
        db.add(ica)
        db.flush()

        db.add(LegalProvision(
            legal_source_id=ica.id,
            section_number="Section 27",
            title="Agreement in restraint of trade, void",
            content="Every agreement by which anyone is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.",
            plain_summary="Invalidates post-employment non-compete clauses in employment contracts. Employers cannot legally bar former employees from working for competitors.",
            tags="non-compete, employment, restraint of trade, void clause"
        ))
        db.add(LegalProvision(
            legal_source_id=ica.id,
            section_number="Section 74",
            title="Compensation for breach of contract where penalty stipulated for",
            content="When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, the party complaining of the breach is entitled to receive reasonable compensation not exceeding the amount so named.",
            plain_summary="Excessive or punitive forfeiture penalties in agreements cannot be enforced beyond reasonable compensation for actual proven damage.",
            tags="penalty, forfeiture, damages, deposit, breach"
        ))

        # DPDP Act 2023
        dpdp = LegalSource(
            title="The Digital Personal Data Protection Act, 2023",
            short_title="DPDP Act, 2023",
            citation="Act No. 22 of 2023",
            issuing_organization="Parliament of India",
            official_url="https://www.meity.gov.in/content/digital-personal-data-protection-act-2023",
            jurisdiction_id=central_id,
            enacted_date=datetime(2023, 8, 11),
            is_verified=True,
        )
        db.add(dpdp)
        db.flush()

        db.add(LegalProvision(
            legal_source_id=dpdp.id,
            section_number="Section 6",
            title="Consent requirements for Data Processing",
            content="The consent given by the Data Principal shall be free, specific, informed, unconditional and unambiguous with a clear affirmative action, and shall signify an agreement to the processing of personal data for the specified purpose.",
            plain_summary="Entities cannot process personal data without specific, affirmative, and unambiguous consent tied strictly to the declared purpose.",
            tags="privacy, consent, dpdp, personal data, affirmative action"
        ))

        db.commit()

    # 3. Knowledge Articles
    if db.query(KnowledgeArticle).count() == 0:
        articles_data = [
            {
                "slug": "understanding-rental-agreements-in-india",
                "title": "Understanding Your Rental Agreement & Tenant Rights in India",
                "category": "Tenant Rights",
                "jurisdiction_id": central_id,
                "plain_language_intro": "Rent agreements are binding legal contracts between tenants and landlords. Understanding key clauses around security deposits, notice periods, and maintenance safeguards your peace of mind.",
                "key_points": json.dumps([
                    "Security deposits are capped at a maximum of 2 months' rent for residential homes under the Model Tenancy Act.",
                    "A landlord must provide at least 24 hours prior written notice before entering the property.",
                    "Essential utilities like water and electricity cannot be disconnected, even in rent disputes.",
                    "Agreements for 11 months or more require mandatory stamp duty and registration in most states."
                ]),
                "everyday_examples": "Example: If your landlord cuts off your electricity because you delayed rent payment by 3 days, this action is illegal under Section 20 of the Model Tenancy Act. You can immediately approach the local Rent Authority.",
                "faqs": json.dumps([
                    {
                        "question": "Can my landlord deduct painting charges automatically?",
                        "answer": "Normal wear and tear cannot be deducted from your deposit unless explicitly agreed upon in writing with proven contractor receipts."
                    },
                    {
                        "question": "What happens if I need to vacate during the lock-in period?",
                        "answer": "Review the lock-in clause. While you may be liable for rent up to the end of the lock-in, courts often enforce compromise if a replacement tenant is found."
                    }
                ]),
                "practical_checklist": json.dumps([
                    "Verify landlord ownership using latest property tax or utility bill.",
                    "Insist on paying security deposit via bank transfer / UPI, not untraceable cash.",
                    "Record high-resolution photos of existing wall and appliance conditions before moving in.",
                    "Ensure exact notice period (typically 30 days) and deposit refund timeline (within 15-30 days) are written."
                ]),
                "disclaimer": "This guide provides educational awareness and does not replace qualified legal advice.",
                "verified_at": datetime(2024, 1, 15),
                "is_published": True
            },
            {
                "slug": "unpaid-salary-and-workplace-rights",
                "title": "Unpaid Salary, Notice Periods & Employment Rights in India",
                "category": "Workplace Rights",
                "jurisdiction_id": central_id,
                "plain_language_intro": "Every employee in India is legally entitled to timely salary payment and fair full-and-final settlement. Learn how Indian labour codes protect you against unfair wage deductions and unlawful non-competes.",
                "key_points": json.dumps([
                    "Wages must be credited on or before the 7th or 10th of each wage month.",
                    "Post-employment non-compete clauses are declared void under Section 27 of the Indian Contract Act.",
                    "Gratuity is payable if you complete 5 years of continuous service (or 1 year for fixed-term contracts).",
                    "Full and final settlement (F&F) should be cleared within two working days under the Code on Wages."
                ]),
                "everyday_examples": "Example: Your employer refuses to release your last month's salary because you joined a direct competitor. Under Indian law (Section 27 Contract Act), their non-compete is void and withholding earned salary is an unlawful deduction.",
                "faqs": json.dumps([
                    {
                        "question": "Can an employer withhold my experience certificate?",
                        "answer": "No. Withholding an experience or relieving letter after proper service of notice is an unfair practice that can be challenged before the Labour Commissioner."
                    },
                    {
                        "question": "Where can I report unpaid salary without paying legal fees?",
                        "answer": "You can lodge an online complaint on the Ministry of Labour's Samadhan Portal (samadhan.labour.gov.in)."
                    }
                ]),
                "practical_checklist": json.dumps([
                    "Keep personal offline copies of your Appointment Letter, payslips, and resignation acceptance email.",
                    "Request an itemized written Full & Final settlement statement from HR.",
                    "Send a formal 15-day Letter of Demand specifying the exact unpaid wage balance.",
                    "Escalate to the Labour Commissionerate or file online via Samadhan."
                ]),
                "disclaimer": "This guide provides educational awareness and does not replace qualified legal advice.",
                "verified_at": datetime(2024, 2, 20),
                "is_published": True
            },
            {
                "slug": "defective-goods-and-consumer-rights",
                "title": "Defective Goods, Refund Refusal & Consumer Rights in India",
                "category": "Consumer Protection",
                "jurisdiction_id": central_id,
                "plain_language_intro": "Purchased a defective phone, laptop, or faced poor service from an airline or hotel? The Consumer Protection Act 2019 gives you the power to claim a full refund, replacement, and compensation.",
                "key_points": json.dumps([
                    "You can file consumer complaints online from anywhere in India using the e-Daakhil portal.",
                    "The National Consumer Helpline (NCH 1915) resolves grievances directly with 800+ partner companies.",
                    "Sellers cannot impose arbitrary 'no return, no refund' policies on defective goods.",
                    "Complaints must be filed within 2 years of the cause of action."
                ]),
                "everyday_examples": "Example: An e-commerce seller delivers a damaged television and claims a '7-day replacement only' policy, then refuses replacement. This is an Unfair Trade Practice under CPA 2019, entitling you to a full refund with interest.",
                "faqs": json.dumps([
                    {
                        "question": "Do I need to hire a lawyer to file in Consumer Court?",
                        "answer": "No! Consumer Commissions are designed for citizens. You can represent yourself on e-Daakhil without any lawyer fees."
                    },
                    {
                        "question": "What is the fee to file a consumer complaint?",
                        "answer": "Filing is completely free for claims up to ₹5 Lakhs, and nominal (₹200 to ₹1000) for higher claims."
                    }
                ]),
                "practical_checklist": json.dumps([
                    "Save the tax invoice, product photos, unboxing video, and customer care chat transcripts.",
                    "Call 1915 or file on consumerhelpline.gov.in to obtain a government grievance Docket Number.",
                    "Send a final 15-day formal Legal Notice via email to the company's Grievance Officer.",
                    "File electronically on edaakhil.nic.in if unresolved."
                ]),
                "disclaimer": "This guide provides educational awareness and does not replace qualified legal advice.",
                "verified_at": datetime(2024, 3, 10),
                "is_published": True
            },
            {
                "slug": "digital-privacy-and-data-protection",
                "title": "Digital Privacy, Data Rights & DPDP Act 2023",
                "category": "Digital Safety",
                "jurisdiction_id": central_id,
                "plain_language_intro": "With the enactment of the Digital Personal Data Protection Act (DPDP) 2023, Indian citizens have clear legal rights over how apps, websites, and employers handle their personal information.",
                "key_points": json.dumps([
                    "Consent must be specific, informed, and granted through affirmative user action.",
                    "You have the right to withdraw consent and request erasure of your personal data.",
                    "Financial fraud or cyber impersonation should be reported immediately to helpline 1930.",
                    "Companies must deploy reasonable security safeguards to prevent leaks."
                ]),
                "everyday_examples": "Example: An AI document summarizer uploads your unredacted Aadhaar number and bank statements to public servers without asking your explicit permission. This violates Section 6 of the DPDP Act 2023.",
                "faqs": json.dumps([
                    {
                        "question": "How do I report cyber financial fraud?",
                        "answer": "Dial 1930 immediately within the 'golden hour' to freeze stolen funds before they leave the banking network."
                    }
                ]),
                "practical_checklist": json.dumps([
                    "Never send unredacted Aadhaar, PAN, or bank details to public AI chatbots.",
                    "Redact sensitive identifying details locally before external processing.",
                    "Use masked Aadhaar (last 4 digits visible only) for identification."
                ]),
                "disclaimer": "This guide provides educational awareness and does not replace qualified legal advice.",
                "verified_at": datetime(2024, 4, 1),
                "is_published": True
            }
        ]
        for a in articles_data:
            db.add(KnowledgeArticle(**a))
        db.commit()

    # 4. Legal Aid Resources
    if db.query(LegalAidResource).count() == 0:
        resources_data = [
            {
                "name": "National Legal Services Authority (NALSA)",
                "organization": "Supreme Court of India / Ministry of Law and Justice",
                "resource_type": "legal_aid",
                "official_url": "https://nalsa.gov.in",
                "contact_phone": "15100 (National Legal Aid Toll-Free Helpline)",
                "email": "nalsa-dla@nic.in",
                "jurisdiction_id": central_id,
                "address": "B-Block, Additional Building Complex, Supreme Court of India, New Delhi - 110001",
                "verified_at": datetime(2024, 1, 1),
                "description": "Provides free and competent legal services to the weaker sections of society including women, children, workers, and indigent citizens."
            },
            {
                "name": "National Consumer Helpline (NCH)",
                "organization": "Department of Consumer Affairs, Government of India",
                "resource_type": "helpline",
                "official_url": "https://consumerhelpline.gov.in",
                "contact_phone": "1915 or 1800-11-4000",
                "email": "consumerhelpline-ca@nic.in",
                "jurisdiction_id": central_id,
                "address": "Krishi Bhawan, New Delhi - 110001",
                "verified_at": datetime(2024, 1, 1),
                "description": "Government pre-litigation grievance redressal portal assisting consumers across telecom, banking, e-commerce, and domestic services."
            },
            {
                "name": "National Cyber Crime Reporting Portal & Helpline",
                "organization": "Indian Cyber Crime Coordination Centre (I4C), MHA",
                "resource_type": "helpline",
                "official_url": "https://cybercrime.gov.in",
                "contact_phone": "1930 (Citizen Financial Cyber Fraud Reporting)",
                "email": "cybercrime-mha@gov.in",
                "jurisdiction_id": central_id,
                "address": "Ministry of Home Affairs, New Delhi",
                "verified_at": datetime(2024, 1, 1),
                "description": "Dedicated national portal and 24x7 emergency helpline for reporting online financial fraud, identity theft, and cyber harassment."
            },
            {
                "name": "e-Daakhil Online Consumer Filing Portal",
                "organization": "National Consumer Disputes Redressal Commission (NCDRC)",
                "resource_type": "portal",
                "official_url": "https://edaakhil.nic.in",
                "contact_phone": "011-24300661",
                "email": "edaakhil-ncdrc@nic.in",
                "jurisdiction_id": central_id,
                "address": "Upbhokta Nyay Bhawan, 'F' Block, GPO Complex, INA, New Delhi - 110023",
                "verified_at": datetime(2024, 1, 1),
                "description": "Official electronic filing portal for filing complaints before District, State, and National Consumer Commissions without physical court visits."
            },
            {
                "name": "e-Courts Services Portal",
                "organization": "e-Committee, Supreme Court of India",
                "resource_type": "portal",
                "official_url": "https://services.ecourts.gov.in",
                "contact_phone": None,
                "email": "ecommittee@aij.gov.in",
                "jurisdiction_id": central_id,
                "address": "Supreme Court of India, Tilak Marg, New Delhi",
                "verified_at": datetime(2024, 1, 1),
                "description": "Pan-India court case status tracking, daily orders, cause lists, and digital certified copies for High Courts and District Courts."
            },
            {
                "name": "Samadhan Portal (Industrial & Labour Disputes)",
                "organization": "Ministry of Labour & Employment, Government of India",
                "resource_type": "portal",
                "official_url": "https://samadhan.labour.gov.in",
                "contact_phone": "1800-180-1111",
                "email": "samadhan-mole@gov.in",
                "jurisdiction_id": central_id,
                "address": "Shram Shakti Bhawan, Rafi Marg, New Delhi - 110001",
                "verified_at": datetime(2024, 1, 1),
                "description": "Online dispute resolution mechanism for workmen and employees to register industrial grievances and unpaid wage claims."
            }
        ]
        for r in resources_data:
            db.add(LegalAidResource(**r))
        db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database successfully seeded with Indian legal sources, jurisdictions, guides, and resources.")
    finally:
        db.close()
