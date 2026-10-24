import React, { useEffect, useState } from 'react';
import { fetchJurisdictions } from '../../api/client';
import { Jurisdiction } from '../../types';
import { MapPin } from 'lucide-react';

interface Props {
  selectedCode: string;
  onSelect: (code: string) => void;
  className?: string;
}

export const JurisdictionSelector: React.FC<Props> = ({ selectedCode, onSelect, className = '' }) => {
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJurisdictions()
      .then((data) => {
        setJurisdictions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load jurisdictions', err);
        // Fallback default list
        setJurisdictions([
          { id: '1', code: 'IN-CENTRAL', name: 'India (Central)', country: 'India', state_or_region: null, is_active: true },
          { id: '2', code: 'IN-KA', name: 'Karnataka', country: 'India', state_or_region: 'Karnataka', is_active: true },
          { id: '3', code: 'IN-MH', name: 'Maharashtra', country: 'India', state_or_region: 'Maharashtra', is_active: true },
          { id: '4', code: 'IN-DL', name: 'Delhi (NCT)', country: 'India', state_or_region: 'Delhi', is_active: true },
          { id: '5', code: 'IN-TN', name: 'Tamil Nadu', country: 'India', state_or_region: 'Tamil Nadu', is_active: true },
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <label htmlFor="jurisdiction-select" className="sr-only">Select Jurisdiction</label>
      <div className="absolute left-3 text-[#203D35] pointer-events-none">
        <MapPin className="w-4 h-4" />
      </div>
      <select
        id="jurisdiction-select"
        value={selectedCode}
        onChange={(e) => {
          onSelect(e.target.value);
          localStorage.setItem('preferred_jurisdiction', e.target.value);
        }}
        disabled={loading}
        className="pl-9 pr-8 py-2 bg-white border border-[#E1E6E2] rounded-lg text-xs font-medium text-[#203D35] focus:ring-2 focus:ring-[#203D35] focus:outline-none shadow-subtle cursor-pointer appearance-none"
      >
        {jurisdictions.map((j) => (
          <option key={j.code} value={j.code}>
            {j.name}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 pointer-events-none text-[#64716B] text-[10px]">
        ▼
      </div>
    </div>
  );
};
