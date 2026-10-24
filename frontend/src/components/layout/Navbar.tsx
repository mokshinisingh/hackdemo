import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Scale, 
  FileText, 
  Lock, 
  BookOpen, 
  GitCompare, 
  PhoneCall, 
  Settings, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: Scale },
    { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
    { to: '/documents', label: 'Document Simplifier', icon: FileText },
    { to: '/privacy', label: 'Privacy Lab', icon: Lock },
    { to: '/knowledge', label: 'Knowledge Centre', icon: BookOpen },
    { to: '/compare', label: 'Compare Contracts', icon: GitCompare },
    { to: '/resources', label: 'Legal Aid & Helplines', icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F7F6F0]/95 backdrop-blur border-b border-[#E1E6E2]">
      {/* Top emergency assistance banner */}
      <div className="bg-[#203D35] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">India Public Service Legal Literacy & Privacy Platform</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>NALSA Legal Aid: <strong className="text-[#DDEBE5]">15100</strong></span>
            <span>Consumer Helpline: <strong className="text-[#DDEBE5]">1915</strong></span>
            <span>Cybercrime: <strong className="text-[#DDEBE5]">1930</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#203D35] flex items-center justify-center text-[#DDEBE5] shadow-sm group-hover:bg-[#294B40] transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-lg text-[#203D35] tracking-tight">NyayaMitra</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#DDEBE5] text-[#203D35] px-1.5 py-0.5 rounded">
                  Privacy-First
                </span>
              </div>
              <p className="text-[11px] text-[#64716B] leading-none">Legal Rights Awareness Assistant</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#203D35] text-white shadow-sm'
                        : 'text-[#24352F] hover:bg-[#EAF3EF] hover:text-[#203D35]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/settings"
              className="p-2 text-[#64716B] hover:text-[#203D35] hover:bg-[#EAF3EF] rounded-lg transition"
              title="Settings & Accessibility"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <Link
              to="/documents"
              className="bg-[#203D35] text-white hover:bg-[#294B40] px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-[#DDEBE5]" />
              Analyze Document
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#24352F] hover:bg-[#EAF3EF] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E1E6E2] bg-[#F7F6F0] px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition ${
                    isActive
                      ? 'bg-[#203D35] text-white'
                      : 'text-[#24352F] hover:bg-[#EAF3EF]'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-[#E1E6E2] flex items-center justify-between">
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-[#64716B] flex items-center gap-2 py-2"
            >
              <Settings className="w-4 h-4" /> Preferences & Accessibility
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
