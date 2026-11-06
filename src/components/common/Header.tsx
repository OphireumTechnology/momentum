import React, { useState } from 'react';
import { Logo } from './Logo';
import { COMPANY } from '../../config/company';
import { Phone, Menu, X, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export type PageView =
  | 'home'
  | 'about'
  | 'services'
  | 'fleet'
  | 'service-areas'
  | 'quote'
  | 'contact'
  | 'careers'
  | 'safety'
  | 'portal'
  | 'operations';

interface HeaderProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; page: PageView }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Services', page: 'services' },
    { label: 'Fleet', page: 'fleet' },
    { label: 'Coverage', page: 'service-areas' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  const handleLinkClick = (page: PageView) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Contact Notice Strip */}
      <div className="bg-[#071E41] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="font-medium text-white">Columbia, SC Headquarters</span>
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className="hidden sm:inline text-slate-300">24/7 Regional Logistics &amp; Hauling Dispatch</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={COMPANY.contact.phoneTel}
              className="inline-flex items-center gap-1.5 text-[#C99A31] font-semibold hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{COMPANY.contact.formattedPhone}</span>
            </a>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => onNavigate('portal')}
              className="text-slate-300 hover:text-white transition-colors text-xs font-medium"
            >
              Customer Portal
            </button>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => onNavigate('operations')}
              className="text-[#C99A31] hover:text-[#E8BE65] transition-colors text-xs font-semibold inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Operations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar — Strict 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleLinkClick('home')}
          className="focus:outline-none text-left shrink-0 cursor-pointer"
        >
          <Logo variant="horizontal-light" size="md" />
        </button>

        {/* Zone 2: Navigation Links (Single-line, 4-6 concise labels) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
          {navLinks.map((link) => {
            const isActive = currentPage === link.page;
            return (
              <button
                key={link.page}
                onClick={() => handleLinkClick(link.page)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                  isActive
                    ? 'text-[#071E41] font-bold border-b-2 border-[#C99A31]'
                    : 'text-slate-600 hover:text-[#071E41]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleLinkClick('quote')}
            className="px-5 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-[#071E41] hover:bg-[#041228] border border-[#071E41] rounded-md transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Request a Quote</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C99A31]" />
          </button>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => handleLinkClick('quote')}
            className="px-3 py-1.5 text-xs font-bold uppercase text-white bg-[#071E41] rounded-md sm:hidden"
          >
            Quote
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-[#071E41] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleLinkClick(link.page)}
                className={`text-left py-2 text-base font-semibold border-b border-slate-100 ${
                  currentPage === link.page ? 'text-[#071E41] text-bold' : 'text-slate-700'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => handleLinkClick('careers')}
                className="text-left py-2 text-sm text-slate-600 font-medium"
              >
                Careers &amp; Drivers
              </button>
              <button
                onClick={() => handleLinkClick('safety')}
                className="text-left py-2 text-sm text-slate-600 font-medium"
              >
                Safety &amp; Compliance
              </button>
              <button
                onClick={() => handleLinkClick('portal')}
                className="text-left py-2 text-sm text-slate-800 font-semibold flex items-center justify-between"
              >
                <span>Customer Portal &amp; Tracking</span>
                <UserCheck className="w-4 h-4 text-[#C99A31]" />
              </button>
              <button
                onClick={() => handleLinkClick('operations')}
                className="text-left py-2 text-sm text-[#071E41] font-semibold flex items-center justify-between"
              >
                <span>Operations Command Center</span>
                <ShieldCheck className="w-4 h-4 text-[#C99A31]" />
              </button>
              <button
                onClick={() => handleLinkClick('quote')}
                className="w-full mt-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] rounded-md shadow"
              >
                Request a Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
