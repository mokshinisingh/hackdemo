export interface Jurisdiction {
  id: string;
  code: string;
  name: string;
  country: string;
  state_or_region: string | null;
  is_active: boolean;
}

export interface NextStep {
  title: string;
  description: string;
  rationale?: string;
  required_information?: string;
  is_completed?: boolean;
  is_verified_requirement: boolean;
}

export interface SourceCitation {
  act_title: string;
  short_title: string;
  citation?: string;
  section_number: string;
  section_title: string;
  official_url: string;
  issuing_organization: string;
  plain_summary: string;
  content_snippet: string;
  is_verified: boolean;
}

export interface LegalAidResource {
  id: string;
  name: string;
  organization: string;
  resource_type: string;
  official_url: string;
  contact_phone?: string;
  email?: string;
  address?: string;
  description: string;
  referral_reason?: string;
}

export interface AssistantResponse {
  query_id: string;
  simple_explanation: string;
  legal_information: string;
  conditions_and_exceptions: string;
  professional_help_advice: string;
  confidence_level: string;
  ai_model: string;
  disclaimer: string;
  next_steps: NextStep[];
  sources: SourceCitation[];
  resources: LegalAidResource[];
}

export interface SensitiveFinding {
  id?: string;
  entity_type: string;
  detected_text: string;
  start_offset: number;
  end_offset: number;
  confidence_score: number;
  is_redacted: boolean;
  placeholder: string;
  scan_stage: string;
}

export interface DocumentUploadResult {
  document_id: string;
  version_id: string;
  title: string;
  original_filename: string;
  page_count: number;
  char_count: number;
  raw_content_hash: string;
  raw_text: string;
}

export interface ClauseExplanation {
  clause_title: string;
  raw_clause_text: string;
  plain_explanation: string;
  category: string;
  impact_level: string;
}

export interface PotentialConcern {
  issue_title: string;
  concern_text: string;
  severity: string;
  suggested_question: string;
  legal_basis?: string;
}

export interface DocumentDeadline {
  deadline_title: string;
  explicit_date_or_duration: string;
  is_inferred: boolean;
  consequence_of_missing: string;
  reminder_suggested: boolean;
}

export interface DocumentAnalysisResult {
  analysis_id: string;
  version_id: string;
  overview: string;
  plain_summary: string;
  clause_explanations: ClauseExplanation[];
  potential_concerns: PotentialConcern[];
  document_deadlines: DocumentDeadline[];
  questions_for_lawyer: string[];
  suggested_next_steps: string[];
  disclaimer: string;
}

export interface CompareResult {
  summary_of_changes: string;
  diff_json: string;
  added_lines: number;
  removed_lines: number;
  modified_lines: number;
  payment_changes: string;
  termination_changes: string;
  notice_changes: string;
  liability_changes: string;
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  plain_language_intro: string;
  key_points: string[];
  everyday_examples: string;
  faqs: { question: string; answer: string }[];
  practical_checklist: string[];
  disclaimer: string;
  verified_at?: string;
  is_published: boolean;
}

export interface ActionChecklistItem {
  id: string;
  title: string;
  description: string;
  importance: string;
  law_reference: string;
}

export interface ActionChecklist {
  id: string;
  title: string;
  category: string;
  description: string;
  items: ActionChecklistItem[];
}
