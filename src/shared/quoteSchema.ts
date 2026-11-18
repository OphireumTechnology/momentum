export type ServiceGroup = 'dry_van' | 'flatbed' | 'cargo_van' | 'heavy_haul';

export const SERVICE_CATEGORY_OPTIONS = [
  {
    value: 'dry_van',
    label: 'Commercial Freight Transportation (53ft Air-Ride Dry Van)',
    group: 'dry_van' as ServiceGroup,
  },
  {
    value: 'flatbed',
    label: 'Flatbed & Step Deck Transport (Structural Steel, Lumber & Materials)',
    group: 'flatbed' as ServiceGroup,
  },
  {
    value: 'cargo_van',
    label: 'Cargo Van Transportation & Delivery (Warehouse-to-Jobsite / Expedited)',
    group: 'cargo_van' as ServiceGroup,
  },
  {
    value: 'heavy_haul',
    label: 'Heavy Hauling & Equipment Mobilization (Lowboy / RGN Machinery)',
    group: 'heavy_haul' as ServiceGroup,
  },
  {
    value: 'regional_logistics',
    label: 'Regional Corridors & Port Access (I-77, I-26, I-20 Dry Van)',
    group: 'dry_van' as ServiceGroup,
  },
  {
    value: 'dedicated',
    label: 'Dedicated Transportation Arrangements (Scheduled Contract Lanes)',
    group: 'dry_van' as ServiceGroup,
  },
  {
    value: 'flatbed_materials',
    label: 'Construction Material Delivery (Flatbed Framing & Jobsite Staging)',
    group: 'flatbed' as ServiceGroup,
  },
  {
    value: 'preconstruction_hauling',
    label: 'Pre-Construction Transportation (Aggregate & Site Prep Hauling)',
    group: 'flatbed' as ServiceGroup,
  },
  {
    value: 'ongoing_construction',
    label: 'Ongoing Construction Hauling (Jobsite Material Staging)',
    group: 'flatbed' as ServiceGroup,
  },
  {
    value: 'equipment_mobilization',
    label: 'Equipment Mobilization (Excavators, Loaders & Heavy Machinery)',
    group: 'heavy_haul' as ServiceGroup,
  },
  {
    value: 'project_logistics',
    label: 'Dedicated Construction Project Logistics (Multi-Vehicle Coordination)',
    group: 'heavy_haul' as ServiceGroup,
  },
] as const;

export const ALLOWED_SERVICE_CATEGORIES = new Set<string>(
  SERVICE_CATEGORY_OPTIONS.map((opt) => opt.value)
);

export function getServiceGroup(serviceCategory: string): ServiceGroup {
  const match = SERVICE_CATEGORY_OPTIONS.find((opt) => opt.value === serviceCategory);
  return match ? match.group : 'dry_van';
}

export function getServiceCategoryLabel(serviceCategory: string): string {
  const match = SERVICE_CATEGORY_OPTIONS.find((opt) => opt.value === serviceCategory);
  return match ? match.label : serviceCategory.replace(/_/g, ' ');
}

export const URGENCY_OPTIONS = [
  { value: 'standard', label: 'Standard Scheduled Dispatch' },
  { value: 'expedited', label: 'Expedited / Priority Transit' },
  { value: 'same_day', label: 'Same-Day / Urgent Dispatch' },
  { value: 'scheduled_contract', label: 'Recurring / Contract Lane Inquiry' },
] as const;

export const CONTACT_METHOD_OPTIONS = [
  { value: 'either', label: 'Email or Phone (Fastest)' },
  { value: 'email', label: 'Email Preferred' },
  { value: 'phone', label: 'Phone Call Preferred' },
] as const;

export const LOADING_REQUIREMENT_OPTIONS = [
  { value: 'dock_to_dock', label: 'Standard Dock-to-Dock' },
  { value: 'forklift_onsite', label: 'Forklift / Loader Available On-Site' },
  { value: 'crane_loading', label: 'Crane / Overhead Rigging Required' },
  { value: 'liftgate_pickup', label: 'Liftgate Required at Pickup' },
  { value: 'liftgate_delivery', label: 'Liftgate Required at Delivery' },
  { value: 'liftgate_both', label: 'Liftgate Required at Pickup & Delivery' },
  { value: 'ramp_self_propelled', label: 'Drive-On / Self-Propelled Ramp Loading' },
  { value: 'driver_assist', label: 'Driver Assist / Hand Unload Needed' },
] as const;

export interface ServiceSpecificDetails {
  // Dry Van
  dryVanSealRequired?: boolean;
  dryVanStackable?: string;
  dryVanAppointmentWindow?: string;
  // Flatbed
  flatbedTarping?: string;
  flatbedSecurement?: string;
  flatbedSideLoading?: boolean;
  // Cargo Van
  cargoVanInsideDelivery?: boolean;
  cargoVanPieceCount?: string;
  cargoVanDockOrJobsite?: string;
  // Heavy Haul
  heavyHaulTrailerType?: string;
  heavyHaulEquipmentModel?: string;
  heavyHaulIsOperable?: string;
  heavyHaulPermitsNeeded?: boolean;
}

export interface QuoteSubmissionInput {
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  preferredContactMethod: 'email' | 'phone' | 'either';
  serviceCategory: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate?: string;
  urgency: 'standard' | 'expedited' | 'same_day' | 'scheduled_contract';
  cargoType: string;
  loadDescription: string;
  estimatedWeightLbs: number | string;
  dimensions?: string;
  palletCountOrEquipment?: string;
  loadingRequirements: string;
  isOversized: boolean;
  isHazmat: boolean;
  hazmatDetails?: string;
  specialHandling?: string;
  serviceDetails?: ServiceSpecificDetails;
  consent: boolean;
  idempotencyKey?: string;
  // Honeypot bot trap — must always remain empty
  companyWebsite?: string;
}

export interface NormalizedQuoteSubmission {
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  preferredContactMethod: 'email' | 'phone' | 'either';
  serviceCategory: string;
  serviceGroup: ServiceGroup;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string;
  urgency: 'standard' | 'expedited' | 'same_day' | 'scheduled_contract';
  cargoType: string;
  loadDescription: string;
  estimatedWeightLbs: number;
  dimensions: string;
  palletCountOrEquipment: string;
  loadingRequirements: string;
  isOversized: boolean;
  isHazmat: boolean;
  hazmatDetails: string;
  specialHandling: string;
  serviceDetails: ServiceSpecificDetails;
  consent: true;
  idempotencyKey: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  data?: NormalizedQuoteSubmission;
  isBotTrap?: boolean;
}

function cleanText(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateAndNormalizeQuote(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: { _form: 'Invalid request payload.' } };
  }

  const input = raw as Record<string, unknown>;
  const errors: Record<string, string> = {};

  // Honeypot check
  const honeypot = cleanText(input.companyWebsite, 200);
  if (honeypot.length > 0) {
    return {
      valid: false,
      isBotTrap: true,
      errors: { _form: 'Submission rejected by automated spam protection.' },
    };
  }

  const customerName = cleanText(input.customerName, 120);
  const companyName = cleanText(input.companyName, 160);
  const email = cleanText(input.email, 160).toLowerCase();
  const phone = cleanText(input.phone, 40);
  const preferredContactMethodRaw = cleanText(input.preferredContactMethod || 'either', 20);
  const serviceCategory = cleanText(input.serviceCategory || 'dry_van', 60);
  const pickupLocation = cleanText(input.pickupLocation, 240);
  const deliveryLocation = cleanText(input.deliveryLocation, 240);
  const pickupDate = cleanText(input.pickupDate, 20);
  const deliveryDate = cleanText(input.deliveryDate, 20);
  const urgencyRaw = cleanText(input.urgency || 'standard', 30);
  const cargoType = cleanText(input.cargoType, 120);
  const loadDescription = cleanText(input.loadDescription, 2000);
  const dimensions = cleanText(input.dimensions, 180);
  const palletCountOrEquipment = cleanText(input.palletCountOrEquipment, 180);
  const loadingRequirements = cleanText(input.loadingRequirements || 'dock_to_dock', 80);
  const isOversized = Boolean(input.isOversized);
  const isHazmat = Boolean(input.isHazmat);
  const hazmatDetails = cleanText(input.hazmatDetails, 500);
  const specialHandling = cleanText(input.specialHandling, 1000);
  const consent = input.consent === true;
  const idempotencyKey = cleanText(input.idempotencyKey, 128);

  if (customerName.length < 2) {
    errors.customerName = 'Please enter your full contact name (at least 2 characters).';
  }
  if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid business email address.';
  }
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = 'Please enter a valid telephone number (7 to 15 digits).';
  }

  if (!ALLOWED_SERVICE_CATEGORIES.has(serviceCategory)) {
    errors.serviceCategory = 'Please select a valid transportation service category.';
  }

  if (pickupLocation.length < 3) {
    errors.pickupLocation = 'Please enter a valid pickup street address, city, state, or ZIP.';
  }
  if (deliveryLocation.length < 3) {
    errors.deliveryLocation = 'Please enter a valid delivery street address, city, state, or ZIP.';
  }

  if (!DATE_REGEX.test(pickupDate)) {
    errors.pickupDate = 'Please select a valid target pickup date.';
  }
  if (deliveryDate && !DATE_REGEX.test(deliveryDate)) {
    errors.deliveryDate = 'Please enter a valid requested delivery date.';
  } else if (deliveryDate && DATE_REGEX.test(pickupDate) && deliveryDate < pickupDate) {
    errors.deliveryDate = 'Requested delivery date cannot be earlier than the pickup date.';
  }

  if (cargoType.length < 2) {
    errors.cargoType = 'Please specify the cargo type (e.g., Palletized Freight, Steel Beams, Excavator).';
  }

  if (loadDescription.length < 5) {
    errors.loadDescription = 'Please provide a clear description of the cargo or equipment.';
  }

  const parsedWeight = Number(input.estimatedWeightLbs);
  if (!Number.isFinite(parsedWeight) || parsedWeight < 50 || parsedWeight > 250000) {
    errors.estimatedWeightLbs = 'Estimated cargo weight must be between 50 and 250,000 lbs.';
  }

  if (isHazmat && hazmatDetails.length < 3) {
    errors.hazmatDetails = 'Please specify the hazardous material class, UN number, or handling details.';
  }

  if (!consent) {
    errors.consent = 'Please confirm accuracy and consent to be contacted regarding this quote.';
  }

  const preferredContactMethod: 'email' | 'phone' | 'either' =
    preferredContactMethodRaw === 'email' || preferredContactMethodRaw === 'phone'
      ? preferredContactMethodRaw
      : 'either';

  const urgency: 'standard' | 'expedited' | 'same_day' | 'scheduled_contract' =
    urgencyRaw === 'expedited' || urgencyRaw === 'same_day' || urgencyRaw === 'scheduled_contract'
      ? urgencyRaw
      : 'standard';

  const serviceGroup = getServiceGroup(serviceCategory);
  const rawDetails =
    input.serviceDetails && typeof input.serviceDetails === 'object'
      ? (input.serviceDetails as Record<string, unknown>)
      : {};

  const serviceDetails: ServiceSpecificDetails = {};
  if (serviceGroup === 'dry_van') {
    serviceDetails.dryVanSealRequired = Boolean(rawDetails.dryVanSealRequired);
    serviceDetails.dryVanStackable = cleanText(rawDetails.dryVanStackable, 60);
    serviceDetails.dryVanAppointmentWindow = cleanText(rawDetails.dryVanAppointmentWindow, 120);
  } else if (serviceGroup === 'flatbed') {
    serviceDetails.flatbedTarping = cleanText(rawDetails.flatbedTarping, 80);
    serviceDetails.flatbedSecurement = cleanText(rawDetails.flatbedSecurement, 120);
    serviceDetails.flatbedSideLoading = Boolean(rawDetails.flatbedSideLoading);
  } else if (serviceGroup === 'cargo_van') {
    serviceDetails.cargoVanInsideDelivery = Boolean(rawDetails.cargoVanInsideDelivery);
    serviceDetails.cargoVanPieceCount = cleanText(rawDetails.cargoVanPieceCount, 60);
    serviceDetails.cargoVanDockOrJobsite = cleanText(rawDetails.cargoVanDockOrJobsite, 80);
  } else if (serviceGroup === 'heavy_haul') {
    serviceDetails.heavyHaulTrailerType = cleanText(rawDetails.heavyHaulTrailerType, 80);
    serviceDetails.heavyHaulEquipmentModel = cleanText(rawDetails.heavyHaulEquipmentModel, 140);
    serviceDetails.heavyHaulIsOperable = cleanText(rawDetails.heavyHaulIsOperable, 60);
    serviceDetails.heavyHaulPermitsNeeded = Boolean(rawDetails.heavyHaulPermitsNeeded);
    if (!dimensions && !serviceDetails.heavyHaulEquipmentModel) {
      errors.dimensions = 'For heavy hauling, please provide equipment dimensions or make/model.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    data: {
      customerName,
      companyName,
      email,
      phone,
      preferredContactMethod,
      serviceCategory,
      serviceGroup,
      pickupLocation,
      deliveryLocation,
      pickupDate,
      deliveryDate,
      urgency,
      cargoType,
      loadDescription,
      estimatedWeightLbs: Math.round(parsedWeight),
      dimensions,
      palletCountOrEquipment,
      loadingRequirements,
      isOversized,
      isHazmat,
      hazmatDetails: isHazmat ? hazmatDetails : '',
      specialHandling,
      serviceDetails,
      consent: true,
      idempotencyKey,
    },
  };
}
