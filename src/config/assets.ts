/**
 * Centralized Image and Logo Assets for Momentum Transportation & Hauling LLC.
 * All image assets are imported directly via Vite so that URLs are correctly resolved
 * across both local development and GitHub Pages under the '/momentum/' base path.
 */

import homeHero from '../assets/images/momentum_home_hero_1793927090285.jpg';
import aboutOperations from '../assets/images/momentum_about_operations_1793927090246.jpg';
import transportationHero from '../assets/images/momentum_transportation_hero_1793927091045.jpg';
import haulingHero from '../assets/images/momentum_hauling_hero_1793927090275.jpg';
import fleetHero from '../assets/images/momentum_fleet_hero_1793927091643.jpg';
import serviceAreas from '../assets/images/momentum_service_areas_1793927092785.jpg';
import quoteHero from '../assets/images/momentum_quote_hero_1793927092924.jpg';
import contactHero from '../assets/images/momentum_contact_hero_1793927092952.jpg';
import portalHero from '../assets/images/momentum_portal_hero_1793927094534.jpg';
import careersHero from '../assets/images/momentum_careers_hero_1793927094602.jpg';
import safetyHero from '../assets/images/momentum_safety_hero_1793927094788.jpg';
import commandCenter from '../assets/images/momentum_command_center_1793927094510.jpg';

// Official Circular Emblem & Logo Derivatives
import logoOriginal from '../assets/logo/momentum-logo-original.png';
import logoTransparent from '../assets/logo/momentum-logo-transparent.png';
import logoHeader from '../assets/logo/momentum-logo-header.png';
import logoFooter from '../assets/logo/momentum-logo-footer.png';
import favicon from '../assets/logo/momentum-favicon.png';
import brandMockup from '../assets/brand/brand-identity-mockup.png';

export const LOGOS = {
  original: logoOriginal,
  transparent: logoTransparent,
  header: logoHeader,
  footer: logoFooter,
  favicon: favicon,
  brandMockup: brandMockup,
} as const;

export const ASSETS = {
  homeHero,
  aboutOperations,
  transportationHero,
  haulingHero,
  fleetHero,
  serviceAreas,
  quoteHero,
  contactHero,
  portalHero,
  careersHero,
  safetyHero,
  commandCenter,
  logoHeader,
  logoFooter,
  logoOriginal,
  logoTransparent,
  brandMockup,
} as const;

export const ASSET_METADATA = {
  homeHero: {
    src: ASSETS.homeHero,
    alt: 'Modern American heavy-duty semi-truck traveling on an interstate highway during morning sunlight in South Carolina',
    caption: 'Interstate commercial freight transport operating across regional hubs.',
  },
  aboutOperations: {
    src: ASSETS.aboutOperations,
    alt: 'Commercial transportation operations yard with freight vehicles and logistics dispatch facilities',
    caption: 'Operational coordination and terminal activity.',
  },
  transportationHero: {
    src: ASSETS.transportationHero,
    alt: 'Commercial semi-truck transporting freight safely on a South Carolina highway corridor',
    caption: 'Scheduled freight transport and regional dedicated hauling.',
  },
  haulingHero: {
    src: ASSETS.haulingHero,
    alt: 'Heavy-duty commercial hauling vehicle at an industrial staging and transport site',
    caption: 'Specialized hauling and heavy cargo transport (illustrative concept).',
  },
  fleetHero: {
    src: ASSETS.fleetHero,
    alt: 'Commercial transportation fleet in alignment at a clean industrial terminal',
    caption: 'Commercial vehicle equipment and configuration concepts.',
  },
  serviceAreas: {
    src: ASSETS.serviceAreas,
    alt: 'Commercial freight transport traveling through southeastern interstate transit corridors',
    caption: 'Columbia, SC regional market and interstate connections.',
  },
  quoteHero: {
    src: ASSETS.quoteHero,
    alt: 'Commercial freight truck staged at distribution loading terminal dock ready for dispatch',
    caption: 'Rapid rate quotation and freight dispatch planning.',
  },
  contactHero: {
    src: ASSETS.contactHero,
    alt: 'Modern logistics dispatch operations office with fleet monitoring workstations',
    caption: 'Direct coordination with dispatch and customer support personnel.',
  },
  portalHero: {
    src: ASSETS.portalHero,
    alt: 'Transportation management desktop interface showing shipment milestones and logistics metrics',
    caption: 'Client access to verified milestones and documentation.',
  },
  careersHero: {
    src: ASSETS.careersHero,
    alt: 'Professional commercial driver conducting pre-trip inspection beside a commercial truck',
    caption: 'Professional driving and logistics operations opportunities.',
  },
  safetyHero: {
    src: ASSETS.safetyHero,
    alt: 'Safety technician conducting comprehensive pre-trip wheel and mechanical inspection',
    caption: 'Commitment to road safety, regular maintenance, and compliance standards.',
  },
  commandCenter: {
    src: ASSETS.commandCenter,
    alt: 'Enterprise logistics operations command center with active route monitoring',
    caption: 'Centralized dispatch, load coordination, and route oversight.',
  },
  officialEmblem: {
    src: LOGOS.transparent,
    alt: 'Official Momentum Transportation & Hauling LLC Circular Emblem',
    caption: 'Official registered emblem with circular navy and gold border, stylized M, and truck illustration.',
  },
} as const;
