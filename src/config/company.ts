/**
 * Centralized company configuration for Momentum Transportation & Hauling LLC.
 * All company details are sourced exclusively from verified official directives.
 */

export const COMPANY_PHONE = {
  display: '+1 (803) 718-5509',
  e164: '+18037185509',
  href: 'tel:+18037185509',
  countryCode: '+1',
  country: 'US',
  ariaLabel: 'Call Momentum Transportation and Hauling at +1 803 718 5509',
} as const;

export const COMPANY = {
  legalName: 'Momentum Transportation & Hauling LLC',
  displayName: 'Momentum Transportation & Hauling',
  shortName: 'Momentum',
  tagline: 'Moving Business Forward.',
  subheading: 'Transportation and hauling solutions designed around your business needs.',
  
  contact: {
    address: '2 Penhurst Ct., Columbia, SC 29229',
    street: '2 Penhurst Ct.',
    city: 'Columbia',
    state: 'SC',
    postalCode: '29229',
    country: 'USA',
    phone: COMPANY_PHONE.display,
    formattedPhone: COMPANY_PHONE.display,
    phoneTel: COMPANY_PHONE.href,
    email: 'wright.wendell@icloud.com',
    emailMailto: 'mailto:wright.wendell@icloud.com',
    secondaryEmail: 'info@momentumtransporthauling.com',
    secondaryEmailMailto: 'mailto:info@momentumtransporthauling.com',
  },

  primaryMarket: 'Columbia, South Carolina',
  industry: 'Transportation, Logistics & Hauling',
  
  hours: {
    dispatch: '24/7 On-Call Operations & Dispatch',
    office: 'Monday – Friday: 7:00 AM – 6:00 PM EST',
    receiving: 'Scheduled Pickup & Delivery Windows',
  },

  corridors: [
    { name: 'I-77 Corridor', route: 'Columbia ⇄ Rock Hill ⇄ Charlotte', focus: 'Industrial freight, building supplies' },
    { name: 'I-26 Corridor', route: 'Columbia ⇄ Charleston (Port Access) ⇄ Upstate Greenville/Spartanburg', focus: 'Port container transit, general cargo' },
    { name: 'I-20 Corridor', route: 'Columbia ⇄ Florence ⇄ Augusta / Atlanta', focus: 'Interstate commercial distribution' },
    { name: 'Greater Midlands', route: 'Richland & Lexington Counties', focus: 'Local hauling, equipment relocation' },
  ],

  colors: {
    navy: '#071E41',
    navyDark: '#041228',
    gold: '#C99A31',
    goldLight: '#E8BE65',
    white: '#FFFFFF',
    softGray: '#F5F7FA',
    charcoal: '#1F2937',
  },
} as const;
