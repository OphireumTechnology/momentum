import { dispatchSupabaseOutboxOnce, startSupabaseOutboxWorker } from './server/supabaseEmailWorker.ts';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import {
  buildQuoteNotificationEmail,
  escapeHtml,
  getActiveEmailProviderName,
  getAuthorizedQuoteRecipients,
  getConfiguredSender,
  isEmailProviderConfigured,
  OFFICIAL_RECIPIENT_EMAIL,
  processOutboxJob,
  startOutboxRetryWorker,
} from './server/emailOutbox.ts';
import {
  createQuoteAndOutbox,
  findQuoteByIdempotencyKey,
  generateQuoteReference,
  getPersistenceBackend,
  hashClientIp,
  listOutboxForAdmin,
  listQuotesForAdmin,
  purgeExpiredLocalRecords,
} from './server/persistence.ts';
import { validateAndNormalizeQuote } from './src/shared/quoteSchema.ts';
import { COMPANY_PHONE } from './src/config/company.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);

// Security Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Restrictive CORS Configuration
const DEFAULT_ALLOWED_ORIGINS = [
  'https://ophireumtechnology.github.io',
  'https://momentum-production-7643a06f.up.railway.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function getAllowedOrigins(): Set<string> {
  const configured = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);
}

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // Same-origin or curl/server-to-server requests without Origin header
  const normalized = origin.replace(/\/$/, '');
  const allowed = getAllowedOrigins();
  if (allowed.has(normalized)) return true;

  // Allow AI Studio preview origins and local dev origins
  if (
    /^https:\/\/ais-(dev|pre)-[a-z0-9-]+\.[a-z0-9-]+\.run\.app$/i.test(normalized) ||
    /^http:\/\/(localhost|127\.0\.0\.1):3000$/i.test(normalized)
  ) {
    return true;
  }
  return false;
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin) {
    if (!isOriginAllowed(origin)) {
      if (req.path.startsWith('/api/')) {
        return res.status(403).json({
          success: false,
          error: 'Origin not permitted by CORS policy.',
        });
      }
    } else {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, Authorization');
      res.setHeader('Access-Control-Max-Age', '600');
    }
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Strict JSON body size limit
app.use(express.json({ limit: '64kb' }));

// Handle malformed JSON payloads cleanly
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Malformed JSON request payload.' });
  }
  if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Request payload exceeds maximum allowed size.' });
  }
  next(err);
});

// Sliding-Window Rate Limiter for Public Submission Endpoints
const rateLimitBuckets = new Map<string, number[]>();

function createRateLimiter(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${clientIp}`;
    const now = Date.now();
    const cutoff = now - windowMs;
    const recent = (rateLimitBuckets.get(key) || []).filter((ts) => ts > cutoff);

    if (recent.length >= maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: 'Too many requests submitted. Please wait briefly before trying again.',
        retryAfterSeconds: retryAfterSec,
      });
    }

    recent.push(now);
    rateLimitBuckets.set(key, recent);
    if (rateLimitBuckets.size > 5000) {
      for (const [k, timestamps] of rateLimitBuckets.entries()) {
        if (timestamps.every((t) => t <= cutoff)) {
          rateLimitBuckets.delete(k);
        }
      }
    }
    next();
  };
}

const quoteRateLimiter = createRateLimiter(10 * 60 * 1000, 12);
const contactRateLimiter = createRateLimiter(10 * 60 * 1000, 10);

// Strict Admin Authorization Middleware (never exposes data to anonymous callers)
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const configuredToken = process.env.ADMIN_API_TOKEN || '';
  if (!configuredToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Administrative access is disabled or requires authentication.',
    });
  }

  const authHeader = req.headers.authorization || '';
  const providedToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!providedToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Missing bearer token.',
    });
  }

  const expectedBuf = Buffer.from(configuredToken, 'utf8');
  const providedBuf = Buffer.from(providedToken, 'utf8');

  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Invalid credentials.',
    });
  }

  next();
}

// Optional Gemini SDK for optional quote route feasibility assist
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
// PUBLIC API ENDPOINTS
// =========================================================================

// 1. Non-sensitive Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    service: 'momentum-freight-quote-api',
    timestamp: new Date().toISOString(),
    persistence: getPersistenceBackend(),
    emailProviderConfigured: isEmailProviderConfigured(),
    emailProvider: getActiveEmailProviderName(),
    notificationRecipientCount: getAuthorizedQuoteRecipients().length,
  });
});

interface RecipientDeliverySummary {
  recipientEmail: string;
  status: string;
  delivered: boolean;
  provider: string | null;
  messageId: string | null;
}

function summarizeEmailDelivery(
  outboxes: Array<{
    recipient_email: string;
    status: string;
    provider?: string | null;
    provider_message_id?: string | null;
  }>
): {
  status: string;
  delivered: boolean;
  allDelivered: boolean;
  provider: string | null;
  messageId: string | null;
  recipients: RecipientDeliverySummary[];
} {
  const recipients: RecipientDeliverySummary[] = outboxes.map((o) => ({
    recipientEmail: o.recipient_email,
    status: o.status,
    delivered: o.status === 'sent',
    provider: o.provider || null,
    messageId: o.provider_message_id || null,
  }));

  const sentCount = recipients.filter((r) => r.delivered).length;
  const allDelivered = recipients.length > 0 && sentCount === recipients.length;

  let status = 'pending_provider_config';
  if (allDelivered) {
    status = 'sent';
  } else if (sentCount > 0) {
    status = 'partial';
  } else if (!isEmailProviderConfigured()) {
    status = 'pending_provider_config';
  } else if (recipients.length > 0 && recipients.every((r) => r.status === 'failed')) {
    status = 'failed';
  } else if (recipients.some((r) => r.status === 'retrying')) {
    status = 'retrying';
  } else if (recipients.length > 0) {
    status = 'pending';
  }

  return {
    status,
    delivered: allDelivered,
    allDelivered,
    provider: recipients.find((r) => r.provider)?.provider || null,
    messageId: recipients.find((r) => r.messageId)?.messageId || null,
    recipients,
  };
}

// 2. Automated Freight Quote Submission (Validated, Idempotent, Durable, Retried Outbox)
app.post('/api/quotes', quoteRateLimiter, async (req: Request, res: Response) => {
  try {
    const validation = validateAndNormalizeQuote(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({
        success: false,
        error: validation.isBotTrap
          ? 'Unable to process request.'
          : Object.values(validation.errors)[0] || 'Validation failed.',
        fieldErrors: validation.isBotTrap ? {} : validation.errors,
      });
    }

    const normalized = validation.data;
    const headerIdempotency =
      typeof req.headers['idempotency-key'] === 'string'
        ? req.headers['idempotency-key'].trim().slice(0, 128)
        : '';
    const idempotencyKey =
      headerIdempotency ||
      normalized.idempotencyKey ||
      crypto
        .createHash('sha256')
        .update(
          JSON.stringify({
            email: normalized.email,
            pickupLocation: normalized.pickupLocation,
            deliveryLocation: normalized.deliveryLocation,
            pickupDate: normalized.pickupDate,
            serviceCategory: normalized.serviceCategory,
            estimatedWeightLbs: normalized.estimatedWeightLbs,
            loadDescription: normalized.loadDescription,
            bucket: Math.floor(Date.now() / (2 * 60 * 1000)),
          })
        )
        .digest('hex');

    const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const authorizedRecipients = getAuthorizedQuoteRecipients();

    if (supabaseUrl && supabaseKey) {
      const previewEmail = buildQuoteNotificationEmail({
        referenceNumber: 'PENDING',
        submittedAtIso: new Date().toISOString(),
        quote: normalized,
      });
      const quotePayload = {
        customer_name: normalized.customerName,
        company_name: normalized.companyName,
        email: normalized.email,
        phone: normalized.phone,
        service_type: normalized.serviceCategory,
        pickup_location: normalized.pickupLocation,
        delivery_location: normalized.deliveryLocation,
        pickup_date: normalized.pickupDate || null,
        delivery_date: normalized.deliveryDate || null,
        freight_description: normalized.loadDescription,
        freight_weight_lbs: normalized.estimatedWeightLbs,
        dimensions: normalized.dimensions,
        special_requirements: normalized.specialHandling,
        html_body: previewEmail.htmlBody,
        text_body: previewEmail.textBody,
        additional_details: normalized,
      };
      const saved = await fetch(supabaseUrl + '/rest/v1/rpc/submit_quote_request', {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: 'Bearer ' + supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_quote: quotePayload, p_key: idempotencyKey }),
        signal: AbortSignal.timeout(12000),
      });
      if (!saved.ok) {
        console.error('Atomic quote RPC failed', saved.status);
        return res.status(saved.status === 409 ? 409 : 503).json({
          success: false,
          quoteRecorded: false,
          error:
            saved.status === 409
              ? 'This submission key was already used with different quote details.'
              : 'Quote storage is temporarily unavailable. Please retry.',
        });
      }
      const rows = (await saved.json()) as Array<{
        reference_number: string;
        quote_id: string;
        created: boolean;
      }>;
      const stored = rows[0];
      if (!stored?.reference_number) throw new Error('Quote RPC returned no reference');

      if (process.env.RESEND_API_KEY) {
        await dispatchSupabaseOutboxOnce().catch((workerErr) => {
          console.error('[Momentum] Immediate Supabase dispatch error:', workerErr instanceof Error ? workerErr.message : String(workerErr));
        });
      }

      let outboxRows: Array<{
        recipient_email: string;
        status: string;
        provider?: string | null;
        provider_message_id?: string | null;
      }> = [];
      if (stored.quote_id) {
        const outboxResp = await fetch(
          `${supabaseUrl}/rest/v1/email_outbox?quote_request_id=eq.${encodeURIComponent(stored.quote_id)}&select=recipient_email,status,provider_message_id&order=created_at.asc`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: 'Bearer ' + supabaseKey,
            },
            signal: AbortSignal.timeout(8000),
          }
        ).catch(() => null);
        if (outboxResp?.ok) {
          outboxRows = (await outboxResp.json()) as typeof outboxRows;
        }
      }

      if (outboxRows.length === 0) {
        outboxRows = authorizedRecipients.map((recipient) => ({
          recipient_email: recipient,
          status: isEmailProviderConfigured() ? 'pending' : 'pending_provider_config',
          provider: null,
          provider_message_id: null,
        }));
      }

      return res.status(stored.created ? 201 : 200).json({
        success: true,
        duplicatePrevented: !stored.created,
        quoteRecorded: true,
        referenceNumber: stored.reference_number,
        createdAt: new Date().toISOString(),
        emailDelivery: summarizeEmailDelivery(outboxRows),
      });
    }

    // Local persistence fallback when Supabase is not configured
    const existing = await findQuoteByIdempotencyKey(idempotencyKey);
    if (existing) {
      return res.status(200).json({
        success: true,
        duplicatePrevented: true,
        quoteRecorded: true,
        referenceNumber: existing.quote.reference_number,
        createdAt: existing.quote.created_at,
        emailDelivery: summarizeEmailDelivery(existing.outboxes),
      });
    }

    const referenceNumber = generateQuoteReference();
    const submittedAtIso = new Date().toISOString();
    const emailContent = buildQuoteNotificationEmail({
      referenceNumber,
      submittedAtIso,
      quote: normalized,
    });
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const { quote, outboxes } = await createQuoteAndOutbox({
      input: normalized,
      referenceNumber,
      idempotencyKey,
      ipHash: hashClientIp(clientIp),
      emailPayload: {
        recipientEmails: authorizedRecipients,
        replyToEmail: normalized.email,
        senderEmail: getConfiguredSender(),
        subject: emailContent.subject,
        htmlBody: emailContent.htmlBody,
        textBody: emailContent.textBody,
      },
    });

    if (isEmailProviderConfigured()) {
      for (const job of outboxes) {
        await processOutboxJob(job.id);
      }
      const refreshed = await findQuoteByIdempotencyKey(idempotencyKey);
      return res.status(201).json({
        success: true,
        duplicatePrevented: false,
        quoteRecorded: true,
        referenceNumber: quote.reference_number,
        createdAt: quote.created_at,
        emailDelivery: summarizeEmailDelivery(refreshed?.outboxes || outboxes),
      });
    }

    return res.status(201).json({
      success: true,
      duplicatePrevented: false,
      quoteRecorded: true,
      referenceNumber: quote.reference_number,
      createdAt: quote.created_at,
      emailDelivery: summarizeEmailDelivery(outboxes),
    });
  } catch (err: unknown) {
    console.error('[Momentum Quote API Error]', err);
    return res.status(503).json({
      success: false,
      quoteRecorded: false,
      error:
        `We could not safely record your quote request at this moment. Please retry in a few seconds or call dispatch at ${COMPANY_PHONE.display}.`,
    });
  }
});

// 3. Optional AI Route & Equipment Feasibility Assistant (No PII stored)
app.post('/api/ai/quote-assist', quoteRateLimiter, async (req: Request, res: Response) => {
  const { origin, destination, serviceCategory, weightLbs, dimensions, loadDescription } =
    req.body || {};

  const safeOrigin = String(origin || '').slice(0, 120);
  const safeDest = String(destination || '').slice(0, 120);
  const safeCategory = String(serviceCategory || 'dry_van').slice(0, 60);
  const safeWeight = Number(weightLbs) || 15000;
  const safeDims = String(dimensions || 'Standard').slice(0, 120);
  const safeDesc = String(loadDescription || '').slice(0, 500);

  const defaultEstimate = {
    recommendedEquipment:
      safeCategory === 'heavy_haul' || safeCategory === 'equipment_mobilization'
        ? 'Hydraulic Lowboy / RGN Trailer'
        : safeCategory === 'flatbed' || safeCategory === 'flatbed_materials'
        ? '48ft / 53ft Air-Ride Flatbed'
        : safeCategory === 'cargo_van'
        ? 'High-Roof Commercial Cargo Van'
        : '53ft Air-Ride Dry Van',
    estimatedMileage: 145,
    suggestedRateMin: 950,
    suggestedRateMax: 1350,
    transitTimeEst: '3.5 - 5.0 Hours',
    permitsRequired: safeCategory === 'heavy_haul' || safeWeight > 45000,
    operationalNotes:
      'Recommended route utilizes regional Carolina interstate corridors (I-77 / I-26 / I-20). Final pricing is confirmed by operations upon review.',
    fuelSurchargeNotice: 'Preliminary estimate only; subject to dispatch verification.',
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
- Origin: ${safeOrigin}
- Destination: ${safeDest}
- Requested Service: ${safeCategory}
- Cargo Description: ${safeDesc}
- Estimated Weight: ${safeWeight} lbs
- Dimensions: ${safeDims}

Respond ONLY with valid JSON with this exact structure:
{
  "recommendedEquipment": "String",
  "estimatedMileage": number,
  "suggestedRateMin": number,
  "suggestedRateMax": number,
  "transitTimeEst": "String",
  "permitsRequired": boolean,
  "operationalNotes": "String",
  "fuelSurchargeNotice": "String"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      analysis: { ...defaultEstimate, ...parsed },
      source: 'gemini',
    });
  } catch (error) {
    console.error('AI Quote Assist fallback:', error);
    return res.json({
      success: true,
      analysis: defaultEstimate,
      source: 'fallback',
    });
  }
});

// 4. General Contact & Driver Careers Forms (HTML-escaped & routed to official Momentum recipients)
async function sendDirectOperationalEmail(params: {
  subject: string;
  replyTo: string;
  reference: string;
  rows: Array<[string, string]>;
}): Promise<{
  delivered: boolean;
  provider: string;
  recipients: Array<{ recipientEmail: string; delivered: boolean; provider: string }>;
}> {
  const sender = getConfiguredSender();
  const recipients = getAuthorizedQuoteRecipients();
  const htmlRows = params.rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 8px 12px; font-weight: 700; color: #071E41; border-bottom: 1px solid #E5E7EB; width: 35%; background-color: #F8FAFC;">
            ${escapeHtml(label)}
          </td>
          <td style="padding: 8px 12px; color: #1F2937; border-bottom: 1px solid #E5E7EB;">
            ${escapeHtml(value).replace(/\n/g, '<br/>')}
          </td>
        </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; padding: 20px; background: #F5F7FA;">
    <div style="max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
      <div style="background: #071E41; color: #fff; padding: 20px; border-bottom: 4px solid #C99A31;">
        <h2 style="margin: 0; font-size: 18px;">MOMENTUM TRANSPORTATION &amp; HAULING LLC</h2>
        <div style="font-size: 12px; color: #C99A31; margin-top: 4px;">Reference: ${escapeHtml(params.reference)}</div>
      </div>
      <div style="padding: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;"><tbody>${htmlRows}</tbody></table>
      </div>
    </div>
  </body></html>`;

  const text = params.rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  if (process.env.RESEND_API_KEY) {
    const results: Array<{ recipientEmail: string; delivered: boolean; provider: string }> = [];
    for (const recipientEmail of recipients) {
      try {
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `${params.reference}-${recipientEmail}`,
          },
          body: JSON.stringify({
            from: sender,
            to: [recipientEmail],
            reply_to: params.replyTo,
            subject: params.subject,
            html,
            text,
          }),
        });
        results.push({ recipientEmail, delivered: resp.ok, provider: 'resend' });
      } catch {
        results.push({ recipientEmail, delivered: false, provider: 'resend' });
      }
    }
    return {
      delivered: results.length > 0 && results.every((r) => r.delivered),
      provider: 'resend',
      recipients: results,
    };
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const results: Array<{ recipientEmail: string; delivered: boolean; provider: string }> = [];
    for (const recipientEmail of recipients) {
      try {
        await transporter.sendMail({
          from: sender,
          to: recipientEmail,
          replyTo: params.replyTo,
          subject: params.subject,
          html,
          text,
        });
        results.push({ recipientEmail, delivered: true, provider: 'smtp' });
      } catch {
        results.push({ recipientEmail, delivered: false, provider: 'smtp' });
      }
    }
    return {
      delivered: results.length > 0 && results.every((r) => r.delivered),
      provider: 'smtp',
      recipients: results,
    };
  }

  return {
    delivered: false,
    provider: 'unconfigured',
    recipients: recipients.map((recipientEmail) => ({
      recipientEmail,
      delivered: false,
      provider: 'unconfigured',
    })),
  };
}

app.post('/api/contact', contactRateLimiter, async (req: Request, res: Response) => {
  try {
    const name = String(req.body?.name || '').trim().slice(0, 120);
    const email = String(req.body?.email || '').trim().slice(0, 160);
    const phone = String(req.body?.phone || '').trim().slice(0, 40);
    const inquiryType = String(req.body?.inquiryType || 'General Inquiries').trim().slice(0, 80);
    const message = String(req.body?.message || '').trim().slice(0, 2000);

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid name, email address, and message.',
      });
    }

    const ticketId = `MTH-MSG-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const result = await sendDirectOperationalEmail({
      subject: `[MOMENTUM] ${inquiryType} — ${ticketId}`,
      replyTo: email,
      reference: ticketId,
      rows: [
        ['Reference Ticket', ticketId],
        ['Name', name],
        ['Email', email],
        ['Phone', phone || 'Not provided'],
        ['Category', inquiryType],
        ['Message', message],
      ],
    });

    return res.status(201).json({
      success: true,
      ticketId,
      delivered: result.delivered,
      message: result.delivered
        ? `Your inquiry (${ticketId}) has been delivered to our operations team.`
        : `Your inquiry (${ticketId}) has been recorded. For immediate assistance, please call ${COMPANY_PHONE.display}.`,
    });
  } catch (err) {
    console.error('[Momentum Contact API Error]', err);
    return res.status(500).json({
      success: false,
      error: `Unable to send inquiry right now. Please call ${COMPANY_PHONE.display}.`,
    });
  }
});

app.post('/api/careers', contactRateLimiter, async (req: Request, res: Response) => {
  try {
    const applicantName = String(req.body?.applicantName || '').trim().slice(0, 120);
    const applicantPhone = String(req.body?.applicantPhone || '').trim().slice(0, 40);
    const applicantEmail = String(req.body?.applicantEmail || '').trim().slice(0, 160);
    const cdlClass = String(req.body?.cdlClass || 'A').trim().slice(0, 40);
    const yearsExperience = String(req.body?.yearsExperience || '3+').trim().slice(0, 40);
    const endorsements = String(req.body?.endorsements || 'Standard Class A').trim().slice(0, 80);
    const preferredLanes = String(req.body?.preferredLanes || '').trim().slice(0, 140);
    const notes = String(req.body?.notes || '').trim().slice(0, 1000);

    if (applicantName.length < 2 || applicantPhone.replace(/\D/g, '').length < 7) {
      return res.status(400).json({
        success: false,
        error: 'Applicant name and valid phone number are required.',
      });
    }

    const applicationId = `MTH-DRV-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(applicantEmail)
      ? applicantEmail
      : OFFICIAL_RECIPIENT_EMAIL;

    const result = await sendDirectOperationalEmail({
      subject: `[MOMENTUM] Driver Application — ${applicationId}`,
      replyTo,
      reference: applicationId,
      rows: [
        ['Application ID', applicationId],
        ['Applicant Name', applicantName],
        ['Phone', applicantPhone],
        ['Email', applicantEmail || 'Not provided'],
        ['CDL Class', cdlClass],
        ['Experience', yearsExperience],
        ['Endorsements', endorsements],
        ['Preferred Lanes', preferredLanes || 'Regional Corridors'],
        ['Notes', notes || 'None'],
      ],
    });

    return res.status(201).json({
      success: true,
      applicationId,
      delivered: result.delivered,
      message: `Driver application (${applicationId}) recorded.`,
    });
  } catch (err) {
    console.error('[Momentum Careers API Error]', err);
    return res.status(500).json({
      success: false,
      error: `Unable to submit driver application right now. Please call ${COMPANY_PHONE.display}.`,
    });
  }
});

// =========================================================================
// RESTRICTED MANAGEMENT ENDPOINTS (Protected by ADMIN_API_TOKEN)
// =========================================================================

app.get('/api/quotes', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const records = await listQuotesForAdmin(50);
    return res.json({ success: true, quotes: records });
  } catch (err) {
    console.error('[Admin Quotes Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to load quote records.' });
  }
});

app.get('/api/admin/quotes', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const records = await listQuotesForAdmin(50);
    return res.json({ success: true, quotes: records });
  } catch (err) {
    console.error('[Admin Quotes Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to load quote records.' });
  }
});

app.get('/api/admin/outbox', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const jobs = await listOutboxForAdmin(50);
    return res.json({ success: true, outbox: jobs });
  } catch (err) {
    console.error('[Admin Outbox Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to load outbox records.' });
  }
});

// Identify the actual runtime build without exposing secrets.
app.get('/api/version', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({
    service: 'momentum',
    sourceRevision: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'unknown',
    deploymentId: process.env.RAILWAY_DEPLOYMENT_ID || 'unknown',
    frontend: 'vite-react',
  });
});

// Block any unknown /api/* routes cleanly instead of falling through to SPA HTML
app.all('/api/*', (_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: 'API endpoint not found.',
  });
});

// =========================================================================
// STATIC ASSETS, VITE MIDDLEWARE & SERVER BOOT
// =========================================================================

async function startServer() {
  // Start durable email retry worker (survives restarts via Supabase / local durable store)
  // The atomic Supabase queue uses a different schema from the legacy worker.
  // Never run that worker against the production Supabase outbox.
  if (getPersistenceBackend() === 'supabase') startSupabaseOutboxWorker();
  else startOutboxRetryWorker(30_000);
  void purgeExpiredLocalRecords();

  app.use(express.static(path.resolve(__dirname, 'public')));
  app.use('/momentum', express.static(path.resolve(__dirname, 'public')));

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    const staticOptions = {
      setHeaders(res: import('http').ServerResponse, filePath: string) {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-store, max-age=0');
        } else if (filePath.includes('/assets/') || filePath.includes('\\assets\\')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    };
    app.use(express.static(distPath, staticOptions));
    app.use('/momentum', express.static(distPath, staticOptions));
    app.get('*', (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Momentum Logistics Platform] Server listening on http://0.0.0.0:${PORT} (persistence=${getPersistenceBackend()}, emailConfigured=${isEmailProviderConfigured()})`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
