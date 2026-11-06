import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { getApiUrl } from '../../config/api';
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
  const [cdlClass, setCdlClass] = useState('A');
  const [yearsExperience, setYearsExperience] = useState('3+');
  const [endorsements, setEndorsements] = useState('Standard Class A');
  const [preferredLanes, setPreferredLanes] = useState('Regional Southeastern Corridors (I-77 / I-26 / I-20)');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!applicantName.trim() || !applicantPhone.trim()) {
      setErrorMessage('Please provide your full legal name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl('/api/careers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName,
          applicantPhone,
          applicantEmail,
          cdlClass,
          yearsExperience,
          endorsements,
          preferredLanes,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRef(data.applicationId);
      } else {
        setErrorMessage(data.error || 'Failed to submit driver application.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Please call our Columbia dispatch office directly at 803-718-5509.');
    } finally {
      setIsSubmitting(false);
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

            {submittedRef ? (
              <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Commercial Driver Application Submitted</span>
                </div>
                <p>
                  Thank you, <strong>{applicantName}</strong>. Your driver application has been assigned reference <strong className="font-mono text-emerald-900">{submittedRef}</strong> and immediately routed to our recruitment inbox at <strong className="font-mono">{COMPANY.contact.email}</strong>.
                </p>
                <div className="p-3 bg-white/70 border border-emerald-200 rounded text-[11px] text-emerald-800 space-y-1">
                  <div><strong>Applicant:</strong> {applicantName} ({applicantPhone})</div>
                  <div><strong>CDL Class:</strong> Class {cdlClass} ({endorsements})</div>
                  <div><strong>Experience:</strong> {yearsExperience} years</div>
                </div>
                <p className="text-[11px] text-emerald-700">
                  A recruitment and safety coordinator from our Columbia operations headquarters will review your qualification profile and reach out regarding regional lane availability.
                </p>
                <button
                  onClick={() => {
                    setSubmittedRef(null);
                    setApplicantName('');
                    setApplicantPhone('');
                    setApplicantEmail('');
                    setNotes('');
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase text-emerald-800 bg-white border border-emerald-300 rounded hover:bg-emerald-100 cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 rounded bg-red-50 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      CDL Class
                    </label>
                    <select
                      value={cdlClass}
                      onChange={(e) => setCdlClass(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    >
                      <option value="A">Class A CDL</option>
                      <option value="B">Class B CDL</option>
                      <option value="Commercial Non-CDL">Commercial Hotshot / Non-CDL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Driving Experience
                    </label>
                    <select
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    >
                      <option value="1-2">1 - 2 Years</option>
                      <option value="3+">3 - 5 Years</option>
                      <option value="5+">5+ Years Professional</option>
                      <option value="10+">10+ Years Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Endorsements
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

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Preferred Regional Corridors
                  </label>
                  <select
                    value={preferredLanes}
                    onChange={(e) => setPreferredLanes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  >
                    <option value="Regional Southeastern Corridors (I-77 / I-26 / I-20)">Regional Southeastern Corridors (I-77 / I-26 / I-20)</option>
                    <option value="Columbia Local Midlands Hauling & Construction">Columbia Local Midlands Hauling &amp; Construction</option>
                    <option value="Port of Charleston Dedicated Drayage">Port of Charleston Dedicated Drayage</option>
                    <option value="Interstate Dedicated Contract Lanes">Interstate Dedicated Contract Lanes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Additional Background or Qualifications (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Mention previous carrier experience, clean MVR record, or preferred start date..."
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  <strong>Driver Minimum Requirements:</strong> Valid Class A CDL, current DOT Medical Examiner&apos;s Certificate, clean Motor Vehicle Record (MVR), and minimum 21 years of age.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>{isSubmitting ? 'Transmitting Application...' : 'Submit Driver Application'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
