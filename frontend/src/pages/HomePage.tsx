import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  HelpCircle, 
  GitCompare, 
  ExternalLink,
  Eye,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { JurisdictionSelector } from '../components/common/JurisdictionSelector';

export const HomePage: React.FC = () => {
  const [jurisdiction, setJurisdiction] = useState(
    localStorage.getItem('preferred_jurisdiction') || 'IN-CENTRAL'
  );

  // Interactive toggle for the privacy preview in hero
  const [previewRedacted, setPreviewRedacted] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[#E1E6E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDEBE5] text-[#203D35] text-xs font-semibold tracking-wide border border-[#C5DDD3]">
                <ShieldCheck className="w-4 h-4 text-[#203D35]" />
                Zero-Knowledge Privacy • Grounded in Indian Law
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#203D35] tracking-tight leading-[1.12]">
                Understand Your Rights. <br />
                <span className="text-[#294B40] underline decoration-[#DDEBE5] decoration-wavy decoration-2">
                  Protect Your Privacy.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#64716B] leading-relaxed max-w-2xl">
                Understand everyday legal documents, simplify confusing clauses, and automatically redact 
                Aadhaar, PAN, and bank details before any document content touches external AI.
              </p>

              {/* Jurisdiction selector */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-xs font-medium text-[#64716B]">Applicable Jurisdiction:</span>
                <JurisdictionSelector selectedCode={jurisdiction} onSelect={setJurisdiction} />
              </div>

              {/* Primary Actions */}
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  to="/assistant"
                  className="bg-[#203D35] text-white hover:bg-[#294B40] px-6 py-3 rounded-xl font-medium text-sm shadow-subtle hover:shadow-elevated transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#DDEBE5]" />
                  Ask a Legal Question
                </Link>

                <Link
                  to="/documents"
                  className="bg-white text-[#203D35] hover:bg-[#EAF3EF] border border-[#E1E6E2] px-6 py-3 rounded-xl font-medium text-sm shadow-subtle transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#203D35]" />
                  Simplify a Document
                </Link>

                <Link
                  to="/privacy"
                  className="bg-[#EAF3EF] text-[#203D35] hover:bg-[#DDEBE5] px-5 py-3 rounded-xl font-medium text-sm transition flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#203D35]" />
                  Redaction Lab
                </Link>
              </div>

              {/* Quick stats or trust signals */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#E1E6E2]/80 max-w-lg text-xs">
                <div>
                  <strong className="block text-[#203D35] text-base font-bold">100% Client-Side</strong>
                  <span className="text-[#64716B]">Local PII Redaction</span>
                </div>
                <div>
                  <strong className="block text-[#203D35] text-base font-bold">SHA-256</strong>
                  <span className="text-[#64716B]">Consent Verification</span>
                </div>
                <div>
                  <strong className="block text-[#203D35] text-base font-bold">Statutory</strong>
                  <span className="text-[#64716B]">Indian Source Citations</span>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Interactive Redaction Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-[#E1E6E2] shadow-elevated overflow-hidden">
                {/* Header bar */}
                <div className="bg-[#203D35] px-4 py-3 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <Lock className="w-4 h-4 text-[#DDEBE5]" />
                    <span>Privacy Gate: Residential_Agreement.pdf</span>
                  </div>
                  <button
                    onClick={() => setPreviewRedacted(!previewRedacted)}
                    className="text-[11px] bg-[#294B40] hover:bg-[#162B25] text-[#DDEBE5] px-2.5 py-1 rounded transition flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    {previewRedacted ? 'View Raw' : 'View Redacted'}
                  </button>
                </div>

                {/* Content preview */}
                <div className="p-5 text-xs font-mono space-y-3 leading-relaxed text-[#24352F] bg-[#FAF9F5]">
                  <p className="text-[11px] text-[#64716B] uppercase font-bold tracking-wider">
                    {previewRedacted ? '✓ Sanitized Preview (Authorized for Analysis)' : '⚠️ Raw Document (Contains Sensitive PII)'}
                  </p>

                  <div className="p-3.5 bg-white rounded-lg border border-[#E1E6E2] shadow-inner space-y-2">
                    <p>
                      THIS LEASE is entered into between{' '}
                      {previewRedacted ? (
                        <span className="badge-redacted">[NAME_1]</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-1 rounded font-bold">Shri Ramesh Sharma</span>
                      )}
                      , residing at{' '}
                      {previewRedacted ? (
                        <span className="badge-redacted">[ADDRESS_1]</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-1 rounded">Flat 402, Bellandur, Bengaluru</span>
                      )}
                      , Aadhaar No:{' '}
                      {previewRedacted ? (
                        <span className="badge-redacted">[AADHAAR_1]</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-1 rounded font-bold">3847 2910 4829</span>
                      )}
                      , Bank A/C:{' '}
                      {previewRedacted ? (
                        <span className="badge-redacted">[BANK_ACCOUNT_1]</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-1 rounded font-bold">109283746501</span>
                      )}
                      , and{' '}
                      {previewRedacted ? (
                        <span className="badge-redacted">[NAME_2]</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-1 rounded font-bold">Adv. Priya Menon</span>
                      )}
                      .
                    </p>
                    <p className="text-[#64716B]">
                      Clause 3: Tenant pays security deposit of INR 64,000/- (refundable within 15 days under Model Tenancy Act).
                    </p>
                  </div>

                  {/* Consent hash badge */}
                  <div className="p-2.5 rounded bg-[#EAF3EF] border border-[#C5DDD3] text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#203D35]">
                      <FileCheck2 className="w-4 h-4 text-[#237A52]" />
                      <span className="font-semibold">Cryptographic Hash Bound:</span>
                    </div>
                    <code className="text-[10px] text-[#294B40]">sha256: 4f8b9e...7a1c</code>
                  </div>
                </div>

                {/* Footer status */}
                <div className="px-5 py-2.5 bg-[#F3F5F3] border-t border-[#E1E6E2] flex items-center justify-between text-[11px] text-[#64716B]">
                  <span>2nd Scan Verification: <strong className="text-[#237A52]">Zero Residual Leaks</strong></span>
                  <Link to="/documents" className="text-[#203D35] font-semibold hover:underline flex items-center gap-0.5">
                    Test your document <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE-STEP ARCHITECTURAL WORKFLOW */}
      <section className="py-16 bg-white border-b border-[#E1E6E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#203D35] uppercase tracking-wider bg-[#DDEBE5] px-2.5 py-1 rounded">
              How It Works
            </span>
            <h2 className="text-3xl font-heading font-bold text-[#203D35] mt-2">
              Privacy-First Document Understanding
            </h2>
            <p className="text-sm text-[#64716B] mt-2">
              We never upload unreviewed personal documents directly to external AI chatbots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E1E6E2] space-y-4 hover:border-[#203D35] transition">
              <div className="w-12 h-12 rounded-xl bg-[#203D35] text-white flex items-center justify-center font-heading font-bold text-lg">
                1
              </div>
              <h3 className="font-heading text-lg font-bold text-[#203D35]">
                Local PII Extraction & Redaction
              </h3>
              <p className="text-xs text-[#64716B] leading-relaxed">
                Your PDF or DOCX is parsed locally. The engine detects Indian identifiers—Aadhaar, PAN, phone numbers, bank accounts, and party names—and replaces them with clear placeholders like <code className="bg-[#DDEBE5] text-[#203D35] px-1 rounded">[AADHAAR_1]</code>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E1E6E2] space-y-4 hover:border-[#203D35] transition">
              <div className="w-12 h-12 rounded-xl bg-[#203D35] text-white flex items-center justify-center font-heading font-bold text-lg">
                2
              </div>
              <h3 className="font-heading text-lg font-bold text-[#203D35]">
                Cryptographic Consent Gate
              </h3>
              <p className="text-xs text-[#64716B] leading-relaxed">
                Inspect the sanitized text side-by-side with the original. A second automated scan verifies zero residual leaks. You review the receiving service and grant explicit affirmative consent bound strictly to the document’s SHA-256 hash.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E1E6E2] space-y-4 hover:border-[#203D35] transition">
              <div className="w-12 h-12 rounded-xl bg-[#203D35] text-white flex items-center justify-center font-heading font-bold text-lg">
                3
              </div>
              <h3 className="font-heading text-lg font-bold text-[#203D35]">
                Grounded Plain-Language Analysis
              </h3>
              <p className="text-xs text-[#64716B] leading-relaxed">
                Only the approved redacted text is processed. Receive a plain-language summary, key obligations, payment deadlines, potential concerns, questions to ask a lawyer, and citations to authoritative Indian statutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICE SUITE */}
      <section className="py-16 bg-[#FAF9F5] border-b border-[#E1E6E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold text-[#203D35] uppercase tracking-wider bg-[#DDEBE5] px-2.5 py-1 rounded">
                Product Features
              </span>
              <h2 className="text-3xl font-heading font-bold text-[#203D35] mt-2">
                Accessible Legal Services for Everyday Citizens
              </h2>
            </div>
            <Link to="/knowledge" className="text-xs font-semibold text-[#203D35] hover:underline flex items-center gap-1">
              Browse All Legal Guides <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle hover:shadow-elevated transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EAF3EF] text-[#203D35] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#203D35]">AI Legal Assistant</h3>
                <p className="text-xs text-[#64716B] leading-relaxed">
                  Ask plain-language questions regarding tenancy disputes, unpaid salaries, consumer refunds, and notices. Grounded in central and state statutes.
                </p>
              </div>
              <Link to="/assistant" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#203D35] hover:text-[#294B40]">
                Launch Assistant <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle hover:shadow-elevated transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EAF3EF] text-[#203D35] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#203D35]">Document Simplifier</h3>
                <p className="text-xs text-[#64716B] leading-relaxed">
                  Upload PDF or DOCX agreements. Review redacted text, give cryptographic consent, and receive plain summaries, obligation dates, and concerns.
                </p>
              </div>
              <Link to="/documents" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#203D35] hover:text-[#294B40]">
                Simplify Document <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle hover:shadow-elevated transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EAF3EF] text-[#203D35] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#203D35]">Privacy Lab</h3>
                <p className="text-xs text-[#64716B] leading-relaxed">
                  Interactive redaction testbench. Detect Aadhaar, PAN, phone numbers, and custom terms. Inspect second-scan results and consent audits.
                </p>
              </div>
              <Link to="/privacy" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#203D35] hover:text-[#294B40]">
                Open Redaction Lab <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle hover:shadow-elevated transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EAF3EF] text-[#203D35] flex items-center justify-center">
                  <GitCompare className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#203D35]">Contract Comparison</h3>
                <p className="text-xs text-[#64716B] leading-relaxed">
                  Compare two contract versions side-by-side. View added/removed terms and plain-language alerts on changes to payment, notice, or lock-in periods.
                </p>
              </div>
              <Link to="/compare" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#203D35] hover:text-[#294B40]">
                Compare Versions <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR LEGAL TOPICS IN INDIA */}
      <section className="py-16 bg-white border-b border-[#E1E6E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-heading font-bold text-[#203D35]">
              Common Everyday Legal Questions
            </h2>
            <p className="text-xs text-[#64716B] mt-1">
              Select a popular issue to open the AI Assistant with a pre-configured query.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Can my landlord deduct painting costs from my deposit?",
                topic: "Tenant Rights",
                act: "Model Tenancy Act, 2021",
                query: "Can a landlord deduct painting and cleaning costs from security deposit under the Model Tenancy Act in India?"
              },
              {
                title: "Is a 12-month post-employment non-compete enforceable?",
                topic: "Workplace Rights",
                act: "Indian Contract Act, 1872 (Section 27)",
                query: "Is a non-compete clause in my employment contract legally enforceable in India after I resign?"
              },
              {
                title: "How to claim refund for defective electronics on e-commerce?",
                topic: "Consumer Rights",
                act: "Consumer Protection Act, 2019",
                query: "What is the procedure to claim a refund for a defective product when an online seller refuses return under the Consumer Protection Act?"
              },
              {
                title: "What are my legal remedies if employer withholds final salary?",
                topic: "Employment Law",
                act: "Payment of Wages Act, 1936",
                query: "What legal actions can I take if my employer refuses to pay my full and final settlement after notice period?"
              },
              {
                title: "How quickly must I report online banking fraud?",
                topic: "Digital Safety",
                act: "RBI Circular on Unauthorized Electronic Transactions",
                query: "What is the timeline and procedure to report cyber financial fraud to helpline 1930 and bank under RBI guidelines?"
              },
              {
                title: "Can a landlord evict a tenant without court notice?",
                topic: "Housing Rights",
                act: "State Rent Control Acts",
                query: "Can a landlord forcefully evict a tenant or cut off electricity without an order from the Rent Tribunal in India?"
              }
            ].map((item, idx) => (
              <Link
                key={idx}
                to={`/assistant?q=${encodeURIComponent(item.query)}`}
                className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E1E6E2] hover:border-[#203D35] hover:bg-[#EAF3EF] transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-semibold text-[#203D35] bg-[#DDEBE5] px-2 py-0.5 rounded">{item.topic}</span>
                    <span className="text-[#64716B] font-mono">{item.act}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#24352F] group-hover:text-[#203D35]">
                    {item.title}
                  </h4>
                </div>
                <span className="text-xs font-medium text-[#203D35] mt-3 flex items-center gap-1">
                  Ask Assistant <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRIVACY GUARANTEE & LIMITATIONS */}
      <section className="py-16 bg-[#FAF9F5] border-b border-[#E1E6E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#203D35] text-white rounded-3xl p-8 sm:p-12 shadow-elevated">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#DDEBE5] bg-[#294B40] px-3 py-1 rounded-full">
                  Application Security & Ethics
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold">
                  Zero-Knowledge Privacy By Design. Not A Marketing Slogan.
                </h2>
                <p className="text-xs sm:text-sm text-[#DDEBE5]/80 leading-relaxed">
                  Ordinary document summarizers leak identity records to commercial LLM training clusters. 
                  NyayaMitra runs client-validated extraction, local PII redaction, cryptographic SHA-256 consent binding, 
                  and strict backend verification gates.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#DDEBE5]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Backend-enforced consent authorization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zero residual leaks verified by second scan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No document training retention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Statutory source grounding only</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#162B25] p-5 rounded-2xl border border-[#294B40] text-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Explicit System Limitations</span>
                </div>
                <p className="text-[#DDEBE5]/80 leading-relaxed text-[11px]">
                  While redaction detects standard Aadhaar, PAN, phone, and banking numbers, optical document artifacts or non-standard formatting may evade detection. 
                  Always review the sanitized preview before granting transmission consent.
                </p>
                <Link
                  to="/privacy-policy"
                  className="inline-block text-[11px] text-[#DDEBE5] underline hover:text-white"
                >
                  Read our Full Privacy & Security Policy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STATUTORY HELPLINES CALLOUT */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-[#FAF9F5] border border-[#E1E6E2]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#203D35] text-white flex items-center justify-center shrink-0">
                <Scale className="w-6 h-6 text-[#DDEBE5]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#203D35]">
                  Need Immediate Free Government Legal Aid?
                </h3>
                <p className="text-xs text-[#64716B]">
                  Citizens can access free legal consultation from National Legal Services Authority (NALSA) or state legal authorities.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="tel:15100"
                className="px-4 py-2 bg-[#203D35] text-white rounded-lg text-xs font-semibold shadow-subtle hover:bg-[#294B40] transition flex items-center gap-1.5"
              >
                Dial NALSA 15100
              </a>
              <Link
                to="/resources"
                className="px-4 py-2 bg-white text-[#203D35] border border-[#E1E6E2] rounded-lg text-xs font-semibold hover:bg-[#EAF3EF] transition"
              >
                View Legal Aid Directory
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
