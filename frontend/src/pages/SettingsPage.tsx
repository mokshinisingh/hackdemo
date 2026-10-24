import React, { useState, useEffect } from 'react';
import { JurisdictionSelector } from '../components/common/JurisdictionSelector';
import { 
  Settings, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  Moon, 
  Sun, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [jurisdiction, setJurisdiction] = useState(
    localStorage.getItem('preferred_jurisdiction') || 'IN-CENTRAL'
  );
  const [reducedMotion, setReducedMotion] = useState(
    localStorage.getItem('pref_reduced_motion') === 'true'
  );
  const [highContrast, setHighContrast] = useState(
    localStorage.getItem('pref_high_contrast') === 'true'
  );
  const [fontSize, setFontSize] = useState(
    localStorage.getItem('pref_font_size') || 'normal'
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    localStorage.setItem('preferred_jurisdiction', jurisdiction);
    localStorage.setItem('pref_reduced_motion', String(reducedMotion));
    localStorage.setItem('pref_high_contrast', String(highContrast));
    localStorage.setItem('pref_font_size', fontSize);

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const clearAllData = () => {
    if (window.confirm('Clear all local session documents, chat history, and preferences?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="pb-6 border-b border-[#E1E6E2]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#203D35] flex items-center justify-center text-[#DDEBE5]">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-[#203D35]">
              Settings & Accessibility
            </h1>
          </div>
          <p className="text-xs text-[#64716B] mt-1">
            Configure your default legal jurisdiction, accessibility settings, and client privacy retention.
          </p>
        </div>

        {savedNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        {/* Section 1: Default Jurisdiction */}
        <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
          <h2 className="font-heading text-base font-bold text-[#203D35]">
            Default Legal Jurisdiction
          </h2>
          <p className="text-xs text-[#64716B]">
            Determines whether statutory queries default to Central Indian Acts (e.g., CPA 2019, Model Tenancy Act) or specific state laws (e.g. Karnataka, Maharashtra).
          </p>
          <JurisdictionSelector selectedCode={jurisdiction} onSelect={setJurisdiction} />
        </div>

        {/* Section 2: Accessibility Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
          <h2 className="font-heading text-base font-bold text-[#203D35]">
            WCAG Accessibility & Visual Comfort
          </h2>
          
          <div className="space-y-4 text-xs">
            {/* Reduced motion */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#E1E6E2]">
              <div>
                <strong className="block text-[#203D35]">Reduce Motion & Micro-Animations</strong>
                <span className="text-[#64716B]">Minimizes transition movement for vestibular comfort.</span>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="h-4 w-4 rounded text-[#203D35] focus:ring-[#203D35] cursor-pointer"
              />
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#E1E6E2]">
              <div>
                <strong className="block text-[#203D35]">High Contrast Mode</strong>
                <span className="text-[#64716B]">Increases border sharpness and text contrast to WCAG AAA.</span>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-4 w-4 rounded text-[#203D35] focus:ring-[#203D35] cursor-pointer"
              />
            </div>

            {/* Font size */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#E1E6E2]">
              <div>
                <strong className="block text-[#203D35]">Reading Text Size</strong>
                <span className="text-[#64716B]">Adjusts document viewer and assistant body text sizing.</span>
              </div>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="p-1.5 bg-white border border-[#E1E6E2] rounded-lg text-xs text-[#203D35]"
              >
                <option value="normal">Normal (14px-16px)</option>
                <option value="large">Comfortable (18px)</option>
                <option value="extra-large">High Legibility (20px)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Data Hygiene & Local Session Reset */}
        <div className="bg-white p-6 rounded-2xl border border-[#E1E6E2] shadow-subtle space-y-4">
          <div className="flex items-center gap-2 text-red-800">
            <Trash2 className="w-5 h-5" />
            <h2 className="font-heading text-base font-bold">Privacy Hygiene & Data Wipe</h2>
          </div>
          <p className="text-xs text-[#64716B] leading-relaxed">
            By default, all uploaded documents, redacted drafts, and assistant history are stored ephemerally in your browser session and wiped automatically. 
            Click below to immediately purge all browser storage and cookies.
          </p>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-semibold transition"
          >
            Purge All Local Session Storage
          </button>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#203D35] text-white hover:bg-[#294B40] rounded-xl text-xs font-semibold shadow-subtle transition"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
};
