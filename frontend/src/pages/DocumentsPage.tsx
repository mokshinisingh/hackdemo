import React, { useState } from 'react';
import { 
  uploadDocument, 
  detectPrivacy, 
  applyRedactions, 
  runSecondScan, 
  grantConsent, 
  analyzeDocument 
} from '../api/client';
import { 
  DocumentUploadResult, 
  SensitiveFinding, 
  DocumentAnalysisResult 
} from '../types';
import { 
  SYNTHETIC_RENTAL_AGREEMENT, 
  SYNTHETIC_EMPLOYMENT_AGREEMENT, 
  SYNTHETIC_CONSUMER_NOTICE 
} from '../fixtures/syntheticDocuments';
import { 
  FileText, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Eye, 
  FileCheck2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  HelpCircle, 
  Calendar, 
  Scale, 
  X
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  // Step indicator (1: Input -> 2: Redaction Review -> 3: Second Scan & Consent -> 4: Analysis Results)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Input states
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('Bangalore Residential Lease');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Uploaded doc version info
  const [uploadResult, setUploadResult] = useState<DocumentUploadResult | null>(null);

  // Privacy findings & redactions
  const [findings, setFindings] = useState<SensitiveFinding[]>([]);
  const [sanitizedText, setSanitizedText] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [customTerm, setCustomTerm] = useState('');

  // Second scan & Consent
  const [secondScanResult, setSecondScanResult] = useState<{
    is_clean: boolean;
    residual_count: number;
    residual_findings: SensitiveFinding[];
    message: string;
  } | null>(null);
  const [consentGranted, setConsentGranted] = useState(false);
  const [consentId, setConsentId] = useState<string | null>(null);

  // Analysis result
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);

  // 1-Click Synthetic Fixture Loader
  const loadFixture = (type: 'rental' | 'employment' | 'consumer') => {
    if (type === 'rental') {
      setPastedText(SYNTHETIC_RENTAL_AGREEMENT);
      setDocTitle('Bangalore Residential Lease Agreement');
    } else if (type === 'employment') {
      setPastedText(SYNTHETIC_EMPLOYMENT_AGREEMENT);
      setDocTitle('Employment & Non-Compete Agreement');
    } else {
      setPastedText(SYNTHETIC_CONSUMER_NOTICE);
      setDocTitle('Consumer Legal Notice - Defective TV');
    }
  };

  // STEP 1 -> STEP 2: Upload, Extract & Detect PII
  const handleProceedToRedaction = async () => {
    setError(null);
    if (!pastedText.trim() && !selectedFile) {
      setError('Please upload a file or paste document text.');
      return;
    }

    setLoading(true);
    try {
      let uploadRes: DocumentUploadResult;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', docTitle);
        uploadRes = await uploadDocument(formData);
      } else {
        const formData = new FormData();
        formData.append('pasted_text', pastedText);
        formData.append('title', docTitle);
        uploadRes = await uploadDocument(formData);
      }

      setUploadResult(uploadRes);

      // Detect sensitive information
      const detectRes = await detectPrivacy(uploadRes.raw_text);
      setFindings(detectRes.findings);

      // Apply initial redaction preview
      const redactRes = await applyRedactions(uploadRes.raw_text, detectRes.findings);
      setSanitizedText(redactRes.sanitized_text);
      setContentHash(redactRes.content_hash);

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to process document.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle finding redaction status
  const handleToggleFinding = async (index: number) => {
    const updated = [...findings];
    updated[index].is_redacted = !updated[index].is_redacted;
    setFindings(updated);

    if (uploadResult) {
      const redactRes = await applyRedactions(uploadResult.raw_text, updated);
      setSanitizedText(redactRes.sanitized_text);
      setContentHash(redactRes.content_hash);
      // Reset consent if text changed
      setConsentGranted(false);
      setSecondScanResult(null);
    }
  };

  // Add custom term to detect
  const handleAddCustomTerm = async () => {
    if (!customTerm.trim() || !uploadResult) return;
    setLoading(true);
    try {
      const detectRes = await detectPrivacy(uploadResult.raw_text, [customTerm.trim()]);
      setFindings(detectRes.findings);
      const redactRes = await applyRedactions(uploadResult.raw_text, detectRes.findings);
      setSanitizedText(redactRes.sanitized_text);
      setContentHash(redactRes.content_hash);
      setCustomTerm('');
    } catch (err: any) {
      setError(err.message || 'Custom redaction failed.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 -> STEP 3: Run Second Scan
  const handleProceedToConsent = async () => {
    setError(null);
    setLoading(true);
    try {
      const scanRes = await runSecondScan(sanitizedText);
      setSecondScanResult(scanRes);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Second scan validation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Grant affirmative consent
  const handleConfirmConsent = async () => {
    if (!uploadResult) return;
    setError(null);
    setLoading(true);
    try {
      const res = await grantConsent({
        version_id: uploadResult.version_id,
        content_hash: contentHash,
        user_affirmation: true,
        destination_service: 'Legaly-AI-Engine',
        purpose: 'Document Plain-Language Simplification and Clause Analysis'
      });
      setConsentId(res.consent_id);
      setConsentGranted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to grant consent.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 -> STEP 4: Run Analysis
  const handleRunAnalysis = async () => {
    if (!uploadResult || !consentGranted) {
      setError('Cannot analyze: Affirmative consent must be granted first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const analysisRes = await analyzeDocument({
        version_id: uploadResult.version_id,
        content_hash: contentHash,
        sanitized_text: sanitizedText,
        document_type: 'agreement',
      });
      setAnalysis(analysisRes);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Analysis processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header and Step Indicators */}
        <div className="pb-6 border-b border-[#E1E6E2]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#203D35] flex items-center justify-center text-[#DDEBE5]">
                  <FileText className="w-4 h-4" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-[#203D35]">Document Simplifier</h1>
              </div>
              <p className="text-xs text-[#64716B] mt-1">
                End-to-end privacy redaction, cryptographic consent authorization, and plain-language clause analysis.
              </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? 'bg-[#203D35] text-white' : 'bg-[#EAF3EF] text-[#203D35]'}`}>
                1. Upload
              </span>
              <span>→</span>
              <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? 'bg-[#203D35] text-white' : 'bg-[#EAF3EF] text-[#203D35]'}`}>
                2. Redaction Review
              </span>
              <span>→</span>
              <span className={`px-2.5 py-1 rounded-lg ${step === 3 ? 'bg-[#203D35] text-white' : 'bg-[#EAF3EF] text-[#203D35]'}`}>
                3. Consent Gate
              </span>
              <span>→</span>
              <span className={`px-2.5 py-1 rounded-lg ${step === 4 ? 'bg-[#203D35] text-white' : 'bg-[#EAF3EF] text-[#203D35]'}`}>
                4. Analysis
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: UPLOAD / PASTE / 1-CLICK FIXTURE */}
        {step === 1 && (
          <div className="py-8 space-y-8 max-w-4xl mx-auto">
            
            {/* Quick 1-click Synthetic Documents */}
            <div className="bg-white p-5 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#203D35] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#237A52]" />
                  1-Click Synthetic Test Fixtures (Fictional Indian Documents)
                </span>
                <span className="text-[11px] text-[#64716B]">Safe for hackathon demo testing</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => loadFixture('rental')}
                  className="p-3 text-left bg-[#FAF9F5] hover:bg-[#EAF3EF] border border-[#E1E6E2] rounded-xl text-xs transition"
                >
                  <strong className="block text-[#203D35]">Residential Rental Agreement</strong>
                  <span className="text-[11px] text-[#64716B]">Bengaluru, Aadhaar, Security Deposit</span>
                </button>
                <button
                  onClick={() => loadFixture('employment')}
                  className="p-3 text-left bg-[#FAF9F5] hover:bg-[#EAF3EF] border border-[#E1E6E2] rounded-xl text-xs transition"
                >
                  <strong className="block text-[#203D35]">Employment & Non-Compete</strong>
                  <span className="text-[11px] text-[#64716B]">IT Services, Salary, Section 27 Restraint</span>
                </button>
                <button
                  onClick={() => loadFixture('consumer')}
                  className="p-3 text-left bg-[#FAF9F5] hover:bg-[#EAF3EF] border border-[#E1E6E2] rounded-xl text-xs transition"
                >
                  <strong className="block text-[#203D35]">Defective Product Notice</strong>
                  <span className="text-[11px] text-[#64716B]">Smart TV Refund, Consumer Act Section 35</span>
                </button>
              </div>
            </div>

            {/* Upload or Paste */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#203D35] uppercase mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E1E6E2] rounded-lg text-xs font-medium text-[#203D35] focus:outline-none focus:ring-2 focus:ring-[#203D35]"
                />
              </div>

              {/* File upload drag zone */}
              <div className="border-2 border-dashed border-[#E1E6E2] rounded-xl p-6 text-center hover:border-[#203D35] transition bg-[#FAF9F5]">
                <Upload className="w-8 h-8 text-[#64716B] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#203D35]">
                  {selectedFile ? selectedFile.name : 'Upload PDF or DOCX (Max 10MB)'}
                </p>
                <p className="text-[11px] text-[#64716B] mt-0.5">
                  PyMuPDF and python-docx extract plain text locally
                </p>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-3 text-xs text-[#64716B]"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E1E6E2]"></div>
                <span className="flex-shrink mx-4 text-xs uppercase font-semibold text-[#64716B]">or paste text</span>
                <div className="flex-grow border-t border-[#E1E6E2]"></div>
              </div>

              {/* Paste textarea */}
              <div>
                <label className="block text-xs font-bold text-[#203D35] uppercase mb-1">
                  Pasted Agreement Text
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste clauses, lease terms, employment contracts, or notices here..."
                  className="w-full p-3 bg-[#FAF9F5] border border-[#E1E6E2] rounded-xl text-xs font-mono text-[#24352F] focus:outline-none focus:ring-2 focus:ring-[#203D35]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#64716B]">
                  🔒 PII is automatically scanned and prepared for redaction review in Step 2.
                </span>
                <button
                  onClick={handleProceedToRedaction}
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#203D35] text-white hover:bg-[#294B40] rounded-xl text-xs font-semibold shadow-subtle transition flex items-center gap-2"
                >
                  {loading ? 'Extracting & Scanning...' : 'Scan & Review Redactions'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PRIVACY & REDACTION REVIEW */}
        {step === 2 && uploadResult && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E1E6E2]">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#203D35]">
                  Step 2: Privacy Review & Redaction Control
                </h3>
                <p className="text-xs text-[#64716B]">
                  Detected {findings.length} sensitive item(s). Review each finding and customize replacements.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 border border-[#E1E6E2] rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToConsent}
                  disabled={loading}
                  className="px-5 py-2 bg-[#203D35] text-white hover:bg-[#294B40] rounded-lg text-xs font-semibold shadow-subtle flex items-center gap-1.5"
                >
                  Confirm Redactions & Verify Second Scan →
                </button>
              </div>
            </div>

            {/* Findings badges and toggles */}
            <div className="bg-white p-4 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#203D35]">
                Detected Sensitive Items:
              </span>
              <div className="flex flex-wrap gap-2">
                {findings.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleFinding(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center gap-2 transition ${
                      f.is_redacted
                        ? 'bg-[#DDEBE5] text-[#203D35] border-[#C5DDD3]'
                        : 'bg-stone-100 text-stone-500 border-stone-200 line-through'
                    }`}
                    title="Click to toggle redaction on/off"
                  >
                    <span className="text-[10px] uppercase font-bold opacity-75">{f.entity_type}:</span>
                    <span>{f.detected_text}</span>
                    <span className="text-[10px] bg-white/70 px-1 rounded">{f.placeholder}</span>
                  </button>
                ))}
              </div>

              {/* Add custom redaction */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={customTerm}
                  onChange={(e) => setCustomTerm(e.target.value)}
                  placeholder="Redact custom term (e.g. specific company or witness name)..."
                  className="p-2 bg-[#FAF9F5] border border-[#E1E6E2] rounded-lg text-xs w-72 focus:outline-none focus:ring-1 focus:ring-[#203D35]"
                />
                <button
                  onClick={handleAddCustomTerm}
                  className="px-3 py-2 bg-[#EAF3EF] text-[#203D35] hover:bg-[#DDEBE5] border border-[#C5DDD3] rounded-lg text-xs font-semibold"
                >
                  Add Custom Redaction
                </button>
              </div>
            </div>

            {/* Two-Panel Comparison: Original vs Redacted Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Panel */}
              <div className="bg-white rounded-2xl border border-[#E1E6E2] shadow-subtle overflow-hidden">
                <div className="bg-stone-100 px-4 py-2.5 border-b border-[#E1E6E2] flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span>Raw Extracted Document</span>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {uploadResult.char_count} chars
                  </span>
                </div>
                <div className="p-4 text-xs font-mono text-stone-700 h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed bg-[#FCFCFB]">
                  {uploadResult.raw_text}
                </div>
              </div>

              {/* Sanitized Panel */}
              <div className="bg-white rounded-2xl border border-[#203D35]/30 shadow-subtle overflow-hidden">
                <div className="bg-[#203D35] px-4 py-2.5 text-white flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-4 h-4 text-[#DDEBE5]" />
                    <span>Sanitized Content Preview</span>
                  </div>
                  <span className="text-[10px] text-[#DDEBE5] font-mono">
                    SHA256: {contentHash.substring(0, 12)}...
                  </span>
                </div>
                <div className="p-4 text-xs font-mono text-[#24352F] h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed bg-[#FAF9F5]">
                  {sanitizedText}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SECOND SCAN VERIFICATION & CRYPTOGRAPHIC CONSENT GATE */}
        {step === 3 && uploadResult && secondScanResult && (
          <div className="py-8 max-w-3xl mx-auto space-y-6">
            
            {/* Second Scan Verification Banner */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${secondScanResult.is_clean ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {secondScanResult.is_clean ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#203D35]">
                    Second Scan Privacy Verification
                  </h3>
                  <p className="text-xs text-[#64716B]">
                    {secondScanResult.message}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E1E6E2] text-xs font-mono space-y-1">
                <div><strong>Target Version ID:</strong> {uploadResult.version_id}</div>
                <div><strong>Cryptographic Content Hash:</strong> {contentHash}</div>
                <div><strong>Residual Findings:</strong> {secondScanResult.residual_count}</div>
              </div>
            </div>

            {/* Affirmative Consent Card */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#203D35] shadow-elevated space-y-5">
              <div className="flex items-center gap-2 text-[#203D35]">
                <Lock className="w-5 h-5 text-[#203D35]" />
                <h3 className="font-heading font-bold text-lg">
                  Explicit Backend Processing Consent
                </h3>
              </div>

              <div className="space-y-3 text-xs text-[#24352F] leading-relaxed">
                <p>
                  In accordance with the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> principles, 
                  your document will be analyzed by the legal engine using <strong>ONLY the sanitized text</strong> previewed above.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#64716B]">
                  <li>Raw names, Aadhaar numbers, PAN cards, and bank account details have been scrubbed.</li>
                  <li>Consent is cryptographically bound to hash <code className="bg-[#DDEBE5] text-[#203D35] px-1 rounded">{contentHash.substring(0, 16)}...</code>.</li>
                  <li>If you modify any text or redaction, this consent will be automatically invalidated.</li>
                  <li>Zero-knowledge ephemeral processing: Data is not retained for AI training.</li>
                </ul>
              </div>

              {/* Consent checkbox / confirmation */}
              <div className="p-4 rounded-xl bg-[#EAF3EF] border border-[#C5DDD3] flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#203D35] block">
                    {consentGranted ? '✓ Affirmative Consent Recorded' : 'Grant Processing Authorization'}
                  </span>
                  <span className="text-[11px] text-[#64716B]">
                    {consentGranted ? `Consent ID: ${consentId}` : 'Click to bind authorization to this content hash'}
                  </span>
                </div>
                {!consentGranted ? (
                  <button
                    onClick={handleConfirmConsent}
                    disabled={loading}
                    className="px-4 py-2 bg-[#203D35] text-white hover:bg-[#294B40] rounded-lg text-xs font-semibold shadow-subtle transition"
                  >
                    {loading ? 'Authorizing...' : 'I Agree & Grant Consent'}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-[#237A52] bg-white px-3 py-1.5 rounded-lg border border-[#C5DDD3]">
                    Authorized ✓
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-[#64716B] hover:text-[#203D35]"
                >
                  ← Edit Redactions
                </button>
                <button
                  onClick={handleRunAnalysis}
                  disabled={!consentGranted || loading}
                  className="px-6 py-2.5 bg-[#203D35] text-white hover:bg-[#294B40] disabled:bg-[#8A9690] rounded-xl text-xs font-semibold shadow-subtle transition flex items-center gap-2"
                >
                  {loading ? 'Analyzing Sanitized Clauses...' : 'Run Plain-Language Analysis'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: STRUCTURED ANALYSIS RESULTS */}
        {step === 4 && analysis && (
          <div className="py-8 space-y-8">
            {/* Top overview card */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E1E6E2]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#237A52] bg-[#EAF3EF] px-2 py-0.5 rounded">
                    Analysis Completed
                  </span>
                  <h2 className="font-heading text-xl font-bold text-[#203D35] mt-1">{docTitle}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setStep(1);
                      setAnalysis(null);
                      setConsentGranted(false);
                    }}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium"
                  >
                    Analyze Another Document
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#24352F] leading-relaxed">
                <div>
                  <strong className="block text-[#203D35] font-heading font-bold mb-1">Document Overview:</strong>
                  <p>{analysis.overview}</p>
                </div>
                <div>
                  <strong className="block text-[#203D35] font-heading font-bold mb-1">Plain-Language Summary:</strong>
                  <p className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E1E6E2]">{analysis.plain_summary}</p>
                </div>
              </div>
            </div>

            {/* Important Clauses */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
              <h3 className="font-heading font-bold text-base text-[#203D35]">
                Key Clauses & What They Mean In Everyday Terms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.clause_explanations.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E1E6E2] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#203D35] font-heading">{c.clause_title}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        c.impact_level === 'high' ? 'bg-red-100 text-red-800' : 'bg-[#DDEBE5] text-[#203D35]'
                      }`}>
                        {c.impact_level} impact
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded border border-[#E1E6E2] font-mono text-[11px] text-[#64716B]">
                      "{c.raw_clause_text}"
                    </div>
                    <p className="text-[#24352F] font-medium leading-relaxed">
                      💡 <strong>Plain English:</strong> {c.plain_explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates & Deadlines */}
            <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-[#203D35]">
                <Calendar className="w-5 h-5 text-[#203D35]" />
                <h3 className="font-heading font-bold text-base">
                  Extracted Dates, Notice Windows & Deadlines
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.document_deadlines.map((dl, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E1E6E2] text-xs space-y-2">
                    <span className="font-bold text-[#203D35] block">{dl.deadline_title}</span>
                    <div className="p-2 rounded bg-white border border-[#E1E6E2] font-semibold text-[#294B40]">
                      {dl.explicit_date_or_duration}
                    </div>
                    <p className="text-[11px] text-[#64716B]">
                      <strong>Consequence:</strong> {dl.consequence_of_missing}
                    </p>
                    <span className="inline-block text-[10px] text-[#203D35] bg-[#DDEBE5] px-2 py-0.5 rounded">
                      {dl.is_inferred ? 'Inferred Window' : 'Explicit Contract Term'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Potential Concerns & Questions for Lawyer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Potential Concerns */}
              <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-heading font-bold text-base text-[#203D35]">Potential Concerns & Risks</h3>
                </div>
                <div className="space-y-3">
                  {analysis.potential_concerns.map((pc, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                      <strong className="block text-amber-950 font-bold">{pc.issue_title}</strong>
                      <p className="text-amber-900">{pc.concern_text}</p>
                      {pc.legal_basis && (
                        <p className="text-[11px] text-amber-800">
                          <strong>Legal basis:</strong> {pc.legal_basis}
                        </p>
                      )}
                      <div className="p-2 bg-white rounded border border-amber-200 text-[11px] text-[#203D35]">
                        <strong>Suggested ask:</strong> "{pc.suggested_question}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions for Lawyer & Next Steps */}
              <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
                <div className="flex items-center gap-2 text-[#203D35]">
                  <HelpCircle className="w-5 h-5 text-[#203D35]" />
                  <h3 className="font-heading font-bold text-base">Questions to Ask Before Signing</h3>
                </div>
                <ul className="space-y-2 text-xs text-[#24352F]">
                  {analysis.questions_for_lawyer.map((q, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E1E6E2] flex items-start gap-2">
                      <span className="font-bold text-[#203D35]">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>

                <h4 className="font-heading font-bold text-xs text-[#203D35] uppercase pt-2">
                  Suggested Action Items:
                </h4>
                <ul className="space-y-1.5 text-xs text-[#64716B]">
                  {analysis.suggested_next_steps.map((st, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-[#F3F5F3] border border-[#E1E6E2] text-[11px] text-[#64716B]">
              {analysis.disclaimer}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
