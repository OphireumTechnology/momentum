import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  MapPin,
  Navigation,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ServiceAreasPageProps {
  onNavigate: (page: PageView) => void;
}

interface CorridorDetail {
  id: string;
  name: string;
  highway: string;
  primaryHubs: string[];
  distanceMiles: number;
  avgTransitTime: string;
  cargoTypes: string;
  keyAccessPoints: string;
}

export const ServiceAreasPage: React.FC<ServiceAreasPageProps> = ({ onNavigate }) => {
  const [selectedCorridor, setSelectedCorridor] = useState<string>('i77');

  const corridors: CorridorDetail[] = [
    {
      id: 'i77',
      name: 'I-77 Northern Corridor',
      highway: 'Interstate 77 North',
      primaryHubs: ['Columbia, SC (29229)', 'Blythewood, SC', 'Rock Hill, SC', 'Charlotte, NC (Metro)'],
      distanceMiles: 94,
      avgTransitTime: '1.75 – 2.25 Hours',
      cargoTypes: 'Industrial manufacturing freight, retail dry van, automotive parts, machinery',
      keyAccessPoints: 'Direct access to Charlotte industrial clusters, I-85 junction, and Piedmont distribution centers',
    },
    {
      id: 'i26',
      name: 'I-26 Southeastern & Port Corridor',
      highway: 'Interstate 26 East & West',
      primaryHubs: ['Columbia, SC', 'Orangeburg, SC', 'Charleston Port Terminals, SC', 'Upstate SC (Spartanburg/Greenville)'],
      distanceMiles: 114,
      avgTransitTime: '2.0 – 2.5 Hours',
      cargoTypes: 'Port container connector freight, export staging, heavy manufacturing, steel',
      keyAccessPoints: 'Wando Welch Terminal, North Charleston Terminal, inland rail hubs, and BMW manufacturing supply chain',
    },
    {
      id: 'i20',
      name: 'I-20 Cross-Midlands Corridor',
      highway: 'Interstate 20 East & West',
      primaryHubs: ['Columbia, SC', 'Lexington, SC', 'Aiken, SC', 'Augusta, GA / Atlanta Connector', 'Florence, SC'],
      distanceMiles: 160,
      avgTransitTime: '2.5 – 3.25 Hours',
      cargoTypes: 'Commercial distribution freight, paper products, agricultural equipment, chemical containers',
      keyAccessPoints: 'Midlands distribution parks, Augusta industrial belt, and I-95 junction at Florence',
    },
    {
      id: 'midlands',
      name: 'Greater Midlands & Local Hauling',
      highway: 'SC Highways & Local Arteries',
      primaryHubs: ['Richland County', 'Lexington County', 'Cayce & West Columbia', 'Sumter & Camden'],
      distanceMiles: 35,
      avgTransitTime: '0.5 – 1.0 Hour',
      cargoTypes: 'Construction machinery relocation, site materials, local business deliveries, job-site staging',
      keyAccessPoints: 'Job-site direct delivery, warehouse cross-docking, and immediate dispatch availability',
    },
  ];

  const current = corridors.find((c) => c.id === selectedCorridor) || corridors[0];

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#071E41] text-white py-16 lg:py-20 border-b border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Regional Geographic Coverage
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Service Areas &amp; Corridors
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Centered at 2 Penhurst Ct., Columbia, SC 29229. We provide reliable freight transportation and hauling focused on verified southeastern interstate corridors.
            </p>
          </div>
        </div>
      </section>

      {/* Main Map & Corridor Explorer */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Corridor Selection List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#071E41] font-display mb-3 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#C99A31]" />
                <span>Select Operating Corridor</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Click a route to view mileage, estimated transit times, and supported freight types originating from Columbia, SC.
              </p>

              <div className="space-y-2.5">
                {corridors.map((corridor) => {
                  const isSelected = corridor.id === selectedCorridor;
                  return (
                    <button
                      key={corridor.id}
                      onClick={() => setSelectedCorridor(corridor.id)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#071E41] bg-[#071E41] text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold font-display ${isSelected ? 'text-[#C99A31]' : 'text-[#071E41]'}`}>
                          {corridor.highway}
                        </span>
                        <span className={`text-[10px] tabular-nums font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          ~{corridor.distanceMiles} mi
                        </span>
                      </div>
                      <div className={`text-sm font-bold mt-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {corridor.name}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {corridor.primaryHubs[0]} ⇄ {corridor.primaryHubs[corridor.primaryHubs.length - 1]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columbia Headquarters Notice */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-bold text-[#071E41]">
                <MapPin className="w-4 h-4 text-[#C99A31]" />
                <span>Primary Terminal &amp; Dispatch Base</span>
              </div>
              <p className="text-slate-600">
                Momentum Transportation &amp; Hauling LLC<br />
                2 Penhurst Ct., Columbia, SC 29229
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Centrally located with immediate access to I-77 (Exit 19/22) and I-20 for rapid deployment across the Carolinas.
              </p>
            </div>
          </div>

          {/* Detailed Corridor Card + Visual Route Map Representation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="h-64 sm:h-72 overflow-hidden relative">
                <ImageWithFallback
                  src={ASSETS.serviceAreas}
                  alt={ASSET_METADATA.serviceAreas.alt}
                  className="w-full h-full object-cover"
                  fallbackTitle="Southeastern Interstate Corridor"
                />
                <div className="absolute top-4 left-4 bg-[#071E41]/90 backdrop-blur-sm text-white px-3 py-1.5 rounded text-xs font-bold font-display flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>{current.highway}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C99A31] font-display">
                    Corridor Details
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#071E41] font-display mt-0.5">
                    {current.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">Estimated Distance:</span>
                    <span className="font-bold text-slate-800 text-sm tabular-nums">~{current.distanceMiles} Miles</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">Typical Transit Window:</span>
                    <span className="font-bold text-slate-800 text-sm">{current.avgTransitTime}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="text-slate-800 block mb-1">Key Connecting Hubs:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {current.primaryHubs.map((hub, i) => (
                        <span key={i} className="bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded text-xs">
                          {hub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <strong className="text-slate-800 block mb-0.5">Primary Cargo Focus:</strong>
                    <p className="text-slate-600">{current.cargoTypes}</p>
                  </div>

                  <div>
                    <strong className="text-slate-800 block mb-0.5">Key Freight Access Points:</strong>
                    <p className="text-slate-600">{current.keyAccessPoints}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Need freight quoted along this lane?
                  </div>
                  <button
                    onClick={() => onNavigate('quote')}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded transition-colors inline-flex items-center gap-1.5 font-display cursor-pointer"
                  >
                    <span>Quote This Corridor</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C99A31]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
