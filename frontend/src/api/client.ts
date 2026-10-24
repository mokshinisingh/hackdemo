import {
  Jurisdiction,
  AssistantResponse,
  SensitiveFinding,
  DocumentUploadResult,
  DocumentAnalysisResult,
  CompareResult,
  KnowledgeArticle,
  LegalAidResource,
  ActionChecklist,
} from '../types';

const API_BASE = '/api';

export async function fetchJurisdictions(): Promise<Jurisdiction[]> {
  const res = await fetch(`${API_BASE}/jurisdictions`);
  if (!res.ok) throw new Error('Failed to load jurisdictions');
  return res.json();
}

export async function askAssistant(params: {
  query_text: string;
  jurisdiction_code?: string;
  category?: string;
  session_id?: string;
}): Promise<AssistantResponse> {
  const res = await fetch(`${API_BASE}/legal-assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to generate assistant response' }));
    throw new Error(err.detail || 'Assistant request failed');
  }
  return res.json();
}

export async function detectPrivacy(text: string, custom_terms?: string[]): Promise<{
  findings_count: number;
  findings: SensitiveFinding[];
  raw_content_hash: string;
}> {
  const res = await fetch(`${API_BASE}/privacy/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, custom_terms }),
  });
  if (!res.ok) throw new Error('Sensitive information detection failed');
  return res.json();
}

export async function applyRedactions(
  text: string,
  findings: SensitiveFinding[],
  custom_replacements?: Record<string, string>
): Promise<{
  sanitized_text: string;
  content_hash: string;
  redactions_applied: number;
}> {
  const res = await fetch(`${API_BASE}/privacy/redact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, findings, custom_replacements }),
  });
  if (!res.ok) throw new Error('Redaction processing failed');
  return res.json();
}

export async function runSecondScan(sanitized_text: string): Promise<{
  is_clean: boolean;
  residual_count: number;
  residual_findings: SensitiveFinding[];
  message: string;
}> {
  const res = await fetch(`${API_BASE}/privacy/second-scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sanitized_text }),
  });
  if (!res.ok) throw new Error('Verification second scan failed');
  return res.json();
}

export async function grantConsent(params: {
  version_id: string;
  content_hash: string;
  user_affirmation: boolean;
  destination_service?: string;
  purpose?: string;
  session_id?: string;
}): Promise<{
  consent_id: string;
  version_id: string;
  content_hash: string;
  is_valid: boolean;
  granted_at: string;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/privacy/consent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to record consent' }));
    throw new Error(err.detail || 'Consent recording failed');
  }
  return res.json();
}

export async function uploadDocument(formData: FormData): Promise<DocumentUploadResult> {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Document upload failed' }));
    throw new Error(err.detail || 'Document upload failed');
  }
  return res.json();
}

export async function analyzeDocument(params: {
  version_id: string;
  content_hash: string;
  sanitized_text: string;
  document_type?: string;
}): Promise<DocumentAnalysisResult> {
  const res = await fetch(`${API_BASE}/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed or consent violation' }));
    throw new Error(err.detail || 'Analysis failed');
  }
  return res.json();
}

export async function compareDocuments(params: {
  source_text: string;
  target_text: string;
  source_title?: string;
  target_title?: string;
}): Promise<CompareResult> {
  const res = await fetch(`${API_BASE}/documents/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Contract comparison failed');
  return res.json();
}

export async function fetchKnowledgeGuides(category?: string, query?: string): Promise<KnowledgeArticle[]> {
  const url = new URL(`${window.location.origin}${API_BASE}/legal-guides`);
  if (category) url.searchParams.set('category', category);
  if (query) url.searchParams.set('q', query);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to load legal guides');
  return res.json();
}

export async function fetchGuideBySlug(slug: string): Promise<KnowledgeArticle> {
  const res = await fetch(`${API_BASE}/legal-guides/${slug}`);
  if (!res.ok) throw new Error('Legal guide not found');
  return res.json();
}

export async function fetchResources(resource_type?: string): Promise<LegalAidResource[]> {
  const url = new URL(`${window.location.origin}${API_BASE}/resources`);
  if (resource_type) url.searchParams.set('resource_type', resource_type);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to load legal aid resources');
  return res.json();
}

export async function fetchChecklists(): Promise<ActionChecklist[]> {
  const res = await fetch(`${API_BASE}/checklists`);
  if (!res.ok) throw new Error('Failed to load checklists');
  return res.json();
}
