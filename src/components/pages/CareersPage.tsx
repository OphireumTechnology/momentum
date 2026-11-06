import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  CheckCircle2,
  Send,
  AlertCircle,
  Truck,
  Award,
  Clock,
  Shield,
  FileCheck,
} from 'lucide-react';

interface CareersPageProps {
  onNavigate: (page: PageView) => void;
}

export const CareersPage: React.FC<CareersPageProps> = ({ onNavigate }) => {
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [yearsExperience, setYearsExperience] = useState('3+');
  const [endorsements, setEndorsements] = useState('Standard Class A');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicantName && applicantPhone) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#071E41] text-white py-14 border-b border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Commercial Driver Opportunities
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Drive With Momentum
            </h1>
            <p className="text-sm text-slate-300">
              We value professional commercial drivers who take pride in road safety, punctual execution, and modern equipment care.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Driver Visual & Standards */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <ImageWithFallback
                src={ASSETS.careersHero}
                alt={ASSET_METADATA.careersHero.alt}
                className="w-full h-80 object-cover"
                fallbackTitle="Commercial Driver Inspection"
              />
              <div className="p-4 bg-white border-t border-slate-200 text-xs">
                <div className="font-bold text-[#071E41]">Professional Driving Standards</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Thorough pre-trip inspections and dedicated communication define every driver on our team.
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
              <h3 className="text-sm font-bold text-[#071E41] uppercase tracking-wider font-display">
                What We Offer Commercial Drivers:
              </h3>
              <ul className="space-y-2.5 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
                  <span><strong>Consistent Regional Corridors:</strong> Predictable southeastern runs (I-77, I-26, I-20) allowing regular home time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
                  <span><strong>Modern, Inspected Equipment:</strong> Well-maintained Class 8 tractors and late-model air-ride trailers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
                  <span><strong>Prompt, Direct Settlement:</strong> Transparent per-mile and percentage rates without hidden deductions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
                  <span><strong>Driver Respect:</strong> You are the backbone of our operation, treated as a professional partner.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#071E41] font-display mb-1">
              Driver Application &amp; Interest
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Complete the preliminary interest form. All applications undergo verification of valid CDL-A credentials and driving records.
            </p>

            {submitted ? (
              <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Application Interest Received</span>
                </div>
                <p>
                  Thank you, <strong>{applicantName}</strong>. A recruitment coordinator from our Columbia operations office will reach out to discuss current lane openings.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-emerald-800 bg-white border border-emerald-300 rounded hover:bg-emerald-100"
                >
                  Submit Additional Information
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    placeholder="First & Last Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Direct Phone *
                    </label>
                    <input
                      type="tel"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      required
                      placeholder="803-000-0000"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="driver@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Commercial Driving Experience
                    </label>
                    <select
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    >
                      <option value="1-2">1 - 2 Years CDL-A</option>
                      <option value="3+">3 - 5 Years CDL-A</option>
                      <option value="5+">5+ Years Professional</option>
                      <option value="10+">10+ Years Senior Driver</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Endorsements &amp; Certifications
                    </label>
                    <select
                      value={endorsements}
                      onChange={(e) => setEndorsements(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    >
                      <option value="Standard Class A">Standard Class A</option>
                      <option value="Tanker (N)">Tanker (N)</option>
                      <option value="Doubles/Triples (T)">Doubles/Triples (T)</option>
                      <option value="TWIC Port Card">TWIC Port Certified</option>
                      <option value="Heavy Haul RGN">Heavy Haul / RGN Specialist</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  <strong>Driver Minimum Requirements:</strong> Valid Class A CDL, current DOT Medical Examiner&apos;s Certificate, clean Motor Vehicle Record (MVR), and minimum 21 years of age.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>Submit Driver Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
