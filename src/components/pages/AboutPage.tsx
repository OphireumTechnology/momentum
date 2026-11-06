import React from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { Logo } from '../common/Logo';
import { ASSETS, ASSET_METADATA, LOGOS, COMPANY_PROFILE_PDF_URL } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Shield, Target, Compass, Award, Phone, Mail, MapPin, ArrowRight, FileText, Download, ExternalLink } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageView) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero Header */}
      <section className="relative bg-[#071E41] text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src={ASSETS.aboutOperations}
            alt={ASSET_METADATA.aboutOperations.alt}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={LOGOS.original}
                alt="Momentum Transportation Official Emblem"
                width={80}
                height={80}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 filter drop-shadow-md select-none"
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display block">
                  About Momentum Transportation &amp; Hauling LLC
                </span>
                <span className="text-sm font-bold tracking-wider text-slate-200 uppercase font-display">
                  Moving Business Forward.
                </span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Disciplined Freight &amp; Commercial Hauling
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Based in Columbia, South Carolina, our operations are founded on dependable logistics execution, driver professionalism, and direct customer accountability.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview & Yard Image */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 min-w-0 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display">
                Company Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#071E41] font-display">
                Grounded in the Heart of South Carolina
              </h2>
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <p>
                  <strong>Momentum Transportation &amp; Hauling LLC</strong> was established to provide regional manufacturers, distributors, and construction firms with a focused, highly responsive transportation partner. Headquartered at 2 Penhurst Ct. in Columbia, SC (29229), we operate at the epicenter of South Carolina&apos;s primary interstate arteries: Interstate 20, Interstate 26, and Interstate 77.
                </p>
                <p>
                  We understand that missed pickup windows and unresponsive dispatchers cost businesses real money. That is why Momentum is built around single-point dispatch contact, verified vehicle readiness, and clear transit communication.
                </p>
                <p>
                  From full truckload dry freight to specialized machinery and job-site hauling, our team manages each assignment with strict adherence to Federal Motor Carrier Safety Regulations (FMCSR) and verified customer load requirements.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#F5F7FA] border border-slate-200">
                  <div className="text-xs font-bold text-[#071E41] uppercase tracking-wider mb-1">
                    Primary Market
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{COMPANY.primaryMarket}</div>
                  <div className="text-xs text-slate-500 mt-1">Midlands &amp; Southeastern Interstate Corridors</div>
                </div>

                <div className="p-4 rounded-lg bg-[#F5F7FA] border border-slate-200">
                  <div className="text-xs font-bold text-[#071E41] uppercase tracking-wider mb-1">
                    Industry Focus
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{COMPANY.industry}</div>
                  <div className="text-xs text-slate-500 mt-1">Commercial Freight, Dry Van, &amp; Heavy Hauling</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 min-w-0">
              <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
                <ImageWithFallback
                  src={ASSETS.aboutOperations}
                  alt={ASSET_METADATA.aboutOperations.alt}
                  className="w-full h-80 object-cover"
                  fallbackTitle="Momentum Operations Yard"
                />
                <div className="p-4 bg-slate-900 text-white text-xs">
                  <div className="font-semibold text-white">Operations Coordination Environment</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Terminal yard staging and dispatch oversight for southeastern regional runs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Company Profile Section per Directive Section 12 */}
      <section className="py-16 bg-[#071E41] text-white border-y border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Document Info and Highlights */}
            <div className="lg:col-span-7 min-w-0 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded border border-white/20 text-[#C99A31] text-xs font-bold uppercase tracking-wider font-display">
                <FileText className="w-3.5 h-3.5" />
                <span>Authoritative 8-Page Corporate Document</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
                Momentum Corporate Company Profile
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Explore our corporate background, transportation and hauling capabilities, regional logistics coverage, operational philosophy, 9 industries served, corporate directory, and official brand collaterals in our complete eight-page publication.
              </p>

              {/* 8-Page Profile Table of Contents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-2.5 rounded border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#C99A31] text-[#071E41] font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span>Cover &amp; Executive Summary</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-2.5 rounded border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#C99A31] text-[#071E41] font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span>Corporate Overview &amp; Regional Corridors</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-2.5 rounded border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#C99A31] text-[#071E41] font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                  <span>Mission, Vision &amp; Core Values (Pending Approval)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-2.5 rounded border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#C99A31] text-[#071E41] font-bold flex items-center justify-center text-[10px] shrink-0">4</span>
                  <span>Core Services (5 Capabilities)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-2.5 rounded border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#C99A31] text-[#071E41] font-bold flex items-center justify-center text-[10px] shrink-0">5</span>
                  <span>Industries &amp; Customers Served (9 Sectors)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-2.5 rounded border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#C99A31] text-[#071E41] font-bold flex items-center justify-center text-[10px] shrink-0">6</span>
                  <span>Operational Philosophy &amp; Direct Dispatch</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-2.5 rounded border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#C99A31] text-[#071E41] font-bold flex items-center justify-center text-[10px] shrink-0">7</span>
                  <span>Corporate Contact Directory &amp; Office Hours</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-2.5 rounded border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#C99A31] text-[#071E41] font-bold flex items-center justify-center text-[10px] shrink-0">8</span>
                  <span>Branding, Apparel, Stationery &amp; Fleet Collaterals</span>
                </div>
              </div>

              {/* Standardized View & Download Controls */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('company-profile')}
                  className="px-6 py-3.5 text-xs font-bold tracking-wider uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>VIEW COMPANY PROFILE</span>
                </button>

                <a
                  href={COMPANY_PROFILE_PDF_URL}
                  download="Momentum-Transportation-Company-Profile.pdf"
                  className="px-6 py-3.5 text-xs font-bold tracking-wider uppercase text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-md transition-all font-display inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#C99A31]" />
                  <span>DOWNLOAD COMPANY PROFILE</span>
                </a>

                <a
                  href={COMPANY_PROFILE_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 text-xs font-semibold text-slate-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View PDF in Browser</span>
                </a>
              </div>
            </div>

            {/* Right: High-Res First Page Preview Thumbnail */}
            <div className="lg:col-span-5 min-w-0 flex justify-center">
              <div className="relative group max-w-sm w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#C99A31] to-[#071E41] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                <div className="relative rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-white">
                  <button
                    onClick={() => onNavigate('company-profile')}
                    className="block relative overflow-hidden group cursor-pointer w-full text-left"
                    title="Click to view full 8-page company profile interactive edition"
                  >
                    <img
                      src={ASSETS.companyProfileThumbnail}
                      alt="Momentum Transportation & Hauling LLC Corporate Profile Document Preview"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-[#071E41]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-[#071E41] text-white text-xs font-bold rounded shadow-lg flex items-center gap-2 border border-[#C99A31]">
                        <ExternalLink className="w-3.5 h-3.5 text-[#C99A31]" />
                        <span>Open 8-Page Profile</span>
                      </span>
                    </div>
                  </button>
                  <div className="p-3.5 bg-slate-900 text-center border-t border-slate-800 flex items-center justify-between px-4">
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-200 block">8-Page Official Profile</span>
                      <span className="block text-[11px] text-slate-400">PDF Document · Public Access</span>
                    </div>
                    <a
                      href={COMPANY_PROFILE_PDF_URL}
                      download="Momentum-Transportation-Company-Profile.pdf"
                      className="p-1.5 bg-[#C99A31] text-[#071E41] rounded hover:bg-[#E8BE65] transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proposed Mission, Vision & Values */}
      <section className="py-16 bg-[#F5F7FA] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Strategic Direction
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071E41] font-display mt-1">
              Mission, Vision &amp; Guiding Principles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              *Proposed strategic statements subject to company management and executive review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 flex items-center justify-center text-[#071E41]">
                <Target className="w-5 h-5 text-[#C99A31]" />
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Proposed Mission
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To move our clients&apos; businesses forward by delivering dependable, safe, and transparent transportation and hauling solutions through rigorous operational discipline and honest communication.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 flex items-center justify-center text-[#071E41]">
                <Compass className="w-5 h-5 text-[#C99A31]" />
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Proposed Vision
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To be the Midlands&apos; most trusted regional commercial carrier, recognized for modern logistics capabilities, zero-compromise safety, and exceptional driver respect.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 flex items-center justify-center text-[#071E41]">
                <Shield className="w-5 h-5 text-[#C99A31]" />
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Safety First Culture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No schedule or deadline supersedes road safety. We mandate thorough vehicle inspections, proper cargo securement, and full compliance with federal hours-of-service rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Four Core Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display">
              Operating Values
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071E41] font-display mt-1">
              The Standards We Uphold on Every Run
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-lg border border-slate-200 bg-[#F5F7FA]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display mb-1">
                Value 01
              </div>
              <h4 className="text-base font-bold text-[#071E41] font-display mb-1.5">Reliability</h4>
              <p className="text-xs text-slate-600">
                When we confirm a dispatch or delivery window, we stand behind it with meticulous preparation and backup protocols.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-[#F5F7FA]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display mb-1">
                Value 02
              </div>
              <h4 className="text-base font-bold text-[#071E41] font-display mb-1.5">Integrity</h4>
              <p className="text-xs text-slate-600">
                Fair, transparent rates with zero hidden accessorial fees. Honest transit communication when road conditions shift.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-[#F5F7FA]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display mb-1">
                Value 03
              </div>
              <h4 className="text-base font-bold text-[#071E41] font-display mb-1.5">Direct Service</h4>
              <p className="text-xs text-slate-600">
                No phone runarounds. You talk directly with Wendell Wright and our Columbia operations coordinators who know your load.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-[#F5F7FA]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display mb-1">
                Value 04
              </div>
              <h4 className="text-base font-bold text-[#071E41] font-display mb-1.5">Equipment Care</h4>
              <p className="text-xs text-slate-600">
                Clean, inspected, well-maintained tractors and trailers to ensure your cargo arrives in the same condition it left the dock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Office & Contact Strip */}
      <section className="py-14 bg-[#071E41] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-2xl font-bold font-display">Speak Directly with Operations</h3>
              <p className="text-slate-300 text-xs sm:text-sm">
                Have specific lane requirements or specialized hauling questions? Connect directly with our team.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={COMPANY.contact.phoneTel}
                className="px-6 py-3 text-xs font-bold tracking-wider uppercase text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded inline-flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#C99A31]" />
                <span>Call 803-718-5509</span>
              </a>
              <button
                onClick={() => onNavigate('quote')}
                className="px-6 py-3 text-xs font-bold tracking-wider uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded inline-flex items-center gap-2 cursor-pointer font-display"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
