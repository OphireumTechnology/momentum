import {
  buildQuoteNotificationEmail,
  escapeHtml,
  getConfiguredSender,
  isAuthorizedRecipient,
} from './emailOutbox.ts';
import type { NormalizedQuoteSubmission } from '../src/shared/quoteSchema.ts';
import { COMPANY_EMAILS, COMPANY_PHONE } from '../src/config/company.ts';

type OutboxJob = {
  id: string;
  recipient_email: string;
  reply_to_email?: string | null;
  sender_email?: string | null;
  subject: string;
  html_body?: string | null;
  text_body?: string | null;
  payload?: { reference_number?: string; quote?: Record<string, unknown> } | null;
  attempt_count: number;
  max_attempts: number;
};

const url = () => (process.env.SUPABASE_URL || '').replace(/\/$/, '') + '/rest/v1/email_outbox';
const key = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const headers = () => ({
  apikey: key(),
  Authorization: 'Bearer ' + key(),
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
});

let running = false;

async function patch(query: string, changes: Record<string, unknown>): Promise<OutboxJob[]> {
  const res = await fetch(url() + '?' + query, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ ...changes, updated_at: new Date().toISOString() }),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error('Supabase outbox update failed: HTTP ' + res.status);
  return (await res.json()) as OutboxJob[];
}

function buildEmailContentFromJob(job: OutboxJob): {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
} {
  const rawQuote = job.payload?.quote || {};
  const additional =
    rawQuote.additional_details && typeof rawQuote.additional_details === 'object'
      ? (rawQuote.additional_details as Partial<NormalizedQuoteSubmission>)
      : (rawQuote as Partial<NormalizedQuoteSubmission>);

  const replyToCandidate =
    job.reply_to_email ||
    (typeof rawQuote.email === 'string' ? rawQuote.email : undefined) ||
    (typeof additional.email === 'string' ? additional.email : undefined);

  if (job.html_body && job.text_body) {
    return {
      subject: job.subject,
      html: job.html_body,
      text: job.text_body,
      replyTo: replyToCandidate,
    };
  }

  const ref = job.payload?.reference_number || 'MTH-QUOTE';
  if (additional.customerName && additional.pickupLocation && additional.deliveryLocation) {
    const normalizedQuote: NormalizedQuoteSubmission = {
      customerName: String(additional.customerName || ''),
      companyName: String(additional.companyName || ''),
      email: String(additional.email || replyToCandidate || ''),
      phone: String(additional.phone || ''),
      preferredContactMethod:
        additional.preferredContactMethod === 'email' || additional.preferredContactMethod === 'phone'
          ? additional.preferredContactMethod
          : 'either',
      serviceCategory: String(additional.serviceCategory || rawQuote.service_type || 'dry_van'),
      serviceGroup: additional.serviceGroup || 'dry_van',
      pickupLocation: String(additional.pickupLocation || rawQuote.pickup_location || ''),
      deliveryLocation: String(additional.deliveryLocation || rawQuote.delivery_location || ''),
      pickupDate: String(additional.pickupDate || rawQuote.pickup_date || ''),
      deliveryDate: String(additional.deliveryDate || rawQuote.delivery_date || ''),
      urgency: additional.urgency || 'standard',
      cargoType: String(additional.cargoType || 'Commercial Freight'),
      loadDescription: String(additional.loadDescription || rawQuote.freight_description || ''),
      estimatedWeightLbs: Number(additional.estimatedWeightLbs || rawQuote.freight_weight_lbs || 0),
      dimensions: String(additional.dimensions || rawQuote.dimensions || ''),
      palletCountOrEquipment: String(additional.palletCountOrEquipment || ''),
      loadingRequirements: String(additional.loadingRequirements || 'dock_to_dock'),
      isOversized: Boolean(additional.isOversized),
      isHazmat: Boolean(additional.isHazmat),
      hazmatDetails: String(additional.hazmatDetails || ''),
      specialHandling: String(additional.specialHandling || rawQuote.special_requirements || ''),
      serviceDetails: additional.serviceDetails || {},
      consent: true,
      idempotencyKey: String(additional.idempotencyKey || ''),
    };
    const built = buildQuoteNotificationEmail({
      referenceNumber: ref,
      submittedAtIso: new Date().toISOString(),
      quote: normalizedQuote,
    });
    return {
      subject: job.subject || built.subject,
      html: built.htmlBody,
      text: built.textBody,
      replyTo: replyToCandidate,
    };
  }

  const entries = Object.entries(rawQuote).filter(([k]) => k !== 'additional_details');
  const textLines = entries.map(
    ([name, value]) =>
      `${name}: ${value === null || value === undefined || value === '' ? 'Not provided' : typeof value === 'object' ? JSON.stringify(value) : String(value)}`
  );
  const text = ['New Momentum freight quote', `Reference: ${ref}`, ...textLines].join('\n');
  const htmlRows = entries
    .map(
      ([name, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:700;color:#071E41;border-bottom:1px solid #E5E7EB;background:#F8FAFC;">${escapeHtml(name)}</td><td style="padding:8px 12px;color:#1F2937;border-bottom:1px solid #E5E7EB;">${escapeHtml(value === null || value === undefined || value === '' ? 'Not provided' : typeof value === 'object' ? JSON.stringify(value) : String(value))}</td></tr>`
    )
    .join('');

  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:20px;background:#F5F7FA;">
    <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
      <div style="background:#071E41;color:#fff;padding:20px;border-bottom:4px solid #C99A31;">
        <h2 style="margin:0;font-size:18px;">MOMENTUM TRANSPORTATION &amp; HAULING LLC</h2>
        <div style="font-size:12px;color:#C99A31;margin-top:4px;">Quote Reference: ${escapeHtml(ref)}</div>
      </div>
      <div style="padding:20px;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><tbody>${htmlRows}</tbody></table></div>
      <div style="background:#F8FAFC;padding:12px 20px;font-size:11px;color:#64748B;text-align:center;">
        ${escapeHtml(COMPANY_PHONE.display)} · ${escapeHtml(COMPANY_EMAILS.dispatch)} · ${escapeHtml(COMPANY_EMAILS.general)}
      </div>
    </div>
  </body></html>`;

  return { subject: job.subject, html, text, replyTo: replyToCandidate };
}

export async function dispatchSupabaseOutboxOnce(): Promise<void> {
  if (
    running ||
    !process.env.RESEND_API_KEY ||
    (!process.env.EMAIL_FROM && !getConfiguredSender()) ||
    !process.env.SUPABASE_URL ||
    !key()
  ) {
    return;
  }
  running = true;
  try {
    // Recover an interrupted job only after its claim lease has expired.
    // Resend uses the same idempotency key per outbox row on retry.
    const stale = new Date(Date.now() - 10 * 60_000).toISOString();
    await patch('status=eq.processing&updated_at=lt.' + encodeURIComponent(stale), { status: 'pending' });
    const due = new URL(url());
    due.searchParams.set(
      'select',
      'id,recipient_email,subject,payload,attempt_count,max_attempts'
    );
    due.searchParams.set('status', 'eq.pending');
    due.searchParams.set('next_attempt_at', 'lte.' + new Date().toISOString());
    due.searchParams.set('order', 'created_at.asc');
    due.searchParams.set('limit', '10');
    const res = await fetch(due, { headers: headers(), signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error('Supabase outbox read failed: HTTP ' + res.status);
    const jobs = (await res.json()) as OutboxJob[];
    for (const job of jobs) {
      if (job.attempt_count >= job.max_attempts) {
        await patch('id=eq.' + encodeURIComponent(job.id) + '&status=eq.pending', {
          status: 'failed',
          last_error: 'Maximum email attempts reached',
        });
        continue;
      }
      // Conditional update ensures only one worker instance claims a pending row.
      const claimed = await patch(
        'id=eq.' + encodeURIComponent(job.id) + '&status=eq.pending&attempt_count=eq.' + job.attempt_count,
        { status: 'processing', attempt_count: job.attempt_count + 1 }
      );
      if (claimed.length !== 1) continue;

      if (!isAuthorizedRecipient(job.recipient_email)) {
        await patch('id=eq.' + encodeURIComponent(job.id) + '&status=eq.processing', {
          status: 'failed',
          last_error: 'Recipient not in server allowlist',
        });
        continue;
      }

      try {
        const emailContent = buildEmailContentFromJob(job);
        const sender = job.sender_email || getConfiguredSender();
        const sent = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
            'Content-Type': 'application/json',
            'Idempotency-Key': 'momentum-quote-' + job.id,
          },
          body: JSON.stringify({
            from: sender,
            to: [job.recipient_email],
            ...(emailContent.replyTo ? { reply_to: emailContent.replyTo } : {}),
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!sent.ok) {
          throw new Error('Resend HTTP ' + sent.status);
        }
        const response = (await sent.json()) as { id?: string };
        if (!response.id) throw new Error('Resend did not return a message ID');
        await patch('id=eq.' + encodeURIComponent(job.id) + '&status=eq.processing', {
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider_message_id: response.id || null,
          last_error: null,
        });
      } catch (error) {
        const attempts = job.attempt_count + 1;
        const final = attempts >= job.max_attempts;
        await patch('id=eq.' + encodeURIComponent(job.id) + '&status=eq.processing', {
          status: final ? 'failed' : 'pending',
          last_error: String(error).slice(0, 400),
          next_attempt_at: new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000).toISOString(),
        });
      }
    }
  } finally {
    running = false;
  }
}

export function startSupabaseOutboxWorker(): void {
  if (!process.env.RESEND_API_KEY || (!process.env.EMAIL_FROM && !getConfiguredSender())) {
    console.warn('[Momentum] Supabase quote email delivery disabled: Resend not configured');
    return;
  }
  const interval = setInterval(() => {
    void dispatchSupabaseOutboxOnce().catch((e) =>
      console.error('[Momentum] Supabase email worker error:', e instanceof Error ? e.message : String(e))
    );
  }, 30_000);
  interval.unref?.();
  void dispatchSupabaseOutboxOnce().catch((e) =>
    console.error('[Momentum] Supabase email worker error:', e instanceof Error ? e.message : String(e))
  );
}
