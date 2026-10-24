import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { askAssistant } from '../api/client';
import { AssistantResponse } from '../types';
import { JurisdictionSelector } from '../components/common/JurisdictionSelector';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Scale, 
  ShieldAlert, 
  Info,
  CornerDownRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  response?: AssistantResponse;
  timestamp: string;
}

export const AssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [jurisdiction, setJurisdiction] = useState(
    localStorage.getItem('preferred_jurisdiction') || 'IN-CENTRAL'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('assistant_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Track completed steps per response
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('completed_action_steps');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleStep = (stepKey: string) => {
    const updated = { ...completedSteps, [stepKey]: !completedSteps[stepKey] };
    setCompletedSteps(updated);
    localStorage.setItem('completed_action_steps', JSON.stringify(updated));
  };

  useEffect(() => {
    sessionStorage.setItem('assistant_history', JSON.stringify(messages));
  }, [messages]);

  // If initialQuery is provided in URL, execute query automatically once
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await askAssistant({
        query_text: text,
        jurisdiction_code: jurisdiction,
        category: 'general',
      });

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        response: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Failed to process legal query.');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('assistant_history');
  };

  const suggestedQuestions = [
    'Can my landlord evict me without 30 days written notice in Karnataka?',
    'What are my rights if my employer refuses to pay my full & final settlement?',
    'How do I file a consumer complaint for a defective product under CPA 2019?',
    'Is a 1-year non-compete clause in my offer letter valid under Indian law?',
    'What should I do if my security deposit is not refunded within 15 days?',
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6E2]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#203D35] flex items-center justify-center text-[#DDEBE5]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[#203D35]">AI Legal Assistant</h1>
            </div>
            <p className="text-xs text-[#64716B] mt-1">
              Ask plain-language questions grounded in Indian statutes and verified legal aid sources.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <JurisdictionSelector selectedCode={jurisdiction} onSelect={setJurisdiction} />
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-3 py-2 bg-white text-stone-600 border border-[#E1E6E2] rounded-lg text-xs hover:bg-stone-50 hover:text-red-700 transition flex items-center gap-1.5 shadow-subtle"
                title="Clear Session Conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Chat / Message Container */}
        <div className="py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E1E6E2] p-8 text-center shadow-subtle space-y-6 max-w-2xl mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF3EF] text-[#203D35] flex items-center justify-center mx-auto">
                <Scale className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-lg font-bold text-[#203D35]">
                  What legal topic can we explain for you today?
                </h2>
                <p className="text-xs text-[#64716B] max-w-md mx-auto">
                  Type your situation in plain words. We structure answers into simple explanations, applicable Indian statutes, conditions, practical next steps, and official sources.
                </p>
              </div>

              {/* Suggestions */}
              <div className="text-left space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-[#64716B] uppercase tracking-wider block">
                  Suggested Questions:
                </span>
                <div className="space-y-1.5">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="w-full text-left p-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#EAF3EF] border border-[#E1E6E2] text-xs text-[#24352F] transition flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <CornerDownRight className="w-3.5 h-3.5 text-[#64716B] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.sender === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-[#203D35] text-white p-4 rounded-2xl rounded-tr-sm max-w-2xl text-xs sm:text-sm leading-relaxed shadow-subtle">
                      <p>{msg.text}</p>
                      <span className="block text-[10px] text-[#DDEBE5]/70 text-right mt-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ) : msg.response ? (
                  <div className="bg-white rounded-2xl border border-[#E1E6E2] p-6 shadow-subtle space-y-6">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E1E6E2] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#237A52]"></span>
                        <span className="font-semibold text-[#203D35]">Verified Legal Response</span>
                        <span className="bg-[#DDEBE5] text-[#203D35] px-2 py-0.5 rounded text-[10px] font-mono">
                          {msg.response.ai_model}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#64716B]">{msg.timestamp}</span>
                    </div>

                    {/* Section 1: Simple Explanation */}
                    <div className="space-y-2">
                      <h3 className="font-heading text-sm font-bold text-[#203D35] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#DDEBE5] text-[#203D35] text-xs flex items-center justify-center font-bold">1</span>
                        Plain-Language Explanation
                      </h3>
                      <p className="text-xs sm:text-sm text-[#24352F] leading-relaxed pl-7">
                        {msg.response.simple_explanation}
                      </p>
                    </div>

                    {/* Section 2: Statutory Information */}
                    <div className="space-y-2">
                      <h3 className="font-heading text-sm font-bold text-[#203D35] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#DDEBE5] text-[#203D35] text-xs flex items-center justify-center font-bold">2</span>
                        Applicable Indian Statutory Law
                      </h3>
                      <div className="pl-7 text-xs sm:text-sm text-[#24352F] leading-relaxed bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E1E6E2]">
                        {msg.response.legal_information}
                      </div>
                    </div>

                    {/* Section 3: Conditions & Exceptions */}
                    <div className="space-y-2">
                      <h3 className="font-heading text-sm font-bold text-[#203D35] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#DDEBE5] text-[#203D35] text-xs flex items-center justify-center font-bold">3</span>
                        Important Conditions & Jurisdictional Exceptions
                      </h3>
                      <p className="text-xs sm:text-sm text-[#64716B] leading-relaxed pl-7">
                        {msg.response.conditions_and_exceptions}
                      </p>
                    </div>

                    {/* Section 4: Practical Next Steps Checklist */}
                    {msg.response.next_steps && msg.response.next_steps.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h3 className="font-heading text-sm font-bold text-[#203D35] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#DDEBE5] text-[#203D35] text-xs flex items-center justify-center font-bold">4</span>
                          Practical Next Steps & Action Checklist
                        </h3>
                        <div className="pl-7 space-y-2.5">
                          {msg.response.next_steps.map((step, sIdx) => {
                            const stepKey = `${msg.id}-step-${sIdx}`;
                            const isDone = !!completedSteps[stepKey];
                            return (
                              <div
                                key={sIdx}
                                onClick={() => toggleStep(stepKey)}
                                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                                  isDone
                                    ? 'bg-[#EAF3EF] border-[#C5DDD3]'
                                    : 'bg-[#FAF9F5] border-[#E1E6E2] hover:border-[#203D35]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => {}}
                                  className="mt-1 h-4 w-4 rounded text-[#203D35] focus:ring-[#203D35] cursor-pointer"
                                />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className={`text-xs font-bold ${isDone ? 'line-through text-[#64716B]' : 'text-[#203D35]'}`}>
                                      {step.title}
                                    </h4>
                                    {step.is_verified_requirement && (
                                      <span className="text-[10px] bg-[#DDEBE5] text-[#203D35] font-semibold px-1.5 py-0.2 rounded">
                                        Verified Requirement
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#24352F]">{step.description}</p>
                                  {step.required_information && (
                                    <p className="text-[11px] text-[#64716B]">
                                      <strong>Documents needed:</strong> {step.required_information}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section 5: Grounded Statutory Sources */}
                    {msg.response.sources && msg.response.sources.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h3 className="font-heading text-sm font-bold text-[#203D35] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#DDEBE5] text-[#203D35] text-xs flex items-center justify-center font-bold">5</span>
                          Statutory Sources & Authoritative Citations
                        </h3>
                        <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.response.sources.map((src, srcIdx) => (
                            <div key={srcIdx} className="p-3 bg-[#FAF9F5] border border-[#E1E6E2] rounded-xl text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#203D35]">{src.act_title}</span>
                                {src.is_verified && (
                                  <span className="text-[10px] text-[#237A52] font-semibold">✓ Verified</span>
                                )}
                              </div>
                              <p className="font-semibold text-[#294B40] text-[11px]">
                                {src.section_number}: {src.section_title}
                              </p>
                              <p className="text-[11px] text-[#64716B] leading-snug">
                                {src.plain_summary}
                              </p>
                              {src.official_url && (
                                <a
                                  href={src.official_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-[#203D35] underline hover:text-[#294B40] pt-1"
                                >
                                  Official Gazette Portal <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 6: When to seek counsel */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldAlert className="w-4 h-4 text-amber-700" />
                        <span>When to Seek Formal Legal Representation:</span>
                      </div>
                      <p className="leading-relaxed">
                        {msg.response.professional_help_advice}
                      </p>
                    </div>

                    {/* Disclaimer */}
                    <div className="text-[11px] text-[#64716B] pt-2 border-t border-[#E1E6E2]">
                      {msg.response.disclaimer}
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}

          {/* Loading state */}
          {loading && (
            <div className="p-6 rounded-2xl bg-white border border-[#E1E6E2] shadow-subtle flex items-center gap-3 text-xs text-[#203D35]">
              <div className="w-5 h-5 border-2 border-[#203D35] border-t-transparent rounded-full animate-spin"></div>
              <span>Grounding your query in Indian statutory records and legal provisions...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => handleSend()}
                className="px-2.5 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="sticky bottom-4 bg-[#FAF9F5]/90 backdrop-blur p-2 rounded-2xl border border-[#E1E6E2] shadow-modal">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Ask a question about tenant rights, employment settlement, consumer complaints, or contracts..."
              className="w-full p-3 bg-white border border-[#E1E6E2] rounded-xl text-xs sm:text-sm text-[#24352F] focus:outline-none focus:ring-2 focus:ring-[#203D35] resize-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-3 bg-[#203D35] text-white hover:bg-[#294B40] disabled:bg-[#8A9690] rounded-xl shadow-subtle transition flex items-center justify-center shrink-0"
              title="Submit Query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="px-2 pt-1.5 flex items-center justify-between text-[10px] text-[#64716B]">
            <span>Press Enter to send, Shift+Enter for new line.</span>
            <span>Educational Awareness • Not Formal Legal Advice</span>
          </div>
        </div>

      </div>
    </div>
  );
};
