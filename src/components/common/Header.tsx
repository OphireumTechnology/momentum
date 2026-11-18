import React, { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { COMPANY, COMPANY_PHONE } from '../../config/company';
import { Phone, Menu, X, ArrowRight, FileText, MapPin } from 'lucide-react';

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
  | 'company-profile';

interface HeaderProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 pt-[env(safe-area-inset-top)]">
        {/* Desktop Top Notice Strip (Hidden on Mobile to prevent sticky header crowding & height bloat) */}
        <div className="hidden md:block bg-[#071E41] text-slate-200 text-xs px-6 lg:px-8 border-b border-[#0D2C5B]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs min-w-0">
              <span className="font-medium text-white whitespace-nowrap">Columbia, SC Headquarters</span>
              <span className="text-slate-400" aria-hidden="true">·</span>
              <span className="text-slate-300 truncate">24/7 Regional Logistics &amp; Hauling Dispatch</span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <a
                href={COMPANY_PHONE.href}
                aria-label={COMPANY_PHONE.ariaLabel}
                className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 text-[#C99A31] font-semibold hover:text-white transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{COMPANY_PHONE.display}</span>
              </a>
              <span className="text-slate-500" aria-hidden="true">|</span>
              <button
                type="button"
                onClick={() => handleLinkClick('company-profile')}
                aria-current={currentPage === 'company-profile' ? 'page' : undefined}
                className={`inline-flex min-h-[44px] min-w-[44px] items-center hover:text-white transition-colors text-xs font-medium cursor-pointer whitespace-nowrap ${
                  currentPage === 'company-profile' ? 'text-[#C99A31] font-bold' : 'text-slate-300'
                }`}
              >
                Company Profile
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4 lg:gap-5 xl:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleLinkClick('home')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A31] rounded-md text-left min-w-0 flex-1 lg:flex-initial shrink cursor-pointer py-1"
            aria-label="Momentum Transportation & Hauling LLC Home"
          >
            <Logo variant="horizontal-light" size="md" compactOnMobile />
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-7 text-sm font-medium text-slate-700 shrink-0" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  type="button"
                  onClick={() => handleLinkClick(link.page)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors px-1 cursor-pointer ${
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

          {/* Zone 3: Tablet/Desktop Primary Action (Hidden below md so mobile phone + hamburger never collide at 640px) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleLinkClick('quote')}
              className="min-h-[44px] px-4 xl:px-5 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-[#071E41] hover:bg-[#041228] border border-[#071E41] rounded-md transition-colors shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Request a Quote</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C99A31]" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile & Tablet Right Controls (>= 44x44 touch targets) */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <a
              href={COMPANY_PHONE.href}
              aria-label={COMPANY_PHONE.ariaLabel}
              className="md:hidden min-w-[44px] min-h-[44px] px-2 sm:px-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 text-[#071E41] hover:bg-slate-100 transition-colors shrink-0"
            >
              <Phone className="w-4 h-4 text-[#C99A31] shrink-0" aria-hidden="true" />
              <span className="min-[460px]:hidden text-xs font-bold">Call</span>
              <span className="hidden min-[460px]:inline text-xs font-bold whitespace-nowrap">
                {COMPANY_PHONE.display}
              </span>
            </a>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-[#071E41] hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Mobile & Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute inset-x-0 top-full h-[calc(100dvh-100%)] z-50">
          <div
            className="absolute inset-0 bg-[#041228]/50 backdrop-blur-[2px]"
            aria-hidden="true"
            onClick={closeMenu}
          />
          <div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="relative z-10 bg-white border-t border-slate-200 shadow-2xl max-h-full overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#C99A31] shrink-0" aria-hidden="true" />
                <span className="truncate font-medium text-[#071E41]">Columbia, SC · 24/7 Dispatch</span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                className="min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#071E41] cursor-pointer shrink-0"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>Close</span>
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="flex flex-col">
              {navLinks.map((link) => {
                const isActive = currentPage === link.page;
                return (
                  <button
                    key={link.page}
                    type="button"
                    onClick={() => handleLinkClick(link.page)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`min-h-[48px] w-full px-3 rounded-md text-left text-base font-semibold border-b border-slate-100 flex items-center justify-between cursor-pointer transition-colors ${
                      isActive
                        ? 'text-[#071E41] bg-[#071E41]/5 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#C99A31]" aria-hidden="true" />}
                  </button>
                );
              })}

              <div className="pt-3 mt-1 space-y-1">
                <button
                  type="button"
                  onClick={() => handleLinkClick('company-profile')}
                  aria-current={currentPage === 'company-profile' ? 'page' : undefined}
                  className={`min-h-[44px] w-full px-3 rounded-md text-left text-sm font-semibold flex items-center justify-between cursor-pointer ${
                    currentPage === 'company-profile' ? 'text-[#071E41] bg-[#071E41]/5' : 'text-[#071E41] hover:bg-slate-50'
                  }`}
                >
                  <span>Company Profile</span>
                  <FileText className="w-4 h-4 text-[#C99A31]" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('safety')}
                  aria-current={currentPage === 'safety' ? 'page' : undefined}
                  className={`min-h-[44px] w-full px-3 rounded-md text-left text-sm font-medium cursor-pointer flex items-center justify-between ${
                    currentPage === 'safety' ? 'text-[#071E41] bg-[#071E41]/5 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Safety &amp; Compliance</span>
                  {currentPage === 'safety' && <span className="w-2 h-2 rounded-full bg-[#C99A31]" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('careers')}
                  aria-current={currentPage === 'careers' ? 'page' : undefined}
                  className={`min-h-[44px] w-full px-3 rounded-md text-left text-sm font-medium cursor-pointer flex items-center justify-between ${
                    currentPage === 'careers' ? 'text-[#071E41] bg-[#071E41]/5 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Careers &amp; Drivers</span>
                  {currentPage === 'careers' && <span className="w-2 h-2 rounded-full bg-[#C99A31]" aria-hidden="true" />}
                </button>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleLinkClick('quote')}
                  className="min-h-[48px] w-full px-5 py-3 text-center text-sm font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Request a Quote</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <a
                  href={COMPANY_PHONE.href}
                  aria-label={COMPANY_PHONE.ariaLabel}
                  className="min-h-[48px] w-full px-5 py-3 text-center text-sm font-bold text-white bg-[#071E41] hover:bg-[#041228] rounded-md flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#C99A31]" aria-hidden="true" />
                  <span>Call Dispatch: {COMPANY_PHONE.display}</span>
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
