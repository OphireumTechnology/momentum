/**
 * Centralized Image and Logo Assets for Momentum Transportation & Hauling LLC.
 * All image assets are imported directly via Vite so that URLs are correctly resolved
 * across both local development and production environments.
 *
 * All vehicle images feature exclusive Momentum corporate branding (Navy #071E41, Gold #C99A31, White #FFFFFF)
 * with the official circular emblem and strictly zero third-party commercial fleet branding.
 */

// Brand-Approved Exclusive Vehicle & Staging Assets (Directive Images 01 - 08)
import commercialFreight from '../assets/images/commercial_freight_1793930931652.jpg';
import commercialHauling from '../assets/images/commercial_hauling_1793930933033.jpg';
import regionalCorridors from '../assets/images/regional_corridors_1793930933975.jpg';
import cargoVanDelivery from '../assets/images/cargo_van_delivery_1793930934063.jpg';
import preconstructionHauling from '../assets/images/preconstruction_hauling_1793930935160.jpg';
import constructionMaterials from '../assets/images/construction_materials_1793930935770.jpg';
import equipmentMobilization from '../assets/images/equipment_mobilization_1793930936065.jpg';
import constructionLogistics from '../assets/images/construction_logistics_1793930937192.jpg';

// Supporting Operational & Facilities Assets
import aboutOperations from '../assets/images/momentum_about_operations_1793927090246.jpg';
import contactHero from '../assets/images/momentum_contact_hero_1793927092952.jpg';
import portalHero from '../assets/images/momentum_portal_hero_1793927094534.jpg';
import careersHero from '../assets/images/momentum_careers_hero_1793927094602.jpg';
import safetyHero from '../assets/images/momentum_safety_hero_1793927094788.jpg';
import commandCenter from '../assets/images/momentum_command_center_1793927094510.jpg';

// Newly Generated Technology & Logistics Assets
import connectedLogisticsNetwork from '../assets/images/connected_logistics_network_1793953504093.jpg';
import digitalDispatchWorkspace from '../assets/images/digital_dispatch_workspace_1793953504229.jpg';
import heroTechTruck from '../assets/images/hero_tech_truck_1793953504134.jpg';
import cargoVanLogistics from '../assets/images/cargo_van_logistics_1793953506308.jpg';
import constructionTransportTech from '../assets/images/construction_transport_tech_1793953505865.jpg';

// Official Corporate Company Profile Document (8-Page Official Publication)
import companyProfileThumbnail from '../assets/images/momentum-company-profile-p1.png';
import companyProfileCollaterals from '../assets/images/momentum-company-profile-p8.png';

export const COMPANY_PROFILE_PDF_URL = `${import.meta.env.BASE_URL}documents/Momentum-Transportation-Company-Profile.pdf`;
export const COMPANY_PROFILE_PDF_ALT_URL = `${import.meta.env.BASE_URL}documents/momentum-company-profile.pdf`;

// Official Circular Emblem & Logo Derivatives (LOCKED)
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
  hero: logoOriginal,
  favicon: favicon,
  brandMockup: brandMockup,
} as const;

export const ASSETS = {
  // Primary Five Services & Core Operations (All Exclusive Momentum Branding)
  commercialFreight,
  commercialHauling,
  regionalCorridors,
  cargoVanDelivery,
  preconstructionHauling,
  constructionMaterials,
  equipmentMobilization,
  constructionLogistics,

  // Aliases for backwards compatibility with existing page components
  homeHero: commercialFreight,
  transportationHero: commercialFreight,
  haulingHero: commercialHauling,
  fleetHero: equipmentMobilization,
  serviceAreas: regionalCorridors,
  quoteHero: commercialFreight,

  // Operational Context Images
  aboutOperations,
  contactHero,
  portalHero,
  careersHero,
  safetyHero,
  commandCenter,

  // Technology & Network Visuals
  connectedLogisticsNetwork,
  digitalDispatchWorkspace,
  heroTechTruck,
  cargoVanLogistics,
  constructionTransportTech,

  // Branding & Documents
  companyProfileThumbnail,
  companyProfileCollaterals,
  logoHeader,
  logoFooter,
  logoOriginal,
  logoTransparent,
  brandMockup,
} as const;

export const ASSET_METADATA = {
  connectedLogisticsNetwork: {
    src: ASSETS.connectedLogisticsNetwork,
    alt: 'Southeast Regional Freight Logistics Network connectivity map across South Carolina and North Carolina corridors',
    caption: 'Inter-hub regional connectivity and freight route network across the Carolinas.',
  },
  digitalDispatchWorkspace: {
    src: ASSETS.digitalDispatchWorkspace,
    alt: 'Modern logistics dispatch operations workspace with fleet routing and coordination displays',
    caption: 'Centralized operations desk coordinating freight movement and delivery milestones.',
  },
  heroTechTruck: {
    src: ASSETS.heroTechTruck,
    alt: 'Momentum commercial semi-truck on South Carolina highway with integrated digital logistics route data',
    caption: 'Connected transportation and hauling supported by responsive operations technology.',
  },
  commercialFreight: {
    src: ASSETS.commercialFreight,
    alt: 'Momentum Transportation & Hauling commercial Class 8 semi-truck with 53ft dry van trailer on South Carolina highway',
    caption: 'Interstate commercial freight transport with exclusive Momentum branding and 53ft dry van trailer.',
  },
  commercialHauling: {
    src: ASSETS.commercialHauling,
    alt: 'Momentum heavy-duty commercial truck transporting construction machinery on lowboy equipment trailer',
    caption: 'Specialized commercial machinery and equipment hauling with certified heavy rigging.',
  },
  regionalCorridors: {
    src: ASSETS.regionalCorridors,
    alt: 'Momentum freight tractor navigating regional corridor and port logistics terminal',
    caption: 'Dedicated corridor transit and container port terminal access across South Carolina.',
  },
  cargoVanDelivery: {
    src: ASSETS.cargoVanDelivery,
    alt: 'High-roof commercial cargo van with Momentum branding at warehouse loading dock',
    caption: 'Warehouse-to-jobsite deliveries, contractor supplies, and scheduled courier transportation.',
  },
  preconstructionHauling: {
    src: ASSETS.preconstructionHauling,
    alt: 'Momentum commercial tandem dump truck delivering crushed stone and aggregate on pre-construction site',
    caption: 'Site preparation, earthwork aggregate supply, and heavy excavation hauling.',
  },
  constructionMaterials: {
    src: ASSETS.constructionMaterials,
    alt: 'Momentum flatbed commercial truck delivering structural steel and building materials to active construction site',
    caption: 'Ongoing construction material logistics, structural framing, and job-site staging.',
  },
  equipmentMobilization: {
    src: ASSETS.equipmentMobilization,
    alt: 'Momentum heavy-duty lowboy trailer carrying large hydraulic excavator with oversized load escort signage',
    caption: 'Safe equipment mobilization, machinery relocation, and infrastructure jobsite delivery.',
  },
  constructionLogistics: {
    src: ASSETS.constructionLogistics,
    alt: 'Coordinated Momentum commercial fleet at commercial construction site including cargo van, freight tractor, and dump truck',
    caption: 'Dedicated construction project logistics and multi-vehicle jobsite supply coordination.',
  },

  // Backwards compatibility aliases
  homeHero: {
    src: ASSETS.commercialFreight,
    alt: 'Momentum Transportation & Hauling commercial Class 8 semi-truck on interstate corridor in South Carolina',
    caption: 'Commercial freight transportation and heavy hauling headquartered in Columbia, SC.',
  },
  aboutOperations: {
    src: ASSETS.aboutOperations,
    alt: 'Commercial transportation operations yard with freight vehicles and logistics dispatch facilities',
    caption: 'Operational coordination and terminal activity in Columbia, SC.',
  },
  transportationHero: {
    src: ASSETS.commercialFreight,
    alt: 'Momentum commercial semi-truck transporting freight safely on South Carolina highway corridor',
    caption: 'Scheduled freight transport and regional dedicated hauling.',
  },
  haulingHero: {
    src: ASSETS.commercialHauling,
    alt: 'Momentum heavy-duty commercial hauling vehicle with lowboy trailer transporting machinery',
    caption: 'Heavy equipment hauling with exclusive Momentum corporate livery.',
  },
  fleetHero: {
    src: ASSETS.equipmentMobilization,
    alt: 'Momentum commercial transportation tractor and lowboy equipment mobilization setup',
    caption: 'Commercial vehicle equipment and specialized trailer configurations.',
  },
  serviceAreas: {
    src: ASSETS.regionalCorridors,
    alt: 'Momentum freight transport traveling through southeastern interstate transit corridors and port connections',
    caption: 'Columbia, SC regional market, Port of Charleston, and interstate highway connections.',
  },
  quoteHero: {
    src: ASSETS.commercialFreight,
    alt: 'Momentum commercial freight truck staged for dispatch',
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
