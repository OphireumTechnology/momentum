import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY, COMPANY_PHONE } from '../../config/company';
import { Logo } from '../common/Logo';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { getApiUrl } from '../../config/api';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageView) => void;
}

const inputClass =
  'w-full min-w-0 min-h-[48px] px-3.5 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-md focus:border-[#071E41] focus:ring-2 focus:ring-[#071E41]/15 focus:outline-none placeholder:text-slate-400';

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'General Inquiries',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please provide your name, email, and message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(getApiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedTicket(data.ticketId);
      } else {
        setErrorMessage(data.error || 'Failed to submit inquiry.');
      }
    } catch {
      setErrorMessage(
        `Network connection error. Please call our dispatch line directly at ${COMPANY_PHONE.display}.`
      );
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
              Columbia, South Carolina Headquarters
            </span>
            <h1 className="text-[28px] sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white leading-tight">
              Contact Operations &amp; Dispatch
            </h1>
            <p className="text-base text-slate-200 leading-relaxed">
              Get in direct contact with Momentum Transportation &amp; Hauling LLC for load coordination, scheduling, and billing.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-14 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Official Contact Card & Image */}
          <div className="lg:col-span-5 min-w-0 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <Logo variant="horizontal-light" size="md" />
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C99A31] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="block text-[#071E41]">Official Address</strong>
                    <span>{COMPANY.contact.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#C99A31] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="block text-[#071E41]">Direct Dispatch Phone</strong>
                    <a
                      href={COMPANY_PHONE.href}
                      aria-label={COMPANY_PHONE.ariaLabel}
                      className="text-slate-900 font-bold hover:text-[#071E41] inline-flex items-center min-h-[44px]"
                    >
                      {COMPANY_PHONE.display}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#C99A31] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <strong className="block text-[#071E41]">Corporate Email</strong>
                    <a href={COMPANY.contact.emailMailto} className="text-slate-900 font-semibold hover:text-[#071E41] break-all inline-flex items-center min-h-[44px]">
                      {COMPANY.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#C99A31] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="block text-[#071E41]">Hours of Operation</strong>
                    <span>{COMPANY.hours.dispatch}</span>
                    <span className="block text-slate-500 text-xs mt-0.5">{COMPANY.hours.office}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={COMPANY_PHONE.href}
                  aria-label={COMPANY_PHONE.ariaLabel}
                  className="min-h-[48px] flex-1 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded-md font-display inline-flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C99A31] shrink-0" aria-hidden="true" />
                  <span>Call {COMPANY_PHONE.display}</span>
                </a>
                <button
                  type="button"
                  onClick={() => onNavigate('quote')}
                  className="min-h-[48px] flex-1 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md font-display inline-flex items-center justify-center cursor-pointer"
                >
                  Request Freight Quote
                </button>
              </div>
            </div>

            {/* Operations Office Visual */}
            <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white">
              <ImageWithFallback
                src={ASSETS.contactHero}
                alt={ASSET_METADATA.contactHero.alt}
                className="w-full h-56 sm:h-64 object-cover"
                fallbackTitle="Momentum Operations Office"
              />
              <div className="p-3.5 text-xs text-slate-600">
                Logistics dispatch and route management office.
              </div>
            </div>
          </div>

          {/* Right Column: Secure Inquiries Form */}
          <div className="lg:col-span-7 min-w-0 bg-white rounded-xl border border-slate-200 p-5 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#071E41] font-display mb-1">
              Send an Operational Message
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              For general inquiries, carrier coordination, or billing matters, please submit the form below.
            </p>

            {submittedTicket ? (
              <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Inquiry Recorded Successfully</span>
                </div>
                <p>
                  Your message has been assigned reference ticket <strong className="font-mono">{submittedTicket}</strong> for operations at <strong className="font-mono text-emerald-900 break-all">{COMPANY.contact.email}</strong>.
                </p>
                <p className="text-xs text-emerald-800">
                  A Momentum logistics coordinator will review your message and follow up promptly via email or direct phone.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedTicket(null);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      inquiryType: 'General Inquiries',
                      message: '',
                    });
                  }}
                  className="min-h-[44px] px-4 py-2 text-xs font-bold uppercase text-emerald-900 bg-white border border-emerald-300 rounded-md hover:bg-emerald-100 cursor-pointer"
                >
                  Submit Another Inquiry
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="min-w-0">
                    <label htmlFor="contact-name" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Your Name <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Full Name"
                      className={inputClass}
                    />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="contact-email" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Email Address <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@business.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="min-w-0">
                    <label htmlFor="contact-phone" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Telephone
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (803) 000-0000"
                      className={inputClass}
                    />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="contact-inquiryType" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      id="contact-inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="General Inquiries">General Inquiries &amp; Customer Support</option>
                      <option value="Freight Booking & Capacity">Commercial Freight Transportation (53ft Dry Van)</option>
                      <option value="Cargo Van Service Request">Cargo Van Transportation &amp; Delivery</option>
                      <option value="Heavy Haul Inquiry">Heavy Machinery &amp; Equipment Hauling</option>
                      <option value="Construction Hauling">Construction Material &amp; Aggregate Hauling</option>
                      <option value="Customer Concern">Customer Concern &amp; Service Issue</option>
                      <option value="Dispatch & Coordination">Dispatch &amp; Route Coordination</option>
                      <option value="Billing & Invoicing">Billing &amp; Invoicing Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-bold text-[#071E41] mb-1.5">
                    Your Message <span className="text-red-700">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Provide details regarding your freight, schedule, or inquiry..."
                    className="w-full min-w-0 px-3.5 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-md focus:border-[#071E41] focus:ring-2 focus:ring-[#071E41]/15 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[48px] w-full py-3 px-5 text-sm font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded-md font-display transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-[#C99A31]" aria-hidden="true" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
