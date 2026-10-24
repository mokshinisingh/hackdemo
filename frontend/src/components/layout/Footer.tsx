import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#203D35] text-white pt-12 pb-8 border-t border-[#294B40]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#294B40]/80">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#DDEBE5] flex items-center justify-center text-[#203D35]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-xl text-white">NyayaMitra</span>
            </div>
            <p className="text-xs text-[#DDEBE5]/80 leading-relaxed">
              India-focused public-service legal rights awareness and privacy-first document simplifier. 
              Built with zero-knowledge local redaction and source-grounded Indian statutory retrieval.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#294B40] text-[11px] text-[#DDEBE5] border border-[#203D35]">
              <span>Hacktoberfest Open Source Project</span>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="text-xs font-semibold text-[#DDEBE5] uppercase tracking-wider mb-3">Core Services</h4>
            <ul className="space-y-2 text-xs text-stone-200">
              <li><Link to="/assistant" className="hover:text-white transition">AI Legal Assistant</Link></li>
              <li><Link to="/documents" className="hover:text-white transition">Document Simplifier</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Privacy & Redaction Lab</Link></li>
              <li><Link to="/compare" className="hover:text-white transition">Contract Version Comparison</Link></li>
              <li><Link to="/knowledge" className="hover:text-white transition">Legal Knowledge Centre</Link></li>
              <li><Link to="/resources" className="hover:text-white transition">Legal Aid & Helplines Directory</Link></li>
            </ul>
          </div>

          {/* Official Indian Portals */}
          <div>
            <h4 className="text-xs font-semibold text-[#DDEBE5] uppercase tracking-wider mb-3">Official Indian Portals</h4>
            <ul className="space-y-2 text-xs text-stone-200">
              <li>
                <a href="https://nalsa.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition">
                  NALSA Free Legal Aid <ExternalLink className="w-3 h-3 text-[#DDEBE5]" />
                </a>
              </li>
              <li>
                <a href="https://consumerhelpline.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition">
                  National Consumer Helpline (1915) <ExternalLink className="w-3 h-3 text-[#DDEBE5]" />
                </a>
              </li>
              <li>
                <a href="https://edaakhil.nic.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition">
                  e-Daakhil Consumer Filing <ExternalLink className="w-3 h-3 text-[#DDEBE5]" />
                </a>
              </li>
              <li>
                <a href="https://services.ecourts.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition">
                  e-Courts Case Tracking <ExternalLink className="w-3 h-3 text-[#DDEBE5]" />
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition">
                  Cyber Crime Portal (1930) <ExternalLink className="w-3 h-3 text-[#DDEBE5]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Project & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-[#DDEBE5] uppercase tracking-wider mb-3">About & Governance</h4>
            <ul className="space-y-2 text-xs text-stone-200">
              <li><Link to="/about" className="hover:text-white transition">About the Project</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy & Zero-Knowledge Guarantee</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Use & Legal Disclaimer</Link></li>
              <li><Link to="/settings" className="hover:text-white transition">Settings & Accessibility</Link></li>
            </ul>
            <div className="mt-4 p-2.5 rounded bg-[#294B40]/70 border border-[#203D35] text-[11px] text-[#DDEBE5]/90">
              🔒 <strong>Cryptographic Consent Gate:</strong> Documents are never processed by external AI without verified content hash consent.
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 space-y-4">
          <div className="p-3.5 rounded-lg bg-[#162B25] border border-[#294B40] text-[11px] text-[#DDEBE5]/80 leading-relaxed">
            <strong>Mandatory Legal Notice:</strong> NyayaMitra is an open-source educational awareness system designed to demystify 
            legal documents and statutory procedures. It does NOT provide legal advice, does not establish an attorney-client relationship, 
            and cannot substitute for a qualified advocate enrolled with the Bar Council of India. Users facing active court litigation or 
            formal statutory notices should consult a qualified legal practitioner or visit their District Legal Services Authority (DLSA).
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#DDEBE5]/70 gap-2">
            <p>© 2026 NyayaMitra Legal Rights Awareness Assistant. Open source under Apache 2.0.</p>
            <p className="flex items-center gap-1">
              Crafted for Hacktoberfest with privacy engineering and public accessibility
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
