import React from 'react';
import { Logo } from './Logo';
import { COMPANY } from '../../config/company';
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
      <div className="border-b border-[#0D2C5B]/80 bg-[#041228]/60 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="text-[#C99A31] text-xs font-bold uppercase tracking-widest font-display">
              Columbia, South Carolina · Regional Logistics
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display tracking-tight">
              Ready to Move Your Freight Forward?
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Connect directly with our dispatch team for accurate rate estimates, dedicated lane scheduling, and reliable freight transport.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={COMPANY.contact.phoneTel}
              className="px-5 py-3 text-xs font-bold tracking-wider uppercase text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 rounded-md transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#C99A31]" />
              <span>Call (803) 718-5509</span>
            </a>
            <button
              onClick={() => handleNav('quote')}
              className="px-6 py-3 text-xs font-bold tracking-wider uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <span>Request a Quote</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Lockup & Official Contact */}
          <div className="lg:col-span-2 space-y-4">
            <button onClick={() => handleNav('home')} className="text-left focus:outline-none cursor-pointer">
              <Logo variant="horizontal-dark" size="lg" />
            </button>
            <p className="text-slate-300 text-sm max-w-sm leading-relaxed">
              &ldquo;{COMPANY.tagline}&rdquo; Commercial freight transportation and hauling solutions designed around your business needs, centered in Columbia, South Carolina.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
                <span>{COMPANY.contact.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C99A31] shrink-0" />
                <a href={COMPANY.contact.phoneTel} className="hover:text-white transition-colors">
                  {COMPANY.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C99A31] shrink-0" />
                <a href={COMPANY.contact.emailMailto} className="hover:text-white transition-colors">
                  {COMPANY.contact.email}
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display mb-4">
              Core Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Commercial Freight Transport
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Heavy Hauling &amp; Machinery
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-white transition-colors text-left cursor-pointer">
                  53ft Air-Ride Dry Van Cargo
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Flatbed &amp; Step Deck Transport
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('service-areas')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Regional Corridor Logistics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Fleet */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display mb-4">
              Company &amp; Roster
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors text-left cursor-pointer">
                  About Momentum
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('fleet')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Fleet &amp; Equipment
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('service-areas')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Service Area Map
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('safety')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Safety &amp; Compliance
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('careers')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Careers &amp; CDL Drivers
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Contact Dispatch
                </button>
              </li>
              <li className="pt-1.5 border-t border-slate-700/60">
                <button
                  onClick={() => handleNav('company-profile')}
                  className="hover:text-[#C99A31] transition-colors text-left inline-flex items-center gap-1.5 font-medium text-slate-300 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C99A31] shrink-0" />
                  <span>Company Profile (8-Page)</span>
                </button>
              </li>
              <li>
                <a
                  href={COMPANY_PROFILE_PDF_URL}
                  download="Momentum-Transportation-Company-Profile.pdf"
                  className="hover:text-white transition-colors text-left inline-flex items-center gap-1.5 text-[11px] text-slate-400 group ml-5"
                >
                  <span>Download Profile PDF</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70 group-hover:opacity-100 text-[#C99A31]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Portals & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display mb-4">
              Operations &amp; Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('portal')} className="hover:text-[#C99A31] transition-colors text-left cursor-pointer font-medium flex items-center gap-1.5">
                  <span>Customer Shipment Portal</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('operations')} className="hover:text-[#C99A31] transition-colors text-left cursor-pointer font-medium flex items-center gap-1.5">
                  <span>Operations Command Suite</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('quote')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Instant Freight Quote
                </button>
              </li>
              <li className="pt-2">
                <div className="bg-[#041228] p-3 rounded border border-slate-700/60 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-white font-semibold mb-1">
                    <Shield className="w-3.5 h-3.5 text-[#C99A31]" />
                    <span>Operating Transparency</span>
                  </div>
                  Verified South Carolina transport entity committed to safety, punctuality, and regulatory standards.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Conceptual Disclosure */}
        <div className="mt-12 pt-6 border-t border-[#0D2C5B] text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong>Operating Disclosure:</strong> Momentum Transportation &amp; Hauling LLC is registered in South Carolina (2 Penhurst Ct., Columbia, SC 29229). All vehicle photography presented on this corporate website represents illustrative commercial transportation concepts until verified company fleet photographs are authorized. Rate quotes provided online are subject to final operational review and route verification.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Momentum Transportation &amp; Hauling LLC. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Columbia, SC 29229</span>
            <span>·</span>
            <span>Phone: 803-718-5509</span>
            <span>·</span>
            <span>Tagline proposal: &ldquo;Moving Business Forward.&rdquo;</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
