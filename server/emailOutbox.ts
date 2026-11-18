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
import { COMPANY_PHONE } from '../src/config/company.ts';

export const OFFICIAL_RECIPIENT_EMAIL =
  process.env.OFFICIAL_RECIPIENT_EMAIL || 'wright.wendell@icloud.com';

export function getConfiguredSender(): string {
  return (
    process.env.EMAIL_FROM ||
    'Momentum Transportation & Hauling <quotes@momentumhauling.com>'
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
  const d = quote.serviceDetails;
  if (quote.serviceGroup === 'dry_van') {
    serviceDetailRows.push(['Dry Van Seal Required', d.dryVanSealRequired ? 'Yes' : 'No']);
    if (d.dryVanStackable) serviceDetailRows.push(['Pallet Stackability', d.dryVanStackable]);
    if (d.dryVanAppointmentWindow) {
      serviceDetailRows.push(['Dock / Appointment Window', d.dryVanAppointmentWindow]);
    }
  } else if (quote.serviceGroup === 'flatbed') {
    if (d.flatbedTarping) serviceDetailRows.push(['Tarping Requirement', d.flatbedTarping]);
    if (d.flatbedSecurement) serviceDetailRows.push(['Securement Needs', d.flatbedSecurement]);
    serviceDetailRows.push(['Side / Crane Loading', d.flatbedSideLoading ? 'Yes' : 'No']);
  } else if (quote.serviceGroup === 'cargo_van') {
    serviceDetailRows.push(['Inside Delivery Needed', d.cargoVanInsideDelivery ? 'Yes' : 'No']);
    if (d.cargoVanPieceCount) serviceDetailRows.push(['Piece Count', d.cargoVanPieceCount]);
    if (d.cargoVanDockOrJobsite) {
      serviceDetailRows.push(['Delivery Environment', d.cargoVanDockOrJobsite]);
    }
  } else if (quote.serviceGroup === 'heavy_haul') {
    if (d.heavyHaulTrailerType) serviceDetailRows.push(['Preferred Trailer Type', d.heavyHaulTrailerType]);
    if (d.heavyHaulEquipmentModel) {
      serviceDetailRows.push(['Equipment Make / Model', d.heavyHaulEquipmentModel]);
    }
    if (d.heavyHaulIsOperable) serviceDetailRows.push(['Machine Operability', d.heavyHaulIsOperable]);
    serviceDetailRows.push([
      'Oversize Permits / Escort Needed',
      d.heavyHaulPermitsNeeded ? 'Yes' : 'No / Unsure',
    ]);
  }

  const allRows: Array<[string, string]> = [
    ['Quote Reference Number', referenceNumber],
    ['Submitted Timestamp', `${formattedTimestamp} EST (${submittedAtIso})`],
    ['Customer Name', quote.customerName],
    ['Company Name', quote.companyName || 'Not provided'],
    ['Customer Email (Reply-To)', quote.email],
    ['Phone Number', quote.phone],
    ['Preferred Contact Method', quote.preferredContactMethod.toUpperCase()],
    ['Service Category', serviceLabel],
    ['Urgency', urgencyLabel],
    ['Pickup Address / Location', quote.pickupLocation],
    ['Delivery Address / Location', quote.deliveryLocation],
    ['Requested Pickup Date', quote.pickupDate],
    ['Requested Delivery Date', quote.deliveryDate || 'Flexible / Coordinate with Dispatch'],
    ['Cargo Type', quote.cargoType],
    ['Cargo Description', quote.loadDescription],
    ['Estimated Weight', `${quote.estimatedWeightLbs.toLocaleString()} lbs`],
    ['Dimensions', quote.dimensions || 'Not specified'],
    ['Pallet Count / Equipment Details', quote.palletCountOrEquipment || 'Not specified'],
    ['Loading / Unloading Requirements', loadingLabel],
    ['Oversized Load Declaration', quote.isOversized ? 'YES — Oversized Freight Declared' : 'No'],
    ['Hazardous Material (Hazmat)', quote.isHazmat ? `YES — ${quote.hazmatDetails}` : 'No'],
    ...serviceDetailRows,
    ['Special Handling Instructions', quote.specialHandling || 'None'],
    ['Consent to Be Contacted', 'Confirmed by customer at submission'],
  ];

  const htmlRows = allRows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 10px 14px; font-weight: 700; color: #071E41; border-bottom: 1px solid #E5E7EB; width: 38%; background-color: #F8FAFC; vertical-align: top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding: 10px 14px; color: #1F2937; border-bottom: 1px solid #E5E7EB; vertical-align: top;">
            ${escapeHtml(value).replace(/\n/g, '<br/>')}
          </td>
        </tr>`
    )
    .join('');

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin: 0; padding: 24px; background-color: #F5F7FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 680px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #071E41; padding: 24px; border-bottom: 4px solid #C99A31; color: #FFFFFF;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C99A31; font-weight: 700;">
          Automated Freight Quote Request
        </div>
        <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #FFFFFF;">
          MOMENTUM TRANSPORTATION &amp; HAULING LLC
        </h1>
        <div style="font-size: 13px; color: #CBD5E1; margin-top: 4px;">
          Columbia, SC · Moving Business Forward.
        </div>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #F8FAFC; border-left: 4px solid #071E41; padding: 12px 16px; margin-bottom: 20px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">Quote Reference</div>
          <div style="font-size: 20px; font-weight: 800; color: #071E41; font-family: monospace;">${escapeHtml(referenceNumber)}</div>
          <div style="font-size: 12px; color: #475569; margin-top: 4px;">
            Route: <strong>${escapeHtml(quote.pickupLocation)}</strong> &rarr; <strong>${escapeHtml(quote.deliveryLocation)}</strong>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tbody>
            ${htmlRows}
          </tbody>
        </table>

        <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #92400E;">
          <strong>Direct Reply Ready:</strong> Reply directly to this email to respond to <strong>${escapeHtml(quote.customerName)}</strong> at <a href="mailto:${escapeHtml(quote.email)}" style="color: #071E41;">${escapeHtml(quote.email)}</a>.
        </div>
      </div>

      <div style="background-color: #F8FAFC; padding: 14px 24px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #64748B; text-align: center;">
        Momentum Transportation &amp; Hauling LLC · 2 Penhurst Ct., Columbia, SC 29229 · <a href="${COMPANY_PHONE.href}" style="color: #071E41; text-decoration: underline;">${COMPANY_PHONE.display}</a>
      </div>
    </div>
  </body>
</html>`;

  const textBody = [
    'MOMENTUM TRANSPORTATION & HAULING LLC — FREIGHT QUOTE REQUEST',
    '==============================================================',
    ...allRows.map(([label, value]) => `${label}: ${value}`),
    '==============================================================',
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
    `[MOMENTUM EMAIL ALERT] Delivery failed for ${job.reference_number} (outbox ${job.id}) after ${job.attempt_count} attempts: ${errorMsg}`
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
    });

    return {
      status: 'sent',
      provider: result.provider,
      messageId: result.messageId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const exhausted = nextAttempt >= claimed.max_attempts;

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
      });

      await emitFailureAlert({ ...claimed, attempt_count: nextAttempt }, errorMsg);
      return { status: 'failed', error: errorMsg };
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
      metadata: { nextRetryAt },
    });

    return { status: 'retrying', error: errorMsg };
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
