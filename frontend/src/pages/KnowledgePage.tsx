import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchKnowledgeGuides } from '../api/client';
import { KnowledgeArticle } from '../types';
import { 
  BookOpen, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  ShieldCheck, 
  FileText, 
  Tag
} from 'lucide-react';

export const KnowledgePage: React.FC = () => {
  const [guides, setGuides] = useState<KnowledgeArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Tenant Rights',
    'Workplace Rights',
    'Consumer Protection',
    'Digital Safety',
    'Contract Basics',
  ];

  useEffect(() => {
    setLoading(true);
    fetchKnowledgeGuides(selectedCategory === 'All' ? undefined : selectedCategory, searchQuery)
      .then((data) => {
        setGuides(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E1E6E2]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#203D35] flex items-center justify-center text-[#DDEBE5]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[#203D35]">
                Legal Knowledge Centre
              </h1>
            </div>
            <p className="text-xs text-[#64716B] mt-1">
              Plain-language legal awareness guides, everyday examples, checklists, and statutory references.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#64716B] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, acts, topics..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E1E6E2] rounded-xl text-xs text-[#203D35] focus:outline-none focus:ring-2 focus:ring-[#203D35] shadow-subtle"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#203D35] text-white shadow-subtle'
                  : 'bg-white text-[#64716B] border border-[#E1E6E2] hover:bg-[#EAF3EF] hover:text-[#203D35]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Guides Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#64716B]">
            Loading legal knowledge guides...
          </div>
        ) : guides.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-[#E1E6E2] text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#64716B] mx-auto opacity-50" />
            <h3 className="font-heading font-bold text-base text-[#203D35]">No matching guides found</h3>
            <p className="text-xs text-[#64716B]">Try searching for other terms like 'tenant', 'salary', or 'consumer'.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                to={`/knowledge/${guide.slug}`}
                className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle hover:shadow-elevated hover:border-[#203D35] transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#203D35] bg-[#DDEBE5] px-2 py-0.5 rounded">
                      {guide.category}
                    </span>
                    {guide.verified_at && (
                      <span className="text-[#237A52] font-medium flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Verified {guide.verified_at}
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#203D35] group-hover:text-[#294B40] leading-snug">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-[#64716B] line-clamp-3 leading-relaxed">
                    {guide.plain_language_intro}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E1E6E2] flex items-center justify-between text-xs font-semibold text-[#203D35]">
                  <span>Read Complete Guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
