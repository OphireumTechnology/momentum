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
} from 'lucide-react';

interface CareersPageProps {
  onNavigate: (page: PageView) => void;
}

const inputClass =
  'w-full min-w-0 min-h-[48px] px-3.5 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-md focus:border-[#071E41] focus:ring-2 focus:ring-[#071E41]/15 focus:outline-none placeholder:text-slate-400';

export const CareersPage: React.FC<CareersPageProps> = () => {
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
    } catch {
      setErrorMessage('Network connection error. Please call our Columbia dispatch office directly at 803-718-5509.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#071E41] text-white py-8 sm:py-12 border-b border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-2 text-left">
            <span className="block text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Commercial Driver Opportunities
            </span>
            <h1 className="text-[28px] sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white leading-tight">
              Drive With Momentum
            </h1>
            <p className="text-base text-slate-200 leading-relaxed">
              We value professional commercial drivers who take pride in road safety, punctual execution, and modern equipment care.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-14 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Driver Visual & Standards */}
          <div className="lg:col-span-6 min-w-0 space-y-6">
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white">
              <ImageWithFallback
                src={ASSETS.careersHero}
                alt={ASSET_METADATA.careersHero.alt}
                className="w-full h-64 sm:h-80 object-cover"
                fallbackTitle="Commercial Driver Inspection"
              />
              <div className="p-4 border-t border-slate-200">
                <div className="font-bold text-sm text-[#071E41]">Professional Driving Standards</div>
                <div className="text-slate-600 text-xs mt-1 leading-relaxed">
                  Thorough pre-trip inspections and dedicated communication define every driver on our team.
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm text-sm">
              <h3 className="text-sm font-bold text-[#071E41] uppercase tracking-wider font-display">
                What We Offer Commercial Drivers:
              </h3>
              <ul className="space-y-3 text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A31] shrink-0 mt-1" aria-hidden="true" />
                  <span><strong>Consistent Regional Corridors:</strong> Predictable southeastern runs (I-77, I-26, I-20) allowing regular home time.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A31] shrink-0 mt-1" aria-hidden="true" />
                  <span><strong>Modern, Inspected Equipment:</strong> Well-maintained Class 8 tractors and late-model air-ride trailers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A31] shrink-0 mt-1" aria-hidden="true" />
                  <span><strong>Prompt, Direct Settlement:</strong> Transparent per-mile and percentage rates without hidden deductions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A31] shrink-0 mt-1" aria-hidden="true" />
                  <span><strong>Driver Respect:</strong> You are the backbone of our operation, treated as a professional partner.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-6 min-w-0 bg-white rounded-xl border border-slate-200 p-5 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#071E41] font-display mb-1">
              Driver Application &amp; Interest
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Complete the preliminary interest form. All applications undergo verification of valid CDL-A credentials and driving records.
            </p>

            {submittedRef ? (
              <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Commercial Driver Application Submitted</span>
                </div>
                <p>
                  Thank you, <strong>{applicantName}</strong>. Your driver application has been assigned reference <strong className="font-mono text-emerald-900">{submittedRef}</strong> and routed to <strong className="font-mono break-all">{COMPANY.contact.email}</strong>.
                </p>
                <div className="p-3.5 bg-white/80 border border-emerald-200 rounded text-xs text-emerald-900 space-y-1">
                  <div><strong>Applicant:</strong> {applicantName} ({applicantPhone})</div>
                  <div><strong>CDL Class:</strong> Class {cdlClass} ({endorsements})</div>
                  <div><strong>Experience:</strong> {yearsExperience} years</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRef(null);
                    setApplicantName('');
                    setApplicantPhone('');
                    setApplicantEmail('');
                    setNotes('');
                  }}
                  className="min-h-[44px] px-4 py-2 text-xs font-bold uppercase text-emerald-900 bg-white border border-emerald-300 rounded-md hover:bg-emerald-100 cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div role="alert" className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="career-name" className="block text-sm font-bold text-[#071E41] mb-1.5">
                    Full Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="career-name"
                    type="text"
                    autoComplete="name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    placeholder="First & Last Name"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="career-phone" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Direct Phone <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="career-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      required
                      placeholder="803-000-0000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="career-email" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="career-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="driver@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="career-cdl" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      CDL Class
                    </label>
                    <select
                      id="career-cdl"
                      value={cdlClass}
                      onChange={(e) => setCdlClass(e.target.value)}
                      className={inputClass}
                    >
                      <option value="A">Class A CDL</option>
                      <option value="B">Class B CDL</option>
                      <option value="Commercial Non-CDL">Commercial Hotshot / Non-CDL</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="career-exp" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Experience
                    </label>
                    <select
                      id="career-exp"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className={inputClass}
                    >
                      <option value="1-2">1 - 2 Years</option>
                      <option value="3+">3 - 5 Years</option>
                      <option value="5+">5+ Years Professional</option>
                      <option value="10+">10+ Years Senior</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="career-endorsements" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Endorsements
                    </label>
                    <select
                      id="career-endorsements"
                      value={endorsements}
                      onChange={(e) => setEndorsements(e.target.value)}
                      className={inputClass}
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
                  <label htmlFor="career-lanes" className="block text-sm font-bold text-[#071E41] mb-1.5">
                    Preferred Regional Corridors
                  </label>
                  <select
                    id="career-lanes"
                    value={preferredLanes}
                    onChange={(e) => setPreferredLanes(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Regional Southeastern Corridors (I-77 / I-26 / I-20)">Regional Southeastern Corridors (I-77 / I-26 / I-20)</option>
                    <option value="Columbia Local Midlands Hauling & Construction">Columbia Local Midlands Hauling &amp; Construction</option>
                    <option value="Port of Charleston Dedicated Drayage">Port of Charleston Dedicated Drayage</option>
                    <option value="Interstate Dedicated Contract Lanes">Interstate Dedicated Contract Lanes</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="career-notes" className="block text-sm font-bold text-[#071E41] mb-1.5">
                    Additional Background or Qualifications (Optional)
                  </label>
                  <textarea
                    id="career-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Mention previous carrier experience, clean MVR record, or preferred start date..."
                    className="w-full min-w-0 px-3.5 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-md focus:border-[#071E41] focus:ring-2 focus:ring-[#071E41]/15 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 text-slate-600 text-xs leading-relaxed">
                  <strong>Driver Minimum Requirements:</strong> Valid Class A CDL, current DOT Medical Examiner&apos;s Certificate, clean Motor Vehicle Record (MVR), and minimum 21 years of age.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[48px] w-full py-3 px-5 text-sm font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded-md font-display transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-[#C99A31]" aria-hidden="true" />
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit Driver Application'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
