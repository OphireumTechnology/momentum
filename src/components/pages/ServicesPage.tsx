import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (page: PageView) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'transportation' | 'hauling' | 'dedicated'>('transportation');

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Page Header */}
      <section className="bg-[#071E41] text-white py-16 lg:py-20 border-b border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Commercial Capabilities
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Transportation &amp; Hauling Services
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Engineered for South Carolina and southeastern businesses needing safe freight movement, reliable dry van transport, and specialized heavy hauling.
            </p>
          </div>

          {/* Interactive Filter Control (Clean Segmented Tabs per Frontend Design Constitution §1.A) */}
          <div className="mt-8 flex items-center gap-1.5 p-1 bg-[#041228]/80 border border-slate-700/60 rounded-lg max-w-xl">
            <button
              onClick={() => setActiveTab('transportation')}
              className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                activeTab === 'transportation'
                  ? 'bg-[#C99A31] text-[#071E41] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Freight Transportation
            </button>
            <button
              onClick={() => setActiveTab('hauling')}
              className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                activeTab === 'hauling'
                  ? 'bg-[#C99A31] text-[#071E41] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Commercial Hauling
            </button>
            <button
              onClick={() => setActiveTab('dedicated')}
              className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                activeTab === 'dedicated'
                  ? 'bg-[#C99A31] text-[#071E41] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Dedicated Corridors
            </button>
          </div>
        </div>
      </section>

      {/* 1. TRANSPORTATION SERVICES SECTION */}
      {activeTab === 'transportation' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display">
                  Core Freight Transport
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071E41] font-display">
                  Full Truckload &amp; Regional Dry Van Services
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Momentum provides dependable point-to-point freight transport for commercial goods, manufacturing components, retail stock, and packaging materials. We operate 53ft air-ride dry van trailers equipped with logistical E-track track systems and load-lock bars to guarantee freight stability from dock to dock.
                </p>

                <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#071E41] font-display">
                    Supported Load Types:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Palletized Commercial Freight</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Finished Industrial Products</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Building Materials &amp; Dry Goods</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Corrugated Packaging &amp; Paper</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => onNavigate('quote')}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Request Freight Quote</span>
                    <ArrowRight className="w-4 h-4 text-[#C99A31]" />
                  </button>
                  <button
                    onClick={() => onNavigate('fleet')}
                    className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded font-display"
                  >
                    View Van Specs
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
                  <ImageWithFallback
                    src={ASSETS.transportationHero}
                    alt={ASSET_METADATA.transportationHero.alt}
                    className="w-full h-80 object-cover"
                    fallbackTitle="Dry Van Freight Transport"
                  />
                  <div className="p-4 bg-white border-t border-slate-200 text-xs">
                    <div className="font-bold text-[#071E41]">Regional Highway Transit</div>
                    <div className="text-slate-500 text-[11px]">Safe, on-schedule freight movements across the Carolinas.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Operational Specs Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#071E41] font-display mb-4">
                Transportation Operating Specifications
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Parameter</th>
                      <th className="py-3 px-4">Standard Capability</th>
                      <th className="py-3 px-4">Operational Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#071E41]">Maximum Payload</td>
                      <td className="py-3 px-4 tabular-nums">Up to 45,000 lbs</td>
                      <td className="py-3 px-4">Weight distribution monitored across tandem drive &amp; trailer axles</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#071E41]">Trailer Dimensions</td>
                      <td className="py-3 px-4 tabular-nums">53ft Length x 102in Width x 110in Interior Height</td>
                      <td className="py-3 px-4">Accommodates standard 48x40 pallets (up to 26 single, 52 double-stacked)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#071E41]">Cargo Securement</td>
                      <td className="py-3 px-4">Dual E-Track rows, heavy ratchet straps &amp; load bars</td>
                      <td className="py-3 px-4">FMCSR 393 compliant tie-down protocols</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#071E41]">Dispatch Radius</td>
                      <td className="py-3 px-4">Same-day regional (up to 350 miles from Columbia, SC)</td>
                      <td className="py-3 px-4">Extended regional lanes coordinated upon request</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. HAULING SERVICES SECTION */}
      {activeTab === 'hauling' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display">
                  Commercial Hauling
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071E41] font-display">
                  Heavy Equipment &amp; Industrial Hauling
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Momentum coordinates specialized hauling for construction machinery, industrial equipment, building materials, and site infrastructure components. Utilizing flatbeds, step decks, and lowboy equipment, we stage and transport heavy assets with strict securement protocols.
                </p>

                <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#071E41] font-display">
                    Supported Hauling Categories:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Excavators &amp; Compact Track Loaders</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Structural Steel &amp; Rebar Bundles</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Commercial Generators &amp; Transformers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#C99A31]" />
                      <span>Job-Site Staging &amp; Equipment Relocation</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => onNavigate('quote')}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Request Hauling Quote</span>
                    <ArrowRight className="w-4 h-4 text-[#C99A31]" />
                  </button>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded font-display"
                  >
                    Consult Dispatch
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
                  <ImageWithFallback
                    src={ASSETS.haulingHero}
                    alt={ASSET_METADATA.haulingHero.alt}
                    className="w-full h-80 object-cover"
                    fallbackTitle="Heavy Equipment Hauling"
                  />
                  <div className="p-4 bg-white border-t border-slate-200 text-xs">
                    <div className="font-bold text-[#071E41]">Industrial Site Transport</div>
                    <div className="text-slate-500 text-[11px] italic">
                      *Illustrative concept. Exact vehicle and trailer selected upon equipment review.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hauling Protocol Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h4 className="text-sm font-bold text-[#071E41]">Load Weight &amp; Dimension Assessment</h4>
                <p className="text-xs text-slate-600">
                  Exact height, width, and axle load parameters are checked prior to dispatch to prevent bridge clearance and weigh-station issues.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h4 className="text-sm font-bold text-[#071E41]">Grade 70 Transport Chains</h4>
                <p className="text-xs text-slate-600">
                  Heavy machinery is secured with high-tensile binder chains, boomer ratchets, and protective edge cushions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded bg-[#071E41] text-[#C99A31] flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h4 className="text-sm font-bold text-[#071E41]">Site Access Coordination</h4>
                <p className="text-xs text-slate-600">
                  Our dispatch verifies unpaved job-site access roads, ground stability, and turnaround clearances before arriving.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. DEDICATED CORRIDORS SECTION */}
      {activeTab === 'dedicated' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display">
                  Regional Route Mastery
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071E41] font-display">
                  Dedicated Corridor Shuttle &amp; Contract Lanes
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  For businesses with regular freight between Columbia, South Carolina and key manufacturing or port clusters, Momentum establishes recurring scheduled runs. Lock in dependable truck capacity and predictable transit intervals without spot-market volatility.
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-white border border-slate-200 flex items-start gap-3">
                    <span className="font-bold text-xs text-[#071E41] bg-slate-100 px-2 py-1 rounded">I-77</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Columbia, SC ⇄ Charlotte, NC</div>
                      <div className="text-[11px] text-slate-500">Same-day turnaround for industrial manufacturing and distribution.</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-slate-200 flex items-start gap-3">
                    <span className="font-bold text-xs text-[#071E41] bg-slate-100 px-2 py-1 rounded">I-26</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Columbia, SC ⇄ Port of Charleston</div>
                      <div className="text-[11px] text-slate-500">Container drayage connectors, port facility freight, and export cargo staging.</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-slate-200 flex items-start gap-3">
                    <span className="font-bold text-xs text-[#071E41] bg-slate-100 px-2 py-1 rounded">I-20</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Midlands ⇄ Florence &amp; Augusta / Atlanta</div>
                      <div className="text-[11px] text-slate-500">Cross-state distribution connecting warehouse logistics corridors.</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('quote')}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Request Contract Lane Quote</span>
                    <ArrowRight className="w-4 h-4 text-[#C99A31]" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
                  <ImageWithFallback
                    src={ASSETS.serviceAreas}
                    alt={ASSET_METADATA.serviceAreas.alt}
                    className="w-full h-80 object-cover"
                    fallbackTitle="Regional Corridors"
                  />
                  <div className="p-4 bg-white border-t border-slate-200 text-xs">
                    <div className="font-bold text-[#071E41]">South Carolina Freight Corridors</div>
                    <div className="text-slate-500 text-[11px]">Direct hub connections out of Columbia, SC.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Customer Action CTA */}
      <section className="bg-white py-14 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-[#071E41] font-display">Need a customized freight solution?</h3>
            <p className="text-xs text-slate-600 mt-1">Our dispatchers will evaluate your exact weight, dimensions, and schedule.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('quote')}
              className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display"
            >
              Request Quote
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-display"
            >
              Contact Dispatch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
