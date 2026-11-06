import React, { useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { Logo } from '../common/Logo';
import { ASSETS, ASSET_METADATA, LOGOS } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageView) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Freight Booking & Capacity',
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
      const res = await fetch('/api/contact', {
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
    } catch (err) {
      setErrorMessage('Network connection error. Please call our dispatch line directly.');
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
              Columbia, South Carolina Headquarters
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Contact Operations &amp; Dispatch
            </h1>
            <p className="text-sm text-slate-300">
              Get in direct contact with Momentum Transportation &amp; Hauling LLC for load coordination, scheduling, and billing.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Official Contact Card & Image */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <Logo variant="horizontal-light" size="md" />
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#071E41]">Official Address:</strong>
                    <span>{COMPANY.contact.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#071E41]">Direct Dispatch Phone:</strong>
                    <a href={COMPANY.contact.phoneTel} className="text-slate-900 font-bold hover:text-[#071E41]">
                      {COMPANY.contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#071E41]">Corporate Email:</strong>
                    <a href={COMPANY.contact.emailMailto} className="text-slate-900 font-semibold hover:text-[#071E41]">
                      {COMPANY.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#071E41]">Hours of Operation:</strong>
                    <span>{COMPANY.hours.dispatch}</span>
                    <span className="block text-slate-500">{COMPANY.hours.office}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={COMPANY.contact.phoneTel}
                  className="flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display"
                >
                  Click to Call Now
                </a>
                <a
                  href={COMPANY.contact.emailMailto}
                  className="flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#071E41] bg-slate-100 hover:bg-slate-200 rounded font-display"
                >
                  Send Direct Email
                </a>
              </div>
            </div>

            {/* Operations Office Visual */}
            <div className="rounded-xl overflow-hidden shadow-md border border-slate-200">
              <ImageWithFallback
                src={ASSETS.contactHero}
                alt={ASSET_METADATA.contactHero.alt}
                className="w-full h-64 object-cover"
                fallbackTitle="Momentum Operations Office"
              />
              <div className="p-3 bg-white text-[11px] text-slate-500">
                Logistics dispatch and route management office.
              </div>
            </div>
          </div>

          {/* Right Column: Secure Inquiries Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#071E41] font-display mb-1">
              Send an Operational Message
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              For general inquiries, carrier coordination, or billing matters, please submit the form below.
            </p>

            {submittedTicket ? (
              <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Inquiry Dispatched Successfully</span>
                </div>
                <p>
                  Your message has been assigned reference ticket <strong className="font-mono">{submittedTicket}</strong>. An authorized Momentum representative will follow up via email or phone.
                </p>
                <button
                  onClick={() => {
                    setSubmittedTicket(null);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      inquiryType: 'Freight Booking & Capacity',
                      message: '',
                    });
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase text-emerald-800 bg-white border border-emerald-300 rounded hover:bg-emerald-100"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded bg-red-50 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Full Name"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@business.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Telephone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(803) 000-0000"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Inquiry Category
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    >
                      <option value="Freight Booking & Capacity">Freight Booking &amp; Capacity</option>
                      <option value="Heavy Haul Inquiry">Heavy Haul &amp; Machinery Inquiry</option>
                      <option value="Billing & Invoicing">Billing &amp; Invoicing</option>
                      <option value="Driver Recruitment">Driver Recruitment</option>
                      <option value="General Management">General Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Provide details regarding your freight, schedule, or inquiry..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[#C99A31]" />
                  <span>{isSubmitting ? 'Transmitting...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
