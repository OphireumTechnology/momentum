import nodemailer from 'nodemailer';
import {
  getServiceCategoryLabel,
  LOADING_REQUIREMENT_OPTIONS,
  URGENCY_OPTIONS,
} from '../src/shared/quoteSchema.ts';
import type { NormalizedQuoteSubmission } from '../src/shared/quoteSchema.ts';
import {
  claimOutboxJobForSending,
  findDueOutboxJobs,
  recordDeliveryEvent,
  updateOutboxJobResult,
} from './persistence.ts';
import type { StoredEmailOutbox } from './persistence.ts';
import { COMPANY_EMAILS, COMPANY_PHONE } from '../src/config/company.ts';

export const AUTHORIZED_OFFICIAL_RECIPIENTS: readonly string[] = [
  COMPANY_EMAILS.dispatch,
  COMPANY_EMAILS.general,
];

const AUTHORIZED_RECIPIENT_SET = new Set(
  AUTHORIZED_OFFICIAL_RECIPIENTS.map((email) => email.toLowerCase())
);

export const OFFICIAL_RECIPIENT_EMAIL = COMPANY_EMAILS.dispatch;

export function isAuthorizedRecipient(email: string | null | undefined): boolean {
  if (!email) return false;
  return AUTHORIZED_RECIPIENT_SET.has(email.trim().toLowerCase());
}

/**
 * Server-side recipient allowlisting:
 * Reads QUOTE_NOTIFICATION_EMAILS (comma-separated) if configured, filters strictly
 * against the authorized official company email allowlist, and ensures both
 * official addresses receive notifications when unset or incomplete.
 */
export function getAuthorizedQuoteRecipients(): string[] {
  const configuredRaw = process.env.QUOTE_NOTIFICATION_EMAILS || '';
  if (!configuredRaw.trim()) {
    return [...AUTHORIZED_OFFICIAL_RECIPIENTS];
  }

  const parsed = configuredRaw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => isAuthorizedRecipient(item));

  const unique = Array.from(new Set(parsed));
  if (unique.length === 0) {
    return [...AUTHORIZED_OFFICIAL_RECIPIENTS];
  }

  // Ensure both official company recipients are covered if only partial env config was supplied
  for (const official of AUTHORIZED_OFFICIAL_RECIPIENTS) {
    if (!unique.includes(official.toLowerCase())) {
      unique.push(official.toLowerCase());
    }
  }
  return unique;
}

export function getConfiguredSender(): string {
  return (
    process.env.EMAIL_FROM ||
    'Momentum Dispatch <quotes@momentumtransporthauling.com>'
  );
}

export function isEmailProviderConfigured(): boolean {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSmtp = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
  return hasResend || hasSmtp;
}

export function getActiveEmailProviderName(): 'resend' | 'smtp' | 'unconfigured' {
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  return 'unconfigured';
}

export function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLoadingLabel(value: string): string {
  return (
    LOADING_REQUIREMENT_OPTIONS.find((opt) => opt.value === value)?.label ||
    value.replace(/_/g, ' ')
  );
}

function getUrgencyLabel(value: string): string {
  return (
    URGENCY_OPTIONS.find((opt) => opt.value === value)?.label ||
    value.replace(/_/g, ' ')
  );
}

function renderEmailSectionTable(title: string, rows: Array<[string, string]>): string {
  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 9px 14px; font-weight: 700; color: #071E41; border-bottom: 1px solid #E5E7EB; width: 38%; background-color: #F8FAFC; vertical-align: top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding: 9px 14px; color: #1F2937; border-bottom: 1px solid #E5E7EB; vertical-align: top;">
            ${escapeHtml(value).replace(/\n/g, '<br/>')}
          </td>
        </tr>`
    )
    .join('');

  return `
    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #071E41; border-bottom: 2px solid #C99A31; padding-bottom: 5px; margin-bottom: 8px;">
        ${escapeHtml(title)}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #E5E7EB;">
        <tbody>${htmlRows}</tbody>
      </table>
    </div>
  `;
}

export function buildQuoteNotificationEmail(params: {
  referenceNumber: string;
  submittedAtIso: string;
  quote: NormalizedQuoteSubmission;
}): {
  subject: string;
  htmlBody: string;
  textBody: string;
} {
  const { referenceNumber, submittedAtIso, quote } = params;
  const serviceLabel = getServiceCategoryLabel(quote.serviceCategory);
  const urgencyLabel = getUrgencyLabel(quote.urgency);
  const loadingLabel = getLoadingLabel(quote.loadingRequirements);
  const formattedTimestamp = new Date(submittedAtIso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const subject = `[MOMENTUM QUOTE] ${referenceNumber} — ${quote.pickupLocation} to ${quote.deliveryLocation} (${quote.serviceGroup.replace('_', ' ').toUpperCase()})`;

  const serviceDetailRows: Array<[string, string]> = [];
  const d = quote.serviceDetails || {};
  if (quote.serviceGroup === 'dry_van') {
    serviceDetailRows.push(['Dry Van Seal Required', d.dryVanSealRequired ? 'Yes' : 'No']);
    serviceDetailRows.push(['Pallet Stackability', d.dryVanStackable || 'Not specified (optional)']);
    serviceDetailRows.push([
      'Dock / Appointment Window',
      d.dryVanAppointmentWindow || 'Not provided (optional)',
    ]);
  } else if (quote.serviceGroup === 'flatbed') {
    serviceDetailRows.push(['Tarping Requirement', d.flatbedTarping || 'Not specified (optional)']);
    serviceDetailRows.push(['Securement Needs', d.flatbedSecurement || 'Not specified (optional)']);
    serviceDetailRows.push(['Side / Crane Loading', d.flatbedSideLoading ? 'Yes' : 'No']);
  } else if (quote.serviceGroup === 'cargo_van') {
    serviceDetailRows.push(['Inside Delivery Needed', d.cargoVanInsideDelivery ? 'Yes' : 'No']);
    serviceDetailRows.push(['Piece Count', d.cargoVanPieceCount || 'Not provided (optional)']);
    serviceDetailRows.push([
      'Delivery Environment',
      d.cargoVanDockOrJobsite || 'Not specified (optional)',
    ]);
  } else if (quote.serviceGroup === 'heavy_haul') {
    serviceDetailRows.push([
      'Preferred Trailer Type',
      d.heavyHaulTrailerType || 'Not specified (optional)',
    ]);
    serviceDetailRows.push([
      'Equipment Make / Model',
      d.heavyHaulEquipmentModel || 'Not provided (optional)',
    ]);
    serviceDetailRows.push([
      'Machine Operability',
      d.heavyHaulIsOperable || 'Not specified (optional)',
    ]);
    serviceDetailRows.push([
      'Oversize Permits / Escort Needed',
      d.heavyHaulPermitsNeeded ? 'Yes' : 'No / Unsure',
    ]);
  }

  const customerRows: Array<[string, string]> = [
    ['Quote Reference Number', referenceNumber],
    ['Submission Date & Time', `${formattedTimestamp} EST (${submittedAtIso})`],
    ['Customer Full Name', quote.customerName],
    ['Company / Business Name', quote.companyName || 'Not provided (optional)'],
    ['Customer Email Address (Reply-To)', quote.email],
    ['Customer Telephone Number', quote.phone],
    ['Preferred Contact Method', quote.preferredContactMethod.toUpperCase()],
  ];

  const routeRows: Array<[string, string]> = [
    ['Requested Transportation Service', serviceLabel],
    ['Schedule Urgency', urgencyLabel],
    ['Pickup Address / Location', quote.pickupLocation],
    ['Delivery Address / Location', quote.deliveryLocation],
    ['Requested Pickup Date', quote.pickupDate],
    ['Requested Delivery Date', quote.deliveryDate || 'Not provided — Flexible / Coordinate with Dispatch (optional)'],
  ];

  const cargoRows: Array<[string, string]> = [
    ['Cargo Type', quote.cargoType],
    ['Freight / Cargo Description', quote.loadDescription],
    ['Estimated Weight', `${quote.estimatedWeightLbs.toLocaleString()} lbs`],
    ['Dimensions (L x W x H)', quote.dimensions || 'Not provided (optional)'],
    ['Pallet Count / Equipment Units', quote.palletCountOrEquipment || 'Not provided (optional)'],
    ['Loading / Unloading Requirements', loadingLabel],
    ...serviceDetailRows,
  ];

  const specialRows: Array<[string, string]> = [
    ['Oversized Load Declaration', quote.isOversized ? 'YES — Oversized Freight Declared' : 'No'],
    ['Hazardous Material (Hazmat)', quote.isHazmat ? `YES — ${quote.hazmatDetails}` : 'No'],
    ['Additional Customer Instructions', quote.specialHandling || 'None provided (optional)'],
    ['Accuracy & Contact Consent', 'Confirmed by customer at submission'],
  ];

  const allRows: Array<[string, string]> = [
    ...customerRows,
    ...routeRows,
    ...cargoRows,
    ...specialRows,
  ];

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin: 0; padding: 24px; background-color: #F5F7FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 700px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #071E41; padding: 24px; border-bottom: 4px solid #C99A31; color: #FFFFFF;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C99A31; font-weight: 700;">
          Automated Freight Quote Notification
        </div>
        <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #FFFFFF;">
          MOMENTUM TRANSPORTATION &amp; HAULING LLC
        </h1>
        <div style="font-size: 13px; color: #CBD5E1; margin-top: 4px;">
          Columbia, SC · Moving Business Forward.
        </div>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #F8FAFC; border-left: 4px solid #071E41; padding: 14px 16px; margin-bottom: 20px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">Quote Reference</div>
          <div style="font-size: 20px; font-weight: 800; color: #071E41; font-family: monospace;">${escapeHtml(referenceNumber)}</div>
          <div style="font-size: 12px; color: #475569; margin-top: 4px;">
            Route: <strong>${escapeHtml(quote.pickupLocation)}</strong> &rarr; <strong>${escapeHtml(quote.deliveryLocation)}</strong>
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">
            Official Routing: ${escapeHtml(AUTHORIZED_OFFICIAL_RECIPIENTS.join(' · '))}
          </div>
        </div>

        ${renderEmailSectionTable('1. Customer & Contact Information', customerRows)}
        ${renderEmailSectionTable('2. Service & Route Schedule', routeRows)}
        ${renderEmailSectionTable('3. Cargo & Equipment Specifications', cargoRows)}
        ${renderEmailSectionTable('4. Declarations & Additional Instructions', specialRows)}

        <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #92400E;">
          <strong>Direct Reply Ready:</strong> Reply directly to this email to respond to <strong>${escapeHtml(quote.customerName)}</strong> at <a href="mailto:${escapeHtml(quote.email)}" style="color: #071E41;">${escapeHtml(quote.email)}</a>.
        </div>
      </div>

      <div style="background-color: #F8FAFC; padding: 14px 24px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #64748B; text-align: center;">
        Momentum Transportation &amp; Hauling LLC · 2 Penhurst Ct., Columbia, SC 29229 · <a href="${COMPANY_PHONE.href}" style="color: #071E41; text-decoration: underline;">${COMPANY_PHONE.display}</a><br/>
        Dispatch: ${escapeHtml(COMPANY_EMAILS.dispatch)} · General Inquiries: ${escapeHtml(COMPANY_EMAILS.general)}
      </div>
    </div>
  </body>
</html>`;

  const textBody = [
    'MOMENTUM TRANSPORTATION & HAULING LLC — FREIGHT QUOTE REQUEST',
    '==============================================================',
    ...allRows.map(([label, value]) => `${label}: ${value}`),
    '==============================================================',
    `Official Notification Recipients: ${AUTHORIZED_OFFICIAL_RECIPIENTS.join(', ')}`,
    `Reply directly to this email to contact ${quote.customerName} (${quote.email}).`,
    `Dispatch Desk: ${COMPANY_PHONE.display} (${COMPANY_PHONE.e164}) · 2 Penhurst Ct., Columbia, SC 29229`,
  ].join('\n');

  return { subject, htmlBody, textBody };
}

interface ProviderSendResult {
  provider: 'resend' | 'smtp';
  messageId: string;
}

async function sendViaResend(job: StoredEmailOutbox): Promise<ProviderSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': job.id,
    },
    body: JSON.stringify({
      from: job.sender_email,
      to: [job.recipient_email],
      reply_to: job.reply_to_email,
      subject: job.subject,
      html: job.html_body,
      text: job.text_body,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.id) {
    const errMsg = payload.error?.message || payload.message || `Resend HTTP ${response.status}`;
    throw new Error(`Resend delivery error: ${errMsg}`);
  }

  return {
    provider: 'resend',
    messageId: payload.id,
  };
}

async function sendViaSmtp(job: StoredEmailOutbox): Promise<ProviderSendResult> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: job.sender_email,
    to: job.recipient_email,
    replyTo: job.reply_to_email,
    subject: job.subject,
    html: job.html_body,
    text: job.text_body,
  });

  return {
    provider: 'smtp',
    messageId: info.messageId || `smtp-${Date.now()}`,
  };
}

async function dispatchToConfiguredProvider(
  job: StoredEmailOutbox
): Promise<ProviderSendResult> {
  if (!isAuthorizedRecipient(job.recipient_email)) {
    throw new Error(`Recipient blocked by server allowlist: ${job.recipient_email}`);
  }
  if (process.env.RESEND_API_KEY) {
    return await sendViaResend(job);
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return await sendViaSmtp(job);
  }
  throw new Error(
    'No outbound email provider configured (set RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS).'
  );
}

function computeNextRetryIso(attemptNumber: number): string {
  // Exponential backoff: 30s, 2m, 8m, 30m, 2h
  const delaysMs = [30_000, 120_000, 480_000, 1_800_000, 7_200_000];
  const delay = delaysMs[Math.min(Math.max(attemptNumber - 1, 0), delaysMs.length - 1)];
  return new Date(Date.now() + delay).toISOString();
}

async function emitFailureAlert(job: StoredEmailOutbox, errorMsg: string): Promise<void> {
  console.error(
    `[MOMENTUM EMAIL ALERT] Delivery failed for ${job.reference_number} (outbox ${job.id}, recipient ${job.recipient_email}) after ${job.attempt_count} attempts: ${errorMsg}`
  );
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'momentum-quote-outbox',
        severity: 'critical',
        referenceNumber: job.reference_number,
        outboxId: job.id,
        recipient: job.recipient_email,
        attempts: job.attempt_count,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (webhookErr) {
    console.error('[MOMENTUM EMAIL ALERT] Failed to invoke ALERT_WEBHOOK_URL:', webhookErr);
  }
}

export async function processOutboxJob(outboxId: string): Promise<{
  status: 'sent' | 'retrying' | 'failed' | 'skipped';
  recipientEmail?: string;
  provider?: string;
  messageId?: string;
  error?: string;
}> {
  const claimed = await claimOutboxJobForSending(outboxId);
  if (!claimed) {
    return { status: 'skipped' };
  }

  const nextAttempt = claimed.attempt_count + 1;
  await recordDeliveryEvent({
    outboxId: claimed.id,
    quoteRequestId: claimed.quote_request_id,
    attemptNumber: nextAttempt,
    eventType: 'attempt_started',
    provider: getActiveEmailProviderName(),
    metadata: { recipientEmail: claimed.recipient_email },
  });

  try {
    const result = await dispatchToConfiguredProvider(claimed);
    const sentAt = new Date().toISOString();

    await updateOutboxJobResult(claimed.id, {
      status: 'sent',
      attempt_count: nextAttempt,
      provider: result.provider,
      provider_message_id: result.messageId,
      last_error: null,
      sent_at: sentAt,
      locked_at: null,
    });

    await recordDeliveryEvent({
      outboxId: claimed.id,
      quoteRequestId: claimed.quote_request_id,
      attemptNumber: nextAttempt,
      eventType: 'delivered',
      provider: result.provider,
      providerMessageId: result.messageId,
      metadata: { recipientEmail: claimed.recipient_email },
    });

    return {
      status: 'sent',
      recipientEmail: claimed.recipient_email,
      provider: result.provider,
      messageId: result.messageId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const blockedByAllowlist = errorMsg.includes('allowlist');
    const exhausted = blockedByAllowlist || nextAttempt >= claimed.max_attempts;

    if (exhausted) {
      await updateOutboxJobResult(claimed.id, {
        status: 'failed',
        attempt_count: nextAttempt,
        last_error: errorMsg,
        locked_at: null,
      });

      await recordDeliveryEvent({
        outboxId: claimed.id,
        quoteRequestId: claimed.quote_request_id,
        attemptNumber: nextAttempt,
        eventType: 'permanent_failure',
        provider: getActiveEmailProviderName(),
        errorMessage: errorMsg,
        metadata: { recipientEmail: claimed.recipient_email },
      });

      await emitFailureAlert({ ...claimed, attempt_count: nextAttempt }, errorMsg);
      return {
        status: 'failed',
        recipientEmail: claimed.recipient_email,
        error: errorMsg,
      };
    }

    const nextRetryAt = computeNextRetryIso(nextAttempt);
    await updateOutboxJobResult(claimed.id, {
      status: 'retrying',
      attempt_count: nextAttempt,
      next_retry_at: nextRetryAt,
      last_error: errorMsg,
      locked_at: null,
    });

    await recordDeliveryEvent({
      outboxId: claimed.id,
      quoteRequestId: claimed.quote_request_id,
      attemptNumber: nextAttempt,
      eventType: 'retry_scheduled',
      provider: getActiveEmailProviderName(),
      errorMessage: errorMsg,
      metadata: { nextRetryAt, recipientEmail: claimed.recipient_email },
    });

    return {
      status: 'retrying',
      recipientEmail: claimed.recipient_email,
      error: errorMsg,
    };
  }
}

let workerInterval: ReturnType<typeof setInterval> | null = null;
let workerRunning = false;

export async function runOutboxWorkerTick(): Promise<void> {
  if (workerRunning) return;
  workerRunning = true;
  try {
    const dueJobs = await findDueOutboxJobs(10);
    for (const job of dueJobs) {
      await processOutboxJob(job.id);
    }
  } catch (err) {
    console.error('[Momentum Outbox Worker] Error processing due jobs:', err);
  } finally {
    workerRunning = false;
  }
}

export function startOutboxRetryWorker(intervalMs = 30_000): void {
  if (workerInterval) return;
  workerInterval = setInterval(() => {
    void runOutboxWorkerTick();
  }, intervalMs);
  if (typeof workerInterval.unref === 'function') {
    workerInterval.unref();
  }
}
