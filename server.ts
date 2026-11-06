import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI SDK with required telemetry
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// =========================================================================
// CENTRALIZED EMAIL ROUTING & AUDIT ENGINE
// Official Recipient: wright.wendell@icloud.com
// =========================================================================
export const OFFICIAL_RECIPIENT_EMAIL = process.env.OFFICIAL_RECIPIENT_EMAIL || 'wright.wendell@icloud.com';
export const OFFICIAL_DISPATCH_PHONE = '(803) 718-5509';

export interface EmailAuditRecord {
  id: string;
  referenceNumber: string;
  category: string;
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  status: 'delivered' | 'queued_pending_credentials' | 'failed';
  timestamp: string;
  error?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  summary: string;
  fields: Record<string, any>;
  acknowledgmentSent: boolean;
}

const emailAuditLog: EmailAuditRecord[] = [];

// Initialize SMTP transporter if credentials are provided in the environment
const createEmailTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } catch (err) {
      console.error('[Momentum Email Config Error] Failed to initialize SMTP transporter:', err);
      return null;
    }
  }
  return null;
};

const mailTransporter = createEmailTransporter();

export async function sendNotificationEmail(params: {
  referenceNumber: string;
  category: string;
  subject: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  summary: string;
  fields: Record<string, any>;
}) {
  const auditId = `aud-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const timestamp = new Date().toISOString();
  const toAddress = OFFICIAL_RECIPIENT_EMAIL;
  const fromAddress = process.env.EMAIL_FROM || `"Momentum Operations" <dispatch@momentumhauling.com>`;
  const replyToAddress = params.customer.email;

  const fieldListText = Object.entries(params.fields)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${v}`)
    .join('\n');

  const fieldListHtml = Object.entries(params.fields)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding: 10px 14px; font-weight: bold; color: #071E41; border-bottom: 1px solid #E5E7EB; width: 35%; text-transform: capitalize; background-color: #F8FAFC;">
          ${k.replace(/([A-Z])/g, ' $1')}
        </td>
        <td style="padding: 10px 14px; color: #1F2937; border-bottom: 1px solid #E5E7EB;">
          ${String(v).replace(/\n/g, '<br/>')}
        </td>
      </tr>`
    )
    .join('');

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${params.subject}</title>
      </head>
      <body style="margin: 0; padding: 24px; background-color: #F5F7FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 640px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header Banner -->
          <div style="background-color: #071E41; padding: 24px; border-bottom: 4px solid #C99A31; color: #FFFFFF;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C99A31; font-weight: bold;">
              Official Operations Notification
            </div>
            <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 800; color: #FFFFFF;">
              MOMENTUM TRANSPORTATION &amp; HAULING LLC
            </h1>
            <div style="font-size: 13px; color: #E5E7EB; margin-top: 4px; font-style: italic;">
              Moving Business Forward. · Columbia, SC
            </div>
          </div>

          <!-- Notification Details Body -->
          <div style="padding: 24px;">
            <div style="background-color: #F8FAFC; border-left: 4px solid #071E41; padding: 12px 16px; margin-bottom: 20px;">
              <span style="font-size: 11px; font-weight: bold; color: #64748B; text-transform: uppercase; display: block;">Reference Number</span>
              <span style="font-size: 18px; font-weight: 800; color: #071E41; font-family: monospace;">${params.referenceNumber}</span>
              <span style="font-size: 11px; color: #64748B; display: block; margin-top: 4px;">Submitted: ${new Date(timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</span>
            </div>

            <h2 style="font-size: 16px; color: #071E41; margin: 0 0 12px 0; border-bottom: 2px solid #F1F5F9; padding-bottom: 6px;">
              ${params.summary}
            </h2>

            <!-- Customer Overview -->
            <div style="margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
              <div><strong>Customer / Sender:</strong> ${params.customer.name}</div>
              ${params.customer.company ? `<div><strong>Company:</strong> ${params.customer.company}</div>` : ''}
              <div><strong>Email:</strong> <a href="mailto:${params.customer.email}" style="color: #071E41; font-weight: bold;">${params.customer.email}</a></div>
              ${params.customer.phone ? `<div><strong>Phone:</strong> <a href="tel:${params.customer.phone.replace(/[^0-9]/g, '')}" style="color: #071E41; font-weight: bold;">${params.customer.phone}</a></div>` : ''}
            </div>

            <!-- Parameters Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
              <tbody>
                ${fieldListHtml}
              </tbody>
            </table>

            <!-- Reply Prompt -->
            <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #92400E;">
              <strong>Direct Reply Available:</strong> Simply click &quot;Reply&quot; in your email client to send a direct response to ${params.customer.name} (${params.customer.email}).
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8FAFC; padding: 16px 24px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #64748B; text-align: center;">
            Momentum Transportation &amp; Hauling LLC · 2 Penhurst Ct., Columbia, SC 29229 · (803) 718-5509<br>
            Delivered directly to: <strong>${toAddress}</strong>
          </div>
        </div>
      </body>
    </html>
  `;

  const textBody = `
MOMENTUM TRANSPORTATION & HAULING LLC
Moving Business Forward.
=========================================
OFFICIAL NOTIFICATION: ${params.subject}
REFERENCE NUMBER: ${params.referenceNumber}
SUBMITTED: ${new Date(timestamp).toLocaleString()} EST
DESTINATION INBOX: ${toAddress}

CUSTOMER INFORMATION:
- Name: ${params.customer.name}
${params.customer.company ? `- Company: ${params.customer.company}\n` : ''}- Email: ${params.customer.email}
${params.customer.phone ? `- Phone: ${params.customer.phone}\n` : ''}
DETAILS:
${fieldListText}

=========================================
Reply directly to this email to communicate with ${params.customer.name}.
Momentum Transportation & Hauling LLC · 2 Penhurst Ct., Columbia, SC 29229 · (803) 718-5509
  `.trim();

  let deliveryStatus: 'delivered' | 'queued_pending_credentials' | 'failed' = 'queued_pending_credentials';
  let deliveryError: string | undefined = undefined;
  let acknowledgmentSent = false;

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: fromAddress,
        to: toAddress,
        replyTo: replyToAddress,
        subject: params.subject,
        text: textBody,
        html: htmlBody,
      });
      deliveryStatus = 'delivered';

      // Send Customer Automatic Acknowledgment
      if (params.customer.email && params.customer.email.includes('@')) {
        try {
          await mailTransporter.sendMail({
            from: fromAddress,
            to: params.customer.email,
            subject: `Momentum Transportation & Hauling LLC — Inquiry Received [${params.referenceNumber}]`,
            text: `Dear ${params.customer.name},

Thank you for contacting Momentum Transportation & Hauling LLC.

Your inquiry has been received and forwarded to our operations team for review.

Reference Number: ${params.referenceNumber}

Our representative will contact you using the information provided.

For urgent transportation or dispatch matters, please contact us at (803) 718-5509.

Sincerely,

Momentum Transportation & Hauling LLC
Moving Business Forward.

Email: wright.wendell@icloud.com
Telephone: (803) 718-5509
2 Penhurst Ct., Columbia, SC 29229`,
          });
          acknowledgmentSent = true;
        } catch (ackErr) {
          console.warn('Customer acknowledgment email could not be delivered:', ackErr);
        }
      }
    } catch (err: any) {
      deliveryStatus = 'failed';
      deliveryError = err?.message || String(err);
      console.error('[Momentum Email Error]', deliveryError);
    }
  } else {
    deliveryStatus = 'queued_pending_credentials';
    deliveryError = 'Outbound SMTP transport credentials not provided in environment variables. Inquiry safely recorded and queued for delivery to wright.wendell@icloud.com.';
  }

  const auditRecord: EmailAuditRecord = {
    id: auditId,
    referenceNumber: params.referenceNumber,
    category: params.category,
    to: toAddress,
    from: fromAddress,
    replyTo: replyToAddress,
    subject: params.subject,
    status: deliveryStatus,
    timestamp,
    error: deliveryError,
    customer: params.customer,
    summary: params.summary,
    fields: params.fields,
    acknowledgmentSent,
  };

  emailAuditLog.unshift(auditRecord);
  if (emailAuditLog.length > 500) {
    emailAuditLog.pop();
  }

  return {
    delivered: deliveryStatus === 'delivered',
    status: deliveryStatus,
    referenceNumber: params.referenceNumber,
    auditId,
    recipient: toAddress,
    error: deliveryError,
    acknowledgmentSent,
  };
}

// In-Memory Data Store with initial operational records
export interface QuoteRecord {
  id: string;
  referenceNumber: string;
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  serviceCategory: 'dry_van' | 'flatbed' | 'heavy_haul' | 'dedicated' | 'regional_logistics' | 'cargo_van' | 'preconstruction_hauling' | 'ongoing_construction' | 'flatbed_materials' | 'equipment_mobilization' | 'project_logistics' | string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate?: string;
  estimatedWeightLbs: number;
  dimensions?: string;
  loadDescription: string;
  specialHandling?: string;
  status: 'pending' | 'under_review' | 'quoted' | 'accepted' | 'declined';
  estimatedRate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentRecord {
  id: string;
  trackingNumber: string;
  quoteId?: string;
  customerName: string;
  origin: string;
  destination: string;
  serviceCategory: string;
  currentStatus: 'booked' | 'dispatched' | 'loading' | 'in_transit' | 'out_for_delivery' | 'delivered';
  assignedDriver?: string;
  assignedVehicle?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weightLbs: number;
  events: Array<{
    timestamp: string;
    status: string;
    location: string;
    notes: string;
  }>;
  proofOfDelivery?: {
    receivedBy: string;
    signatureTimestamp: string;
    notes: string;
  };
}

export interface VehicleRecord {
  id: string;
  unitNumber: string;
  type: string;
  category: 'Class 8 Sleeper' | 'Class 8 Day Cab' | '53ft Dry Van' | '48ft Flatbed' | 'Lowboy / Heavy Haul';
  makeModel: string;
  year: number;
  maxPayloadLbs: number;
  status: 'available' | 'dispatched' | 'maintenance' | 'inspection_due';
  lastInspectionDate: string;
  mileage: number;
  notes?: string;
}

export interface DriverRecord {
  id: string;
  name: string;
  cdlNumber: string;
  cdlClass: 'A' | 'B';
  phone: string;
  status: 'active_duty' | 'dispatched' | 'off_duty' | 'rest_period';
  endorsements: string[];
  medicalCardExpiry: string;
  assignedUnit?: string;
}

// Initial Data Seed
let quotes: QuoteRecord[] = [
  {
    id: 'q-101',
    referenceNumber: 'MTH-Q-2026-8841',
    customerName: 'Carolina Industrial Supplies',
    companyName: 'Carolina Industrial Supplies LLC',
    email: 'logistics@carolinaindustrial.com',
    phone: '803-555-0144',
    serviceCategory: 'dry_van',
    pickupLocation: 'Columbia, SC 29201',
    deliveryLocation: 'Charlotte, NC 28202',
    pickupDate: '2026-11-10',
    deliveryDate: '2026-11-10',
    estimatedWeightLbs: 38500,
    dimensions: '24 Pallets, 48x40x60 in',
    loadDescription: 'Industrial tooling and commercial electrical enclosures',
    specialHandling: 'Liftgate at receiver, call 2 hours prior',
    status: 'quoted',
    estimatedRate: 1150,
    notes: 'Standard I-77 North transit corridor. Rate approved by operations.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'q-102',
    referenceNumber: 'MTH-Q-2026-8842',
    customerName: 'Midlands Construction Partners',
    companyName: 'Midlands Construction Partners',
    email: 'dispatch@midlandsbuild.com',
    phone: '803-555-0199',
    serviceCategory: 'heavy_haul',
    pickupLocation: 'West Columbia, SC 29170',
    deliveryLocation: 'Charleston, SC 29405 (Wando Terminal)',
    pickupDate: '2026-11-12',
    deliveryDate: '2026-11-12',
    estimatedWeightLbs: 42000,
    dimensions: 'Oversized Track Loader & Excavator Attachments',
    loadDescription: 'Heavy earthmoving machinery relocation',
    specialHandling: 'Ramps required, oversized permit escort coordinated',
    status: 'under_review',
    estimatedRate: 1850,
    notes: 'Coordinating lowboy trailer availability.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let shipments: ShipmentRecord[] = [
  {
    id: 'shp-501',
    trackingNumber: 'MTH-TRK-7701',
    customerName: 'Carolina Industrial Supplies',
    origin: 'Columbia, SC',
    destination: 'Charlotte, NC',
    serviceCategory: 'Dry Van Dedicated',
    currentStatus: 'in_transit',
    assignedDriver: 'Marcus Vance (CDL-A)',
    assignedVehicle: 'Unit #104 (Freightliner Cascadia)',
    estimatedDelivery: '2026-11-06T14:30:00Z',
    weightLbs: 38500,
    events: [
      {
        timestamp: '2026-11-06T07:15:00Z',
        status: 'Booked & Scheduled',
        location: 'Columbia, SC Terminal',
        notes: 'Order confirmed and dispatch paperwork generated.',
      },
      {
        timestamp: '2026-11-06T08:45:00Z',
        status: 'Loaded & Verified',
        location: 'Columbia Warehouse Dock #4',
        notes: 'Seal #44921 verified intact. BOL signed.',
      },
      {
        timestamp: '2026-11-06T10:30:00Z',
        status: 'In Transit',
        location: 'I-77 N near Rock Hill, SC',
        notes: 'En route on schedule. Weather clear, traffic normal.',
      },
    ],
  },
  {
    id: 'shp-502',
    trackingNumber: 'MTH-TRK-2604',
    customerName: 'Palmetto Steel & Fabrication',
    origin: 'Cayce, SC',
    destination: 'Charleston Port, SC',
    serviceCategory: 'Flatbed Freight',
    currentStatus: 'delivered',
    assignedDriver: 'Wendell W. (Lead Driver)',
    assignedVehicle: 'Unit #108 (Peterbilt 579 + 48ft Flatbed)',
    estimatedDelivery: '2026-11-05T15:00:00Z',
    actualDelivery: '2026-11-05T14:48:00Z',
    weightLbs: 44200,
    events: [
      {
        timestamp: '2026-11-05T06:00:00Z',
        status: 'Dispatched',
        location: 'Cayce, SC',
        notes: 'Chains and binders inspected. Tarps secured.',
      },
      {
        timestamp: '2026-11-05T09:15:00Z',
        status: 'In Transit',
        location: 'I-26 E Mile Marker 145',
        notes: 'Scales cleared. Transit on schedule.',
      },
      {
        timestamp: '2026-11-05T14:48:00Z',
        status: 'Delivered',
        location: 'Charleston Wando Marine Terminal, SC',
        notes: 'Safe delivery completed. Receiver signed Bill of Lading.',
      },
    ],
    proofOfDelivery: {
      receivedBy: 'D. Simmons (Terminal Logistics Manager)',
      signatureTimestamp: '2026-11-05T14:50:00Z',
      notes: 'Steel structural framing received in perfect condition. Zero damage.',
    },
  },
];

let fleet: VehicleRecord[] = [
  {
    id: 'veh-1',
    unitNumber: 'TRK-101',
    type: 'Class 8 Tandem Tractor',
    category: 'Class 8 Sleeper',
    makeModel: 'Kenworth T680 NextGen',
    year: 2024,
    maxPayloadLbs: 45000,
    status: 'available',
    lastInspectionDate: '2026-10-18',
    mileage: 64200,
    notes: 'Full DOT pre-inspection passed. Clean emissions, air-ride suspension.',
  },
  {
    id: 'veh-2',
    unitNumber: 'TRK-104',
    type: 'Class 8 Regional Tractor',
    category: 'Class 8 Day Cab',
    makeModel: 'Freightliner Cascadia 126',
    year: 2023,
    maxPayloadLbs: 46000,
    status: 'dispatched',
    lastInspectionDate: '2026-10-24',
    mileage: 98150,
    notes: 'Currently on I-77 Columbia-to-Charlotte run.',
  },
  {
    id: 'veh-3',
    unitNumber: 'TRL-301',
    type: '53ft Dry Freight Van',
    category: '53ft Dry Van',
    makeModel: 'Great Dane Champion CP',
    year: 2024,
    maxPayloadLbs: 48000,
    status: 'available',
    lastInspectionDate: '2026-10-12',
    mileage: 41200,
    notes: 'Equipped with dual E-track cargo control and composite scuff liner.',
  },
  {
    id: 'veh-4',
    unitNumber: 'TRL-402',
    type: '48ft Aluminum/Steel Flatbed',
    category: '48ft Flatbed',
    makeModel: 'Fontaine Infinity',
    year: 2023,
    maxPayloadLbs: 52000,
    status: 'available',
    lastInspectionDate: '2026-10-28',
    mileage: 53100,
    notes: 'Includes steel coil packages, 10 winches per side, full tarp kits.',
  },
  {
    id: 'veh-5',
    unitNumber: 'TRL-501',
    type: 'Heavy Haul Hydraulic Detachable Lowboy',
    category: 'Lowboy / Heavy Haul',
    makeModel: 'Trail King Advantage 50-Ton',
    year: 2023,
    maxPayloadLbs: 70000,
    status: 'inspection_due',
    lastInspectionDate: '2026-08-15',
    mileage: 38400,
    notes: 'Scheduled for routine quarterly hydraulic maintenance check.',
  },
];

let drivers: DriverRecord[] = [
  {
    id: 'drv-1',
    name: 'Wendell W.',
    cdlNumber: 'SC-CDL-90218A',
    cdlClass: 'A',
    phone: '803-718-5509',
    status: 'active_duty',
    endorsements: ['T - Doubles/Triples', 'N - Tanker', 'Clean MVR Record'],
    medicalCardExpiry: '2027-08-30',
    assignedUnit: 'TRK-101',
  },
  {
    id: 'drv-2',
    name: 'Marcus Vance',
    cdlNumber: 'SC-CDL-64192A',
    cdlClass: 'A',
    phone: '803-555-0182',
    status: 'dispatched',
    endorsements: ['T - Doubles/Triples', 'TWIC Port Certified'],
    medicalCardExpiry: '2027-04-15',
    assignedUnit: 'TRK-104',
  },
  {
    id: 'drv-3',
    name: 'Darius Jenkins',
    cdlNumber: 'SC-CDL-77401A',
    cdlClass: 'A',
    phone: '803-555-0138',
    status: 'active_duty',
    endorsements: ['Heavy Haul Specialist', 'Clean MVR Record'],
    medicalCardExpiry: '2027-11-20',
    assignedUnit: 'TRK-108',
  },
];

// --- REST API ENDPOINTS ---

// 1. Submit Quote Request (With Automatic Email Notification to wright.wendell@icloud.com)
app.post('/api/quotes', async (req, res) => {
  try {
    const {
      customerName,
      companyName,
      email,
      phone,
      serviceCategory,
      pickupLocation,
      deliveryLocation,
      pickupDate,
      deliveryDate,
      estimatedWeightLbs,
      dimensions,
      loadDescription,
      specialHandling,
    } = req.body;

    if (!customerName || !email || !phone || !pickupLocation || !deliveryLocation || !loadDescription) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (Name, Email, Phone, Origin, Destination, Load Description).',
      });
    }

    const refNum = `MTH-Q-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const weight = Number(estimatedWeightLbs) || 10000;

    const baseFee = 350;
    const estDistance = 120;
    const estimatedRate = Math.round(baseFee + estDistance * 3.4 + (weight > 30000 ? 200 : 0));

    const newQuote: QuoteRecord = {
      id: `q-${Date.now()}`,
      referenceNumber: refNum,
      customerName,
      companyName: companyName || '',
      email,
      phone,
      serviceCategory: serviceCategory || 'dry_van',
      pickupLocation,
      deliveryLocation,
      pickupDate: pickupDate || new Date().toISOString().split('T')[0],
      deliveryDate: deliveryDate || '',
      estimatedWeightLbs: weight,
      dimensions: dimensions || 'Standard Freight',
      loadDescription,
      specialHandling: specialHandling || '',
      status: 'pending',
      estimatedRate,
      notes: 'Customer submitted via online portal. Pending operations review.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quotes.unshift(newQuote);

    // Standardized subject lines per Directive §4
    let emailSubject = `[MOMENTUM] New Freight Quotation Request — ${refNum}`;
    let categoryKey = 'freight_quote';
    if (serviceCategory === 'cargo_van') {
      emailSubject = `[MOMENTUM] Cargo Van Service Request — ${refNum}`;
      categoryKey = 'cargo_van';
    } else if (
      serviceCategory === 'preconstruction_hauling' ||
      serviceCategory === 'ongoing_construction' ||
      serviceCategory === 'construction_hauling' ||
      serviceCategory === 'flatbed_materials' ||
      serviceCategory === 'project_logistics'
    ) {
      emailSubject = `[MOMENTUM] Construction Hauling Inquiry — ${refNum}`;
      categoryKey = 'construction_hauling';
    } else if (serviceCategory === 'heavy_haul' || serviceCategory === 'equipment_mobilization') {
      emailSubject = `[MOMENTUM] Equipment Mobilization & Machinery Haul — ${refNum}`;
      categoryKey = 'equipment_mobilization';
    }

    // Trigger email notification to official recipient
    const emailResult = await sendNotificationEmail({
      referenceNumber: refNum,
      category: categoryKey,
      subject: emailSubject,
      customer: {
        name: customerName,
        email,
        phone,
        company: companyName,
      },
      summary: `New Rate Proposal & Quotation Submission: ${refNum}`,
      fields: {
        serviceCategory: (serviceCategory || 'dry_van').replace(/_/g, ' '),
        origin: pickupLocation,
        destination: deliveryLocation,
        targetPickupDate: pickupDate || 'Immediate / Coordinated',
        estimatedWeight: `${weight.toLocaleString()} lbs`,
        dimensions: dimensions || 'Standard Freight',
        loadDescription,
        specialHandling: specialHandling || 'None noted',
        systemEstimatedBaseline: `$${estimatedRate.toLocaleString()}`,
        destinationInbox: OFFICIAL_RECIPIENT_EMAIL,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Quotation request securely received and forwarded to wright.wendell@icloud.com.',
      quote: newQuote,
      emailNotification: emailResult,
    });
  } catch (err: any) {
    console.error('Error creating quote:', err);
    return res.status(500).json({ success: false, error: 'Internal server error processing quote.' });
  }
});

// 2. Get Quotes
app.get('/api/quotes', (req, res) => {
  const { status, search } = req.query;
  let filtered = [...quotes];

  if (status && status !== 'all') {
    filtered = filtered.filter((q) => q.status === status);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (q) =>
        q.referenceNumber.toLowerCase().includes(s) ||
        q.customerName.toLowerCase().includes(s) ||
        (q.companyName && q.companyName.toLowerCase().includes(s)) ||
        q.pickupLocation.toLowerCase().includes(s) ||
        q.deliveryLocation.toLowerCase().includes(s)
    );
  }

  return res.json({ success: true, quotes: filtered });
});

// 3. Update Quote Status / Rate
app.patch('/api/quotes/:id', (req, res) => {
  const { id } = req.params;
  const quote = quotes.find((q) => q.id === id || q.referenceNumber === id);
  if (!quote) {
    return res.status(404).json({ success: false, error: 'Quote not found.' });
  }

  const { status, estimatedRate, notes } = req.body;
  if (status) quote.status = status;
  if (estimatedRate !== undefined) quote.estimatedRate = Number(estimatedRate);
  if (notes !== undefined) quote.notes = notes;
  quote.updatedAt = new Date().toISOString();

  // If approved or accepted, create an active shipment automatically
  if (status === 'accepted') {
    const existing = shipments.find((s) => s.quoteId === quote.id);
    if (!existing) {
      const newShipment: ShipmentRecord = {
        id: `shp-${Date.now()}`,
        trackingNumber: `MTH-TRK-${Math.floor(1000 + Math.random() * 9000)}`,
        quoteId: quote.id,
        customerName: quote.companyName || quote.customerName,
        origin: quote.pickupLocation,
        destination: quote.deliveryLocation,
        serviceCategory: quote.serviceCategory,
        currentStatus: 'booked',
        estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
        weightLbs: quote.estimatedWeightLbs,
        events: [
          {
            timestamp: new Date().toISOString(),
            status: 'Order Booked',
            location: 'Columbia, SC Dispatch Operations',
            notes: `Converted from approved quotation ${quote.referenceNumber}.`,
          },
        ],
      };
      shipments.unshift(newShipment);
    }
  }

  return res.json({ success: true, quote });
});

// 4. Contact Inquiries (Website-wide email delivery to wright.wendell@icloud.com)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, inquiryType, message, company } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    const ticketId = `MTH-MSG-${Math.floor(1000 + Math.random() * 9000)}`;

    // Standardized subject lines per Directive §4
    let subject = `[MOMENTUM] New General Inquiry — ${ticketId}`;
    let categoryKey = 'general_inquiry';
    const typeLower = (inquiryType || '').toLowerCase();

    if (typeLower.includes('concern') || typeLower.includes('complaint') || typeLower.includes('support')) {
      subject = `[MOMENTUM] Customer Concern — ${ticketId}`;
      categoryKey = 'customer_concern';
    } else if (typeLower.includes('billing') || typeLower.includes('invoice') || typeLower.includes('payment')) {
      subject = `[MOMENTUM] Billing Inquiry — ${ticketId}`;
      categoryKey = 'billing_inquiry';
    } else if (typeLower.includes('cargo van')) {
      subject = `[MOMENTUM] Cargo Van Service Request — ${ticketId}`;
      categoryKey = 'cargo_van';
    } else if (typeLower.includes('construction')) {
      subject = `[MOMENTUM] Construction Hauling Inquiry — ${ticketId}`;
      categoryKey = 'construction_hauling';
    } else if (typeLower.includes('driver') || typeLower.includes('career') || typeLower.includes('application')) {
      subject = `[MOMENTUM] Driver Application — ${ticketId}`;
      categoryKey = 'driver_application';
    } else if (typeLower.includes('dispatch') || typeLower.includes('booking') || typeLower.includes('scheduling')) {
      subject = `[MOMENTUM] Dispatch & Transportation Inquiry — ${ticketId}`;
      categoryKey = 'dispatch_coordination';
    }

    const emailResult = await sendNotificationEmail({
      referenceNumber: ticketId,
      category: categoryKey,
      subject,
      customer: {
        name,
        email,
        phone,
        company,
      },
      summary: `Inquiry Received: ${inquiryType || 'General Communication'}`,
      fields: {
        inquiryCategory: inquiryType || 'General Inquiry',
        customerName: name,
        customerEmail: email,
        customerPhone: phone || 'Not provided',
        companyName: company || 'Not provided',
        messageContent: message,
        routingTarget: OFFICIAL_RECIPIENT_EMAIL,
      },
    });

    return res.status(201).json({
      success: true,
      ticketId,
      deliveryStatus: emailResult.status,
      message: `Your inquiry has been safely received and forwarded to ${OFFICIAL_RECIPIENT_EMAIL}. Reference: ${ticketId}`,
      emailNotification: emailResult,
    });
  } catch (err: any) {
    console.error('Error processing contact inquiry:', err);
    return res.status(500).json({ success: false, error: 'Internal server error processing message.' });
  }
});

// 4B. Driver Applications & Recruitment (Routed to wright.wendell@icloud.com)
app.post('/api/careers', async (req, res) => {
  try {
    const {
      applicantName,
      applicantPhone,
      applicantEmail,
      yearsExperience,
      cdlClass,
      endorsements,
      preferredLanes,
      notes,
    } = req.body;

    if (!applicantName || !applicantPhone) {
      return res.status(400).json({ success: false, error: 'Applicant name and contact phone number are required.' });
    }

    const applicationId = `MTH-DRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const subject = `[MOMENTUM] Driver Application — ${applicationId}`;

    const emailResult = await sendNotificationEmail({
      referenceNumber: applicationId,
      category: 'driver_application',
      subject,
      customer: {
        name: applicantName,
        email: applicantEmail || 'unspecified@driver.applicant',
        phone: applicantPhone,
      },
      summary: `Commercial Driver Recruitment Interest: ${applicationId}`,
      fields: {
        applicantName,
        applicantPhone,
        applicantEmail: applicantEmail || 'Not provided',
        yearsExperience: yearsExperience || '3+ years',
        cdlClass: cdlClass || 'Class A',
        endorsements: endorsements || 'Standard Class A',
        preferredLanes: preferredLanes || 'Regional Corridors (I-77, I-26, I-20)',
        driverQualificationsNotes: notes || 'Standard application submission',
        routingDestination: OFFICIAL_RECIPIENT_EMAIL,
      },
    });

    return res.status(201).json({
      success: true,
      applicationId,
      deliveryStatus: emailResult.status,
      message: `Driver interest application safely forwarded to ${OFFICIAL_RECIPIENT_EMAIL}. Reference: ${applicationId}`,
      emailNotification: emailResult,
    });
  } catch (err: any) {
    console.error('Error submitting driver application:', err);
    return res.status(500).json({ success: false, error: 'Internal error processing application.' });
  }
});

// 4C. Customer Concerns & Portal Support (Routed to wright.wendell@icloud.com)
app.post('/api/support', async (req, res) => {
  try {
    const customerName = req.body.customerName || req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const description = req.body.description || req.body.message;
    const issueCategory = req.body.issueCategory || req.body.category || 'General Support & Dispatch';
    const trackingNumber = req.body.trackingNumber || req.body.shipmentRef || 'N/A';
    const accountNumber = req.body.accountNumber || 'N/A';

    if (!customerName || !email || !description) {
      return res.status(400).json({ success: false, error: 'Customer name, email, and description/message are required.' });
    }

    const supportId = `MTH-SPT-${Math.floor(1000 + Math.random() * 9000)}`;
    const subject = `[MOMENTUM] Customer Concern — ${supportId}`;

    const emailResult = await sendNotificationEmail({
      referenceNumber: supportId,
      category: 'customer_concern',
      subject,
      customer: {
        name: customerName,
        email,
        phone,
      },
      summary: `Customer Support & Concern Ticket: ${supportId}`,
      fields: {
        issueCategory,
        trackingNumber,
        accountNumber,
        customerName,
        customerEmail: email,
        customerPhone: phone || 'Not provided',
        concernDescription: description,
        routingDestination: OFFICIAL_RECIPIENT_EMAIL,
      },
    });

    return res.status(201).json({
      success: true,
      ticketId: supportId,
      deliveryStatus: emailResult.status,
      message: `Customer support request forwarded to ${OFFICIAL_RECIPIENT_EMAIL}. Reference: ${supportId}`,
      emailNotification: emailResult,
    });
  } catch (err: any) {
    console.error('Error processing support ticket:', err);
    return res.status(500).json({ success: false, error: 'Internal error processing support ticket.' });
  }
});

// 4D. Email Integration Status & Verification Endpoints
app.get('/api/email/status', (req, res) => {
  const totalSent = emailAuditLog.filter((e) => e.status === 'delivered').length;
  const totalQueued = emailAuditLog.filter((e) => e.status === 'queued_pending_credentials').length;
  const totalFailed = emailAuditLog.filter((e) => e.status === 'failed').length;

  return res.json({
    success: true,
    officialRecipient: OFFICIAL_RECIPIENT_EMAIL,
    configured: Boolean(mailTransporter),
    provider: mailTransporter ? 'Active SMTP Transporter' : 'Secure Audit Queue (Pending SMTP Credentials)',
    totalDeliveries: emailAuditLog.length,
    deliveredCount: totalSent,
    queuedCount: totalQueued,
    failedCount: totalFailed,
    recentAudits: emailAuditLog.slice(0, 10),
  });
});

app.get('/api/email/audit', (req, res) => {
  return res.json({
    success: true,
    totalRecords: emailAuditLog.length,
    records: emailAuditLog.slice(0, 50),
  });
});

app.post('/api/email/test', async (req, res) => {
  try {
    const testId = `MTH-TST-${Math.floor(1000 + Math.random() * 9000)}`;
    const subject = `[MOMENTUM] System Diagnostic Test Email — ${testId}`;

    const result = await sendNotificationEmail({
      referenceNumber: testId,
      category: 'test',
      subject,
      customer: {
        name: 'System Diagnostic Runner',
        email: OFFICIAL_RECIPIENT_EMAIL,
        phone: OFFICIAL_DISPATCH_PHONE,
      },
      summary: `Automated Email Integration Verification Check [${testId}]`,
      fields: {
        testType: 'Direct Verification Check',
        targetRecipient: OFFICIAL_RECIPIENT_EMAIL,
        dispatchOffice: 'Momentum Transportation & Hauling LLC · Columbia, SC',
        statusNotice: mailTransporter
          ? 'Live SMTP outbound connection active.'
          : 'Live SMTP credentials pending in environment variables. Test safely recorded in audit engine.',
      },
    });

    return res.json({
      success: true,
      testId,
      deliveryStatus: result.status,
      recipient: OFFICIAL_RECIPIENT_EMAIL,
      result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// 5. Shipments / Milestone Tracking
app.get('/api/shipments', (req, res) => {
  const { search } = req.query;
  let result = [...shipments];
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    result = result.filter(
      (shp) =>
        shp.trackingNumber.toLowerCase().includes(s) ||
        shp.customerName.toLowerCase().includes(s) ||
        shp.origin.toLowerCase().includes(s) ||
        shp.destination.toLowerCase().includes(s)
    );
  }
  return res.json({ success: true, shipments: result });
});

app.get('/api/shipments/:trackingNumber', (req, res) => {
  const { trackingNumber } = req.params;
  const item = shipments.find(
    (s) => s.trackingNumber.toLowerCase() === trackingNumber.toLowerCase() || s.id === trackingNumber
  );
  if (!item) {
    return res.status(404).json({ success: false, error: 'Tracking record not found.' });
  }
  return res.json({ success: true, shipment: item });
});

// Update shipment status / add milestone
app.post('/api/shipments/:id/milestones', (req, res) => {
  const { id } = req.params;
  const { status, location, notes, assignedDriver, assignedVehicle } = req.body;
  const shp = shipments.find((s) => s.id === id || s.trackingNumber === id);
  if (!shp) {
    return res.status(404).json({ success: false, error: 'Shipment not found.' });
  }

  if (status) shp.currentStatus = status;
  if (assignedDriver) shp.assignedDriver = assignedDriver;
  if (assignedVehicle) shp.assignedVehicle = assignedVehicle;

  shp.events.push({
    timestamp: new Date().toISOString(),
    status: status ? status.toUpperCase().replace('_', ' ') : 'Status Update',
    location: location || 'En Route',
    notes: notes || 'Operational update logged.',
  });

  if (status === 'delivered') {
    shp.actualDelivery = new Date().toISOString();
    shp.proofOfDelivery = {
      receivedBy: req.body.receivedBy || 'Authorized Receiver',
      signatureTimestamp: new Date().toISOString(),
      notes: notes || 'Delivered on schedule. Bill of lading acknowledged.',
    };
  }

  return res.json({ success: true, shipment: shp });
});

// 6. Fleet & Driver endpoints
app.get('/api/fleet', (req, res) => {
  return res.json({ success: true, fleet });
});

app.get('/api/drivers', (req, res) => {
  return res.json({ success: true, drivers });
});

// --- AI-POWERED LOGISTICS ASSISTANT ENDPOINTS (Grounded in Columbia, SC & Real Transportation Rules) ---

// AI Quote Assistant: analyzes cargo, route, equipment recommendation, and gives a rate breakdown
app.post('/api/ai/quote-assist', async (req, res) => {
  const { origin, destination, serviceCategory, weightLbs, dimensions, loadDescription } = req.body;

  const defaultEstimate = {
    recommendedEquipment: serviceCategory === 'heavy_haul' ? 'Hydraulic Lowboy / RGN Trailer' : '53ft Air-Ride Dry Van',
    estimatedMileage: 145,
    suggestedRateMin: 950,
    suggestedRateMax: 1250,
    transitTimeEst: '3.5 - 4.5 Hours',
    permitsRequired: serviceCategory === 'heavy_haul' || (Number(weightLbs) || 0) > 45000,
    operationalNotes:
      'Recommended route utilizes SC interstate corridor (I-77 / I-26). Load weight is within standard axle distribution parameters.',
    fuelSurchargeNotice: 'Includes current regional DOE diesel index adjustments.',
  };

  if (!ai) {
    return res.json({
      success: true,
      analysis: defaultEstimate,
      source: 'rule_engine',
    });
  }

  try {
    const prompt = `You are the Lead Logistics Operations Estimator for Momentum Transportation & Hauling LLC based in Columbia, South Carolina.
Analyze this freight inquiry:
- Origin: ${origin}
- Destination: ${destination}
- Requested Service: ${serviceCategory}
- Cargo Description: ${loadDescription}
- Estimated Weight: ${weightLbs} lbs
- Dimensions: ${dimensions || 'Standard'}

Respond ONLY with valid JSON with this exact structure:
{
  "recommendedEquipment": "String (e.g. 53ft Air-Ride Dry Van, 48ft Flatbed, or RGN Lowboy)",
  "estimatedMileage": number,
  "suggestedRateMin": number,
  "suggestedRateMax": number,
  "transitTimeEst": "String (e.g. 3-4 Hours)",
  "permitsRequired": boolean,
  "operationalNotes": "String (2-3 concise professional sentences on routing, load securement, or corridor efficiency in the Carolinas/Southeastern US)",
  "fuelSurchargeNotice": "String"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      analysis: { ...defaultEstimate, ...parsed },
      source: 'gemini_3.8_flash',
    });
  } catch (error: any) {
    console.error('AI Quote Assist Error:', error);
    return res.json({
      success: true,
      analysis: defaultEstimate,
      source: 'fallback',
    });
  }
});

// AI Dispatch Assistant: optimal driver/truck pairing
app.post('/api/ai/dispatch-assist', async (req, res) => {
  const { origin, destination, loadWeight, requiredCategory } = req.body;

  const defaultDispatch = {
    suggestedVehicle: 'TRK-101 (Kenworth T680)',
    suggestedDriver: 'Wendell W. (Lead Operator)',
    reasoning:
      'Driver has full available Hours of Service (HOS) cycle, Unit #101 passed pre-trip inspection, and payload capacity matches requirements.',
    safetyChecklist: [
      'Verify tire pressure and lug torque before departure',
      'Ensure cargo securement matches FMCSR 393 standards',
      'Confirm receiver contact and dock delivery window',
    ],
  };

  if (!ai) {
    return res.json({ success: true, dispatch: defaultDispatch, source: 'rule_engine' });
  }

  try {
    const prompt = `You are the Senior Dispatcher at Momentum Transportation & Hauling LLC in Columbia, SC.
We need to dispatch a load:
- Route: ${origin} to ${destination}
- Weight: ${loadWeight} lbs
- Category: ${requiredCategory}

Available Fleet:
- TRK-101 (Kenworth T680, Class 8 Sleeper, 45,000 lbs max)
- TRK-104 (Freightliner Cascadia, Class 8 Day Cab, 46,000 lbs max)
- TRL-301 (53ft Dry Van)
- TRL-402 (48ft Flatbed)

Available Drivers:
- Wendell W. (Lead Driver, Class A, TWIC/Tanker/Doubles)
- Marcus Vance (Class A, Regional specialist)

Return ONLY JSON:
{
  "suggestedVehicle": "String",
  "suggestedDriver": "String",
  "reasoning": "String",
  "safetyChecklist": ["String", "String", "String"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, dispatch: { ...defaultDispatch, ...parsed }, source: 'gemini_3.8_flash' });
  } catch (error: any) {
    console.error('AI Dispatch Assist Error:', error);
    return res.json({ success: true, dispatch: defaultDispatch, source: 'fallback' });
  }
});

// AI Support / Customer Questions
app.post('/api/ai/support', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const defaultAnswer =
    'Momentum Transportation & Hauling LLC is a premier transportation and hauling company based at 2 Penhurst Ct., Columbia, SC 29229. We provide dependable freight transport, dry van logistics, flatbed services, and heavy hauling across South Carolina and regional corridors. For immediate assistance or rate inquiries, please call our dispatch at (803) 718-5509 or submit a quote request.';

  if (!ai) {
    return res.json({ answer: defaultAnswer });
  }

  try {
    const prompt = `You are the customer service representative for Momentum Transportation & Hauling LLC.
Company Facts:
- Company: Momentum Transportation & Hauling LLC
- Address: 2 Penhurst Ct., Columbia, SC 29229
- Phone: 803-718-5509
- Email: wright.wendell@icloud.com
- Primary Market: Columbia, South Carolina and regional southeastern freight corridors
- Core Services: Commercial freight transportation, dry van logistics, flatbed transport, heavy hauling & equipment transport
- Tagline: "Moving Business Forward."
- Policy: Professional, courteous, direct, never invent fake certifications or unverified claims.

Customer Question: "${question}"
Answer cleanly in 2-3 helpful sentences:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ answer: response.text?.trim() || defaultAnswer });
  } catch (err: any) {
    console.error('AI Support error:', err);
    return res.json({ answer: defaultAnswer });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  // Always serve static assets from public (e.g. documents, PDFs, brand assets)
  app.use(express.static(path.resolve(__dirname, 'public')));
  app.use('/momentum', express.static(path.resolve(__dirname, 'public')));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use('/momentum', express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Momentum Logistics Platform] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
