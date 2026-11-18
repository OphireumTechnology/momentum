import React, { useMemo, useRef, useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { Logo } from '../common/Logo';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { getApiUrl } from '../../config/api';
import {
  CONTACT_METHOD_OPTIONS,
  getServiceCategoryLabel,
  getServiceGroup,
  LOADING_REQUIREMENT_OPTIONS,
  NormalizedQuoteSubmission,
  SERVICE_CATEGORY_OPTIONS,
  ServiceSpecificDetails,
  URGENCY_OPTIONS,
  validateAndNormalizeQuote,
} from '../../shared/quoteSchema';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Printer,
  Phone,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface QuotePageProps {
  onNavigate: (page: PageView) => void;
}

interface FormState {
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  preferredContactMethod: 'email' | 'phone' | 'either';
  serviceCategory: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string;
  urgency: 'standard' | 'expedited' | 'same_day' | 'scheduled_contract';
  cargoType: string;
  loadDescription: string;
  estimatedWeightLbs: string;
  dimensions: string;
  palletCountOrEquipment: string;
  loadingRequirements: string;
  isOversized: boolean;
  isHazmat: boolean;
  hazmatDetails: string;
  specialHandling: string;
  serviceDetails: ServiceSpecificDetails;
  consent: boolean;
  companyWebsite: string; // Honeypot field
}

interface SubmittedQuoteSummary {
  referenceNumber: string;
  createdAt: string;
  duplicatePrevented: boolean;
  emailDelivery: {
    status: string;
    delivered: boolean;
    messageId?: string | null;
  };
  submittedData: NormalizedQuoteSubmission;
}

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mth-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDefaultPickupDate(): string {
  return new Date(Date.now() + 86400000).toISOString().split('T')[0];
}

function createInitialFormState(): FormState {
  return {
    customerName: '',
    companyName: '',
    email: '',
    phone: '',
    preferredContactMethod: 'either',
    serviceCategory: 'dry_van',
    pickupLocation: 'Columbia, SC',
    deliveryLocation: '',
    pickupDate: getDefaultPickupDate(),
    deliveryDate: '',
    urgency: 'standard',
    cargoType: '',
    loadDescription: '',
    estimatedWeightLbs: '15000',
    dimensions: '',
    palletCountOrEquipment: '',
    loadingRequirements: 'dock_to_dock',
    isOversized: false,
    isHazmat: false,
    hazmatDetails: '',
    specialHandling: '',
    serviceDetails: {
      dryVanSealRequired: false,
      dryVanStackable: 'Stackable',
      dryVanAppointmentWindow: '',
      flatbedTarping: 'No Tarp Required',
      flatbedSecurement: 'Chains & Binders / Straps',
      flatbedSideLoading: false,
      cargoVanInsideDelivery: false,
      cargoVanPieceCount: '',
      cargoVanDockOrJobsite: 'Jobsite / Street Delivery',
      heavyHaulTrailerType: 'RGN Lowboy',
      heavyHaulEquipmentModel: '',
      heavyHaulIsOperable: 'Operable (Drives On)',
      heavyHaulPermitsNeeded: false,
    },
    consent: false,
    companyWebsite: '',
  };
}

export const QuotePage: React.FC<QuotePageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<FormState>(createInitialFormState);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(createIdempotencyKey);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    recommendedEquipment: string;
    estimatedMileage: number;
    suggestedRateMin: number;
    suggestedRateMax: number;
    transitTimeEst: string;
    operationalNotes: string;
  } | null>(null);
  const [submittedSummary, setSubmittedSummary] = useState<SubmittedQuoteSummary | null>(null);
  const errorBannerRef = useRef<HTMLDivElement | null>(null);

  const activeServiceGroup = useMemo(
    () => getServiceGroup(formData.serviceCategory),
    [formData.serviceCategory]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const nextValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleServiceDetailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const nextValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      serviceDetails: {
        ...prev.serviceDetails,
        [name]: nextValue,
      },
    }));
  };

  const handleAiAssist = async () => {
    if (!formData.pickupLocation.trim() || !formData.deliveryLocation.trim() || !formData.loadDescription.trim()) {
      setErrorMessage('Please enter Pickup Address, Delivery Address, and Cargo Description before running route analysis.');
      setCanRetry(false);
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
    } catch {
      // Non-blocking optional assistant
    } finally {
      setIsAiLoading(false);
    }
  };

  const submitQuotePayload = async () => {
    if (isSubmitting) return;
    setErrorMessage('');
    setCanRetry(false);

    const validation = validateAndNormalizeQuote({
      ...formData,
      idempotencyKey,
    });

    if (!validation.valid || !validation.data) {
      setFieldErrors(validation.errors);
      const firstErr = Object.values(validation.errors)[0] || 'Please review the highlighted fields.';
      setErrorMessage(firstErr);
      errorBannerRef.current?.focus();
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl('/api/quotes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          ...formData,
          idempotencyKey,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.referenceNumber) {
        setSubmittedSummary({
          referenceNumber: data.referenceNumber,
          createdAt: data.createdAt || new Date().toISOString(),
          duplicatePrevented: Boolean(data.duplicatePrevented),
          emailDelivery: data.emailDelivery || {
            status: 'retrying',
            delivered: false,
          },
          submittedData: validation.data,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (data.fieldErrors && typeof data.fieldErrors === 'object') {
          setFieldErrors(data.fieldErrors);
        }
        setErrorMessage(
          data.error ||
            'Unable to submit your quote request right now. Please review your entries or retry.'
        );
        setCanRetry(response.status >= 500 || response.status === 429);
        errorBannerRef.current?.focus();
      }
    } catch {
      setErrorMessage(
        'Could not reach the Momentum quotation server. Your form inputs have been preserved — click Retry Submission below or call dispatch directly at (803) 718-5509.'
      );
      setCanRetry(true);
      errorBannerRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitQuotePayload();
  };

  const handleResetForNewQuote = () => {
    setSubmittedSummary(null);
    setAiAnalysis(null);
    setFieldErrors({});
    setErrorMessage('');
    setCanRetry(false);
    setFormData(createInitialFormState());
    setIdempotencyKey(createIdempotencyKey());
  };

  // Accessible Confirmation Screen
  if (submittedSummary) {
    const { referenceNumber, submittedData, emailDelivery } = submittedSummary;
    const isDelivered = emailDelivery.status === 'sent' || emailDelivery.delivered;

    return (
      <div className="bg-[#F5F7FA] min-h-screen py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <section
            aria-labelledby="quote-confirmation-heading"
            className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden p-8 sm:p-10 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <Logo variant="horizontal-light" size="lg" />
              <div className="text-left sm:text-right text-xs text-slate-500">
                <span className="font-bold text-[#071E41] block">{COMPANY.legalName}</span>
                <span>{COMPANY.contact.address}</span>
                <span className="block">Dispatch: {COMPANY.contact.formattedPhone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
                  Quote Request Recorded
                </span>
                <h1
                  id="quote-confirmation-heading"
                  className="text-2xl font-extrabold text-[#071E41] font-display"
                >
                  Thank You, {submittedData.customerName}
                </h1>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-[#071E41] text-white space-y-1.5" role="status" aria-live="polite">
              <div className="text-xs uppercase tracking-wider text-[#C99A31] font-bold font-display">
                Your Official Quote Reference Number
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white tabular-nums">
                {referenceNumber}
              </div>
              <p className="text-xs text-slate-300 pt-1">
                Please keep this reference number for your records when speaking with dispatch at {COMPANY.contact.formattedPhone}.
              </p>
            </div>

            {/* Honest email dispatch status */}
            <div
              className={`p-4 rounded-lg border text-xs flex items-start gap-2.5 ${
                isDelivered
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {isDelivered ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div>
                {isDelivered ? (
                  <>
                    <strong className="block">Dispatch Notification Sent</strong>
                    <span>
                      Your quote details have been delivered to our operations team ({COMPANY.contact.email}). A coordinator will reply to <strong>{submittedData.email}</strong> or call <strong>{submittedData.phone}</strong>.
                    </span>
                  </>
                ) : (
                  <>
                    <strong className="block">Quote Saved — Dispatch Email Queued for Delivery</strong>
                    <span>
                      Your quote request ({referenceNumber}) is safely stored in our system and queued for automated delivery to {COMPANY.contact.email}. For immediate same-day dispatch, please call <strong>{COMPANY.contact.formattedPhone}</strong>.
                    </span>
                  </>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-y border-slate-200 py-5 text-slate-700">
              <div>
                <dt className="font-bold text-[#071E41]">Pickup Location</dt>
                <dd>{submittedData.pickupLocation}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#071E41]">Delivery Location</dt>
                <dd>{submittedData.deliveryLocation}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#071E41]">Service Category</dt>
                <dd>{getServiceCategoryLabel(submittedData.serviceCategory)}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#071E41]">Cargo Type &amp; Weight</dt>
                <dd className="tabular-nums">
                  {submittedData.cargoType} ({submittedData.estimatedWeightLbs.toLocaleString()} lbs)
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#071E41]">Requested Pickup Date</dt>
                <dd>{submittedData.pickupDate}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#071E41]">Preferred Contact</dt>
                <dd className="uppercase">{submittedData.preferredContactMethod}</dd>
              </div>
            </dl>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Print Confirmation</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="px-4 py-2.5 text-xs font-bold uppercase text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                >
                  Back to Home
                </button>
                <button
                  type="button"
                  onClick={handleResetForNewQuote}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display cursor-pointer"
                >
                  Submit Another Quote
                </button>
              </div>
            </div>
          </section>
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
              Provide your shipment specifications below for a direct rate proposal from our Columbia, SC dispatch team.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form + Dispatch Info */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Quotation Form */}
          <div className="lg:col-span-8 min-w-0 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#071E41] font-display mb-1">
              Freight &amp; Route Information
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Fields marked with * are required. Submissions are delivered directly to our dispatch inbox.
            </p>

            {errorMessage && (
              <div
                ref={errorBannerRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 space-y-2.5 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>{errorMessage}</div>
                </div>
                {canRetry && (
                  <div className="flex flex-wrap items-center gap-3 pl-6">
                    <button
                      type="button"
                      onClick={() => void submitQuotePayload()}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-red-700 hover:bg-red-800 rounded inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Retry Submission</span>
                    </button>
                    <a
                      href={COMPANY.contact.phoneTel}
                      className="text-xs font-semibold text-red-800 underline"
                    >
                      Call Dispatch: {COMPANY.contact.formattedPhone}
                    </a>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Honeypot anti-bot field (visually hidden, excluded from tab flow) */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="companyWebsite">Company Website</label>
                <input
                  id="companyWebsite"
                  type="text"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Section 1: Customer Contact */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-wider text-[#071E41] border-b border-slate-200 pb-1.5 w-full">
                  1. Contact Information
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customerName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Name *
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.customerName)}
                      aria-describedby={fieldErrors.customerName ? 'err-customerName' : undefined}
                      required
                      placeholder="Full Name"
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.customerName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <p id="err-customerName" className="mt-1 text-[11px] text-red-600">{fieldErrors.customerName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="companyName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Business or Contractor Name"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                      required
                      placeholder="logistics@company.com"
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p id="err-email" className="mt-1 text-[11px] text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
                      required
                      placeholder="803-555-0100"
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.phone ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p id="err-phone" className="mt-1 text-[11px] text-red-600">{fieldErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="preferredContactMethod" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Preferred Contact
                    </label>
                    <select
                      id="preferredContactMethod"
                      name="preferredContactMethod"
                      value={formData.preferredContactMethod}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none bg-white"
                    >
                      {CONTACT_METHOD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Section 2: Service & Route */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-wider text-[#071E41] border-b border-slate-200 pb-1.5 w-full">
                  2. Service Category, Addresses &amp; Schedule
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="serviceCategory" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Transportation Service Category *
                    </label>
                    <select
                      id="serviceCategory"
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none bg-white"
                    >
                      {SERVICE_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="urgency" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Urgency *
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none bg-white"
                    >
                      {URGENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pickupLocation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pickup Address / Location *
                    </label>
                    <input
                      id="pickupLocation"
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.pickupLocation)}
                      aria-describedby={fieldErrors.pickupLocation ? 'err-pickupLocation' : undefined}
                      required
                      placeholder="Street Address, City, State, ZIP"
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.pickupLocation ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.pickupLocation && (
                      <p id="err-pickupLocation" className="mt-1 text-[11px] text-red-600">{fieldErrors.pickupLocation}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="deliveryLocation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Delivery Address / Destination *
                    </label>
                    <input
                      id="deliveryLocation"
                      type="text"
                      name="deliveryLocation"
                      value={formData.deliveryLocation}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.deliveryLocation)}
                      aria-describedby={fieldErrors.deliveryLocation ? 'err-deliveryLocation' : undefined}
                      required
                      placeholder="Street Address, City, State, ZIP"
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.deliveryLocation ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.deliveryLocation && (
                      <p id="err-deliveryLocation" className="mt-1 text-[11px] text-red-600">{fieldErrors.deliveryLocation}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pickupDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Requested Pickup Date *
                    </label>
                    <input
                      id="pickupDate"
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.pickupDate)}
                      required
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.pickupDate ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.pickupDate && (
                      <p className="mt-1 text-[11px] text-red-600">{fieldErrors.pickupDate}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="deliveryDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Requested Delivery Date (Optional)
                    </label>
                    <input
                      id="deliveryDate"
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.deliveryDate)}
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.deliveryDate ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.deliveryDate && (
                      <p className="mt-1 text-[11px] text-red-600">{fieldErrors.deliveryDate}</p>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Section 3: Cargo Specifications */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-wider text-[#071E41] border-b border-slate-200 pb-1.5 w-full">
                  3. Cargo Specifications &amp; Handling
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cargoType" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cargo Type *
                    </label>
                    <input
                      id="cargoType"
                      type="text"
                      name="cargoType"
                      value={formData.cargoType}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.cargoType)}
                      required
                      placeholder="e.g., Palletized Goods, Structural Steel, Excavator"
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.cargoType ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.cargoType && (
                      <p className="mt-1 text-[11px] text-red-600">{fieldErrors.cargoType}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="loadingRequirements" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Loading &amp; Unloading Requirements *
                    </label>
                    <select
                      id="loadingRequirements"
                      name="loadingRequirements"
                      value={formData.loadingRequirements}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none bg-white"
                    >
                      {LOADING_REQUIREMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="estimatedWeightLbs" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Estimated Weight (lbs) *
                    </label>
                    <input
                      id="estimatedWeightLbs"
                      type="number"
                      name="estimatedWeightLbs"
                      value={formData.estimatedWeightLbs}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.estimatedWeightLbs)}
                      required
                      min="50"
                      max="250000"
                      placeholder="e.g. 24000"
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.estimatedWeightLbs ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.estimatedWeightLbs && (
                      <p className="mt-1 text-[11px] text-red-600">{fieldErrors.estimatedWeightLbs}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="dimensions" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Dimensions (L x W x H)
                    </label>
                    <input
                      id="dimensions"
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.dimensions)}
                      placeholder="e.g. 48x40x54 in or 28ft x 8.5ft"
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.dimensions ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.dimensions && (
                      <p className="mt-1 text-[11px] text-red-600">{fieldErrors.dimensions}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="palletCountOrEquipment" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pallet Count / Equipment Units
                    </label>
                    <input
                      id="palletCountOrEquipment"
                      type="text"
                      name="palletCountOrEquipment"
                      value={formData.palletCountOrEquipment}
                      onChange={handleChange}
                      placeholder="e.g. 18 Pallets or 1 Skid Steer"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Service-Specific Dynamic Fields */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#071E41]">
                    Service-Specific Details ({activeServiceGroup.replace('_', ' ')})
                  </div>

                  {activeServiceGroup === 'dry_van' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="dryVanStackable" className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Pallet Stackability
                        </label>
                        <select
                          id="dryVanStackable"
                          name="dryVanStackable"
                          value={formData.serviceDetails.dryVanStackable || 'Stackable'}
                          onChange={handleServiceDetailChange}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="Stackable">Stackable</option>
                          <option value="Non-Stackable">Non-Stackable</option>
                          <option value="Mixed / Floor Loaded">Mixed / Floor Loaded</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="dryVanAppointmentWindow" className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Dock / Appointment Window
                        </label>
                        <input
                          id="dryVanAppointmentWindow"
                          type="text"
                          name="dryVanAppointmentWindow"
                          value={formData.serviceDetails.dryVanAppointmentWindow || ''}
                          onChange={handleServiceDetailChange}
                          placeholder="e.g. 8:00 AM - 2:00 PM"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div className="flex items-end pb-1.5">
                        <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="dryVanSealRequired"
                            checked={Boolean(formData.serviceDetails.dryVanSealRequired)}
                            onChange={handleServiceDetailChange}
                            className="h-4 w-4 rounded border-slate-300 text-[#071E41]"
                          />
                          <span>Tamper Seal Required</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeServiceGroup === 'flatbed' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="flatbedTarping" className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tarping Requirements
                        </label>
                        <select
                          id="flatbedTarping"
                          name="flatbedTarping"
                          value={formData.serviceDetails.flatbedTarping || 'No Tarp Required'}
                          onChange={handleServiceDetailChange}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="No Tarp Required">No Tarp Required</option>
                          <option value="4ft Lumber Tarps">4ft Lumber Tarps</option>
                          <option value="6ft / 8ft Full Tarps">6ft / 8ft Full Tarps</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="flatbedSecurement" className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Securement Preference
                        </label>
                        <input
                          id="flatbedSecurement"
                          type="text"
                          name="flatbedSecurement"
                          value={formData.serviceDetails.flatbedSecurement || ''}
                          onChange={handleServiceDetailChange}
                          placeholder="Straps, chains, coil racks..."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div className="flex items-end pb-1.5">
                        <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="flatbedSideLoading"
                            checked={Boolean(formData.serviceDetails.flatbedSideLoading)}
                            onChange={handleServiceDetailChange}
                            className="h-4 w-4 rounded border-slate-300 text-[#071E41]"
                          />
                          <span>Side / Overhead Crane Load</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeServiceGroup === 'cargo_van' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="cargoVanPieceCount" className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Piece / Box Count
                        </label>
                        <input
                          id="cargoVanPieceCount"
                          type="text"
                          name="cargoVanPieceCount"
                          value={formData.serviceDetails.cargoVanPieceCount || ''}
                          onChange={handleServiceDetailChange}
                          placeholder="e.g. 2 Pallets / 18 Cartons"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="cargoVanDockOrJobsite" className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Delivery Site Type
                        </label>
                        <select
                          id="cargoVanDockOrJobsite"
                          name="cargoVanDockOrJobsite"
                          value={formData.serviceDetails.cargoVanDockOrJobsite || 'Jobsite / Street Delivery'}
                          onChange={handleServiceDetailChange}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="Jobsite / Street Delivery">Jobsite / Street Delivery</option>
                          <option value="Commercial Dock">Commercial Dock</option>
                          <option value="Warehouse Transfer">Warehouse Transfer</option>
                        </select>
                      </div>
                      <div className="flex items-end pb-1.5">
                        <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="cargoVanInsideDelivery"
                            checked={Boolean(formData.serviceDetails.cargoVanInsideDelivery)}
                            onChange={handleServiceDetailChange}
                            className="h-4 w-4 rounded border-slate-300 text-[#071E41]"
                          />
                          <span>Inside Delivery Requested</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeServiceGroup === 'heavy_haul' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="heavyHaulTrailerType" className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Trailer Configuration
                        </label>
                        <select
                          id="heavyHaulTrailerType"
                          name="heavyHaulTrailerType"
                          value={formData.serviceDetails.heavyHaulTrailerType || 'RGN Lowboy'}
                          onChange={handleServiceDetailChange}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="RGN Lowboy">RGN / Detachable Lowboy</option>
                          <option value="Step Deck with Ramps">Step Deck with Ramps</option>
                          <option value="Landoll / Tilt Bed">Landoll / Hydraulic Tilt Bed</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="heavyHaulEquipmentModel" className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Machine Make &amp; Model
                        </label>
                        <input
                          id="heavyHaulEquipmentModel"
                          type="text"
                          name="heavyHaulEquipmentModel"
                          value={formData.serviceDetails.heavyHaulEquipmentModel || ''}
                          onChange={handleServiceDetailChange}
                          placeholder="e.g. CAT 320 Excavator"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="heavyHaulIsOperable" className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Machine Operability
                        </label>
                        <select
                          id="heavyHaulIsOperable"
                          name="heavyHaulIsOperable"
                          value={formData.serviceDetails.heavyHaulIsOperable || 'Operable (Drives On)'}
                          onChange={handleServiceDetailChange}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="Operable (Drives On)">Operable (Drives On)</option>
                          <option value="Non-Operable (Winch Required)">Non-Operable (Winch Required)</option>
                        </select>
                      </div>
                      <div className="flex items-end pb-1.5">
                        <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="heavyHaulPermitsNeeded"
                            checked={Boolean(formData.serviceDetails.heavyHaulPermitsNeeded)}
                            onChange={handleServiceDetailChange}
                            className="h-4 w-4 rounded border-slate-300 text-[#071E41]"
                          />
                          <span>Oversize Permits / Escort Needed</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Declarations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="flex items-center gap-2.5 p-3 rounded border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isOversized"
                      checked={formData.isOversized}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-[#071E41]"
                    />
                    <span><strong>Oversized / Over-Dimensional</strong> load declaration</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isHazmat"
                      checked={formData.isHazmat}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-[#071E41]"
                    />
                    <span><strong>Hazardous Material (Hazmat)</strong> declaration</span>
                  </label>
                </div>

                {formData.isHazmat && (
                  <div>
                    <label htmlFor="hazmatDetails" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hazmat UN Number, Class &amp; Packaging Details *
                    </label>
                    <input
                      id="hazmatDetails"
                      type="text"
                      name="hazmatDetails"
                      value={formData.hazmatDetails}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.hazmatDetails)}
                      placeholder="Specify UN#, Hazard Class, Packing Group, and Emergency Contact"
                      className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                        fieldErrors.hazmatDetails ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.hazmatDetails && (
                      <p className="mt-1 text-[11px] text-red-600">{fieldErrors.hazmatDetails}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="loadDescription" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cargo Description *
                  </label>
                  <textarea
                    id="loadDescription"
                    name="loadDescription"
                    value={formData.loadDescription}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.loadDescription)}
                    required
                    rows={3}
                    placeholder="Describe goods, packaging, machinery model, or site constraints..."
                    className={`w-full px-3 py-2 text-xs border rounded focus:border-[#071E41] focus:outline-none ${
                      fieldErrors.loadDescription ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.loadDescription && (
                    <p className="mt-1 text-[11px] text-red-600">{fieldErrors.loadDescription}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="specialHandling" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Special Handling Instructions (Optional)
                  </label>
                  <input
                    id="specialHandling"
                    type="text"
                    name="specialHandling"
                    value={formData.specialHandling}
                    onChange={handleChange}
                    placeholder="e.g., Call receiver 2 hours prior, security gate code, PPE required on jobsite"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
                  />
                </div>
              </fieldset>

              {/* Optional AI Route Feasibility Assistant */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Sparkles className="w-4 h-4 text-[#C99A31]" aria-hidden="true" />
                  <span>Optional: Preview Preliminary Equipment &amp; Corridor Estimate</span>
                </div>
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 text-[11px] font-bold uppercase text-[#071E41] bg-[#C99A31]/20 hover:bg-[#C99A31]/30 border border-[#C99A31]/50 rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAiLoading ? 'Analyzing...' : 'Preview Estimate'}
                </button>
              </div>

              {aiAnalysis && (
                <div className="p-4 rounded-lg bg-[#071E41] text-white space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-bold text-[#C99A31] uppercase tracking-wider">
                      Preliminary Route &amp; Equipment Guide
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Est. {aiAnalysis.estimatedMileage} Miles · {aiAnalysis.transitTimeEst}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Recommended Unit:</span>
                      <span className="font-semibold">{aiAnalysis.recommendedEquipment}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Indicative Range:</span>
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

              {/* Consent to be contacted */}
              <div className="pt-1">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.consent)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#071E41] focus:ring-[#071E41]"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-600 leading-normal cursor-pointer">
                    I confirm the shipment details provided are accurate to the best of my knowledge and consent to be contacted by Momentum Transportation &amp; Hauling LLC via phone or email regarding this quotation request. *
                  </label>
                </div>
                {fieldErrors.consent && (
                  <p className="mt-1 text-[11px] text-red-600 pl-6">{fieldErrors.consent}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-all font-display shadow-md hover:shadow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>{isSubmitting ? 'Submitting Quotation Request...' : 'Submit Quotation Request'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Visual Hero & Direct Support */}
          <div className="lg:col-span-4 min-w-0 space-y-6">
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <ImageWithFallback
                src={ASSETS.quoteHero}
                alt={ASSET_METADATA.quoteHero.alt}
                className="w-full h-56 object-cover"
                fallbackTitle="Momentum Logistics Dispatch"
              />
              <div className="p-5 bg-white space-y-2">
                <h3 className="text-sm font-bold text-[#071E41] font-display">
                  Direct Dispatch Quotation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every quote request is assigned a unique reference number and sent directly to our Columbia dispatch team for prompt verification and rate confirmation.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
              <h4 className="font-bold text-[#071E41] uppercase tracking-wider font-display">
                Prefer Phone Dispatch?
              </h4>
              <p className="text-slate-600">
                Speak directly with our Columbia dispatch desk for urgent same-day hauling, oversized equipment permits, or immediate truck availability.
              </p>
              <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <Phone className="w-4 h-4 text-[#C99A31]" aria-hidden="true" />
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
