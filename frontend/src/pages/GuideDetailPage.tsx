import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchGuideBySlug } from '../api/client';
import { KnowledgeArticle } from '../types';
import { 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink, 
  HelpCircle, 
  ListChecks, 
  Scale, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [guide, setGuide] = useState<KnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FAQ accordion open states
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchGuideBySlug(slug)
      .then((data) => {
        setGuide(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Guide not found.');
        setLoading(false);
      });
  }, [slug]);

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] py-16 text-center text-xs text-[#64716B]">
        Loading legal guide...
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] py-16">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-xl font-heading font-bold text-[#203D35]">Guide Not Found</h2>
          <p className="text-xs text-[#64716B]">The requested legal guide does not exist or has been moved.</p>
          <Link
            to="/knowledge"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#203D35] text-white rounded-lg text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Knowledge Centre
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#203D35] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Knowledge Centre
        </Link>

        {/* Title Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#203D35] bg-[#DDEBE5] px-2.5 py-0.5 rounded">
              {guide.category}
            </span>
            {guide.verified_at && (
              <span className="text-xs text-[#237A52] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified: {guide.verified_at}
              </span>
            )}
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#203D35] leading-tight">
            {guide.title}
          </h1>

          <p className="text-sm text-[#24352F] leading-relaxed border-t border-[#E1E6E2] pt-4">
            {guide.plain_language_intro}
          </p>
        </div>

        {/* Key Statutory Points */}
        <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
          <h2 className="font-heading text-lg font-bold text-[#203D35] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#237A52]" />
            Key Rights & Legal Points to Remember
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#24352F]">
            {guide.key_points.map((pt, idx) => (
              <li key={idx} className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E6E2] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#DDEBE5] text-[#203D35] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Everyday Real-World Examples */}
        {guide.everyday_examples && (
          <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-3">
            <h2 className="font-heading text-lg font-bold text-[#203D35] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#203D35]" />
              Everyday Practical Example
            </h2>
            <div className="p-4 rounded-xl bg-[#EAF3EF] border border-[#C5DDD3] text-xs sm:text-sm text-[#203D35] leading-relaxed">
              {guide.everyday_examples}
            </div>
          </div>
        )}

        {/* Action Checklist */}
        {guide.practical_checklist && guide.practical_checklist.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
            <h2 className="font-heading text-lg font-bold text-[#203D35] flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-[#203D35]" />
              Practical Action Checklist
            </h2>
            <div className="space-y-2 text-xs sm:text-sm">
              {guide.practical_checklist.map((chk, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E1E6E2] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0 mt-0.5" />
                  <span className="text-[#24352F]">{chk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequently Asked Questions */}
        {guide.faqs && guide.faqs.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
            <h2 className="font-heading text-lg font-bold text-[#203D35] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#203D35]" />
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-2">
              {guide.faqs.map((faq, idx) => {
                const isOpen = !!openFaq[idx];
                return (
                  <div key={idx} className="rounded-xl border border-[#E1E6E2] overflow-hidden">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 text-left bg-[#FAF9F5] hover:bg-[#EAF3EF] text-xs sm:text-sm font-semibold text-[#203D35] flex items-center justify-between transition"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white text-xs text-[#64716B] leading-relaxed border-t border-[#E1E6E2]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-[#F3F5F3] border border-[#E1E6E2] text-[11px] text-[#64716B]">
          {guide.disclaimer}
        </div>

      </div>
    </div>
  );
};
