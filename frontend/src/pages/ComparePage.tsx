import React, { useState } from 'react';
import { compareDocuments } from '../api/client';
import { CompareResult } from '../types';
import { 
  GitCompare, 
  ArrowRight, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

const SAMPLE_V1 = `RESIDENTIAL RENTAL AGREEMENT - VERSION 1
1. Monthly Rent: The tenant shall pay INR 25,000/- on or before the 5th of each month.
2. Security Deposit: Refundable security deposit of INR 50,000/- (two months' rent).
3. Notice Period: Either party may terminate with 30 days written notice.
4. Maintenance: Minor repairs under INR 1,000 shall be borne by the tenant.`;

const SAMPLE_V2 = `RESIDENTIAL RENTAL AGREEMENT - VERSION 2 (LANDLORD PROPOSED AMENDMENT)
1. Monthly Rent: The tenant shall pay INR 30,000/- on or before the 1st of each month. Late fee of 10% per week.
2. Security Deposit: Deposit increased to INR 1,50,000/- (non-refundable for initial 6 months).
3. Notice Period: Tenant must give 90 days notice; Landlord may terminate with 15 days notice.
4. Maintenance: All repairs, painting, and structural maintenance borne exclusively by tenant.
5. Inspection: Landlord may inspect premises at any time without prior intimation.`;

export const ComparePage: React.FC = () => {
  const [doc1, setDoc1] = useState(SAMPLE_V1);
  const [doc2, setDoc2] = useState(SAMPLE_V2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await compareDocuments({
        source_text: doc1,
        target_text: doc2,
        source_title: 'Version 1',
        target_title: 'Version 2 (Proposed Amendment)',
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6E2]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#203D35] flex items-center justify-center text-[#DDEBE5]">
                <GitCompare className="w-4 h-4" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[#203D35]">
                Contract Version Comparison
              </h1>
            </div>
            <p className="text-xs text-[#64716B] mt-1">
              Compare two agreements or revisions to identify altered rent, lock-in clauses, notice windows, and penalty liabilities.
            </p>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="px-6 py-2.5 bg-[#203D35] text-white hover:bg-[#294B40] rounded-xl text-xs font-semibold shadow-subtle flex items-center gap-2"
          >
            {loading ? 'Comparing Clauses...' : 'Run Contract Comparison'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
            {error}
          </div>
        )}

        {/* Input Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Version 1 */}
          <div className="bg-white rounded-2xl border border-[#E1E6E2] shadow-subtle overflow-hidden">
            <div className="bg-stone-100 px-4 py-2.5 border-b border-[#E1E6E2] flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>Original Document (Version 1)</span>
              <span className="text-[11px] text-stone-500 font-mono">{doc1.length} chars</span>
            </div>
            <textarea
              rows={9}
              value={doc1}
              onChange={(e) => setDoc1(e.target.value)}
              className="w-full p-4 text-xs font-mono text-stone-800 focus:outline-none bg-[#FCFCFB] resize-none leading-relaxed"
            />
          </div>

          {/* Version 2 */}
          <div className="bg-white rounded-2xl border border-[#203D35]/40 shadow-subtle overflow-hidden">
            <div className="bg-[#203D35] px-4 py-2.5 text-white flex items-center justify-between text-xs font-semibold">
              <span>Modified Document (Version 2)</span>
              <span className="text-[11px] text-[#DDEBE5] font-mono">{doc2.length} chars</span>
            </div>
            <textarea
              rows={9}
              value={doc2}
              onChange={(e) => setDoc2(e.target.value)}
              className="w-full p-4 text-xs font-mono text-[#24352F] focus:outline-none bg-[#FAF9F5] resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 pt-4">
            
            {/* Summary card */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#203D35] bg-[#DDEBE5] px-2 py-0.5 rounded">
                Comparison Summary
              </span>
              <h2 className="font-heading text-lg font-bold text-[#203D35]">
                {result.summary_of_changes}
              </h2>

              <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <strong className="block text-emerald-800 text-lg font-bold">+{result.added_lines}</strong>
                  <span className="text-emerald-700">New / Extended Clauses</span>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <strong className="block text-red-800 text-lg font-bold">-{result.removed_lines}</strong>
                  <span className="text-red-700">Removed Clauses</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <strong className="block text-amber-800 text-lg font-bold">~{result.modified_lines}</strong>
                  <span className="text-amber-700">Modified Clauses</span>
                </div>
              </div>
            </div>

            {/* Domain-specific clause shifts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#E1E6E2] shadow-subtle space-y-1.5 text-xs">
                <span className="font-bold text-[#203D35] block">Payment & Security Deposit Shifts</span>
                <p className="text-[#64716B] leading-relaxed">{result.payment_changes}</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E1E6E2] shadow-subtle space-y-1.5 text-xs">
                <span className="font-bold text-[#203D35] block">Notice & Termination Window Shifts</span>
                <p className="text-[#64716B] leading-relaxed">{result.termination_changes}</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E1E6E2] shadow-subtle space-y-1.5 text-xs">
                <span className="font-bold text-[#203D35] block">Intimation & Notice Delivery Terms</span>
                <p className="text-[#64716B] leading-relaxed">{result.notice_changes}</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E1E6E2] shadow-subtle space-y-1.5 text-xs">
                <span className="font-bold text-[#203D35] block">Liabilities, Damages & Dispute Forums</span>
                <p className="text-[#64716B] leading-relaxed">{result.liability_changes}</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
