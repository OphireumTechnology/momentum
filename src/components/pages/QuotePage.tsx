import React, { useMemo, useRef, useState } from 'react';
import { PageView } from '../common/Header';
import { COMPANY, COMPANY_PHONE } from '../../config/company';
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
  Copy,
  Check,
  Loader2,
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

const inputBaseClass =
  'w-full min-w-0 min-h-[48px] px-3.5 py-2.5 text-base text-slate-900 bg-white border rounded-md transition-colors focus:border-[#071E41] focus:ring-2 focus:ring-[#071E41]/15 focus:outline-none placeholder:text-slate-400';

export const QuotePage: React.FC<QuotePageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<FormState>(createInitialFormState);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(createIdempotencyKey);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedReference, setCopiedReference] = useState(false);
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
      errorBannerRef.current?.focus();
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
        `Could not reach the Momentum quotation server. Your form inputs have been preserved — click Retry Submission below or call dispatch directly at ${COMPANY_PHONE.display}.`
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

  const handleCopyReference = async (refNumber: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(refNumber);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = refNumber;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopiedReference(true);
      window.setTimeout(() => setCopiedReference(false), 2500);
    } catch {
      setCopiedReference(false);
    }
  };

  const handleResetForNewQuote = () => {
    setSubmittedSummary(null);
    setCopiedReference(false);
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
      <div className="bg-[#F5F7FA] min-h-screen py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <section
            aria-labelledby="quote-confirmation-heading"
            className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden p-5 sm:p-10 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <Logo variant="horizontal-light" size="md" />
              <div className="text-left sm:text-right text-xs text-slate-600">
                <span className="font-bold text-[#071E41] block">{COMPANY.legalName}</span>
                <span>{COMPANY.contact.address}</span>
                <a
                  href={COMPANY_PHONE.href}
                  aria-label={COMPANY_PHONE.ariaLabel}
                  className="block font-semibold text-[#071E41] mt-0.5 hover:underline"
                >
                  Dispatch: {COMPANY_PHONE.display}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display block">
                  Quote Request Saved
                </span>
                <h1
                  id="quote-confirmation-heading"
                  className="text-2xl sm:text-3xl font-extrabold text-[#071E41] font-display leading-tight"
                >
                  Thank You, {submittedData.customerName}
                </h1>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-[#071E41] text-white space-y-3" role="status" aria-live="polite">
              <div className="text-xs uppercase tracking-wider text-[#C99A31] font-bold font-display">
                Your Official Quote Reference Number
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white tabular-nums break-all">
                  {referenceNumber}
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyReference(referenceNumber)}
                  className="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-colors"
                >
                  {copiedReference ? (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>Copied Reference</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>Copy Reference Number</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Keep this reference number for your records when speaking with dispatch at{' '}
                <a
                  href={COMPANY_PHONE.href}
                  aria-label={COMPANY_PHONE.ariaLabel}
                  className="text-white underline font-semibold"
                >
                  {COMPANY_PHONE.display}
                </a>
                .
              </p>
            </div>

            {/* Honest email dispatch status */}
            <div
              className={`p-4 rounded-lg border text-sm flex items-start gap-3 leading-relaxed ${
                isDelivered
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {isDelivered ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div>
                {isDelivered ? (
                  <>
                    <strong className="block mb-0.5">Dispatch Notification Sent</strong>
                    <span>
                      Your quote details have been delivered to our operations team ({COMPANY.contact.email}). A coordinator will reply to <strong>{submittedData.email}</strong> or call <strong>{submittedData.phone}</strong>.
                    </span>
                  </>
                ) : (
                  <>
                    <strong className="block mb-0.5">Saved — Dispatch Notification Queued</strong>
                    <span>
                      Your quote request has been saved successfully. Your dispatch notification is queued for delivery. For immediate same-day dispatch, call{' '}
                      <a
                        href={COMPANY_PHONE.href}
                        aria-label={COMPANY_PHONE.ariaLabel}
                        className="font-bold underline"
                      >
                        {COMPANY_PHONE.display}
                      </a>
                      .
                    </span>
                  </>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-y border-slate-200 py-5 text-slate-700">
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wider font-bold text-[#071E41]">Pickup Location</dt>
                <dd className="mt-0.5 break-words">{submittedData.pickupLocation}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wider font-bold text-[#071E41]">Delivery Location</dt>
                <dd className="mt-0.5 break-words">{submittedData.deliveryLocation}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wider font-bold text-[#071E41]">Service Category</dt>
                <dd className="mt-0.5 break-words">{getServiceCategoryLabel(submittedData.serviceCategory)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wider font-bold text-[#071E41]">Cargo Type &amp; Weight</dt>
                <dd className="mt-0.5 tabular-nums break-words">
                  {submittedData.cargoType} ({submittedData.estimatedWeightLbs.toLocaleString()} lbs)
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wider font-bold text-[#071E41]">Requested Pickup Date</dt>
                <dd className="mt-0.5">{submittedData.pickupDate}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wider font-bold text-[#071E41]">Preferred Contact</dt>
                <dd className="mt-0.5 uppercase">{submittedData.preferredContactMethod}</dd>
              </div>
            </dl>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[48px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Print Confirmation</span>
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="min-h-[48px] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                >
                  Back to Home
                </button>
                <button
                  type="button"
                  onClick={handleResetForNewQuote}
                  className="min-h-[48px] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md font-display cursor-pointer"
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
      {/* Compact, Left-Aligned Hero Header */}
      <section className="bg-[#071E41] text-white py-7 sm:py-11 border-b border-[#0D2C5B]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl space-y-2 text-left">
            <span className="block text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
              Momentum Freight Dispatch · Columbia, SC
            </span>
            <h1 className="text-[28px] sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white leading-[1.15]">
              Request a Transportation Quote
            </h1>
            <p className="text-base text-slate-200 leading-relaxed">
              Tell us about your shipment and our dispatch team will review your request.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form + Dispatch Info */}
      <section className="py-7 sm:py-12 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Primary Single-Column Mobile Quote Form */}
          <div className="lg:col-span-8 min-w-0 bg-white rounded-xl border border-slate-200 p-5 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#071E41] font-display">
                Shipment Rate Request
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Fields marked with <span className="text-red-700 font-bold">*</span> are required.
              </p>
            </div>

            {errorMessage && (
              <div
                ref={errorBannerRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                className="mb-6 p-4 rounded-lg bg-red-50 border border-red-300 text-sm text-red-900 space-y-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="font-medium leading-relaxed">{errorMessage}</div>
                </div>
                {canRetry && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pl-7">
                    <button
                      type="button"
                      onClick={() => void submitQuotePayload()}
                      disabled={isSubmitting}
                      className="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-700 hover:bg-red-800 rounded-md inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                      <span>Retry Submission</span>
                    </button>
                    <a
                      href={COMPANY_PHONE.href}
                      aria-label={COMPANY_PHONE.ariaLabel}
                      className="min-h-[44px] inline-flex items-center text-sm font-bold text-red-800 underline"
                    >
                      Call Dispatch: {COMPANY_PHONE.display}
                    </a>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* Honeypot anti-bot field */}
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

              {/* SECTION A — Contact Information */}
              <fieldset className="space-y-5">
                <legend className="w-full pb-2 border-b-2 border-[#071E41]/15 flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#071E41] text-[#C99A31] text-xs font-bold shrink-0">
                    A
                  </span>
                  <span className="text-sm font-extrabold uppercase tracking-wider text-[#071E41] font-display">
                    Contact Information
                  </span>
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Full Name <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      name="customerName"
                      autoComplete="name"
                      value={formData.customerName}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.customerName)}
                      aria-describedby={fieldErrors.customerName ? 'err-customerName' : undefined}
                      required
                      placeholder="e.g., Jordan Taylor"
                      className={`${inputBaseClass} ${
                        fieldErrors.customerName ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <p id="err-customerName" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.customerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="companyName" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Company Name (if applicable)
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      autoComplete="organization"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Business or Contractor Name"
                      className={`${inputBaseClass} border-slate-300`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Email Address <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                      required
                      placeholder="dispatch@yourcompany.com"
                      className={`${inputBaseClass} ${
                        fieldErrors.email ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p id="err-email" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Phone Number <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
                      required
                      placeholder="+1 (803) 555-0199"
                      className={`${inputBaseClass} ${
                        fieldErrors.phone ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p id="err-phone" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="preferredContactMethod" className="block text-sm font-bold text-[#071E41] mb-1.5">
                    Preferred Contact Method
                  </label>
                  <select
                    id="preferredContactMethod"
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={handleChange}
                    className={`${inputBaseClass} border-slate-300`}
                  >
                    {CONTACT_METHOD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>

              {/* SECTION B — Shipment Information */}
              <fieldset className="space-y-5">
                <legend className="w-full pb-2 border-b-2 border-[#071E41]/15 flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#071E41] text-[#C99A31] text-xs font-bold shrink-0">
                    B
                  </span>
                  <span className="text-sm font-extrabold uppercase tracking-wider text-[#071E41] font-display">
                    Shipment Information
                  </span>
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="pickupLocation" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Pickup Location <span className="text-red-700">*</span>
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
                      placeholder="City, State or Full Street Address"
                      className={`${inputBaseClass} ${
                        fieldErrors.pickupLocation ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.pickupLocation && (
                      <p id="err-pickupLocation" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.pickupLocation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="deliveryLocation" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Delivery Location <span className="text-red-700">*</span>
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
                      placeholder="City, State or Full Street Address"
                      className={`${inputBaseClass} ${
                        fieldErrors.deliveryLocation ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.deliveryLocation && (
                      <p id="err-deliveryLocation" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.deliveryLocation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="pickupDate" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Requested Pickup Date <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="pickupDate"
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.pickupDate)}
                      aria-describedby={fieldErrors.pickupDate ? 'err-pickupDate' : undefined}
                      required
                      className={`${inputBaseClass} ${
                        fieldErrors.pickupDate ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.pickupDate && (
                      <p id="err-pickupDate" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.pickupDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="deliveryDate" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Requested Delivery Date (Optional)
                    </label>
                    <input
                      id="deliveryDate"
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.deliveryDate)}
                      aria-describedby={fieldErrors.deliveryDate ? 'err-deliveryDate' : undefined}
                      className={`${inputBaseClass} ${
                        fieldErrors.deliveryDate ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.deliveryDate && (
                      <p id="err-deliveryDate" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.deliveryDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="serviceCategory" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Transportation Service <span className="text-red-700">*</span>
                    </label>
                    <select
                      id="serviceCategory"
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleChange}
                      className={`${inputBaseClass} border-slate-300`}
                    >
                      {SERVICE_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="urgency" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Schedule Urgency <span className="text-red-700">*</span>
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className={`${inputBaseClass} border-slate-300`}
                    >
                      {URGENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="cargoType" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Cargo Type <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="cargoType"
                      type="text"
                      name="cargoType"
                      value={formData.cargoType}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.cargoType)}
                      aria-describedby={fieldErrors.cargoType ? 'err-cargoType' : undefined}
                      required
                      placeholder="e.g., Palletized Goods, Structural Steel"
                      className={`${inputBaseClass} ${
                        fieldErrors.cargoType ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.cargoType && (
                      <p id="err-cargoType" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.cargoType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="estimatedWeightLbs" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Estimated Weight (lbs) <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="estimatedWeightLbs"
                      type="number"
                      inputMode="numeric"
                      name="estimatedWeightLbs"
                      value={formData.estimatedWeightLbs}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.estimatedWeightLbs)}
                      aria-describedby={fieldErrors.estimatedWeightLbs ? 'err-estimatedWeightLbs' : undefined}
                      required
                      min="50"
                      max="250000"
                      placeholder="e.g., 24000"
                      className={`${inputBaseClass} ${
                        fieldErrors.estimatedWeightLbs ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.estimatedWeightLbs && (
                      <p id="err-estimatedWeightLbs" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.estimatedWeightLbs}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="loadDescription" className="block text-sm font-bold text-[#071E41] mb-1.5">
                    Freight or Cargo Description <span className="text-red-700">*</span>
                  </label>
                  <textarea
                    id="loadDescription"
                    name="loadDescription"
                    value={formData.loadDescription}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.loadDescription)}
                    aria-describedby={fieldErrors.loadDescription ? 'err-loadDescription' : undefined}
                    required
                    rows={3}
                    placeholder="Describe goods, packaging, machinery model, or site access constraints..."
                    className={`w-full min-w-0 px-3.5 py-3 text-base text-slate-900 bg-white border rounded-md transition-colors focus:border-[#071E41] focus:ring-2 focus:ring-[#071E41]/15 focus:outline-none placeholder:text-slate-400 ${
                      fieldErrors.loadDescription ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.loadDescription && (
                    <p id="err-loadDescription" className="mt-1.5 text-sm font-medium text-red-700">
                      {fieldErrors.loadDescription}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="palletCountOrEquipment" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Equipment or Vehicle Requirements / Units
                    </label>
                    <input
                      id="palletCountOrEquipment"
                      type="text"
                      name="palletCountOrEquipment"
                      value={formData.palletCountOrEquipment}
                      onChange={handleChange}
                      placeholder="e.g., 18 Pallets, Liftgate, or 1 Skid Steer"
                      className={`${inputBaseClass} border-slate-300`}
                    />
                  </div>

                  <div>
                    <label htmlFor="dimensions" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Cargo Dimensions (L x W x H)
                    </label>
                    <input
                      id="dimensions"
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.dimensions)}
                      placeholder="e.g., 48x40x54 in or 28ft x 8.5ft"
                      className={`${inputBaseClass} ${
                        fieldErrors.dimensions ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.dimensions && (
                      <p className="mt-1.5 text-sm font-medium text-red-700">{fieldErrors.dimensions}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="loadingRequirements" className="block text-sm font-bold text-[#071E41] mb-1.5">
                    Loading &amp; Unloading Requirements <span className="text-red-700">*</span>
                  </label>
                  <select
                    id="loadingRequirements"
                    name="loadingRequirements"
                    value={formData.loadingRequirements}
                    onChange={handleChange}
                    className={`${inputBaseClass} border-slate-300`}
                  >
                    {LOADING_REQUIREMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service-Specific Equipment Fields */}
                <div className="p-4 sm:p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#071E41]">
                    Equipment Specifications ({activeServiceGroup.replace('_', ' ')})
                  </div>

                  {activeServiceGroup === 'dry_van' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dryVanStackable" className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Pallet Stackability
                        </label>
                        <select
                          id="dryVanStackable"
                          name="dryVanStackable"
                          value={formData.serviceDetails.dryVanStackable || 'Stackable'}
                          onChange={handleServiceDetailChange}
                          className={`${inputBaseClass} border-slate-300`}
                        >
                          <option value="Stackable">Stackable</option>
                          <option value="Non-Stackable">Non-Stackable</option>
                          <option value="Mixed / Floor Loaded">Mixed / Floor Loaded</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="dryVanAppointmentWindow" className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Dock / Appointment Window
                        </label>
                        <input
                          id="dryVanAppointmentWindow"
                          type="text"
                          name="dryVanAppointmentWindow"
                          value={formData.serviceDetails.dryVanAppointmentWindow || ''}
                          onChange={handleServiceDetailChange}
                          placeholder="e.g., 8:00 AM - 2:00 PM"
                          className={`${inputBaseClass} border-slate-300`}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="min-h-[44px] inline-flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            name="dryVanSealRequired"
                            checked={Boolean(formData.serviceDetails.dryVanSealRequired)}
                            onChange={handleServiceDetailChange}
                            className="h-5 w-5 rounded border-slate-300 text-[#071E41]"
                          />
                          <span>Tamper Seal Required</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeServiceGroup === 'flatbed' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="flatbedTarping" className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Tarping Requirements
                        </label>
                        <select
                          id="flatbedTarping"
                          name="flatbedTarping"
                          value={formData.serviceDetails.flatbedTarping || 'No Tarp Required'}
                          onChange={handleServiceDetailChange}
                          className={`${inputBaseClass} border-slate-300`}
                        >
                          <option value="No Tarp Required">No Tarp Required</option>
                          <option value="4ft Lumber Tarps">4ft Lumber Tarps</option>
                          <option value="6ft / 8ft Full Tarps">6ft / 8ft Full Tarps</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="flatbedSecurement" className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Securement Preference
                        </label>
                        <input
                          id="flatbedSecurement"
                          type="text"
                          name="flatbedSecurement"
                          value={formData.serviceDetails.flatbedSecurement || ''}
                          onChange={handleServiceDetailChange}
                          placeholder="Straps, chains, coil racks..."
                          className={`${inputBaseClass} border-slate-300`}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="min-h-[44px] inline-flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            name="flatbedSideLoading"
                            checked={Boolean(formData.serviceDetails.flatbedSideLoading)}
                            onChange={handleServiceDetailChange}
                            className="h-5 w-5 rounded border-slate-300 text-[#071E41]"
                          />
                          <span>Side / Overhead Crane Load</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeServiceGroup === 'cargo_van' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cargoVanPieceCount" className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Piece / Box Count
                        </label>
                        <input
                          id="cargoVanPieceCount"
                          type="text"
                          name="cargoVanPieceCount"
                          value={formData.serviceDetails.cargoVanPieceCount || ''}
                          onChange={handleServiceDetailChange}
                          placeholder="e.g., 2 Pallets / 18 Cartons"
                          className={`${inputBaseClass} border-slate-300`}
                        />
                      </div>
                      <div>
                        <label htmlFor="cargoVanDockOrJobsite" className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Delivery Site Type
                        </label>
                        <select
                          id="cargoVanDockOrJobsite"
                          name="cargoVanDockOrJobsite"
                          value={formData.serviceDetails.cargoVanDockOrJobsite || 'Jobsite / Street Delivery'}
                          onChange={handleServiceDetailChange}
                          className={`${inputBaseClass} border-slate-300`}
                        >
                          <option value="Jobsite / Street Delivery">Jobsite / Street Delivery</option>
                          <option value="Commercial Dock">Commercial Dock</option>
                          <option value="Warehouse Transfer">Warehouse Transfer</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="min-h-[44px] inline-flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            name="cargoVanInsideDelivery"
                            checked={Boolean(formData.serviceDetails.cargoVanInsideDelivery)}
                            onChange={handleServiceDetailChange}
                            className="h-5 w-5 rounded border-slate-300 text-[#071E41]"
                          />
                          <span>Inside Delivery Requested</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeServiceGroup === 'heavy_haul' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="heavyHaulTrailerType" className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Trailer Configuration
                        </label>
                        <select
                          id="heavyHaulTrailerType"
                          name="heavyHaulTrailerType"
                          value={formData.serviceDetails.heavyHaulTrailerType || 'RGN Lowboy'}
                          onChange={handleServiceDetailChange}
                          className={`${inputBaseClass} border-slate-300`}
                        >
                          <option value="RGN Lowboy">RGN / Detachable Lowboy</option>
                          <option value="Step Deck with Ramps">Step Deck with Ramps</option>
                          <option value="Landoll / Tilt Bed">Landoll / Hydraulic Tilt Bed</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="heavyHaulEquipmentModel" className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Machine Make &amp; Model
                        </label>
                        <input
                          id="heavyHaulEquipmentModel"
                          type="text"
                          name="heavyHaulEquipmentModel"
                          value={formData.serviceDetails.heavyHaulEquipmentModel || ''}
                          onChange={handleServiceDetailChange}
                          placeholder="e.g., CAT 320 Excavator"
                          className={`${inputBaseClass} border-slate-300`}
                        />
                      </div>
                      <div>
                        <label htmlFor="heavyHaulIsOperable" className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Machine Operability
                        </label>
                        <select
                          id="heavyHaulIsOperable"
                          name="heavyHaulIsOperable"
                          value={formData.serviceDetails.heavyHaulIsOperable || 'Operable (Drives On)'}
                          onChange={handleServiceDetailChange}
                          className={`${inputBaseClass} border-slate-300`}
                        >
                          <option value="Operable (Drives On)">Operable (Drives On)</option>
                          <option value="Non-Operable (Winch Required)">Non-Operable (Winch Required)</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="min-h-[48px] inline-flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            name="heavyHaulPermitsNeeded"
                            checked={Boolean(formData.serviceDetails.heavyHaulPermitsNeeded)}
                            onChange={handleServiceDetailChange}
                            className="h-5 w-5 rounded border-slate-300 text-[#071E41]"
                          />
                          <span>Oversize Permits / Escort Needed</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </fieldset>

              {/* SECTION C — Additional Details */}
              <fieldset className="space-y-5">
                <legend className="w-full pb-2 border-b-2 border-[#071E41]/15 flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#071E41] text-[#C99A31] text-xs font-bold shrink-0">
                    C
                  </span>
                  <span className="text-sm font-extrabold uppercase tracking-wider text-[#071E41] font-display">
                    Additional Details
                  </span>
                </legend>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-[#071E41]">Special Requirements</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <label className="min-h-[48px] flex items-center gap-3 p-3.5 rounded-md border border-slate-300 bg-white text-sm text-slate-800 cursor-pointer hover:border-[#071E41]">
                      <input
                        type="checkbox"
                        name="isOversized"
                        checked={formData.isOversized}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-slate-300 text-[#071E41] shrink-0"
                      />
                      <span>
                        <strong>Oversized / Over-Dimensional</strong> load
                      </span>
                    </label>

                    <label className="min-h-[48px] flex items-center gap-3 p-3.5 rounded-md border border-slate-300 bg-white text-sm text-slate-800 cursor-pointer hover:border-[#071E41]">
                      <input
                        type="checkbox"
                        name="isHazmat"
                        checked={formData.isHazmat}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-slate-300 text-[#071E41] shrink-0"
                      />
                      <span>
                        <strong>Hazardous Material (Hazmat)</strong> cargo
                      </span>
                    </label>
                  </div>
                </div>

                {formData.isHazmat && (
                  <div>
                    <label htmlFor="hazmatDetails" className="block text-sm font-bold text-[#071E41] mb-1.5">
                      Hazmat UN Number, Class &amp; Packaging Details <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="hazmatDetails"
                      type="text"
                      name="hazmatDetails"
                      value={formData.hazmatDetails}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.hazmatDetails)}
                      aria-describedby={fieldErrors.hazmatDetails ? 'err-hazmatDetails' : undefined}
                      placeholder="Specify UN#, Hazard Class, Packing Group, and Emergency Contact"
                      className={`${inputBaseClass} ${
                        fieldErrors.hazmatDetails ? 'border-red-600 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.hazmatDetails && (
                      <p id="err-hazmatDetails" className="mt-1.5 text-sm font-medium text-red-700">
                        {fieldErrors.hazmatDetails}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="specialHandling" className="block text-sm font-bold text-[#071E41] mb-1.5">
                    Additional Shipment Instructions (Optional)
                  </label>
                  <textarea
                    id="specialHandling"
                    name="specialHandling"
                    rows={3}
                    value={formData.specialHandling}
                    onChange={handleChange}
                    placeholder="e.g., Call receiver 2 hours prior, security gate code, PPE required on jobsite"
                    className="w-full min-w-0 px-3.5 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-md transition-colors focus:border-[#071E41] focus:ring-2 focus:ring-[#071E41]/15 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* Optional Preliminary Estimate Preview */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2.5 text-sm text-slate-700">
                    <Sparkles className="w-4 h-4 text-[#C99A31] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
                    <span>Optional: Preview Preliminary Equipment &amp; Corridor Estimate</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiAssist}
                    disabled={isAiLoading}
                    className="min-h-[44px] px-4 py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31]/20 hover:bg-[#C99A31]/30 border border-[#C99A31]/60 rounded-md transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isAiLoading ? 'Analyzing...' : 'Preview Estimate'}
                  </button>
                </div>

                {aiAnalysis && (
                  <div className="p-4 rounded-lg bg-[#071E41] text-white space-y-2.5 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-700 pb-2">
                      <span className="font-bold text-xs text-[#C99A31] uppercase tracking-wider">
                        Preliminary Route &amp; Equipment Guide
                      </span>
                      <span className="text-xs text-slate-300">
                        Est. {aiAnalysis.estimatedMileage} Miles · {aiAnalysis.transitTimeEst}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      <div>
                        <span className="text-slate-400 block">Recommended Unit:</span>
                        <span className="font-semibold text-sm">{aiAnalysis.recommendedEquipment}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Indicative Range:</span>
                        <span className="font-bold text-sm text-[#C99A31] tabular-nums">
                          ${aiAnalysis.suggestedRateMin} – ${aiAnalysis.suggestedRateMax}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs pt-1 leading-relaxed">
                      {aiAnalysis.operationalNotes}
                    </p>
                  </div>
                )}
              </fieldset>

              {/* SECTION D — Review and Submit */}
              <fieldset className="space-y-5">
                <legend className="w-full pb-2 border-b-2 border-[#071E41]/15 flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#071E41] text-[#C99A31] text-xs font-bold shrink-0">
                    D
                  </span>
                  <span className="text-sm font-extrabold uppercase tracking-wider text-[#071E41] font-display">
                    Review and Submit
                  </span>
                </legend>

                <div className="p-4 sm:p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#071E41]">
                    Summary of Entered Details
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-slate-500">Contact</dt>
                      <dd className="font-medium text-[#071E41] break-words">
                        {formData.customerName.trim() || 'Not entered yet'}
                        {formData.companyName.trim() ? ` · ${formData.companyName.trim()}` : ''}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-slate-500">Email / Phone</dt>
                      <dd className="font-medium text-[#071E41] break-words">
                        {formData.email.trim() || '—'} · {formData.phone.trim() || '—'}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-slate-500">Route</dt>
                      <dd className="font-medium text-[#071E41] break-words">
                        {formData.pickupLocation.trim() || 'Origin'} → {formData.deliveryLocation.trim() || 'Destination'}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-slate-500">Service &amp; Weight</dt>
                      <dd className="font-medium text-[#071E41] tabular-nums break-words">
                        {getServiceCategoryLabel(formData.serviceCategory)} ·{' '}
                        {formData.estimatedWeightLbs ? `${Number(formData.estimatedWeightLbs).toLocaleString()} lbs` : 'Weight TBD'}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-slate-500">Requested Pickup</dt>
                      <dd className="font-medium text-[#071E41]">{formData.pickupDate || 'Not selected'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-slate-500">Cargo Type</dt>
                      <dd className="font-medium text-[#071E41] break-words">
                        {formData.cargoType.trim() || 'Not entered yet'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Consent to be contacted */}
                <div>
                  <label
                    htmlFor="consent"
                    className={`min-h-[48px] flex items-start gap-3 p-3.5 rounded-md border text-sm leading-relaxed cursor-pointer ${
                      fieldErrors.consent ? 'border-red-600 bg-red-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="consent"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.consent)}
                      aria-describedby={fieldErrors.consent ? 'err-consent' : undefined}
                      className="mt-0.5 h-5 w-5 rounded border-slate-300 text-[#071E41] focus:ring-[#071E41] shrink-0"
                    />
                    <span className="text-slate-700">
                      I confirm the shipment details provided are accurate and consent to be contacted by Momentum Transportation &amp; Hauling LLC regarding this quote request. <span className="text-red-700 font-bold">*</span>
                    </span>
                  </label>
                  {fieldErrors.consent && (
                    <p id="err-consent" className="mt-1.5 text-sm font-medium text-red-700">
                      {fieldErrors.consent}
                    </p>
                  )}
                </div>

                {/* Primary Submit Action */}
                <div className="pt-1 space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="min-h-[52px] w-full py-3.5 px-6 text-sm sm:text-base font-bold uppercase tracking-wider text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded-md transition-colors font-display shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        <span>Submitting Quote Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />
                        <span>Submit Quote Request</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    Duplicate submissions are automatically prevented while your request is processed.
                  </p>
                </div>
              </fieldset>
            </form>
          </div>

          {/* Right Column: Dispatch Support & Visual */}
          <div className="lg:col-span-4 min-w-0 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#071E41] uppercase tracking-wider font-display">
                Prefer Phone Dispatch?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Speak directly with our Columbia dispatch desk for urgent same-day hauling, oversized permits, or truck availability.
              </p>
              <a
                href={COMPANY_PHONE.href}
                aria-label={COMPANY_PHONE.ariaLabel}
                className="min-h-[48px] w-full px-4 py-3 rounded-md bg-[#071E41] hover:bg-[#041228] text-white font-bold text-sm inline-flex items-center justify-center gap-2.5 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C99A31]" aria-hidden="true" />
                <span>Call {COMPANY_PHONE.display}</span>
              </a>
              <div className="text-xs text-slate-500 pt-1">
                {COMPANY.hours.dispatch}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white">
              <ImageWithFallback
                src={ASSETS.quoteHero}
                alt={ASSET_METADATA.quoteHero.alt}
                className="w-full h-48 sm:h-56 object-cover"
                fallbackTitle="Momentum Logistics Dispatch"
              />
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-[#071E41] font-display">
                  Direct Dispatch Quotation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every quote request receives a unique reference number and routes directly to our Columbia dispatch team for prompt rate confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
