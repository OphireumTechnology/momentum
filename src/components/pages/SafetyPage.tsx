import React from 'react';
import { PageView } from '../common/Header';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  ShieldCheck,
  CheckCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  Gauge,
  Wrench,
} from 'lucide-react';

interface SafetyPageProps {
  onNavigate: (page: PageView) => void;
}

export const SafetyPage: React.FC<SafetyPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#071E41] text-white py-14 border-b border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Operational Standards &amp; Maintenance Rigor
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Safety &amp; Regulatory Compliance
            </h1>
            <p className="text-sm text-slate-300">
              Rigorous inspection standards, certified driver qualifications, and mechanical readiness protect your freight and our communities every mile.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display">
              Pre-Trip &amp; Post-Trip Discipline
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071E41] font-display">
              Zero-Compromise Vehicle Readiness
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every tractor and trailer deployed under Momentum Transportation &amp; Hauling LLC is subjected to mandatory pre-trip safety checks adhering strictly to Federal Motor Carrier Safety Administration (FMCSA) regulations.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Brake chamber stroke, tire tread depth, air line connections, kingpin locking mechanisms, and signal lighting are physically verified before rolling out of our Columbia staging terminal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-[#071E41] uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#C99A31]" />
                  <span>Daily DVIR Logging</span>
                </div>
                <p className="text-xs text-slate-600">
                  Electronic Driver Vehicle Inspection Reports (DVIR) record all mechanical observations before and after each shift.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-[#071E41] uppercase tracking-wider mb-1">
                  <Gauge className="w-4 h-4 text-[#C99A31]" />
                  <span>Hours of Service (HOS)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Certified ELD telematics strictly enforce mandated rest periods and driving-hour caps to prevent driver fatigue.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <ImageWithFallback
                src={ASSETS.safetyHero}
                alt={ASSET_METADATA.safetyHero.alt}
                className="w-full h-80 object-cover"
                fallbackTitle="Safety Inspection Protocol"
              />
              <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-600">
                <div className="font-bold text-[#071E41]">Mechanical Pre-Trip Inspection</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Brake systems, wheel assemblies, and suspension checked prior to regional highway dispatch.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Pillars */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#071E41] font-display">
            The Momentum Safety Pillars
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#071E41] text-sm">1. Cargo Securement Rigor</h4>
              <p className="text-slate-600 leading-relaxed">
                Loads are blocked, braced, and chained according to FMCSR Section 393 standards. Tarps, corner protectors, and steel friction mats are deployed on flatbed freight to eliminate shifting.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#071E41] text-sm">2. Preventive Maintenance</h4>
              <p className="text-slate-600 leading-relaxed">
                Tractors undergo scheduled oil analysis, transmission checks, and computerized brake-roller tests every 15,000 miles to preempt mechanical downtime.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#071E41] text-sm">3. Driver Qualification</h4>
              <p className="text-slate-600 leading-relaxed">
                Drivers maintain active DOT medical cards, clean motor vehicle records, and undergo pre-employment drug and background screening.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
