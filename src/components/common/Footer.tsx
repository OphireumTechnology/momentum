import React from 'react';
import { Logo } from './Logo';
import { COMPANY, COMPANY_PHONE } from '../../config/company';
import { COMPANY_PROFILE_PDF_URL } from '../../config/assets';
import { PageView } from './Header';
import { Phone, Mail, MapPin, Shield, ArrowUpRight, FileText } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (page: PageView) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#071E41] text-slate-300 border-t border-[#0D2C5B]">
      {/* Top CTA Bar */}
      <div className="border-b border-[#0D2C5B]/80 bg-[#041228]/60 py-10 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
          <div>
            <span className="text-[#C99A31] text-xs font-bold uppercase tracking-widest font-display">
              Columbia, South Carolina · Regional Logistics
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display tracking-tight">
              Ready to Move Your Freight Forward?
            </h3>
            <p className="text-slate-300 text-sm mt-1.5 max-w-xl leading-relaxed">
              Connect directly with our dispatch team for accurate rate estimates, dedicated lane scheduling, and reliable freight transport.
            </p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <a
              href={COMPANY_PHONE.href}
              aria-label={COMPANY_PHONE.ariaLabel}
              className="min-h-[48px] px-5 py-3 text-xs font-bold tracking-wider uppercase text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600 rounded-md transition-colors inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#C99A31]" aria-hidden="true" />
              <span>Call {COMPANY_PHONE.display}</span>
            </a>
            <button
              type="button"
              onClick={() => handleNav('quote')}
              className="min-h-[48px] px-6 py-3 text-xs font-bold tracking-wider uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-colors font-display shadow-md cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Request a Quote</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Lockup & Official Contact */}
          <div className="lg:col-span-2 space-y-4">
            <button type="button" onClick={() => handleNav('home')} className="text-left focus:outline-none cursor-pointer">
              <Logo variant="horizontal-dark" size="lg" />
            </button>
            <p className="text-slate-300 text-sm max-w-sm leading-relaxed">
              &ldquo;{COMPANY.tagline}&rdquo; Commercial freight transportation and hauling solutions designed around your business needs, centered in Columbia, South Carolina.
            </p>

            <div className="pt-2 space-y-1 text-sm text-slate-300">
              <div className="flex items-start gap-2.5 py-1.5">
                <MapPin className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{COMPANY.contact.address}</span>
              </div>
              <div>
                <a
                  href={COMPANY_PHONE.href}
                  aria-label={COMPANY_PHONE.ariaLabel}
                  className="min-h-[44px] inline-flex items-center gap-2.5 text-slate-200 hover:text-white transition-colors font-medium"
                >
                  <Phone className="w-4 h-4 text-[#C99A31] shrink-0" aria-hidden="true" />
                  <span>{COMPANY_PHONE.display}</span>
                </a>
              </div>
              <div>
                <a
                  href={COMPANY.contact.emailMailto}
                  className="min-h-[44px] inline-flex items-center gap-2.5 text-slate-200 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-[#C99A31] shrink-0" aria-hidden="true" />
                  <span>{COMPANY.contact.email}</span>
                </a>
              </div>
              <div>
                <a href={COMPANY.contact.secondaryEmailMailto} className="min-h-[44px] inline-flex items-center gap-2.5 text-slate-200 hover:text-white transition-colors break-all">
                  <Mail className="w-4 h-4 text-[#C99A31] shrink-0" aria-hidden="true" />
                  <span>{COMPANY.contact.secondaryEmail}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display mb-3">
              Core Capabilities
            </h4>
            <ul className="space-y-0.5 text-sm text-slate-300">
              <li>
                <button type="button" onClick={() => handleNav('services')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  Commercial Freight Transport
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('services')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  Heavy Hauling &amp; Machinery
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('services')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  53ft Air-Ride Dry Van Cargo
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('services')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  Flatbed &amp; Step Deck Transport
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('service-areas')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  Regional Corridor Logistics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Fleet */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display mb-3">
              Company &amp; Roster
            </h4>
            <ul className="space-y-0.5 text-sm text-slate-300">
              <li>
                <button type="button" onClick={() => handleNav('about')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  About Momentum
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('fleet')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  Fleet &amp; Equipment
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('service-areas')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  Service Area Map
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('safety')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  Safety &amp; Compliance
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('careers')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  Careers &amp; CDL Drivers
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('contact')} className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left cursor-pointer">
                  Contact Dispatch
                </button>
              </li>
              <li className="pt-1.5 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => handleNav('company-profile')}
                  className="min-h-[44px] w-full hover:text-[#C99A31] transition-colors text-left inline-flex items-center gap-2 font-medium text-slate-200 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#C99A31] shrink-0" aria-hidden="true" />
                  <span>Company Profile (8-Page)</span>
                </button>
              </li>
              <li>
                <a
                  href={COMPANY_PROFILE_PDF_URL}
                  download="Momentum-Transportation-Company-Profile.pdf"
                  className="min-h-[44px] hover:text-white transition-colors text-left inline-flex items-center gap-1.5 text-xs text-slate-300 group ml-6"
                >
                  <span>Download Profile PDF</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 text-[#C99A31]" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Quotation & Dispatch */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display mb-3">
              Quotation &amp; Dispatch
            </h4>
            <ul className="space-y-0.5 text-sm text-slate-300">
              <li>
                <button type="button" onClick={() => handleNav('quote')} className="min-h-[44px] w-full flex items-center hover:text-[#C99A31] transition-colors text-left cursor-pointer font-medium">
                  <span>Request a Freight Quote</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('contact')} className="min-h-[44px] w-full flex items-center hover:text-[#C99A31] transition-colors text-left cursor-pointer font-medium">
                  <span>Direct Dispatch Inquiries</span>
                </button>
              </li>
              <li>
                <a
                  href={COMPANY_PHONE.href}
                  aria-label={COMPANY_PHONE.ariaLabel}
                  className="min-h-[44px] w-full flex items-center hover:text-white transition-colors text-left"
                >
                  24/7 Phone: {COMPANY_PHONE.display}
                </a>
              </li>
              <li className="pt-3">
                <div className="bg-[#041228] p-3.5 rounded-md border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-white font-semibold mb-1">
                    <Shield className="w-4 h-4 text-[#C99A31] shrink-0" aria-hidden="true" />
                    <span>Operating Transparency</span>
                  </div>
                  Verified South Carolina transport entity committed to safety, punctuality, and regulatory standards.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Conceptual Disclosure */}
        <div className="mt-10 pt-6 border-t border-[#0D2C5B] text-xs text-slate-400 leading-relaxed">
          <p>
            <strong>Operating Disclosure:</strong> Momentum Transportation &amp; Hauling LLC is registered in South Carolina (2 Penhurst Ct., Columbia, SC 29229). All vehicle photography presented on this corporate website represents illustrative commercial transportation concepts until verified company fleet photographs are authorized. Rate quotes provided online are subject to final operational review and route verification.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Momentum Transportation &amp; Hauling LLC. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Columbia, SC 29229</span>
            <a
              href={COMPANY_PHONE.href}
              aria-label={COMPANY_PHONE.ariaLabel}
              className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
            >
              {COMPANY_PHONE.display}
            </a>
            <span>&ldquo;Moving Business Forward.&rdquo;</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
