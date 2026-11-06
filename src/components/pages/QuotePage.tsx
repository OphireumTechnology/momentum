import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { Logo } from '../common/Logo';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { getApiUrl } from '../../config/api';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Printer,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Phone,
} from 'lucide-react';

interface QuotePageProps {
  onNavigate: (page: PageView) => void;
}

export const QuotePage: React.FC<QuotePageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    companyName: '',
    email: '',
    phone: '',
    serviceCategory: 'dry_van',
    pickupLocation: 'Columbia, SC',
    deliveryLocation: '',
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    deliveryDate: '',
    estimatedWeightLbs: '15000',
    dimensions: '',
    loadDescription: '',
    specialHandling: '',
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Run AI Quote Assistance
  const handleAiAssist = async () => {
    if (!formData.pickupLocation || !formData.deliveryLocation || !formData.loadDescription) {
      setErrorMessage('Please enter Pickup Location, Delivery Location, and Load Description before running AI analysis.');
      return;
    }
    setErrorMessage('');
    setIsAiLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/ai/quote-assist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: formData.pickupLocation,
          destination: formData.deliveryLocation,
          serviceCategory: formData.serviceCategory,
          weightLbs: formData.estimatedWeightLbs,
          dimensions: formData.dimensions,
          loadDescription: formData.loadDescription,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to run AI Quote Assist:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit quote to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.customerName.trim()) {
      setErrorMessage('Please provide your full contact name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid business email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please provide a direct telephone number.');
      return;
    }
    if (!formData.deliveryLocation.trim()) {
      setErrorMessage('Please specify the destination location.');
      return;
    }
    if (!formData.loadDescription.trim()) {
      setErrorMessage('Please describe the cargo or equipment to be transported.');
      return;
    }
    if (!formData.consent) {
      setErrorMessage('Please acknowledge the quotation consent and accuracy terms.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl('/api/quotes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmittedQuote(data.quote);
      } else {
        setErrorMessage(data.error || 'Failed to submit quotation. Please check your inputs.');
      }
    } catch (err) {
      setErrorMessage('Network or server connection error. Please try again or call dispatch at 803-718-5509.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully submitted, render the official confirmation screen
  if (submittedQuote) {
    return (
      <div className="bg-[#F5F7FA] min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden p-8 sm:p-10 space-y-6">
            {/* Official Corporate Logo on Confirmation Document */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <Logo variant="horizontal-light" size="lg" />
              <div className="text-right text-xs text-slate-500">
                <span className="font-bold text-[#071E41] block">Momentum Transportation &amp; Hauling LLC</span>
                <span>2 Penhurst Ct., Columbia, SC 29229</span>
                <span className="block">Dispatch: 803-718-5509</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
                  Quotation Request Recorded
                </span>
                <h2 className="text-2xl font-extrabold text-[#071E41] font-display">
                  Thank You, {submittedQuote.customerName}
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#071E41] text-white space-y-1">
              <div className="text-xs uppercase tracking-wider text-[#C99A31] font-bold font-display">
                Your Official Reference Number
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white tabular-nums">
                {submittedQuote.referenceNumber}
              </div>
              <p className="text-xs text-slate-300 pt-1">
                Save this number to track your shipment in the Customer Portal or reference during telephone dispatch inquiries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-y border-slate-200 py-4 text-slate-700">
              <div>
                <span className="font-bold text-[#071E41] block">Origin (Pickup):</span>
                <span>{submittedQuote.pickupLocation}</span>
              </div>
              <div>
                <span className="font-bold text-[#071E41] block">Destination:</span>
                <span>{submittedQuote.deliveryLocation}</span>
              </div>
              <div>
                <span className="font-bold text-[#071E41] block">Service Type:</span>
                <span className="capitalize">{submittedQuote.serviceCategory.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="font-bold text-[#071E41] block">Estimated Weight:</span>
                <span className="tabular-nums">{submittedQuote.estimatedWeightLbs.toLocaleString()} lbs</span>
              </div>
              <div>
                <span className="font-bold text-[#071E41] block">Requested Pickup Date:</span>
                <span>{submittedQuote.pickupDate}</span>
              </div>
              <div>
                <span className="font-bold text-[#071E41] block">Preliminary Estimated Rate:</span>
                <span className="font-bold text-[#071E41] tabular-nums">
                  ${submittedQuote.estimatedRate?.toLocaleString() || 'Under Review'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-[#071E41]">Next Operational Steps:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your request specifications have been automatically routed to operations at <strong>{COMPANY.contact.email}</strong>.</li>
                <li>An official rate confirmation sheet will be finalized and sent to <strong>{submittedQuote.email}</strong>.</li>
                <li>For urgent or same-day freight needs, contact dispatch directly at <strong>803-718-5509</strong>.</li>
              </ul>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Confirmation</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('portal')}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display cursor-pointer"
                >
                  View in Customer Portal
                </button>
                <button
                  onClick={() => {
                    setSubmittedQuote(null);
                    setFormData({
                      customerName: '',
                      companyName: '',
                      email: '',
                      phone: '',
                      serviceCategory: 'dry_van',
                      pickupLocation: 'Columbia, SC',
                      deliveryLocation: '',
                      pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                      deliveryDate: '',
                      estimatedWeightLbs: '15000',
                      dimensions: '',
                      loadDescription: '',
                      specialHandling: '',
                      consent: false,
                    });
                  }}
                  className="px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:text-slate-900"
                >
                  Submit Another Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#071E41] text-white py-14 border-b border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Commercial Freight &amp; Hauling Rate Inquiries
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Request a Transportation Quote
            </h1>
            <p className="text-sm text-slate-300">
              Provide your freight details below for a verified rate proposal from our Columbia, SC operations team.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form + Image & AI Assistant Layout */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Quotation Form */}
          <div className="lg:col-span-7 min-w-0 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#071E41] font-display mb-1">
              Freight &amp; Route Information
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              All quotation submissions are processed by authorized operations personnel.
            </p>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    placeholder="Full Name"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Business / Logistics Entity"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="logistics@company.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telephone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="803-555-0100"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
              </div>

              {/* Service Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Service Category *
                  </label>
                  <select
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  >
                    <option value="dry_van">Commercial Freight Transportation (53ft Air-Ride Dry Van)</option>
                    <option value="heavy_haul">Commercial Hauling &amp; Machinery (Heavy Equipment Lowboy)</option>
                    <option value="regional_logistics">Regional Corridors &amp; Port Access (I-77, I-26, I-20)</option>
                    <option value="cargo_van">Cargo Van Transportation &amp; Delivery (Warehouse-to-Jobsite)</option>
                    <option value="preconstruction_hauling">Pre-Construction Transportation (Dump Truck Aggregate &amp; Site Prep)</option>
                    <option value="ongoing_construction">Ongoing Construction Hauling (Jobsite Staging)</option>
                    <option value="flatbed_materials">Construction Material Delivery (Flatbed Structural Steel &amp; Lumber)</option>
                    <option value="equipment_mobilization">Equipment Mobilization (Excavators &amp; Heavy Machinery)</option>
                    <option value="project_logistics">Dedicated Construction Project Logistics (Multi-Vehicle Coordination)</option>
                    <option value="dedicated">Dedicated Transportation Arrangements (Scheduled Contract Lanes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Pickup Date *
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pickup Location (City, State or Zip) *
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Columbia, SC 29229"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Delivery Destination (City, State or Zip) *
                  </label>
                  <input
                    type="text"
                    name="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Charlotte, NC or Charleston, SC"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
              </div>

              {/* Weight & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Total Weight (lbs) *
                  </label>
                  <input
                    type="number"
                    name="estimatedWeightLbs"
                    value={formData.estimatedWeightLbs}
                    onChange={handleChange}
                    required
                    min="100"
                    max="80000"
                    placeholder="e.g. 24000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dimensions (Pallet Count / LxWxH)
                  </label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    placeholder="e.g. 18 Pallets (48x40x50 in)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description & Special Handling */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cargo Description *
                </label>
                <textarea
                  name="loadDescription"
                  value={formData.loadDescription}
                  onChange={handleChange}
                  required
                  rows={2}
                  placeholder="Describe goods, packaging, or machinery model..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Special Handling / Receiver Instructions (Optional)
                </label>
                <input
                  type="text"
                  name="specialHandling"
                  value={formData.specialHandling}
                  onChange={handleChange}
                  placeholder="e.g. Liftgate required, call 2 hours prior, tarping needed"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                />
              </div>

              {/* AI Assistant Button Option */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Sparkles className="w-4 h-4 text-[#C99A31]" />
                  <span>Optional: Run AI Route Feasibility &amp; Rate Analysis</span>
                </div>
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 text-[11px] font-bold uppercase text-[#071E41] bg-[#C99A31]/20 hover:bg-[#C99A31]/30 border border-[#C99A31]/50 rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAiLoading ? 'Analyzing...' : 'Analyze Load'}
                </button>
              </div>

              {/* AI Analysis Result Display if triggered */}
              {aiAnalysis && (
                <div className="p-4 rounded-lg bg-[#071E41] text-white space-y-2 text-xs animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-bold text-[#C99A31] uppercase tracking-wider">
                      AI Route &amp; Equipment Analysis
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Est. Distance: {aiAnalysis.estimatedMileage} Miles · {aiAnalysis.transitTimeEst}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Recommended Unit:</span>
                      <span className="font-semibold">{aiAnalysis.recommendedEquipment}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Rate Range:</span>
                      <span className="font-bold text-[#C99A31] tabular-nums">
                        ${aiAnalysis.suggestedRateMin} – ${aiAnalysis.suggestedRateMax}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-[11px] pt-1 leading-relaxed">
                    {aiAnalysis.operationalNotes}
                  </p>
                </div>
              )}

              {/* Consent checkbox */}
              <div className="flex items-start gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#071E41] focus:ring-[#071E41]"
                />
                <label htmlFor="consent" className="text-xs text-slate-600 leading-normal">
                  I certify that the provided load weights and dimensions are accurate to the best of my knowledge, and I request a formal transportation proposal from Momentum Transportation &amp; Hauling LLC.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-md hover:shadow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording Request...' : 'Submit Quotation Request'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Visual Hero & Direct Support */}
          <div className="lg:col-span-5 min-w-0 space-y-6">
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <ImageWithFallback
                src={ASSETS.quoteHero}
                alt={ASSET_METADATA.quoteHero.alt}
                className="w-full h-64 object-cover"
                fallbackTitle="Momentum Logistics Dispatch"
              />
              <div className="p-5 bg-white space-y-2">
                <h3 className="text-sm font-bold text-[#071E41] font-display">
                  Direct Dispatch Quotation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every request submitted through this platform is recorded into our internal operations queue and assigned an official tracking reference number.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
              <h4 className="font-bold text-[#071E41] uppercase tracking-wider font-display">
                Prefer Phone Dispatch?
              </h4>
              <p className="text-slate-600">
                You can speak directly with Wendell Wright to quote an urgent load or check immediate vehicle availability in the Columbia area.
              </p>
              <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <Phone className="w-4 h-4 text-[#C99A31]" />
                  <a href={COMPANY.contact.phoneTel} className="font-bold text-[#071E41] hover:underline">
                    {COMPANY.contact.formattedPhone}
                  </a>
                </div>
                <div className="text-[11px] text-slate-500">
                  {COMPANY.hours.dispatch}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
