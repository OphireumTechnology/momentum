import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { ASSETS, ASSET_METADATA, LOGOS, COMPANY_PROFILE_PDF_URL } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  Layers,
  Calculator,
  Navigation,
  Activity,
  FileCheck,
  Truck,
  Box,
  Compass,
  Radio,
  SlidersHorizontal,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageView) => void;
  onOpenQuickQuote?: (prefill?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenQuickQuote }) => {
  // Section 03: Smart Freight Corridor Estimator State
  const [calcOrigin, setCalcOrigin] = useState('Columbia, SC (29229)');
  const [calcDest, setCalcDest] = useState('charlotte');
  const [calcCategory, setCalcCategory] = useState('dry_van');
  const [isCalculated, setIsCalculated] = useState(true);

  // Section 07: Regional Corridors Interactive Inspector State
  const [activeCorridorId, setActiveCorridorId] = useState<'i77' | 'i26_port' | 'i26_upstate' | 'i20' | 'midlands'>('i77');

  // Corridor Estimation Matrix
  const corridorData: Record<string, { label: string; miles: number; hours: string; baseRateMin: number; baseRateMax: number; corridor: string }> = {
    charlotte: {
      label: 'Charlotte, NC (I-77 N Corridor)',
      miles: 94,
      hours: '1.75 – 2.0 hrs',
      baseRateMin: 750,
      baseRateMax: 950,
      corridor: 'I-77 Northbound Artery',
    },
    charleston: {
      label: 'Charleston Port, SC (I-26 E Corridor)',
      miles: 114,
      hours: '2.0 – 2.5 hrs',
      baseRateMin: 850,
      baseRateMax: 1100,
      corridor: 'I-26 Coastal & Port Corridor',
    },
    greenville: {
      label: 'Greenville-Spartanburg, SC (I-26 W / I-385)',
      miles: 102,
      hours: '1.75 – 2.2 hrs',
      baseRateMin: 780,
      baseRateMax: 1020,
      corridor: 'I-26 / I-385 Upstate Corridor',
    },
    rock_hill: {
      label: 'Rock Hill, SC (I-77 Corridor)',
      miles: 72,
      hours: '1.25 – 1.5 hrs',
      baseRateMin: 650,
      baseRateMax: 850,
      corridor: 'I-77 Piedmont Corridor',
    },
    florence: {
      label: 'Florence, SC (I-20 E Corridor)',
      miles: 82,
      hours: '1.3 – 1.7 hrs',
      baseRateMin: 700,
      baseRateMax: 900,
      corridor: 'I-20 Pee Dee Commercial Corridor',
    },
    augusta: {
      label: 'Augusta / Savannah River, GA (I-20 W)',
      miles: 76,
      hours: '1.3 – 1.6 hrs',
      baseRateMin: 720,
      baseRateMax: 920,
      corridor: 'I-20 West Interstate Route',
    },
    atlanta: {
      label: 'Atlanta Metro Hub, GA (I-20 W)',
      miles: 215,
      hours: '3.5 – 4.0 hrs',
      baseRateMin: 1400,
      baseRateMax: 1800,
      corridor: 'I-20 Regional Distribution Artery',
    },
  };

  const currentCorridor = corridorData[calcDest] || corridorData.charlotte;

  // Category Multiplier
  let rateMultiplier = 1.0;
  let categoryLabel = '53ft Air-Ride Dry Van Freight';
  if (calcCategory === 'heavy_haul') {
    rateMultiplier = 1.65;
    categoryLabel = 'Commercial Heavy Machinery (Lowboy & Rigging)';
  } else if (calcCategory === 'cargo_van') {
    rateMultiplier = 0.72;
    categoryLabel = 'Cargo Van Expedited Delivery';
  } else if (calcCategory === 'dump_truck') {
    rateMultiplier = 1.15;
    categoryLabel = 'Pre-Construction Aggregate Dump Truck';
  } else if (calcCategory === 'flatbed') {
    rateMultiplier = 1.25;
    categoryLabel = 'Flatbed Structural Materials Delivery';
  }

  const calculatedMin = Math.round(currentCorridor.baseRateMin * rateMultiplier);
  const calculatedMax = Math.round(currentCorridor.baseRateMax * rateMultiplier);

  const handleApplyEstimateToQuote = () => {
    onNavigate('quote');
  };

  // Regional Network Data for Section 07
  const regionalCorridorsInfo = {
    i77: {
      name: 'I-77 Logistics Corridor',
      route: 'Columbia ⇄ Rock Hill ⇄ Charlotte Metro',
      distance: '94 Miles · ~1.8 Hours',
      focus: 'High-volume commercial freight distribution, retail staging, industrial consumer goods, and inter-facility shuttles.',
      connectors: ['I-20 Interchange (Columbia)', 'US-21 Logistics Spine', 'I-485 Outer Loop (Charlotte)'],
      frequency: 'Daily Scheduled Runs',
    },
    i26_port: {
      name: 'I-26 Coastal & Port Corridor',
      route: 'Columbia ⇄ Orangeburg ⇄ Charleston Marine Terminals',
      distance: '114 Miles · ~2.2 Hours',
      focus: 'Maritime container transloading, imported raw materials, breakbulk cargo, and southeastern distribution.',
      connectors: ['Wando Welch Terminal', 'North Charleston Marine Terminal', 'Hugh K. Leatherman Terminal'],
      frequency: 'Continuous Dedicated Access',
    },
    i26_upstate: {
      name: 'I-26 / I-385 Upstate Corridor',
      route: 'Columbia ⇄ Newberry ⇄ Spartanburg / Greenville',
      distance: '102 Miles · ~2.0 Hours',
      focus: 'Automotive manufacturing components, industrial plastics, heavy fabrication, and advanced manufacturing freight.',
      connectors: ['I-85 Manufacturing Axis', 'GSP International Logistics Hub', 'SC Inland Port Greer'],
      frequency: 'Regular Regional Corridors',
    },
    i20: {
      name: 'I-20 Interstate East-West Spine',
      route: 'Florence (I-95 Junction) ⇄ Columbia ⇄ Augusta ⇄ Atlanta',
      distance: '76 – 215 Miles',
      focus: 'East-west commercial supply lines, cross-state logistics relays, building products, and agricultural hauling.',
      connectors: ['I-95 Intersection (Florence)', 'Midlands Interchanges', 'Georgia State Logistics Junctions'],
      frequency: 'Scheduled Contract Lanes',
    },
    midlands: {
      name: 'Greater Midlands Infrastructure Network',
      route: 'Richland, Lexington, Kershaw & Calhoun Counties',
      distance: 'Local Radius (10 – 50 Miles)',
      focus: 'Pre-construction aggregate supply, commercial jobsite staging, excavator mobilization, and urgent cargo van shuttles.',
      connectors: ['Columbia Metropolitan Airport (CAE)', 'Shop Road Industrial Corridor', 'Lexington County Distribution Parks'],
      frequency: 'Same-Day & On-Demand Dispatch',
    },
  };

  const selectedCorridor = regionalCorridorsInfo[activeCorridorId];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      {/* =========================================================================
          SECTION 02: CINEMATIC TECHNOLOGY HERO
          Strict 50/50 CSS Grid layout with min-w-0 isolation.
          Guaranteed zero overlap between left text/buttons and right truck visual.
          Seamless continuous Deep Royal Navy background (#071E41).
          ========================================================================= */}
      <section className="relative bg-[#071E41] text-white overflow-hidden border-b border-[#0D2C5B]">
        {/* Subtle Ambient Radial Highlight — Seamless, continuous, zero rectangular seams */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(ellipse 70% 60% at 75% 30%, rgba(201, 154, 49, 0.25) 0%, rgba(7, 30, 65, 0) 70%)',
          }}
        />

        {/* Faint Technology Grid Mesh (Restrained) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(201, 154, 49, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(201, 154, 49, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full">
            
            {/* Left Column: 50% Allocated Width (Strictly bounded with min-w-0) */}
            <div className="w-full min-w-0 space-y-6">
              
              {/* 1. Official Momentum Logo & Company Name */}
              <div className="flex items-center gap-3.5 sm:gap-4">
                <img
                  src={LOGOS.original}
                  alt="Momentum Transportation & Hauling LLC Official Emblem"
                  width={72}
                  height={72}
                  className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 object-contain shrink-0 aspect-square filter drop-shadow-md select-none"
                  loading="eager"
                  decoding="async"
                />
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white leading-none truncate">
                    MOMENTUM
                  </span>
                  <div className="flex items-center gap-2 mt-1 sm:mt-1.5">
                    <span className="w-3.5 h-[2px] bg-[#C99A31] shrink-0" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-200 font-display truncate">
                      TRANSPORTATION &amp; HAULING LLC
                    </span>
                  </div>
                </div>
              </div>

              {/* 2 & 3. Primary Headlines & Tagline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white leading-[1.15] text-balance">
                  Moving Business Forward.
                </h1>
                <p className="text-lg sm:text-xl font-bold text-[#C99A31] font-display">
                  Transportation &amp; Hauling, Connected by Technology.
                </p>
                {/* 4. Supporting Company Description */}
                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pt-1 max-w-xl">
                  Dependable freight transportation, cargo van delivery, construction hauling and regional logistics solutions—supported by responsive coordination and modern transportation technology.
                </p>
              </div>

              {/* 5, 6, 7. Standardized Calls to Action (Never overlaps truck; wraps naturally or stacks on mobile) */}
              <div className="pt-2 flex flex-wrap items-center gap-3 w-full">
                <button
                  onClick={() => onNavigate('quote')}
                  className="w-full sm:w-auto px-5 py-3 text-xs font-bold tracking-wider uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer text-center shrink-0"
                >
                  <span>REQUEST A QUOTE</span>
                  <ArrowRight className="w-4 h-4 text-[#071E41]" />
                </button>

                <button
                  onClick={() => onNavigate('services')}
                  className="w-full sm:w-auto px-5 py-3 text-xs font-bold tracking-wider uppercase text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-md transition-all font-display backdrop-blur-sm cursor-pointer inline-flex items-center justify-center text-center shrink-0"
                >
                  EXPLORE OUR SERVICES
                </button>

                <button
                  onClick={() => onNavigate('contact')}
                  className="w-full sm:w-auto px-5 py-3 text-xs font-bold tracking-wider uppercase text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-600 rounded-md transition-all font-display cursor-pointer inline-flex items-center justify-center gap-2 text-center shrink-0"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>CONTACT OPERATIONS</span>
                </button>
              </div>

              {/* 8. Regional Location & Dispatch Contact */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C99A31] shrink-0" />
                  <span>Columbia, SC Regional Market Base</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C99A31] shrink-0" />
                  <span>Direct Dispatch: <a href={COMPANY.contact.phoneTel} className="font-semibold text-white hover:text-[#C99A31]">(803) 718-5509</a></span>
                </div>
              </div>
            </div>

            {/* Right Column: 50% Allocated Width (Strictly bounded in normal grid flow) */}
            <div className="w-full min-w-0 relative">
              <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#071E41] group">
                
                {/* Truck Visual Asset in Normal Flow */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden block">
                  <ImageWithFallback
                    src={ASSETS.commercialFreight}
                    alt={ASSET_METADATA.commercialFreight.alt}
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-[1.02] block"
                    fallbackTitle="Momentum Commercial Freight Transport"
                  />

                  {/* Clean subtle bottom gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071E41]/60 via-transparent to-transparent pointer-events-none" />

                  {/* Integrated Animated SVG Logistics Route Vector */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 600 380"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background Route Guide Path */}
                    <path
                      d="M 50 320 C 180 320, 260 250, 360 210 S 520 150, 560 120"
                      stroke="#C99A31"
                      strokeWidth="2.5"
                      strokeDasharray="6 6"
                      strokeOpacity="0.4"
                    />

                    {/* Animated Pulse Beam along highway route */}
                    <path
                      d="M 50 320 C 180 320, 260 250, 360 210 S 520 150, 560 120"
                      stroke="#E8BE65"
                      strokeWidth="3"
                      strokeDasharray="40 180"
                      strokeLinecap="round"
                      style={{
                        animation: 'dashRoute 6s ease-in-out infinite',
                      }}
                    />

                    {/* Origin Hub Beacon: Columbia, SC */}
                    <circle cx="90" cy="310" r="6" fill="#071E41" stroke="#C99A31" strokeWidth="2.5" />
                    <circle cx="90" cy="310" r="11" stroke="#C99A31" strokeWidth="1" strokeOpacity="0.5" className="animate-ping" />

                    {/* Corridor Checkpoints */}
                    <circle cx="360" cy="210" r="5" fill="#C99A31" />
                    <circle cx="560" cy="120" r="6" fill="#071E41" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>

                  {/* Faint Floating HUD Telemetry Overlay Card (Contained within image frame) */}
                  <div className="absolute top-3 right-3 bg-[#071E41]/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-xs shadow-xl max-w-[200px] space-y-1 hidden sm:block pointer-events-none">
                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-1">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#C99A31] shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Dispatch Coordination</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">ONLINE</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-300 truncate">
                      Corridor: <span className="font-semibold text-white">I-77 N Regional Artery</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Milestone: <span className="text-slate-200">Columbia CAE ➔ Charlotte</span>
                    </div>
                    <div className="text-[10px] text-[#C99A31] font-mono font-semibold pt-0.5">
                      Verified Milestone Status
                    </div>
                  </div>

                  {/* Bottom Image Caption Badge (Contained within image frame) */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-[#071E41]/85 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700/60 pointer-events-none">
                    <div className="flex items-center gap-2 truncate">
                      <Navigation className="w-3.5 h-3.5 text-[#C99A31] shrink-0" />
                      <span className="font-semibold text-white truncate">Class 8 Power Unit &amp; 53ft Air-Ride Trailer</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline shrink-0 ml-2">Columbia, SC Base</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03: SMART FREIGHT CORRIDOR ESTIMATOR
          Clean white background, consistent field heights, professional icons,
          navy primary button, gold highlights, and indicative calculation transparency.
          ========================================================================= */}
      <section className="bg-white border-b border-slate-200 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block">
              Freight Transit &amp; Rate Planning
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#071E41] font-display">
              Smart Freight Corridor Estimator
            </h2>
            <p className="text-xs text-slate-500">
              Calculate preliminary regional transit times and rate benchmarks based on standard southeastern commercial corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end bg-[#F5F7FA] p-5 sm:p-6 rounded-xl border border-slate-200">
            {/* Input 1: Origin */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Origin Logistics Hub
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#C99A31] absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={calcOrigin}
                  onChange={(e) => setCalcOrigin(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded focus:border-[#071E41] focus:ring-1 focus:ring-[#071E41] focus:outline-none"
                  placeholder="Columbia, SC (29229)"
                />
              </div>
            </div>

            {/* Input 2: Destination Market */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Destination Market
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-[#C99A31] absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={calcDest}
                  onChange={(e) => setCalcDest(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded focus:border-[#071E41] focus:ring-1 focus:ring-[#071E41] focus:outline-none"
                >
                  <option value="charlotte">Charlotte, NC (I-77 N Corridor)</option>
                  <option value="charleston">Charleston Port, SC (I-26 E Corridor)</option>
                  <option value="greenville">Greenville-Spartanburg, SC (I-26 / I-385)</option>
                  <option value="rock_hill">Rock Hill, SC (I-77 Piedmont Corridor)</option>
                  <option value="florence">Florence, SC (I-20 E / I-95 Junction)</option>
                  <option value="augusta">Augusta / Savannah River, GA (I-20 W)</option>
                  <option value="atlanta">Atlanta Metro Hub, GA (I-20 Regional)</option>
                </select>
              </div>
            </div>

            {/* Input 3: Service Category */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Equipment / Service Type
              </label>
              <div className="relative">
                <SlidersHorizontal className="w-4 h-4 text-[#C99A31] absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={calcCategory}
                  onChange={(e) => setCalcCategory(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded focus:border-[#071E41] focus:ring-1 focus:ring-[#071E41] focus:outline-none"
                >
                  <option value="dry_van">Commercial Freight (53ft Air-Ride Dry Van)</option>
                  <option value="heavy_haul">Commercial Hauling (Heavy Machinery Lowboy)</option>
                  <option value="cargo_van">Cargo Van Delivery (Jobsite / Courier)</option>
                  <option value="dump_truck">Pre-Construction Aggregate Dump Truck</option>
                  <option value="flatbed">Construction Material Flatbed (Steel &amp; Lumber)</option>
                </select>
              </div>
            </div>

            {/* Calculate / Action Button */}
            <div className="lg:col-span-3">
              <button
                type="button"
                onClick={handleApplyEstimateToQuote}
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded transition-colors inline-flex items-center justify-center gap-2 font-display cursor-pointer shadow-sm hover:shadow"
              >
                <span>Lock In Rate Quote</span>
                <ArrowRight className="w-4 h-4 text-[#C99A31]" />
              </button>
            </div>
          </div>

          {/* Real-Time Calculated Benchmark Box */}
          <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Corridor Highway Distance</span>
                <strong className="text-slate-900 font-bold tabular-nums text-sm">{currentCorridor.miles} Miles</strong>
              </div>
              <div className="hidden sm:block text-slate-300">|</div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Transit Window</span>
                <strong className="text-slate-900 font-bold text-sm">{currentCorridor.hours}</strong>
              </div>
              <div className="hidden sm:block text-slate-300">|</div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected Freight Category</span>
                <span className="text-slate-800 font-semibold">{categoryLabel}</span>
              </div>
              <div className="hidden sm:block text-slate-300">|</div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Indicative Rate Calculation</span>
                <strong className="text-[#071E41] font-bold text-sm tabular-nums">
                  ${calculatedMin} – ${calculatedMax} USD
                </strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 italic text-right max-w-xs">
              *Indicative corridor calculation based on regional carrier averages. Official binding rate sheet finalized upon dispatch review.
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04: TRANSPORTATION & HAULING SOLUTIONS
          Five distinct service categories with photorealistic branded images,
          consistent card heights, key capabilities, and Request a Quote actions.
          ========================================================================= */}
      <section className="py-20 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block mb-1">
                Verified Capabilities &amp; Specialized Equipment
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display">
                Transportation &amp; Hauling Solutions
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Precision transport tailored to industrial shippers, commercial manufacturers, and general construction contractors throughout South Carolina and regional corridors.
              </p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs font-bold uppercase tracking-wider text-[#071E41] hover:text-[#C99A31] transition-colors inline-flex items-center gap-1.5 font-display self-start md:self-auto cursor-pointer"
            >
              <span>View All Service Specifications</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Service Card 1: Commercial Freight Transportation */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-52 overflow-hidden relative">
                  <ImageWithFallback
                    src={ASSETS.commercialFreight}
                    alt={ASSET_METADATA.commercialFreight.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    fallbackTitle="Commercial Freight Transport"
                  />
                  <div className="absolute top-3 left-3 bg-[#071E41]/90 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded font-display">
                    Full Truckload &amp; Dedicated
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#071E41] font-display mb-2">
                    Commercial Freight Transportation
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Reliable dry van and palletized freight movement across South Carolina, North Carolina, and Georgia. Clean, late-model air-ride trailers with sealed load security and continuous milestone logging.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>53ft Air-Ride Dry Vans (up to 45,000 lbs max payload)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Dual E-track load securement, cargo bars, and straps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Scheduled route lanes &amp; dedicated regional contract shuttles</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => onNavigate('quote')}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-[#071E41] hover:text-white rounded transition-colors text-center font-display cursor-pointer"
                >
                  Request Freight Quote
                </button>
              </div>
            </div>

            {/* Service Card 2: Commercial Hauling & Machinery */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-52 overflow-hidden relative">
                  <ImageWithFallback
                    src={ASSETS.commercialHauling}
                    alt={ASSET_METADATA.commercialHauling.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    fallbackTitle="Heavy Equipment Hauling"
                  />
                  <div className="absolute top-3 left-3 bg-[#071E41]/90 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded font-display">
                    Heavy Machinery &amp; RGN
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#071E41] font-display mb-2">
                    Commercial Hauling &amp; Machinery
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Specialized transport for industrial machinery, heavy construction plant, and oversized structural equipment. Certified tie-down rigging, lowboy trailers, and route clearance planning.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Lowboy, RGN, and step-deck specialized trailers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Excavator, dozer, loader, and industrial tooling relocation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>South Carolina DOT oversized permit and route coordination</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => onNavigate('quote')}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-[#071E41] hover:text-white rounded transition-colors text-center font-display cursor-pointer"
                >
                  Request Hauling Quote
                </button>
              </div>
            </div>

            {/* Service Card 3: Regional Corridors & Port Access */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-52 overflow-hidden relative">
                  <ImageWithFallback
                    src={ASSETS.regionalCorridors}
                    alt={ASSET_METADATA.regionalCorridors.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    fallbackTitle="Regional Corridors"
                  />
                  <div className="absolute top-3 left-3 bg-[#071E41]/90 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded font-display">
                    I-77 · I-26 · Port Access
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#071E41] font-display mb-2">
                    Regional Corridors &amp; Port Access
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Direct freight runs linking Columbia, SC with the Port of Charleston maritime container terminals, Charlotte regional logistics hubs, and I-85 manufacturing corridors with confirmed delivery appointments.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Port of Charleston access &amp; regional container drayage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>I-77 Corridor: Columbia ⇄ Rock Hill ⇄ Charlotte</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>I-20 Artery: Florence ⇄ Columbia ⇄ Augusta / Atlanta</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => onNavigate('service-areas')}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-[#071E41] hover:text-white rounded transition-colors text-center font-display cursor-pointer"
                >
                  Explore Route Corridors
                </button>
              </div>
            </div>

            {/* Service Card 4: Cargo Van Transportation & Delivery */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-52 overflow-hidden relative">
                  <ImageWithFallback
                    src={ASSETS.cargoVanDelivery}
                    alt={ASSET_METADATA.cargoVanDelivery.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    fallbackTitle="Cargo Van Delivery"
                  />
                  <div className="absolute top-3 left-3 bg-[#071E41]/90 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded font-display">
                    Expedited &amp; Jobsite Courier
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#071E41] font-display mb-2">
                    Cargo Van Transportation &amp; Delivery
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    High-roof commercial cargo van service for rapid warehouse-to-jobsite deliveries, contractor supplies, time-critical equipment replacement, and scheduled distribution routes throughout the Midlands.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Rapid warehouse-to-jobsite contractor deliveries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Scheduled commercial supply shuttles &amp; regional courier</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Direct point-to-point dispatch without hub delays</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => onNavigate('quote')}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-[#071E41] hover:text-white rounded transition-colors text-center font-display cursor-pointer"
                >
                  Request Cargo Van Quote
                </button>
              </div>
            </div>

            {/* Service Card 5: Construction Transportation & Hauling Solutions */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between md:col-span-2 lg:col-span-2">
              <div>
                <div className="h-52 overflow-hidden relative">
                  <ImageWithFallback
                    src={ASSETS.preconstructionHauling}
                    alt={ASSET_METADATA.preconstructionHauling.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    fallbackTitle="Construction Hauling Logistics"
                  />
                  <div className="absolute top-3 left-3 bg-[#071E41]/90 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded font-display">
                    Earthwork, Aggregate &amp; Jobsite Staging
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#071E41] font-display mb-2">
                    Construction Transportation &amp; Hauling Solutions
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Comprehensive project logistics supporting every phase of commercial and industrial construction: tandem/tri-axle dump truck aggregate supply (gravel, stone, sand), flatbed building material transit, and heavy machinery mobilization.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Dump truck aggregate &amp; pre-construction site preparation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Flatbed delivery of structural steel, rebar, &amp; framing lumber</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Heavy equipment mobilization on certified lowboys</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0 mt-0.5" />
                      <span>Scheduled project logistics coordination &amp; staging</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onNavigate('quote')}
                  className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded transition-colors text-center font-display cursor-pointer"
                >
                  Quote Construction Hauling
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-slate-200 rounded transition-colors text-center font-display cursor-pointer"
                >
                  Speak With Dispatch Team
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05: TECHNOLOGY-CONNECTED LOGISTICS
          Title: Modern Logistics. Connected Operations.
          Four capabilities: Route Planning, Dispatch Communication,
          Delivery Scheduling, Shipment Visibility. Includes Southeast Regional
          Logistics Network visual asset.
          ========================================================================= */}
      <section className="py-20 bg-[#071E41] text-white relative overflow-hidden border-t border-[#0D2C5B]">
        {/* Faint Background Network Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(201, 154, 49, 0.25) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display block mb-1">
              Technology &amp; Operational Coordination
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Modern Logistics. Connected Operations.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              We leverage digital routing coordination, direct dispatch communication, and structured milestone tracking to deliver responsive transportation management for southeastern shippers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Four Capabilities Grid */}
            <div className="lg:col-span-7 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Capability 1: Route Planning */}
              <div className="p-6 rounded-xl bg-[#041228]/80 border border-slate-700/80 space-y-3 hover:border-[#C99A31]/60 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#C99A31]/15 text-[#C99A31] flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-display">
                  Route Planning
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Organized transportation route coordination analyzing commercial interstate arteries (I-77, I-26, I-20) to bypass congestion and deliver on schedule.
                </p>
                <div className="text-[11px] text-[#C99A31] font-semibold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Optimized regional corridors</span>
                </div>
              </div>

              {/* Capability 2: Dispatch Communication */}
              <div className="p-6 rounded-xl bg-[#041228]/80 border border-slate-700/80 space-y-3 hover:border-[#C99A31]/60 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#C99A31]/15 text-[#C99A31] flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-display">
                  Dispatch Communication
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct coordination between customers and our Columbia operations desk. Speak directly with experienced logistics coordinators for immediate status updates.
                </p>
                <div className="text-[11px] text-[#C99A31] font-semibold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Direct phone line: 803-718-5509</span>
                </div>
              </div>

              {/* Capability 3: Delivery Scheduling */}
              <div className="p-6 rounded-xl bg-[#041228]/80 border border-slate-700/80 space-y-3 hover:border-[#C99A31]/60 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#C99A31]/15 text-[#C99A31] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-display">
                  Delivery Scheduling
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Rigorous pickup and delivery appointment planning around customer and receiver dock requirements, jobsite crane staging, and warehouse hours.
                </p>
                <div className="text-[11px] text-[#C99A31] font-semibold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Scheduled appointment compliance</span>
                </div>
              </div>

              {/* Capability 4: Shipment Visibility */}
              <div className="p-6 rounded-xl bg-[#041228]/80 border border-slate-700/80 space-y-3 hover:border-[#C99A31]/60 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#C99A31]/15 text-[#C99A31] flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-display">
                  Shipment Visibility
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Verified milestone reporting and signed Proof of Delivery (POD) documentation accessible through the online Customer Portal or via direct email.
                </p>
                <div className="text-[11px] text-[#C99A31] font-semibold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Documented POD &amp; verified check-ins</span>
                </div>
              </div>

            </div>

            {/* Right: Connected Network Visualization Card */}
            <div className="lg:col-span-5 min-w-0 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#041228]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ImageWithFallback
                    src={ASSETS.connectedLogisticsNetwork}
                    alt={ASSET_METADATA.connectedLogisticsNetwork.alt}
                    className="w-full h-full object-cover"
                    fallbackTitle="Southeast Regional Freight Logistics Network"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041228] via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C99A31]">
                      Regional Transit Topology
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Hub: Columbia CAE (29229)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Momentum coordinates freight across a dedicated web of primary regional hubs: connecting Columbia with Charlotte, Charleston Port, Greenville-Spartanburg, and the I-20 Atlanta artery.
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('service-areas')}
                      className="text-xs font-bold uppercase text-[#C99A31] hover:text-[#E8BE65] inline-flex items-center gap-1.5 font-display"
                    >
                      <span>Explore Regional Service Network</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onNavigate('portal')}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                    >
                      Customer Portal
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#041228]/50 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">Operational Transparency Notice:</span> Real-time telemetry indicators are illustrative representations of operational coordination. Official delivery milestones are recorded by dispatch personnel.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 06: CONSTRUCTION DEVELOPMENT LOGISTICS
          Title: Supporting Every Stage of Construction.
          5 Stages: Pre-construction, Equipment mobilization, Active hauling,
          Supplier-to-jobsite transport, Project logistics coordination.
          ========================================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 relative group">
                <ImageWithFallback
                  src={ASSETS.constructionLogistics}
                  alt={ASSET_METADATA.constructionLogistics.alt}
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                  fallbackTitle="Momentum Construction Staging & Equipment Logistics"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display">
                    Commercial Staging &amp; Supply Coordination
                  </div>
                  <h4 className="text-base font-bold font-display mt-0.5">
                    Coordinated Jobsite Hauling Fleet
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Tri-axle dump trucks, flatbed material trailers, and equipment mobilization.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="p-3 rounded-lg bg-[#F5F7FA] border border-slate-200">
                  <strong className="block text-[#071E41]">Aggregate Capacity:</strong>
                  <span>Crushed run, gravel, stone, and sand hauling.</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F5F7FA] border border-slate-200">
                  <strong className="block text-[#071E41]">Structural Freight:</strong>
                  <span>Structural steel, joists, framing, and lumber.</span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block mb-1">
                  Site Preparation to Final Delivery
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display text-balance">
                  Supporting Every Stage of Construction.
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  General contractors, earthwork specialists, and building material suppliers depend on Momentum for dependable jobsite supply lines. We eliminate downtime by staging materials precisely when crews are ready.
                </p>
              </div>

              {/* 5 Construction Stages */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-[#F5F7FA] transition-colors border border-transparent hover:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 font-display">
                    01
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#071E41] uppercase tracking-wider font-display">
                      Pre-Construction Material Deliveries
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Dump truck aggregate delivery for site pads, access roads, gravel base, and grading materials.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-[#F5F7FA] transition-colors border border-transparent hover:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 font-display">
                    02
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#071E41] uppercase tracking-wider font-display">
                      Equipment Mobilization
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Safe relocation of excavators, wheel loaders, scissor lifts, and site machinery on specialized lowboys.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-[#F5F7FA] transition-colors border border-transparent hover:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 font-display">
                    03
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#071E41] uppercase tracking-wider font-display">
                      Active Construction Hauling
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Continuous day-to-day jobsite replenishment, scheduled supply drops, and bulk material transport.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-[#F5F7FA] transition-colors border border-transparent hover:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 font-display">
                    04
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#071E41] uppercase tracking-wider font-display">
                      Supplier-to-Jobsite Transportation
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Flatbed transport of structural steel, precast concrete, drywall, insulation, and commercial building packages.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-[#F5F7FA] transition-colors border border-transparent hover:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 font-display">
                    05
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#071E41] uppercase tracking-wider font-display">
                      Project Logistics Coordination
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Multi-vehicle coordination tailored around congested construction entrances, crane pick windows, and safety protocols.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('quote')}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Request Construction Hauling Proposal</span>
                  <ArrowRight className="w-4 h-4 text-[#C99A31]" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 07: REGIONAL TRANSPORTATION COVERAGE
          Interactive regional corridor explorer featuring Columbia and primary
          operating corridors. Deep navy lines, metallic gold markers.
          ========================================================================= */}
      <section className="py-20 bg-[#F5F7FA] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block mb-1">
                Regional Logistics Reach
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display">
                Regional Transportation Coverage
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Strategically headquartered at 2 Penhurst Ct. in Columbia, SC, Momentum connects major commercial markets, manufacturing hubs, and deepwater marine ports across the Carolinas.
              </p>
            </div>
            <button
              onClick={() => onNavigate('service-areas')}
              className="text-xs font-bold uppercase tracking-wider text-[#071E41] hover:text-[#C99A31] transition-colors inline-flex items-center gap-1.5 font-display self-start md:self-auto cursor-pointer"
            >
              <span>Explore Complete Coverage Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Interactive Corridor Selector Tabs */}
            <div className="lg:col-span-5 min-w-0 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1 font-display">
                Select Operating Corridor to Inspect:
              </span>

              {[
                { id: 'i77', name: 'I-77 Corridor: Columbia ⇄ Charlotte', miles: '94 Miles' },
                { id: 'i26_port', name: 'I-26 Corridor: Port of Charleston', miles: '114 Miles' },
                { id: 'i26_upstate', name: 'I-26 Corridor: Greenville / Upstate', miles: '102 Miles' },
                { id: 'i20', name: 'I-20 Interstate: Florence ⇄ Atlanta', miles: '76 - 215 Miles' },
                { id: 'midlands', name: 'Greater Midlands Infrastructure Zone', miles: 'Local Radius' },
              ].map((corridor) => {
                const isSelected = activeCorridorId === corridor.id;
                return (
                  <button
                    key={corridor.id}
                    onClick={() => setActiveCorridorId(corridor.id as any)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#071E41] text-white border-[#071E41] shadow-md ring-1 ring-[#C99A31]'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold font-display ${isSelected ? 'text-[#C99A31]' : 'text-[#071E41]'}`}>
                        {corridor.name}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {corridor.miles} · Highway transit corridor
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-[#C99A31]' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Detailed Corridor Inspector Card */}
            <div className="lg:col-span-7 min-w-0 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#C99A31] font-display">
                    Inspected Freight Lane
                  </span>
                  <h3 className="text-xl font-bold text-[#071E41] font-display">
                    {selectedCorridor.name}
                  </h3>
                </div>
                <div className="bg-[#F5F7FA] px-3 py-1.5 rounded border border-slate-200 text-xs font-bold text-[#071E41]">
                  {selectedCorridor.distance}
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div>
                  <strong className="block text-[#071E41] mb-0.5">Route Termini:</strong>
                  <span className="text-slate-800 font-medium">{selectedCorridor.route}</span>
                </div>

                <div>
                  <strong className="block text-[#071E41] mb-0.5">Key Freight &amp; Industry Focus:</strong>
                  <p className="text-slate-600 leading-relaxed">{selectedCorridor.focus}</p>
                </div>

                <div>
                  <strong className="block text-[#071E41] mb-1.5">Principal Interchange Connectors:</strong>
                  <div className="flex flex-wrap gap-2">
                    {selectedCorridor.connectors.map((connector, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-[#F5F7FA] text-slate-700 border border-slate-200 text-[11px]">
                        {connector}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#071E41]/5 border border-[#071E41]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C99A31]" />
                    <span className="font-semibold text-[#071E41]">Dispatch Frequency:</span>
                  </div>
                  <strong className="text-slate-900">{selectedCorridor.frequency}</strong>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onNavigate('quote')}
                  className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display transition-colors text-center cursor-pointer"
                >
                  Quote Freight On This Lane
                </button>
                <a
                  href={COMPANY.contact.phoneTel}
                  className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-slate-200 rounded font-display transition-colors text-center"
                >
                  Speak With Lane Dispatcher
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 08: CORPORATE TRUST AND BUSINESS CHARACTER
          Title: Built on Reliability. Driven by Professionalism.
          5 Principles: Safety, Accountability, Clear Communication,
          Transportation Coordination, Customer-Focused Service.
          ========================================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block mb-1">
              Foundational Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display">
              Built on Reliability. Driven by Professionalism.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              In commercial logistics, confidence is earned on the highway through meticulous pre-trip inspections, disciplined driving, honest communication, and punctual execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Principle 1: Safety First */}
            <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold font-display text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Safety First
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Daily pre-trip and post-trip mechanical inspections, rigorous cargo tie-down checks, and strict FMCSA compliance on every haul.
              </p>
            </div>

            {/* Principle 2: Complete Accountability */}
            <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold font-display text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Accountability
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We accept direct responsibility from initial load tender to signed receiver delivery. No excuses, no third-party deflection.
              </p>
            </div>

            {/* Principle 3: Clear Communication */}
            <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold font-display text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Clear Communication
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct phone and digital access to our Columbia dispatch personnel. No automated phone trees or unresponsive email queues.
              </p>
            </div>

            {/* Principle 4: Transportation Coordination */}
            <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold font-display text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Transportation Coordination
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Disciplined coordination aligning shipper pickup appointments, interstate transit windows, and receiver dock protocols.
              </p>
            </div>

            {/* Principle 5: Customer-Focused Service */}
            <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold font-display text-sm">
                05
              </div>
              <h3 className="text-base font-bold text-[#071E41] font-display">
                Customer-Focused
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We treat our clients as long-term business partners, delivering solutions tailored to your unique operational timelines.
              </p>
            </div>

          </div>

          {/* Operational Headquarters Anchor Card */}
          <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[#071E41] text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C99A31] font-display">
                Corporate Headquarters &amp; Terminal Staging
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display">
                Momentum Transportation &amp; Hauling LLC
              </h3>
              <p className="text-xs text-slate-300">
                2 Penhurst Ct., Columbia, South Carolina 29229 · Operational Dispatch: (803) 718-5509
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('about')}
                className="px-5 py-2.5 text-xs font-bold uppercase text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded font-display"
              >
                About Our Company
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-2.5 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display"
              >
                Contact Operations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMPANY PROFILE PDF SECTION per Directive Section 12
          Heading: Discover Momentum Transportation & Hauling LLC
          Description: Explore our corporate background, transportation and hauling services,
          regional logistics coverage, operational philosophy and contact information.
          Buttons: VIEW COMPANY PROFILE, DOWNLOAD COMPANY PROFILE
          Preview: Actual first page of the PDF as high-resolution thumbnail
          ========================================================================= */}
      <section className="py-20 bg-[#F5F7FA] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 min-w-0 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded border border-slate-200 text-[#071E41] text-xs font-bold uppercase tracking-wider font-display shadow-xs">
                <FileText className="w-3.5 h-3.5 text-[#C99A31]" />
                <span>Official Corporate Publication</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071E41] tracking-tight font-display">
                  Discover Momentum Transportation &amp; Hauling LLC
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                  Explore our corporate background, transportation and hauling services, regional logistics coverage, operational philosophy and contact information.
                </p>
              </div>

              {/* 7-Page Outline Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <span className="w-5 h-5 rounded-full bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span className="font-medium">Corporate Company Profile Cover</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <span className="w-5 h-5 rounded-full bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span className="font-medium">Corporate Overview &amp; Corridor Map</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <span className="w-5 h-5 rounded-full bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                  <span className="font-medium">Mission, Vision &amp; Guiding Principles</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <span className="w-5 h-5 rounded-full bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-[10px] shrink-0">4</span>
                  <span className="font-medium">Core Transportation &amp; Hauling Services</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <span className="w-5 h-5 rounded-full bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-[10px] shrink-0">5</span>
                  <span className="font-medium">Industries &amp; Customers Served</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <span className="w-5 h-5 rounded-full bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-[10px] shrink-0">6</span>
                  <span className="font-medium">Operational Philosophy &amp; Dispatch</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 text-slate-700 shadow-xs sm:col-span-2">
                  <span className="w-5 h-5 rounded-full bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-[10px] shrink-0">7</span>
                  <span className="font-medium">Corporate Contact Directory, Location &amp; Quotation Inquiries</span>
                </div>
              </div>

              {/* Standardized View & Download Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={COMPANY_PROFILE_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold tracking-wider uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 text-center"
                >
                  <ExternalLink className="w-4 h-4 text-[#071E41]" />
                  <span>VIEW COMPANY PROFILE</span>
                </a>

                <a
                  href={COMPANY_PROFILE_PDF_URL}
                  download="Momentum_Transportation_and_Hauling_Services.pdf"
                  className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold tracking-wider uppercase text-[#071E41] bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-all font-display inline-flex items-center justify-center gap-2 text-center shadow-xs"
                >
                  <Download className="w-4 h-4 text-[#C99A31]" />
                  <span>DOWNLOAD COMPANY PROFILE</span>
                </a>
              </div>
            </div>

            {/* Right Preview Column: Actual Page 1 High-Res Thumbnail */}
            <div className="lg:col-span-5 min-w-0 flex justify-center">
              <div className="relative group max-w-sm w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#C99A31] to-[#071E41] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-2xl bg-white">
                  <a
                    href={COMPANY_PROFILE_PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative overflow-hidden group cursor-pointer"
                    title="Click to view full 7-page company profile PDF"
                  >
                    <img
                      src={ASSETS.companyProfileThumbnail}
                      alt="Momentum Transportation & Hauling LLC Corporate Company Profile Cover"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-[#071E41]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-[#071E41] text-white text-xs font-bold rounded shadow-lg flex items-center gap-2 border border-[#C99A31]">
                        <ExternalLink className="w-3.5 h-3.5 text-[#C99A31]" />
                        <span>Open 7-Page PDF</span>
                      </span>
                    </div>
                  </a>
                  <div className="p-3.5 bg-[#071E41] text-center border-t border-slate-800 text-white">
                    <span className="text-xs font-bold block">Official 7-Page Corporate Profile</span>
                    <span className="text-[11px] text-slate-300 block mt-0.5">Columbia, South Carolina · United States of America</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 09: FINAL CALL TO ACTION
          Deep Royal Navy background (#071E41) with metallic gold accents.
          Headline: Let's Move Your Business Forward.
          Buttons: REQUEST A QUOTE, CONTACT OPERATIONS.
          Direct contacts: (803) 718-5509, wright.wendell@icloud.com
          ========================================================================= */}
      <section className="bg-gradient-to-r from-[#071E41] via-[#0B2B5C] to-[#071E41] text-white py-16 border-t border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
            Direct Dispatch Line · Columbia, SC
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display max-w-2xl mx-auto text-balance">
            Let&apos;s Move Your Business Forward.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Discuss your transportation, hauling or construction logistics requirements with Momentum. Our Columbia dispatch team provides verified rate confirmations and rapid capacity answers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('quote')}
              className="px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-lg hover:shadow-xl cursor-pointer inline-flex items-center gap-2"
            >
              <span>REQUEST A QUOTE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors font-display inline-flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#C99A31]" />
              <span>CONTACT OPERATIONS</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-700/60 max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-300">
            <a href={COMPANY.contact.phoneTel} className="font-semibold text-white hover:text-[#C99A31] inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#C99A31]" />
              <span>(803) 718-5509</span>
            </a>
            <span className="hidden sm:inline text-slate-500">·</span>
            <a href={COMPANY.contact.emailMailto} className="font-semibold text-white hover:text-[#C99A31]">
              wright.wendell@icloud.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
