import React, { useState, useEffect } from 'react';
import { detectPrivacy, applyRedactions, runSecondScan } from '../api/client';
import { SensitiveFinding } from '../types';
import { SYNTHETIC_RENTAL_AGREEMENT, SYNTHETIC_EMPLOYMENT_AGREEMENT } from '../fixtures/syntheticDocuments';
import { 
  Lock, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileCheck2, 
  Key, 
  Info,
  FileText
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const [rawText, setRawText] = useState(SYNTHETIC_RENTAL_AGREEMENT);
  const [findings, setFindings] = useState<SensitiveFinding[]>([]);
  const [sanitizedText, setSanitizedText] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [customTerm, setCustomTerm] = useState('');
  const [secondScanResult, setSecondScanResult] = useState<{
    is_clean: boolean;
    residual_count: number;
    message: string;
  } | null>(null);

  // Scan on mount or fixture change
  useEffect(() => {
    runDetection(rawText);
  }, []);

  const runDetection = async (textToScan: string) => {
    setLoading(true);
    try {
      const detectRes = await detectPrivacy(textToScan);
      setFindings(detectRes.findings);

      const redactRes = await applyRedactions(textToScan, detectRes.findings);
      setSanitizedText(redactRes.sanitized_text);
      setContentHash(redactRes.content_hash);

      const scanRes = await runSecondScan(redactRes.sanitized_text);
      setSecondScanResult(scanRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFinding = async (index: number) => {
    const updated = [...findings];
    updated[index].is_redacted = !updated[index].is_redacted;
    setFindings(updated);

    const redactRes = await applyRedactions(rawText, updated);
    setSanitizedText(redactRes.sanitized_text);
    setContentHash(redactRes.content_hash);

    const scanRes = await runSecondScan(redactRes.sanitized_text);
    setSecondScanResult(scanRes);
  };

  const handleBulkToggle = async (redactAll: boolean) => {
    const updated = findings.map((f) => ({ ...f, is_redacted: redactAll }));
    setFindings(updated);

    const redactRes = await applyRedactions(rawText, updated);
    setSanitizedText(redactRes.sanitized_text);
    setContentHash(redactRes.content_hash);

    const scanRes = await runSecondScan(redactRes.sanitized_text);
    setSecondScanResult(scanRes);
  };

  const handleAddCustom = async () => {
    if (!customTerm.trim()) return;
    setLoading(true);
    try {
      const detectRes = await detectPrivacy(rawText, [customTerm.trim()]);
      setFindings(detectRes.findings);

      const redactRes = await applyRedactions(rawText, detectRes.findings);
      setSanitizedText(redactRes.sanitized_text);
      setContentHash(redactRes.content_hash);

      const scanRes = await runSecondScan(redactRes.sanitized_text);
      setSecondScanResult(scanRes);
      setCustomTerm('');
    } catch (e) {
      console.error(e);
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
                <Lock className="w-4 h-4" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[#203D35]">
                Privacy Centre & Redaction Lab
              </h1>
            </div>
            <p className="text-xs text-[#64716B] mt-1">
              Interactive testbench for PII detection, redaction controls, second-scan verification, and SHA-256 consent audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRawText(SYNTHETIC_RENTAL_AGREEMENT);
                runDetection(SYNTHETIC_RENTAL_AGREEMENT);
              }}
              className="px-3 py-1.5 rounded-lg border border-[#E1E6E2] text-xs font-semibold bg-white text-[#203D35] hover:bg-[#EAF3EF]"
            >
              Load Rental Agreement
            </button>
            <button
              onClick={() => {
                setRawText(SYNTHETIC_EMPLOYMENT_AGREEMENT);
                runDetection(SYNTHETIC_EMPLOYMENT_AGREEMENT);
              }}
              className="px-3 py-1.5 rounded-lg border border-[#E1E6E2] text-xs font-semibold bg-white text-[#203D35] hover:bg-[#EAF3EF]"
            >
              Load Employment NDA
            </button>
          </div>
        </div>

        {/* Security Metrics & Second Scan Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E1E6E2] shadow-subtle space-y-1">
            <span className="text-[11px] text-[#64716B] font-semibold uppercase">Detected Entities</span>
            <div className="text-2xl font-heading font-bold text-[#203D35]">{findings.length}</div>
            <span className="text-[10px] text-[#64716B]">Aadhaar, PAN, Phone, Email, Bank</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E6E2] shadow-subtle space-y-1">
            <span className="text-[11px] text-[#64716B] font-semibold uppercase">Active Redactions</span>
            <div className="text-2xl font-heading font-bold text-[#237A52]">
              {findings.filter(f => f.is_redacted).length} / {findings.length}
            </div>
            <span className="text-[10px] text-[#237A52]">Replaced with placeholders</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E6E2] shadow-subtle space-y-1">
            <span className="text-[11px] text-[#64716B] font-semibold uppercase">Second Scan Status</span>
            <div className="flex items-center gap-1.5 pt-1">
              {secondScanResult?.is_clean ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#237A52]" />
                  <span className="text-sm font-bold text-[#237A52]">Zero Residuals</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-bold text-amber-700">{secondScanResult?.residual_count} Leaked</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-[#64716B]">Checked against residual regexes</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E6E2] shadow-subtle space-y-1">
            <span className="text-[11px] text-[#64716B] font-semibold uppercase">Content Fingerprint</span>
            <code className="text-xs font-mono font-bold text-[#203D35] block truncate pt-1">
              {contentHash ? `${contentHash.substring(0, 16)}...` : 'Computing...'}
            </code>
            <span className="text-[10px] text-[#64716B]">SHA-256 bound to consent</span>
          </div>
        </div>

        {/* User Controls Bar */}
        <div className="bg-white p-5 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-heading font-bold text-sm text-[#203D35]">
              Redaction Entity Manager
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkToggle(true)}
                className="px-3 py-1 bg-[#EAF3EF] text-[#203D35] hover:bg-[#DDEBE5] rounded-lg text-xs font-semibold"
              >
                Redact All
              </button>
              <button
                onClick={() => handleBulkToggle(false)}
                className="px-3 py-1 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg text-xs font-semibold"
              >
                Unredact All (View Raw)
              </button>
            </div>
          </div>

          {/* Findings Pills */}
          <div className="flex flex-wrap gap-2">
            {findings.map((f, idx) => (
              <button
                key={idx}
                onClick={() => handleToggleFinding(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center gap-2 transition ${
                  f.is_redacted
                    ? 'bg-[#DDEBE5] text-[#203D35] border-[#C5DDD3]'
                    : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                }`}
              >
                <span className="text-[10px] uppercase font-bold opacity-75">{f.entity_type}:</span>
                <span>{f.detected_text}</span>
                <span className="text-[10px] bg-white/70 px-1 rounded">{f.placeholder}</span>
              </button>
            ))}
          </div>

          {/* Add custom term input */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#E1E6E2]">
            <input
              type="text"
              value={customTerm}
              onChange={(e) => setCustomTerm(e.target.value)}
              placeholder="Add custom entity or name to redact..."
              className="p-2 bg-[#FAF9F5] border border-[#E1E6E2] rounded-lg text-xs w-80 focus:outline-none focus:ring-1 focus:ring-[#203D35]"
            />
            <button
              onClick={handleAddCustom}
              className="px-4 py-2 bg-[#203D35] text-white hover:bg-[#294B40] rounded-lg text-xs font-semibold"
            >
              Add Custom Term
            </button>
          </div>
        </div>

        {/* Two-Panel Comparison View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel 1: Original */}
          <div className="bg-white rounded-2xl border border-[#E1E6E2] shadow-subtle overflow-hidden">
            <div className="bg-stone-100 px-4 py-2.5 border-b border-[#E1E6E2] flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>Original Document (With PII Highlighted)</span>
              <span className="text-[11px] text-stone-500 font-mono">{rawText.length} characters</span>
            </div>
            <textarea
              rows={14}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                runDetection(e.target.value);
              }}
              className="w-full p-4 text-xs font-mono text-stone-700 focus:outline-none bg-[#FCFCFB] resize-none leading-relaxed"
            />
          </div>

          {/* Panel 2: Proposed Redacted Result */}
          <div className="bg-white rounded-2xl border border-[#203D35]/40 shadow-subtle overflow-hidden">
            <div className="bg-[#203D35] px-4 py-2.5 text-white flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-[#DDEBE5]" />
                <span>Sanitized Output (Ready for External AI)</span>
              </div>
              <span className="text-[10px] text-[#DDEBE5] font-mono">
                {sanitizedText.length} characters
              </span>
            </div>
            <div className="p-4 text-xs font-mono text-[#24352F] h-[252px] overflow-y-auto whitespace-pre-wrap leading-relaxed bg-[#FAF9F5]">
              {sanitizedText}
            </div>
          </div>
        </div>

        {/* Consent Ledger & Security Guarantees */}
        <div className="p-5 rounded-2xl bg-[#EAF3EF] border border-[#C5DDD3] space-y-3 text-xs text-[#203D35]">
          <div className="flex items-center gap-2 font-bold text-sm">
            <FileCheck2 className="w-5 h-5 text-[#237A52]" />
            <span>Cryptographic Consent Audit Ledger</span>
          </div>
          <p className="leading-relaxed">
            Whenever a document is submitted for AI simplification, our backend enforces a strict gate: 
            it computes <code className="bg-white px-1.5 py-0.5 rounded border border-[#C5DDD3]">sha256(sanitized_text)</code> 
            and verifies against the database consent record. 
            If the text has been altered by even one character without renewing affirmative consent, the request is 
            immediately rejected with HTTP 403 Forbidden.
          </p>
        </div>

      </div>
    </div>
  );
};
