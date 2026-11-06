import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle,
  Truck,
  Filter,
} from 'lucide-react';

interface FleetPageProps {
  onNavigate: (page: PageView) => void;
}

interface EquipmentCard {
  id: string;
  name: string;
  category: 'Tractor' | 'Dry Van' | 'Flatbed' | 'Heavy Haul';
  payloadCapacity: string;
  dimensions: string;
  status: 'Ready for Dispatch' | 'Scheduled Runs' | 'Inspection Current';
  supportedCargo: string[];
  restrictions: string;
  description: string;
}

export const FleetPage: React.FC<FleetPageProps> = ({ onNavigate }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const equipmentList: EquipmentCard[] = [
    {
      id: 'eq-1',
      name: 'Class 8 Tandem-Axle Commercial Tractor',
      category: 'Tractor',
      payloadCapacity: 'Up to 80,000 lbs Gross Combined Weight (GCWR)',
      dimensions: 'Standard Highway Tractor Wheelbase',
      status: 'Ready for Dispatch',
      supportedCargo: ['General freight', 'Regional intermodal trailers', 'Flatbed loads', 'Heavy haul'],
      restrictions: 'Requires certified CDL-A operator and daily pre-trip logs',
      description: 'Equipped with electronic logging devices (ELD), advanced collision mitigation, and air-ride cab suspension for smooth freight handling.',
    },
    {
      id: 'eq-2',
      name: '53ft Air-Ride Dry Freight Van Trailer',
      category: 'Dry Van',
      payloadCapacity: 'Up to 45,000 lbs Cargo Payload (3,900 cu ft volume)',
      dimensions: '53ft Length x 102in Width x 110in Interior Height',
      status: 'Ready for Dispatch',
      supportedCargo: ['Palletized dry goods', 'Industrial components', 'Consumer retail', 'Electronics'],
      restrictions: 'Weather-tight dry freight only (non-temperature controlled)',
      description: 'Heavy-duty composite side walls, dual logistical E-track rows, swing rear doors, and durable scuff-resistant flooring.',
    },
    {
      id: 'eq-3',
      name: '48ft Aluminum/Steel Combo Flatbed Trailer',
      category: 'Flatbed',
      payloadCapacity: 'Up to 48,000 lbs Distributed Payload',
      dimensions: '48ft Length x 102in Width x 58in Deck Height',
      status: 'Inspection Current',
      supportedCargo: ['Structural steel', 'Lumber & drywall', 'Piping & conduit', 'Pre-cast concrete'],
      restrictions: 'Requires weather tarps if moisture-sensitive; strict chain tie-down calculations',
      description: 'Features sliding winches, heavy stake pockets, steel rub rails, and optional custom tarping kits for weather-sensitive commercial shipments.',
    },
    {
      id: 'eq-4',
      name: '53ft Step Deck / Drop Deck Trailer',
      category: 'Flatbed',
      payloadCapacity: 'Up to 46,000 lbs Payload',
      dimensions: '11ft Upper Deck + 42ft Lower Deck (38in Lower Deck Height)',
      status: 'Scheduled Runs',
      supportedCargo: ['Taller machinery', 'Crated industrial pumps', 'Medium construction equipment'],
      restrictions: 'Lower deck clearance requires smooth ramp transitions during loading',
      description: 'Lower deck height allows transport of cargo up to 10 feet tall without requiring specialized over-height state road permits.',
    },
    {
      id: 'eq-5',
      name: 'Hydraulic Detachable Lowboy (RGN) Trailer',
      category: 'Heavy Haul',
      payloadCapacity: 'Up to 70,000 lbs Concentrated Payload',
      dimensions: '26ft Well Deck (18in Deck Height)',
      status: 'Ready for Dispatch',
      supportedCargo: ['Track excavators', 'Bulldozers', 'Motor graders', 'Heavy transformers'],
      restrictions: 'Permits and route survey required for oversized widths exceeding 102 inches',
      description: 'Detachable front gooseneck allows heavy machinery to be driven directly onto the lowboy deck from ground level safely and efficiently.',
    },
  ];

  const filteredEquipment =
    filterCategory === 'all'
      ? equipmentList
      : equipmentList.filter((eq) => eq.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#071E41] text-white py-16 lg:py-20 border-b border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Commercial Fleet Configurations
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Fleet &amp; Equipment Specifications
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Standard commercial configurations utilized for dry freight distribution, flatbed transport, and heavy machinery hauling.
            </p>
          </div>

          {/* Illustrative Notice Banner (Directive §4 & §6 requirement) */}
          <div className="mt-8 p-4 rounded-lg bg-[#041228] border border-slate-700/80 max-w-3xl text-xs text-slate-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Illustrative Equipment Notice:</strong> Equipment models and dimensions shown represent verified commercial transportation industry configurations. Active vehicles assigned to your shipment are matched to specific load weight, cargo dimensions, and receiving dock requirements at time of dispatch.
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image Showcase */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="rounded-xl overflow-hidden shadow-md border border-slate-200">
          <ImageWithFallback
            src={ASSETS.fleetHero}
            alt={ASSET_METADATA.fleetHero.alt}
            className="w-full h-80 sm:h-96 object-cover"
            fallbackTitle="Commercial Transport Fleet"
          />
          <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
            <span>Illustrative terminal yard concept · Standard American commercial truck equipment</span>
            <span className="text-[#071E41] font-semibold">Columbia, SC Base Operations</span>
          </div>
        </div>
      </section>

      {/* Equipment Cards & Interactive Filter */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Category Filter Controls */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-colors cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-[#071E41] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setFilterCategory('Tractor')}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-colors cursor-pointer ${
                filterCategory === 'Tractor'
                  ? 'bg-[#071E41] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tractors
            </button>
            <button
              onClick={() => setFilterCategory('Dry Van')}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-colors cursor-pointer ${
                filterCategory === 'Dry Van'
                  ? 'bg-[#071E41] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              53ft Dry Vans
            </button>
            <button
              onClick={() => setFilterCategory('Flatbed')}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-colors cursor-pointer ${
                filterCategory === 'Flatbed'
                  ? 'bg-[#071E41] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flatbeds
            </button>
            <button
              onClick={() => setFilterCategory('Heavy Haul')}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-colors cursor-pointer ${
                filterCategory === 'Heavy Haul'
                  ? 'bg-[#071E41] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heavy Haul Lowboys
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-[#071E41]">{filteredEquipment.length}</span> equipment profiles
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C99A31] font-display">
                    {eq.category}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {eq.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#071E41] font-display">
                  {eq.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {eq.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block">Payload Capacity:</span>
                    <span className="text-slate-600 tabular-nums">{eq.payloadCapacity}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Dimensions / Clearances:</span>
                    <span className="text-slate-600">{eq.dimensions}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Supported Cargo:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {eq.supportedCargo.map((item, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="font-bold text-slate-700 block">Operating Considerations:</span>
                    <span className="text-[11px] text-slate-500 italic">{eq.restrictions}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  onClick={() => onNavigate('quote')}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-50 hover:bg-[#071E41] hover:text-white border border-slate-200 rounded transition-colors text-center font-display cursor-pointer"
                >
                  Quote With This Equipment
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
