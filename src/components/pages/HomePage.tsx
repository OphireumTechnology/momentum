import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { ASSETS, ASSET_METADATA, LOGOS } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  Layers,
  Sparkles,
  Calculator,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageView) => void;
  onOpenQuickQuote?: (prefill?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenQuickQuote }) => {
  // Quick calculator state for corridor transit estimate
  const [calcOrigin, setCalcOrigin] = useState('Columbia, SC');
  const [calcDest, setCalcDest] = useState('Charlotte, NC');
  const [calcService, setCalcService] = useState('dry_van');
  const [calcResult, setCalcResult] = useState<{ miles: number; hours: string; estRate: string } | null>({
    miles: 94,
    hours: '1.75 - 2.2 hrs',
    estRate: '$750 - $950',
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    let miles = 110;
    let rateMin = 850;
    let rateMax = 1150;
    let time = '2 - 2.5 hrs';

    const destLower = calcDest.toLowerCase();
    if (destLower.includes('charlotte')) {
      miles = 94;
      time = '1.75 - 2 hrs';
      rateMin = 750;
      rateMax = 950;
    } else if (destLower.includes('charleston')) {
      miles = 114;
      time = '2 - 2.5 hrs';
      rateMin = 850;
      rateMax = 1100;
    } else if (destLower.includes('atlanta')) {
      miles = 215;
      time = '3.5 - 4 hrs';
      rateMin = 1350;
      rateMax = 1750;
    } else if (destLower.includes('greenville')) {
      miles = 102;
      time = '1.75 - 2.2 hrs';
      rateMin = 780;
      rateMax = 1000;
    } else if (destLower.includes('rock hill')) {
      miles = 72;
      time = '1.25 - 1.5 hrs';
      rateMin = 650;
      rateMax = 850;
    }

    if (calcService === 'heavy_haul') {
      rateMin += 450;
      rateMax += 650;
    }

    setCalcResult({
      miles,
      hours: time,
      estRate: `$${rateMin} - $${rateMax}`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* 1. CINEMATIC HERO SECTION MATCHING OFFICIAL BRAND MOCKUP */}
      <section className="relative bg-[#071E41] text-white overflow-hidden">
        {/* Visual Hero Image Carrier */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={ASSETS.homeHero}
            alt={ASSET_METADATA.homeHero.alt}
            className="w-full h-full object-cover object-center scale-105"
            containerClassName="w-full h-full"
          />
          {/* Measured Dark Scrim for WCAG AAA text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071E41] via-[#071E41]/90 to-transparent lg:w-4/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071E41] via-transparent to-black/40" />
        </div>

        {/* Dynamic Aerodynamic Gold & Navy Ribbon Swooshes (Signature Brand Element from Attachment 1) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none overflow-hidden h-16 sm:h-24">
          <svg
            viewBox="0 0 1440 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full preserve-3d"
            preserveAspectRatio="none"
          >
            {/* Navy Base Curve */}
            <path
              d="M0 96L1440 96L1440 45C1080 85 720 15 0 70L0 96Z"
              fill="#071E41"
              opacity="0.95"
            />
            {/* Metallic Gold Primary Highway Ribbon */}
            <path
              d="M0 72C360 40 840 88 1440 28L1440 44C840 104 360 56 0 88L0 72Z"
              fill="url(#heroGoldGrad)"
            />
            {/* Metallic Gold Accent Swoosh */}
            <path
              d="M200 86C600 62 1050 94 1440 46L1440 52C1050 100 600 68 200 92L200 86Z"
              fill="#E8BE65"
              opacity="0.8"
            />
            <defs>
              <linearGradient id="heroGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C99A31" />
                <stop offset="50%" stopColor="#E8BE65" />
                <stop offset="100%" stopColor="#C99A31" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 py-20 lg:py-28 flex flex-col justify-center min-h-[620px]">
          <div className="max-w-2xl space-y-6">
            {/* Official Brand Lockup: Exact Emblem + Typography */}
            <div className="flex items-center gap-4">
              <img
                src={LOGOS.header}
                alt="Momentum Transportation & Hauling LLC Official Emblem"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 filter drop-shadow-md"
              />
              <div className="flex flex-col text-left">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white leading-none">
                  MOMENTUM
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-4 h-[2px] bg-[#C99A31] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-200 font-display leading-none">
                    TRANSPORTATION &amp; HAULING LLC
                  </span>
                </div>
              </div>
            </div>

            {/* Proposed Tagline & Headline */}
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold italic font-display text-[#C99A31] tracking-tight">
                Moving Business Forward.
              </div>
              <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed">
                {COMPANY.subheading}
              </p>
            </div>

            {/* Prominent CTAs per Directive Section 5 */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => onNavigate('quote')}
                className="px-7 py-3.5 text-xs font-bold tracking-wider uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-lg hover:shadow-xl inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>REQUEST A QUOTE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('services')}
                className="px-6 py-3.5 text-xs font-bold tracking-wider uppercase text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-md transition-all font-display backdrop-blur-sm cursor-pointer whitespace-nowrap shrink-0"
              >
                EXPLORE SERVICES
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="px-6 py-3.5 text-xs font-bold tracking-wider uppercase text-slate-200 hover:text-white bg-transparent hover:bg-slate-800/40 border border-slate-500/50 rounded-md transition-all font-display cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#C99A31]" />
                <span>CONTACT US</span>
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C99A31]" />
                <span>Columbia, SC Regional Market Base</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C99A31]" />
                <span>Direct Dispatch: (803) 718-5509</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RAPID ROUTE & CORRIDOR ESTIMATOR BAR */}
      <section className="bg-white border-b border-slate-200 shadow-sm relative z-20 -mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
          <form
            onSubmit={handleCalculate}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
          >
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                Origin Hub
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={calcOrigin}
                  onChange={(e) => setCalcOrigin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded focus:border-[#071E41] focus:bg-white focus:outline-none"
                  placeholder="Columbia, SC (29229)"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                Destination Market
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={calcDest}
                  onChange={(e) => setCalcDest(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded focus:border-[#071E41] focus:bg-white focus:outline-none"
                  placeholder="e.g. Charlotte, Charleston, Atlanta"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                Freight Category
              </label>
              <select
                value={calcService}
                onChange={(e) => setCalcService(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded focus:border-[#071E41] focus:bg-white focus:outline-none"
              >
                <option value="dry_van">53ft Dry Van Freight</option>
                <option value="flatbed">Flatbed / Building Cargo</option>
                <option value="heavy_haul">Heavy Hauling &amp; Machinery</option>
                <option value="dedicated">Dedicated Corridor Run</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded transition-colors inline-flex items-center justify-center gap-1.5 font-display cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-[#C99A31]" />
                <span>Estimate Corridor</span>
              </button>
            </div>

            {/* Quick Result */}
            <div className="bg-[#071E41]/5 p-2 rounded border border-[#071E41]/10 text-center sm:col-span-2 lg:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Est. Transit &amp; Rate</span>
              {calcResult && (
                <div className="text-xs font-bold text-[#071E41] tabular-nums">
                  {calcResult.hours} · <span className="text-[#C99A31]">{calcResult.estRate}</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* 3. COMPANY INTRODUCTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#C99A31] font-display">
                <span>01. OPERATIONAL EXCELLENCE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display text-balance">
                Built For Dependable Transportation &amp; Commercial Hauling
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Headquartered at 2 Penhurst Ct. in Columbia, South Carolina, <strong>Momentum Transportation &amp; Hauling LLC</strong> provides disciplined commercial freight movement and specialized hauling services. We connect southeastern industrial hubs, distribution terminals, and construction sites with safety-first logistics.
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                Whether you need dedicated regional dry van runs across the I-77, I-26, or I-20 corridors or specialized heavy equipment hauling across South Carolina, our operations team ensures direct communication and verified delivery milestones.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-[#F5F7FA] border border-slate-200">
                  <div className="text-2xl font-bold font-display text-[#071E41] tabular-nums">100%</div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">Safety &amp; Compliance Focus</div>
                  <div className="text-[11px] text-slate-500 mt-1">Daily pre-trip and DOT maintenance checks.</div>
                </div>
                <div className="p-4 rounded-lg bg-[#F5F7FA] border border-slate-200">
                  <div className="text-2xl font-bold font-display text-[#071E41] tabular-nums">Direct</div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">Driver &amp; Dispatch Contact</div>
                  <div className="text-[11px] text-slate-500 mt-1">Speak directly with dispatch personnel.</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#071E41] hover:text-[#C99A31] transition-colors font-display"
                >
                  <span>Learn more about our company philosophy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-xl overflow-hidden shadow-xl border border-slate-200">
                <ImageWithFallback
                  src={ASSETS.aboutOperations}
                  alt={ASSET_METADATA.aboutOperations.alt}
                  className="w-full h-[400px] object-cover"
                  fallbackTitle="Momentum Logistics Terminal"
                />
                <div className="p-4 bg-slate-900 text-slate-300 text-xs flex items-center justify-between">
                  <span>Logistics operations coordination yard</span>
                  <span className="text-[#C99A31] font-semibold">Columbia, SC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE SERVICES BENTO GRID */}
      <section className="py-20 bg-[#F5F7FA] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block mb-1">
                02. SERVICE CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display">
                Transportation &amp; Hauling Solutions
              </h2>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs font-bold uppercase tracking-wider text-[#071E41] hover:text-[#C99A31] transition-colors inline-flex items-center gap-1.5 font-display self-start md:self-auto cursor-pointer"
            >
              <span>View All Service Specs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1: Freight Transportation */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-48 overflow-hidden">
                  <ImageWithFallback
                    src={ASSETS.transportationHero}
                    alt={ASSET_METADATA.transportationHero.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    fallbackTitle="Freight Transport"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display mb-1">
                    Full Truckload &amp; Regional
                  </div>
                  <h3 className="text-xl font-bold text-[#071E41] font-display mb-2">
                    Commercial Freight Transportation
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Reliable dry van and palletized freight distribution across South Carolina, North Carolina, and Georgia. Clean, air-ride trailers with continuous transit updates.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>53ft Air-Ride Dry Vans (up to 45,000 lbs)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>E-Track Cargo Securement &amp; Sealed Loads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Scheduled Route &amp; Dedicated Run Options</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => onNavigate('quote')}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-[#071E41] hover:text-white rounded transition-colors text-center font-display"
                >
                  Quote Freight
                </button>
              </div>
            </div>

            {/* Service 2: Heavy Hauling & Equipment */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-48 overflow-hidden">
                  <ImageWithFallback
                    src={ASSETS.haulingHero}
                    alt={ASSET_METADATA.haulingHero.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    fallbackTitle="Heavy Hauling"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display mb-1">
                    Specialized Staging &amp; Machinery
                  </div>
                  <h3 className="text-xl font-bold text-[#071E41] font-display mb-2">
                    Commercial Hauling &amp; Machinery
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Heavy-duty hauling solutions for industrial machinery, construction equipment, and oversized freight. Safe tie-downs, certified rigging, and coordinated routing.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Flatbed, Step Deck, &amp; Lowboy Capability</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Machinery &amp; Job-Site Staging Relocation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Oversized Permits &amp; Escort Coordination</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => onNavigate('quote')}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-[#071E41] hover:text-white rounded transition-colors text-center font-display"
                >
                  Quote Hauling
                </button>
              </div>
            </div>

            {/* Service 3: Regional Corridor Logistics */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-48 overflow-hidden">
                  <ImageWithFallback
                    src={ASSETS.serviceAreas}
                    alt={ASSET_METADATA.serviceAreas.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    fallbackTitle="Regional Corridors"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display mb-1">
                    Midlands &amp; Port Connectors
                  </div>
                  <h3 className="text-xl font-bold text-[#071E41] font-display mb-2">
                    Regional Corridors &amp; Port Access
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Direct freight runs linking Columbia, SC with the Port of Charleston, Charlotte industrial centers, and regional manufacturers with guaranteed time slots.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>I-77 Corridor: Columbia ⇄ Charlotte</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>I-26 Corridor: Columbia ⇄ Charleston Terminals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>I-20 Corridor: Florence ⇄ Augusta / Atlanta</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => onNavigate('service-areas')}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-[#071E41] hover:text-white rounded transition-colors text-center font-display"
                >
                  Explore Corridors
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE MOMENTUM */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block mb-1">
              03. THE MOMENTUM STANDARD
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display">
              Why Shippers &amp; Contractors Trust Momentum
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              In transportation, consistency and communication matter above all else. We pride ourselves on transparent operations, honest timelines, and disciplined commercial driving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold font-display text-lg">
                01
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Punctual Dispatch Windows
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We respect your receiving docks and construction schedules. Scheduled pickups and drop-offs adhere to confirmed transit windows.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold font-display text-lg">
                02
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Real Milestone Visibility
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No simulated data or automated ghost alerts. Every milestone in our portal represents an actual recorded operational check-in.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold font-display text-lg">
                03
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Dedicated Single Contact
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You get direct access to our Columbia dispatch personnel—not an overseas call center or automated chat tree.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold font-display text-lg">
                04
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Safety &amp; Securement Rigor
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tire pressures, load tie-downs, seal verifications, and FMCSR hours-of-service compliance are non-negotiable for every mile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPORTATION PROCESS OVERVIEW */}
      <section className="py-20 bg-[#071E41] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display block mb-1">
              04. STEP-BY-STEP PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              How We Execute Your Transport
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              From initial rate confirmation to signed proof of delivery, our workflow is simple, structured, and accountable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative p-6 rounded-xl bg-[#0B2B5C]/60 border border-slate-700/60">
              <span className="text-2xl font-bold font-display text-[#C99A31] block mb-2">01</span>
              <h4 className="text-base font-bold text-white font-display mb-1">Quote &amp; Route Review</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submit load specs online or call dispatch. We analyze cargo weight, trailer suitability, and provide a clear quote.
              </p>
            </div>

            <div className="relative p-6 rounded-xl bg-[#0B2B5C]/60 border border-slate-700/60">
              <span className="text-2xl font-bold font-display text-[#C99A31] block mb-2">02</span>
              <h4 className="text-base font-bold text-white font-display mb-1">Dispatch &amp; Loading</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Commercial tractor and trailer are staged at your pickup site. Cargo is secured, weighed, and verified with signed BOL.
              </p>
            </div>

            <div className="relative p-6 rounded-xl bg-[#0B2B5C]/60 border border-slate-700/60">
              <span className="text-2xl font-bold font-display text-[#C99A31] block mb-2">03</span>
              <h4 className="text-base font-bold text-white font-display mb-1">Milestone Transit</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Freight moves along pre-planned regional highway corridors with operational status updates recorded at key waypoints.
              </p>
            </div>

            <div className="relative p-6 rounded-xl bg-[#0B2B5C]/60 border border-slate-700/60">
              <span className="text-2xl font-bold font-display text-[#C99A31] block mb-2">04</span>
              <h4 className="text-base font-bold text-white font-display mb-1">Delivery &amp; Verified POD</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cargo arrives safely at receiver dock. Bill of lading is signed, receiver notes are recorded, and instant POD is logged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FLEET & EQUIPMENT INTRODUCTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-xl overflow-hidden shadow-xl border border-slate-200">
                <ImageWithFallback
                  src={ASSETS.fleetHero}
                  alt={ASSET_METADATA.fleetHero.alt}
                  className="w-full h-[380px] object-cover"
                  fallbackTitle="Commercial Transport Fleet"
                />
                <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-600 italic">
                  *Illustrative fleet concept. Actual vehicles assigned per specific load requirements.
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#C99A31] font-display">
                <span>05. EQUIPMENT READINESS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display text-balance">
                Commercial Fleet &amp; Trailer Configurations
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Momentum coordinates modern Class 8 tractors and specialized trailing equipment designed to handle general palletized freight, heavy building supplies, and job-site machinery relocations.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <Layers className="w-5 h-5 text-[#C99A31] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#071E41]">53ft Dry Freight Vans</h4>
                    <p className="text-[11px] text-slate-600">Air-ride suspension, 45,000 lbs capacity, dual E-track systems.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <Layers className="w-5 h-5 text-[#C99A31] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#071E41]">48ft &amp; 53ft Flatbeds &amp; Step Decks</h4>
                    <p className="text-[11px] text-slate-600">Steel coils, structural framing, building supplies, side-loading access.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <Layers className="w-5 h-5 text-[#C99A31] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#071E41]">Heavy-Haul Lowboy &amp; RGN Trailers</h4>
                    <p className="text-[11px] text-slate-600">Ground-level equipment loading for excavators, loaders, and industrial equipment.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('fleet')}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded transition-colors font-display"
                >
                  View Full Fleet Specifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. APPROVED CORPORATE BRAND IDENTITY & FLEET LIVERY SYSTEM */}
      <section className="py-20 bg-[#F5F7FA] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block mb-1">
              06. CORPORATE BRAND IDENTITY &amp; LIVERY SYSTEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display">
              Approved Corporate Visual Identity
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Momentum Transportation &amp; Hauling LLC operates under a strict, standardized corporate design system across all commercial tractors, trailers, operator uniforms, and customer communications.
            </p>
          </div>

          {/* Brand Board Mockup Showcase Carrier */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
            <div className="relative">
              <img
                src={ASSETS.brandMockup}
                alt="Momentum Transportation Brand Identity Mockup - Fleet Livery, Apparel, Stationery and Palette"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 bg-[#071E41]/90 backdrop-blur-md text-white px-3 py-1.5 rounded text-xs font-bold font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C99A31]" />
                <span>Approved Corporate Identity System</span>
              </div>
            </div>

            {/* Explanatory Grid: Palette, Emblem, Typography */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-200 text-xs">
              {/* Col 1: Palette */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#071E41] uppercase tracking-wider font-display">
                  Official Corporate Color Palette
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-[#071E41] text-white space-y-0.5">
                    <span className="text-[10px] font-bold uppercase block text-slate-300">Deep Royal Navy</span>
                    <span className="font-mono text-[11px] font-bold text-[#C99A31]">#071E41</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#C99A31] text-[#071E41] space-y-0.5">
                    <span className="text-[10px] font-bold uppercase block text-[#071E41]">Metallic Gold</span>
                    <span className="font-mono text-[11px] font-bold text-white">#C99A31</span>
                  </div>
                  <div className="p-2.5 rounded bg-white text-slate-900 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase block text-slate-500">Pure White</span>
                    <span className="font-mono text-[11px] font-bold text-slate-700">#FFFFFF</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F5F7FA] text-slate-800 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase block text-slate-500">Light Gray</span>
                    <span className="font-mono text-[11px] font-bold text-slate-700">#F5F7FA</span>
                  </div>
                </div>
              </div>

              {/* Col 2: Official Emblem */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-[#071E41] uppercase tracking-wider font-display flex items-center gap-1.5">
                  <img src={LOGOS.favicon} alt="Emblem icon" className="w-4 h-4 object-contain" />
                  <span>The Official Emblem</span>
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  The circular insignia features a deep royal navy and metallic gold double ring, crisp white interior, stylized navy letter &apos;M&apos;, gold forward-motion swooshes, curved highway ribbon, and modern commercial truck illustration.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#071E41] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>Approved for Fleet, Signage &amp; Documents</span>
                </div>
              </div>

              {/* Col 3: Typography & Tagline */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-[#071E41] uppercase tracking-wider font-display">
                  Corporate Typography &amp; Tagline
                </h4>
                <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-sm font-bold text-[#071E41] font-display">
                    Inter (Bold &amp; Extra Bold)
                  </div>
                  <div className="text-xs text-slate-600 font-normal">
                    Inter (Regular) for body prose &amp; tabular metrics
                  </div>
                  <div className="text-xs italic font-bold text-[#C99A31] pt-1 border-t border-slate-200">
                    &ldquo;Moving Business Forward.&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA & DIRECT DISPATCH STRIP */}
      <section className="bg-gradient-to-r from-[#071E41] via-[#0D2C5B] to-[#071E41] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
            Direct Dispatch Line · Columbia, SC
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display max-w-2xl mx-auto text-balance">
            Need Scheduled Transport or Immediate Hauling Capacity?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Contact Wendell Wright and the Momentum operations team directly at <strong>803-718-5509</strong> or request your customized freight rate online.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={COMPANY.contact.phoneTel}
              className="px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#C99A31]" />
              <span>Call 803-718-5509</span>
            </a>
            <button
              onClick={() => onNavigate('quote')}
              className="px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <span>Submit Load For Rate Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
