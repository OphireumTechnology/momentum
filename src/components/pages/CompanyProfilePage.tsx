import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { LOGOS, ASSETS, COMPANY_PROFILE_PDF_URL } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  FileText,
  Download,
  ExternalLink,
  Shield,
  Target,
  Compass,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle2,
  Truck,
  Box,
  Layers,
  Palette,
  Briefcase,
  HardHat,
  Factory,
  Building2,
  Store,
  Warehouse,
  Construction,
  Hammer,
  Wrench,
  Radio,
  FileCheck,
  Award,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface CompanyProfilePageProps {
  onNavigate: (page: PageView) => void;
}

export const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState<number>(1);

  const sections = [
    { id: 1, title: 'Cover & Executive Summary', subtitle: 'Corporate Identity' },
    { id: 2, title: 'Corporate Overview', subtitle: 'Columbia Hub & Corridors' },
    { id: 3, title: 'Mission & Vision', subtitle: 'Strategic Direction' },
    { id: 4, title: 'Core Services', subtitle: '5 Service Categories' },
    { id: 5, title: 'Industries Served', subtitle: '9 Commercial Sectors' },
    { id: 6, title: 'Operational Philosophy', subtitle: 'Safety & Dispatch Model' },
    { id: 7, title: 'Contact Directory', subtitle: 'Direct Operations & Inquiries' },
    { id: 8, title: 'Branding & Collaterals', subtitle: 'Identity, Uniforms & Fleet' },
  ];

  return (
    <div className="bg-[#F5F7FA] min-h-screen text-[#1F2937]">
      {/* =========================================================================
          PAGE HERO & DOWNLOAD HEADER
          ========================================================================= */}
      <section className="relative bg-[#071E41] text-white py-14 sm:py-18 border-b border-[#0D2C5B] overflow-hidden">
        {/* Subtle ambient lighting */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(ellipse 70% 60% at 75% 30%, rgba(201, 154, 49, 0.3) 0%, rgba(7, 30, 65, 0) 70%)',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Header Copy */}
            <div className="lg:col-span-7 min-w-0 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[#C99A31] text-xs font-bold uppercase tracking-wider font-display">
                <FileText className="w-3.5 h-3.5" />
                <span>Authoritative 8-Page Corporate Publication</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={LOGOS.original}
                    alt="Momentum Transportation Official Emblem"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain shrink-0 aspect-square select-none"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display block">
                      MOMENTUM TRANSPORTATION &amp; HAULING LLC
                    </span>
                    <span className="text-sm font-bold text-[#C99A31] font-display italic">
                      Moving Business Forward.
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white leading-tight">
                  Corporate Company Profile
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed pt-1">
                  Complete eight-page corporate profile detailing our Columbia, SC logistics base, core commercial freight and hauling solutions, operational philosophy, contact directory, and official brand standards.
                </p>
              </div>

              {/* Primary Download and View Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={COMPANY_PROFILE_PDF_URL}
                  download="Momentum-Transportation-Company-Profile.pdf"
                  className="px-6 py-3.5 text-xs font-bold tracking-wider uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-lg hover:shadow-xl inline-flex items-center gap-2 cursor-pointer text-center"
                >
                  <Download className="w-4 h-4 text-[#071E41]" />
                  <span>DOWNLOAD COMPANY PROFILE (PDF)</span>
                </a>

                <a
                  href={COMPANY_PROFILE_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 text-xs font-bold tracking-wider uppercase text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-md transition-all font-display backdrop-blur-sm inline-flex items-center gap-2 text-center"
                >
                  <ExternalLink className="w-4 h-4 text-[#C99A31]" />
                  <span>VIEW PDF IN BROWSER</span>
                </a>

                <button
                  onClick={() => onNavigate('quote')}
                  className="px-5 py-3.5 text-xs font-bold tracking-wider uppercase text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-600 rounded-md transition-all font-display cursor-pointer inline-flex items-center gap-2 text-center"
                >
                  <span>REQUEST A QUOTE</span>
                  <ArrowRight className="w-4 h-4 text-[#C99A31]" />
                </button>
              </div>

              {/* Metadata strip */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-300 border-t border-slate-700/60 pt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>Columbia, South Carolina · USA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>(803) 718-5509</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>Complete 8-Page Document · 2.7 MB</span>
                </div>
              </div>
            </div>

            {/* Right: Cover & Collaterals Dual Document Preview */}
            <div className="lg:col-span-5 min-w-0 flex justify-center">
              <div className="relative group max-w-sm w-full">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#C99A31] to-[#071E41] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                <div className="relative rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-white">
                  <a
                    href={COMPANY_PROFILE_PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative overflow-hidden group cursor-pointer"
                    title="Click to view full 8-page company profile PDF in browser"
                  >
                    <img
                      src={ASSETS.companyProfileThumbnail}
                      alt="Momentum Transportation & Hauling LLC Official 8-Page Company Profile Cover"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-[#071E41]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-[#071E41] text-white text-xs font-bold rounded shadow-xl flex items-center gap-2 border border-[#C99A31]">
                        <ExternalLink className="w-4 h-4 text-[#C99A31]" />
                        <span>Open Complete 8-Page PDF</span>
                      </span>
                    </div>
                  </a>
                  <div className="p-3 bg-[#071E41] text-center border-t border-slate-800 text-white flex items-center justify-between text-xs px-4">
                    <span className="font-bold text-[#C99A31]">8-Page Publication</span>
                    <span className="text-slate-300">Public Access · PDF Format</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8-PAGE INTERACTIVE TAB SELECTOR
          ========================================================================= */}
      <section className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display shrink-0 pr-2 hidden md:inline">
              Page Index:
            </span>
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#071E41] text-white shadow-sm'
                      : 'bg-[#F5F7FA] text-slate-700 hover:bg-slate-200 hover:text-[#071E41]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isActive ? 'bg-[#C99A31] text-[#071E41]' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {sec.id}
                  </span>
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PAGE-BY-PAGE DETAILED SECTIONS
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">

        {/* -----------------------------------------------------------------------
            PAGE 1: COVER & EXECUTIVE SUMMARY
            ----------------------------------------------------------------------- */}
        {(activeSection === 1 || activeSection === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#071E41] text-[#C99A31] text-xs font-bold rounded">
                  Page 1 of 8
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#071E41] font-display">
                  Company Profile Cover &amp; Executive Summary
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">PDF Document Cover</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 min-w-0 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block">
                    Authoritative Corporate Identity
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#071E41] font-display">
                    Momentum Transportation &amp; Hauling LLC
                  </h3>
                  <p className="text-base font-bold text-[#C99A31] font-display italic">
                    Moving Business Forward.
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Headquartered in Columbia, South Carolina, Momentum Transportation &amp; Hauling LLC operates as a dedicated freight transportation, equipment hauling, and construction logistics provider. This comprehensive company profile defines our operating capabilities, safety standards, regional corridors, customer base, and corporate contact directory.
                </p>

                <div className="p-4 bg-[#F5F7FA] rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Corporate Headquarters:</span>
                    <span className="font-semibold text-slate-800">2 Penhurst Ct.</span>
                    <span className="block text-slate-600">Columbia, SC 29229 · USA</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Direct Operations &amp; Dispatch:</span>
                    <a href="tel:8037185509" className="font-bold text-[#071E41] hover:text-[#C99A31]">
                      (803) 718-5509
                    </a>
                    <span className="block text-slate-600">wright.wendell@icloud.com</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={COMPANY_PROFILE_PDF_URL}
                    download="Momentum-Transportation-Company-Profile.pdf"
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#071E41]" />
                    <span>Download Official PDF (8 Pages)</span>
                  </a>
                  <button
                    onClick={() => setActiveSection(2)}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-slate-200 rounded font-display inline-flex items-center gap-1.5"
                  >
                    <span>View Page 2: Corporate Overview</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 min-w-0 flex justify-center">
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg max-w-xs">
                  <img
                    src={ASSETS.companyProfileThumbnail}
                    alt="Page 1 Cover Screenshot"
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-2.5 bg-slate-900 text-white text-[11px] text-center font-medium">
                    Page 1: Official Corporate Profile Cover
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PAGE 2: CORPORATE OVERVIEW
            ----------------------------------------------------------------------- */}
        {(activeSection === 2 || activeSection === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#071E41] text-[#C99A31] text-xs font-bold rounded">
                  Page 2 of 8
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#071E41] font-display">
                  1. Corporate Overview
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Columbia Hub &amp; Corridors</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 min-w-0 space-y-5">
                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  <p>
                    <strong>Momentum Transportation &amp; Hauling LLC</strong> is a Columbia, South Carolina-based transportation, commercial freight and hauling company serving the logistics needs of manufacturers, distributors, construction contractors, commercial enterprises and regional businesses.
                  </p>
                  <p>
                    Strategically located near <strong>Interstate 20, Interstate 26, and Interstate 77</strong>, Momentum focuses on connecting businesses with freight transportation, equipment hauling, cargo delivery and construction logistics solutions throughout South Carolina and the southeastern United States.
                  </p>
                  <p>
                    Our business philosophy emphasizes dependable transportation execution, responsive dispatch coordination, professional service, cargo safety and clear communication.
                  </p>
                </div>

                {/* Corridor connectivity badges */}
                <div className="p-5 bg-[#F5F7FA] rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#071E41] font-display flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#C99A31]" />
                    <span>Epicenter Interstate Connectivity (Columbia, SC)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-[#071E41] block">Interstate 77</span>
                      <span className="text-slate-500 text-[11px]">Columbia ⇄ Charlotte</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-[#071E41] block">Interstate 26</span>
                      <span className="text-slate-500 text-[11px]">Charleston ⇄ Upstate</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-[#071E41] block">Interstate 20</span>
                      <span className="text-slate-500 text-[11px]">Florence ⇄ Augusta / Atlanta</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#071E41] text-white rounded-xl text-center font-bold text-sm sm:text-base font-display">
                  &ldquo;Transportation and hauling solutions designed around your business needs.&rdquo;
                </div>
              </div>

              <div className="lg:col-span-5 min-w-0 space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">
                  <ImageWithFallback
                    src={ASSETS.commercialFreight}
                    alt="Momentum Transportation Fleet on South Carolina Highway"
                    className="w-full h-64 object-cover"
                    fallbackTitle="Momentum Fleet"
                  />
                  <div className="p-3 bg-white text-xs text-slate-600 border-t border-slate-100">
                    <strong className="text-[#071E41] block">Southeastern Freight Transport</strong>
                    Late-model commercial semi-truck with Momentum circular emblem and 53ft dry van trailer.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PAGE 3: MISSION AND VISION
            ----------------------------------------------------------------------- */}
        {(activeSection === 3 || activeSection === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#071E41] text-[#C99A31] text-xs font-bold rounded">
                  Page 3 of 8
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#071E41] font-display">
                  2. Mission &amp; 3. Vision
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Strategic Direction</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Mission Box */}
              <div className="bg-[#F5F7FA] p-8 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#071E41] text-[#C99A31] flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display block">
                    Section 2
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#071E41] font-display">
                    Mission
                  </h3>
                  <blockquote className="text-sm sm:text-base text-slate-700 leading-relaxed italic border-l-4 border-[#C99A31] pl-4">
                    &ldquo;To move our clients&apos; businesses forward by delivering dependable, safe and transparent transportation and hauling solutions through operational discipline and honest communication.&rdquo;
                  </blockquote>
                </div>
                <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                  Focus: Operational discipline, safety compliance, and client trust.
                </div>
              </div>

              {/* Vision Box */}
              <div className="bg-[#F5F7FA] p-8 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#071E41] text-[#C99A31] flex items-center justify-center">
                    <Compass className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display block">
                    Section 3
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#071E41] font-display">
                    Vision
                  </h3>
                  <blockquote className="text-sm sm:text-base text-slate-700 leading-relaxed italic border-l-4 border-[#071E41] pl-4">
                    &ldquo;To become one of the Midlands&apos; most trusted regional commercial transportation providers, recognized for professional logistics capabilities, strong safety standards, responsive service and respect for drivers and customers.&rdquo;
                  </blockquote>
                </div>
                <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                  Focus: Regional recognition, safety leadership, and mutual respect.
                </div>
              </div>
            </div>

            {/* Mandatory Management Approval Notice */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs text-amber-900 font-medium">
              *Mission and vision statements are proposed on the website and remain subject to management approval.
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PAGE 4: CORE TRANSPORTATION & HAULING SERVICES
            ----------------------------------------------------------------------- */}
        {(activeSection === 4 || activeSection === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#071E41] text-[#C99A31] text-xs font-bold rounded">
                  Page 4 of 8
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#071E41] font-display">
                  4. Core Transportation &amp; Hauling Services
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">5 Service Categories</span>
            </div>

            <div className="space-y-8">
              {/* 4.1 Commercial Freight */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-[#071E41] text-white text-xs font-bold rounded">4.1</span>
                    <h3 className="text-lg font-bold text-[#071E41] font-display">
                      Commercial Freight Transportation
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">Full Truckload &amp; Regional Dry Van</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Full truckload and regional dry van transportation for commercial and industrial customers. Features 53-foot air-ride dry van transportation, logistical E-track cargo securement systems, and scheduled commercial freight movements.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0" />
                    <span>Palletized commercial freight</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0" />
                    <span>Finished industrial products</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0" />
                    <span>Building materials &amp; dry goods</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0" />
                    <span>Corrugated packaging &amp; paper</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0" />
                    <span>Retail &amp; distribution shipments</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31] shrink-0" />
                    <span>Manufacturing components</span>
                  </div>
                </div>
              </div>

              {/* 4.2 Commercial Hauling & Machinery */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-[#071E41] text-white text-xs font-bold rounded">4.2</span>
                    <h3 className="text-lg font-bold text-[#071E41] font-display">
                      Commercial Hauling &amp; Machinery
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">Machinery &amp; Heavy Equipment</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Transportation solutions for industrial machinery, construction equipment, and specialized commercial cargo.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-semibold text-slate-800 text-center">
                    Flatbed Transportation
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-semibold text-slate-800 text-center">
                    Step-Deck Transportation
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-semibold text-slate-800 text-center">
                    Lowboy Transportation
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-semibold text-slate-800 text-center">
                    Equipment Relocation
                  </div>
                </div>
                <div className="p-3 bg-slate-100 rounded text-xs text-slate-500 italic">
                  *Including coordination for oversized shipments where applicable. Specialized transportation arrangements are subject to appropriate equipment, permits and operational confirmation.
                </div>
              </div>

              {/* 4.3 Cargo Van Delivery */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-[#071E41] text-white text-xs font-bold rounded">4.3</span>
                    <h3 className="text-lg font-bold text-[#071E41] font-display">
                      Cargo Van Transportation &amp; Delivery
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">Expedited &amp; Flexible Deliveries</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Flexible cargo van transportation solutions for businesses requiring smaller-volume commercial deliveries, scheduled business distribution, and urgent contractor supplies.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-700">
                  <div className="bg-white p-2.5 rounded border border-slate-200">Local &amp; regional commercial deliveries</div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">Contractor tools and supplies</div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">Warehouse-to-business transport</div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">Building material deliveries</div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">Scheduled business distribution</div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">Expedited &amp; dedicated van requests</div>
                  <div className="bg-white p-2.5 rounded border border-slate-200 sm:col-span-2">Multiple pickup &amp; delivery locations</div>
                </div>
              </div>

              {/* 4.4 Construction Transportation & Hauling */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-[#071E41] text-white text-xs font-bold rounded">4.4</span>
                    <h3 className="text-lg font-bold text-[#071E41] font-display">
                      Construction Transportation &amp; Hauling
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">Developers, Contractors &amp; Suppliers</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Project-oriented transportation solutions supporting construction developers, general contractors, industrial projects and building suppliers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-[#071E41] uppercase text-[11px] block">Pre-Construction Support</span>
                    <p className="text-slate-600">Transportation coordination for aggregates, site preparation supplies, equipment mobilization, temporary facilities, construction materials and initial development requirements.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-[#071E41] uppercase text-[11px] block">Active Construction Support</span>
                    <p className="text-slate-600">Scheduled deliveries of building materials, structural supplies, equipment, tools and other construction-related cargo.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-[#071E41] uppercase text-[11px] block">Project Logistics Coordination</span>
                    <p className="text-slate-600">Transportation planning for recurring material deliveries, equipment relocation, multiple jobsite requirements and construction-phase scheduling.</p>
                  </div>
                </div>
              </div>

              {/* 4.5 Regional Corridors & Port Access */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-[#071E41] text-white text-xs font-bold rounded">4.5</span>
                    <h3 className="text-lg font-bold text-[#071E41] font-display">
                      Regional Corridors &amp; Port Access
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">Columbia Connecting Hub</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#071E41] block text-sm mb-1">I-77 Corridor</span>
                    <span className="text-slate-500 block mb-2 font-medium">Columbia — Rock Hill — Charlotte</span>
                    <p className="text-slate-600 text-[11px]">Focused on industrial freight, commercial distribution and building supplies.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#071E41] block text-sm mb-1">I-26 Corridor</span>
                    <span className="text-slate-500 block mb-2 font-medium">Columbia — Charleston — Upstate</span>
                    <p className="text-slate-600 text-[11px]">Regional freight movements, Port of Charleston access and general commercial cargo.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#071E41] block text-sm mb-1">I-20 Corridor</span>
                    <span className="text-slate-500 block mb-2 font-medium">Columbia — Florence — Augusta/Atlanta</span>
                    <p className="text-slate-600 text-[11px]">Interstate commercial distribution and trans-regional transportation.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#071E41] block text-sm mb-1">Greater Midlands</span>
                    <span className="text-slate-500 block mb-2 font-medium">Richland &amp; Lexington Counties</span>
                    <p className="text-slate-600 text-[11px]">Focused on local commercial hauling, cargo movement and equipment relocation.</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-100 rounded text-xs text-slate-500 italic">
                  *All routes, cargo types and transportation arrangements remain subject to operational availability and applicable requirements.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PAGE 5: INDUSTRIES AND CUSTOMERS SERVED
            ----------------------------------------------------------------------- */}
        {(activeSection === 5 || activeSection === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#071E41] text-[#C99A31] text-xs font-bold rounded">
                  Page 5 of 8
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#071E41] font-display">
                  5. Industries and Customers Served
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">9 Commercial Sectors</span>
            </div>

            <p className="text-sm text-slate-600">
              Momentum&apos;s transportation services are designed for the unique supply chain needs of nine primary industry sectors:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Sector 1 */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 text-[#071E41] flex items-center justify-center">
                  <Factory className="w-5 h-5 text-[#C99A31]" />
                </div>
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Manufacturing and Industrial Businesses
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inbound raw material logistics, intermediate assemblies, specialized machinery components, and finished product outbound transportation.
                </p>
              </div>

              {/* Sector 2 */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 text-[#071E41] flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#C99A31]" />
                </div>
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Commercial Freight Shippers
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full truckload dry van freight, dedicated lane contracts, palletized merchandise, and scheduled regional freight routing.
                </p>
              </div>

              {/* Sector 3 */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 text-[#071E41] flex items-center justify-center">
                  <Store className="w-5 h-5 text-[#C99A31]" />
                </div>
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Wholesale and Retail Distributors
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Distribution center transfers, retail staging, consumer goods, food packaging products, and replenishment deliveries.
                </p>
              </div>

              {/* Sector 4 */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 text-[#071E41] flex items-center justify-center">
                  <Warehouse className="w-5 h-5 text-[#C99A31]" />
                </div>
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Warehousing and Logistics Operations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cross-dock transportation, regional terminal transfers, container devanning support, and facility-to-facility transit.
                </p>
              </div>

              {/* Sector 5 */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 text-[#071E41] flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-[#C99A31]" />
                </div>
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Construction Contractors
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Heavy equipment hauling, excavator and dozer mobilization, tool delivery, aggregate dump trucking, and jobsite support.
                </p>
              </div>

              {/* Sector 6 */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 text-[#071E41] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#C99A31]" />
                </div>
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Residential &amp; Commercial Developers
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Site development material delivery, pre-construction staging, utility infrastructure piping, and project mobilization.
                </p>
              </div>

              {/* Sector 7 */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 text-[#071E41] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#C99A31]" />
                </div>
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Building Material Suppliers
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Structural steel, lumber, drywall, roofing, masonry aggregates, and hardware distribution to commercial supply yards.
                </p>
              </div>

              {/* Sector 8 */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 text-[#071E41] flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[#C99A31]" />
                </div>
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Equipment Suppliers &amp; Rental Companies
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Timely lowboy transport, rental fleet relocations, and returning heavy machinery between commercial branch yards.
                </p>
              </div>

              {/* Sector 9 */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#071E41]/10 text-[#071E41] flex items-center justify-center">
                  <Construction className="w-5 h-5 text-[#C99A31]" />
                </div>
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Infrastructure Development Projects
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Highway, bridge, public works, and utility transport requiring disciplined safety compliance and scheduled deliveries.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PAGE 6: OPERATIONAL PHILOSOPHY
            ----------------------------------------------------------------------- */}
        {(activeSection === 6 || activeSection === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#071E41] text-[#C99A31] text-xs font-bold rounded">
                  Page 6 of 8
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#071E41] font-display">
                  6. Operational Philosophy &amp; Dispatch Model
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">5 Core Principles</span>
            </div>

            {/* 5 Core Principles */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-xs font-display">
                  01
                </div>
                <h4 className="text-sm font-bold text-[#071E41] font-display">Safety First</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prioritize road safety, appropriate vehicle inspections, cargo securement and compliance with applicable transportation regulations.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-xs font-display">
                  02
                </div>
                <h4 className="text-sm font-bold text-[#071E41] font-display">Reliable Dispatch Coordination</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Emphasize preparation, scheduled pickup and delivery windows, and direct communication regarding transportation assignments.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-xs font-display">
                  03
                </div>
                <h4 className="text-sm font-bold text-[#071E41] font-display">Transparent Communication</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provide customers with clear information about service arrangements, transportation schedules and quotation requirements.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-xs font-display">
                  04
                </div>
                <h4 className="text-sm font-bold text-[#071E41] font-display">Professional Accountability</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Promote responsible handling of freight, customer requirements and transportation documentation on every load.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#071E41] text-[#C99A31] font-bold flex items-center justify-center text-xs font-display">
                  05
                </div>
                <h4 className="text-sm font-bold text-[#071E41] font-display">Customer-Centered Service</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Develop transportation solutions around the commercial and operational needs of each individual customer.
                </p>
              </div>
            </div>

            {/* Strategic Location & Inquiries breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="p-5 rounded-xl bg-[#071E41] text-white space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
                  Strategic Location &amp; Service Coverage
                </span>
                <h4 className="text-base font-bold font-display">
                  Primary Operating Market: Columbia, South Carolina
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Momentum&apos;s location provides direct access to South Carolina&apos;s major interstate transportation network, highlighting continuous connectivity with Charlotte, Charleston, Greenville, Spartanburg, Rock Hill, Florence, Augusta, and Atlanta.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#071E41] font-display">
                  Customer Service &amp; Direct Dispatch Model
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The website identifies a direct dispatch contact model intended to simplify customer communication and freight coordination. Customers may inquire about:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" /><span>Freight bookings</span></div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" /><span>Cargo van deliveries</span></div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" /><span>Machinery movement</span></div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" /><span>Construction logistics</span></div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" /><span>Pickup/delivery windows</span></div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#C99A31]" /><span>Rate quotations</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PAGE 7: CORPORATE CONTACT DIRECTORY
            ----------------------------------------------------------------------- */}
        {(activeSection === 7 || activeSection === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#071E41] text-[#C99A31] text-xs font-bold rounded">
                  Page 7 of 8
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#071E41] font-display">
                  Corporate Contact Directory &amp; Business Inquiries
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Official Directory</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Address */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#071E41]">
                  <MapPin className="w-4 h-4 text-[#C99A31]" />
                  <span className="font-bold uppercase tracking-wider text-xs font-display">Business Address</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  2 Penhurst Ct.
                </div>
                <div className="text-xs text-slate-600">
                  Columbia, South Carolina 29229<br />United States of America
                </div>
              </div>

              {/* Card 2: Operations Phone */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#071E41]">
                  <Phone className="w-4 h-4 text-[#C99A31]" />
                  <span className="font-bold uppercase tracking-wider text-xs font-display">Direct Operations &amp; Dispatch</span>
                </div>
                <a href="tel:8037185509" className="text-base font-bold text-[#071E41] hover:text-[#C99A31] block">
                  (803) 718-5509
                </a>
                <div className="text-xs text-slate-600">
                  Immediate capacity, scheduling &amp; dispatch
                </div>
              </div>

              {/* Card 3: Email */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#071E41]">
                  <Mail className="w-4 h-4 text-[#C99A31]" />
                  <span className="font-bold uppercase tracking-wider text-xs font-display">Corporate Email</span>
                </div>
                <a href="mailto:wright.wendell@icloud.com" className="text-sm font-bold text-[#071E41] hover:text-[#C99A31] block break-all">
                  wright.wendell@icloud.com
                </a>
                <div className="text-xs text-slate-600">
                  Central inquiries &amp; rate quotation inbox
                </div>
              </div>

              {/* Card 4: Dispatch Availability */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#071E41]">
                  <Clock className="w-4 h-4 text-[#C99A31]" />
                  <span className="font-bold uppercase tracking-wider text-xs font-display">Dispatch Availability</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  24/7 On-Call Operations
                </div>
                <div className="text-xs text-slate-600">
                  Round-the-clock emergency &amp; linehaul coordination
                </div>
              </div>

              {/* Card 5: Office Hours */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#071E41]">
                  <Briefcase className="w-4 h-4 text-[#C99A31]" />
                  <span className="font-bold uppercase tracking-wider text-xs font-display">Office Hours</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Monday – Friday
                </div>
                <div className="text-xs text-slate-600">
                  7:00 AM – 6:00 PM Eastern Time
                </div>
              </div>

              {/* Card 6: Company Operations Contact */}
              <div className="p-6 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#071E41]">
                  <UserCheck className="w-4 h-4 text-[#C99A31]" />
                  <span className="font-bold uppercase tracking-wider text-xs font-display">Operations Contact</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Wendell Wright
                </div>
                <div className="text-xs text-slate-600">
                  Direct operations &amp; commercial logistics contact
                </div>
              </div>
            </div>

            {/* Quotations Box */}
            <div className="p-6 rounded-xl bg-[#071E41] text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-lg font-bold font-display text-white">Business Inquiries &amp; Quotations</h4>
                <p className="text-xs text-slate-300 max-w-xl">
                  For commercial transportation, cargo van services, equipment hauling, construction logistics and regional freight requirements, customers may contact Momentum directly.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="tel:8037185509"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>Call (803) 718-5509</span>
                </a>
                <button
                  onClick={() => onNavigate('quote')}
                  className="px-5 py-2.5 bg-[#C99A31] hover:bg-[#E8BE65] text-[#071E41] rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 font-display"
                >
                  <span>Request Online Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PAGE 8: CORPORATE BRANDING AND COLLATERALS
            ----------------------------------------------------------------------- */}
        {(activeSection === 8 || activeSection === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#071E41] text-[#C99A31] text-xs font-bold rounded">
                  Page 8 of 8
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#071E41] font-display">
                  Corporate Branding and Collaterals
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Brand Standards &amp; Assets</span>
            </div>

            {/* High-Resolution Page 8 Image Showcase */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C99A31] font-display block">
                    Authoritative Style Guide &amp; Physical Collateral Portfolio
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#071E41] font-display">
                    Official Momentum Identity System
                  </h3>
                </div>
                <a
                  href={COMPANY_PROFILE_PDF_URL}
                  download="Momentum-Transportation-Company-Profile.pdf"
                  className="text-xs font-bold uppercase text-[#071E41] hover:text-[#C99A31] inline-flex items-center gap-1 font-display"
                >
                  <span>Download Page 8 in PDF</span>
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-50 flex justify-center">
                <img
                  src={ASSETS.companyProfileCollaterals}
                  alt="Momentum Transportation Corporate Branding and Collaterals Page 8"
                  className="w-full max-w-4xl h-auto object-contain block"
                />
              </div>
            </div>

            {/* 1. Official Brand Color Palette Breakdown */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#071E41] font-display flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#C99A31]" />
                <span>Brand Color Palette</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="h-12 w-full rounded-lg bg-[#071E41] shadow-xs" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Royal Navy</span>
                    <span className="font-mono text-slate-500 font-semibold">#071E41</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="h-12 w-full rounded-lg bg-[#C99A31] shadow-xs" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Metallic Gold</span>
                    <span className="font-mono text-slate-500 font-semibold">#C99A31</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="h-12 w-full rounded-lg bg-[#FFFFFF] border border-slate-200 shadow-xs" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">White</span>
                    <span className="font-mono text-slate-500 font-semibold">#FFFFFF</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="h-12 w-full rounded-lg bg-[#F5F7FA] border border-slate-200 shadow-xs" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Light Gray</span>
                    <span className="font-mono text-slate-500 font-semibold">#F5F7FA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Typography & Brand Elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[#071E41] font-display block">
                  Typography Standards
                </span>
                <div className="text-2xl font-bold font-display text-slate-900">Inter</div>
                <p className="text-slate-600">
                  <strong>Inter (Bold)</strong> utilized for primary corporate titles, company wordmarks, and equipment classifications.<br />
                  <strong>Inter (Regular)</strong> utilized for specification sheets, contract copy, and general correspondence.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-slate-200 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[#071E41] font-display block">
                  Brand Graphic Elements
                </span>
                <p className="text-slate-600">
                  Circular emblem with gold concentric borders, stylized &apos;M&apos; road curvature, transport tractor graphic, and clean logistic vector markers representing commercial transport, machinery lowboy, cargo van, and terminal staging hubs.
                </p>
              </div>
            </div>

            {/* 3. Physical Collateral Categories */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="font-bold uppercase tracking-wider text-[#071E41] text-xs font-display block">
                Physical Collaterals &amp; Fleet Execution (As Specified on Page 8)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-[#F5F7FA] rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-[#071E41] block">Uniforms &amp; Safety Apparel</span>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside text-[11px]">
                    <li>Two-tone navy/white corporate polos</li>
                    <li>Royal blue &amp; charcoal dispatch shirts</li>
                    <li>Reflective high-vis safety vests</li>
                    <li>Embroidered driver &amp; mechanics caps</li>
                    <li>Heavy-duty all-weather safety jackets</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#F5F7FA] rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-[#071E41] block">Corporate Stationery</span>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside text-[11px]">
                    <li>Executive business cards (Wendell Wright)</li>
                    <li>Official corporate letterhead &amp; envelopes</li>
                    <li>Presentation folders &amp; rate sheets</li>
                    <li>Employee photo ID security badges</li>
                    <li>Lanyard clip attachments</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#F5F7FA] rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-[#071E41] block">Promotional Materials</span>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside text-[11px]">
                    <li>Branded executive travel duffel bag</li>
                    <li>Insulated travel tumblers &amp; ceramic mugs</li>
                    <li>Corporate metal rollerball pens</li>
                    <li>Spiral desk calendars</li>
                    <li>Spiral wirebound notebooks</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#F5F7FA] rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-[#071E41] block">Fleet &amp; Exterior Signage</span>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside text-[11px]">
                    <li>Door emblems &amp; gold racing stripes</li>
                    <li>Class 8 53ft trailer corporate wraps</li>
                    <li>Cargo delivery van side emblems</li>
                    <li>Outdoor teardrop feather flags</li>
                    <li>Terminal building entrance signage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          PERSISTENT BOTTOM DOWNLOAD & ACTION STRIP
          ========================================================================= */}
      <section className="bg-[#071E41] text-white py-8 border-t border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Authoritative Documentation · 8 Full Pages
            </span>
            <div className="text-lg font-bold font-display">
              Momentum Transportation &amp; Hauling LLC — Complete Company Profile
            </div>
            <p className="text-xs text-slate-300">
              Download the official PDF for commercial shipping procurement, vendor onboarding, and logistics review.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={COMPANY_PROFILE_PDF_URL}
              download="Momentum-Transportation-Company-Profile.pdf"
              className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#071E41]" />
              <span>DOWNLOAD PDF (2.7 MB)</span>
            </a>

            <button
              onClick={() => onNavigate('quote')}
              className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-md transition-all font-display cursor-pointer"
            >
              Request a Rate Quote
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
