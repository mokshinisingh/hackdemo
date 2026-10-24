import React from 'react';
import { ShieldCheck, Lock, FileCheck2, AlertCircle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="pb-6 border-b border-[#E1E6E2]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#203D35] bg-[#DDEBE5] px-2.5 py-0.5 rounded">
            Privacy Engineering Policy
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#203D35] mt-2">
            Zero-Knowledge Document Confidentiality
          </h1>
          <p className="text-xs text-[#64716B] mt-1">
            Compliant with Digital Personal Data Protection (DPDP) Act, 2023 principles.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-6 text-xs sm:text-sm text-[#24352F] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-heading text-base font-bold text-[#203D35]">1. Core Privacy Tenet</h2>
            <p>
              NyayaMitra operates under a strict principle of <strong>data minimization and zero-retention</strong>. 
              We believe users should never have to surrender their privacy to understand their legal documents.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-base font-bold text-[#203D35]">2. What Information is Detected & Redacted</h2>
            <p>
              Our automated redaction engine specifically looks for Indian PII:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#64716B]">
              <li><strong>Government Identifiers:</strong> 12-digit Aadhaar numbers, 10-character alphanumeric PAN numbers, Voter IDs.</li>
              <li><strong>Financial Details:</strong> Indian bank account numbers, 11-character alphanumeric IFSC codes, salary slips.</li>
              <li><strong>Direct Contact Data:</strong> Indian mobile phone numbers (+91), email addresses, street addresses.</li>
              <li><strong>Personal Identifiers:</strong> Party names appearing after legal honorifics (Shri, Smt., Mr., Adv.) or contractual preambles.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-base font-bold text-[#203D35]">3. Backend-Enforced Cryptographic Consent</h2>
            <p>
              Unlike traditional platforms that rely on superficial frontend checkboxes, our system enforces a backend authorization gate:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#64716B]">
              <li>Every document version has an associated SHA-256 content hash computed strictly on the sanitized output.</li>
              <li>External AI processing is rejected by the backend unless an active affirmative consent record matches that exact hash.</li>
              <li>Modifying the document or revoking consent immediately terminates authorization.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-base font-bold text-[#203D35]">4. No Training on Citizen Documents</h2>
            <p>
              Your document text is never used to train, fine-tune, or improve public or private artificial intelligence models. 
              All processing is session-scoped and ephemeral.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-base font-bold text-[#203D35]">5. User Rights Under DPDP Act 2023</h2>
            <p>
              Under Section 11 and 12 of the DPDP Act 2023, you retain full rights to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#64716B]">
              <li>Withdraw processing consent at any stage of document review.</li>
              <li>Request immediate purging of local browser session storage.</li>
              <li>Access plain-language explanation of all algorithmic inferences.</li>
            </ul>
          </section>
        </div>

      </div>
    </div>
  );
};
