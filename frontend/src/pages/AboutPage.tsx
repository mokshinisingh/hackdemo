import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Scale, 
  Heart, 
  Code2, 
  Lock, 
  AlertTriangle, 
  FileCheck2, 
  CheckCircle2 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="pb-6 border-b border-[#E1E6E2]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#203D35] bg-[#DDEBE5] px-2.5 py-0.5 rounded">
            Project Mission
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#203D35] mt-2">
            Democratizing Legal Rights Awareness In India
          </h1>
          <p className="text-sm text-[#64716B] mt-2 leading-relaxed">
            NyayaMitra is an open-source public service initiative created for Hacktoberfest to bridge India's legal literacy divide 
            without compromising citizen document confidentiality.
          </p>
        </div>

        {/* The Two Core Problems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-heading font-bold text-base text-[#203D35]">
              The Legal Complexity Problem
            </h3>
            <p className="text-xs text-[#64716B] leading-relaxed">
              Everyday contracts, tenancy deeds, workplace non-competes, and consumer warranties are written in impenetrable legalese. 
              Ordinary citizens are pressured to sign terms they do not understand, forfeiting their statutory protections.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-heading font-bold text-base text-[#203D35]">
              The AI Document Privacy Leak
            </h3>
            <p className="text-xs text-[#64716B] leading-relaxed">
              When citizens upload contracts to commercial AI chatbots for summaries, they inadvertently upload Aadhaar numbers, 
              PAN details, home addresses, bank account numbers, and signatures to third-party model training pipelines.
            </p>
          </div>
        </div>

        {/* Our Architectural Response */}
        <div className="bg-white p-8 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-6">
          <h2 className="font-heading text-xl font-bold text-[#203D35] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#237A52]" />
            How NyayaMitra Solves Both
          </h2>

          <div className="space-y-4 text-xs text-[#24352F] leading-relaxed">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0 mt-0.5" />
              <div>
                <strong>Client-Gated Local Redaction:</strong> Before any text leaves your browser or session, sensitive Indian identifiers are replaced with sequential placeholders (<code className="bg-[#DDEBE5] px-1 rounded text-[#203D35]">[AADHAAR_1]</code>, <code className="bg-[#DDEBE5] px-1 rounded text-[#203D35]">[PAN_1]</code>).
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0 mt-0.5" />
              <div>
                <strong>Cryptographic SHA-256 Consent Binding:</strong> Affirmative user consent is bound to the exact content hash. If the text changes by a single character, processing is blocked until re-authorized.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0 mt-0.5" />
              <div>
                <strong>Statutory Grounding & Verified Sources:</strong> Rather than hallucinating legal citations, claims are verified against authoritative central statutes (Consumer Protection Act 2019, Model Tenancy Act, Indian Contract Act 1872, DPDP Act 2023).
              </div>
            </div>
          </div>
        </div>

        {/* Explicit Limitations */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <span>Honest System Limitations</span>
          </div>
          <p className="leading-relaxed">
            NyayaMitra is not a law firm and does not provide legal representation. While our PII detector covers major Indian identifier patterns, 
            optical scanning imperfections or non-standard document formatting may fail to detect all sensitive information. Users must always 
            inspect the sanitized preview before transmission.
          </p>
        </div>

      </div>
    </div>
  );
};
