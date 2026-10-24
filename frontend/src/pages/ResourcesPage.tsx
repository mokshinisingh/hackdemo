import React, { useState, useEffect } from 'react';
import { fetchResources } from '../api/client';
import { LegalAidResource } from '../types';
import { 
  PhoneCall, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  Building2, 
  Mail, 
  MapPin, 
  Phone,
  Scale
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<LegalAidResource[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);

  const types = ['All', 'legal_aid', 'helpline', 'portal'];

  useEffect(() => {
    setLoading(true);
    fetchResources(selectedType === 'All' ? undefined : selectedType)
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedType]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="pb-6 border-b border-[#E1E6E2]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#203D35] flex items-center justify-center text-[#DDEBE5]">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-[#203D35]">
              Verified Legal Aid & Helplines Directory
            </h1>
          </div>
          <p className="text-xs text-[#64716B] mt-1">
            Free government legal consultation bodies, statutory helplines, e-Courts, and consumer dispute redressal portals.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                selectedType === t
                  ? 'bg-[#203D35] text-white shadow-subtle'
                  : 'bg-white text-[#64716B] border border-[#E1E6E2] hover:bg-[#EAF3EF] hover:text-[#203D35]'
              }`}
            >
              {t === 'legal_aid' ? 'Free Legal Aid' : t}
            </button>
          ))}
        </div>

        {/* Emergency Callout Card */}
        <div className="bg-[#203D35] text-white p-6 rounded-2xl shadow-elevated">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> National Statutory Helplines (Toll-Free)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-[#294B40] rounded-xl border border-[#203D35]">
              <span className="text-[11px] text-[#DDEBE5] block">NALSA Free Legal Aid</span>
              <strong className="text-lg font-mono text-white">15100</strong>
            </div>
            <div className="p-3 bg-[#294B40] rounded-xl border border-[#203D35]">
              <span className="text-[11px] text-[#DDEBE5] block">National Consumer Helpline</span>
              <strong className="text-lg font-mono text-white">1915</strong>
            </div>
            <div className="p-3 bg-[#294B40] rounded-xl border border-[#203D35]">
              <span className="text-[11px] text-[#DDEBE5] block">Citizen Cyber Fraud Reporting</span>
              <strong className="text-lg font-mono text-white">1930</strong>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#64716B]">Loading resources directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div
                key={res.id}
                className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle hover:border-[#203D35] transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#203D35] bg-[#DDEBE5] px-2 py-0.5 rounded uppercase">
                      {res.resource_type.replace('_', ' ')}
                    </span>
                    <span className="text-[#237A52] font-semibold text-[10px]">✓ Government Portal</span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#203D35]">
                    {res.name}
                  </h3>

                  <p className="text-[11px] font-semibold text-[#294B40]">
                    {res.organization}
                  </p>

                  <p className="text-xs text-[#64716B] leading-relaxed">
                    {res.description}
                  </p>

                  {res.contact_phone && (
                    <div className="flex items-center gap-2 text-xs text-[#24352F]">
                      <Phone className="w-3.5 h-3.5 text-[#203D35]" />
                      <span className="font-mono">{res.contact_phone}</span>
                    </div>
                  )}

                  {res.email && (
                    <div className="flex items-center gap-2 text-xs text-[#24352F]">
                      <Mail className="w-3.5 h-3.5 text-[#203D35]" />
                      <span className="font-mono text-[11px]">{res.email}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E1E6E2]">
                  <a
                    href={res.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#203D35] hover:underline"
                  >
                    Visit Official Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
