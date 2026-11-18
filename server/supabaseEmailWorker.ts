/**
 * Durable Supabase quote notification dispatcher. Each database outbox row is
 * ONE recipient, so retries, status and provider IDs remain independent.
 */
type OutboxJob = {
  id: string;
  recipient_email: string;
  subject: string;
  payload: { reference_number?: string; quote?: Record<string, unknown> };
  attempt_count: number;
  max_attempts: number;
};

const AUTHORIZED_RECIPIENTS = new Set([
  'wright.wendell@icloud.com',
  'info@momentumtransporthauling.com',
]);
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
  return await res.json() as OutboxJob[];
}

async function list(filters: Record<string, string>): Promise<OutboxJob[]> {
  const endpoint = new URL(url());
  endpoint.searchParams.set('select', 'id,recipient_email,subject,payload,attempt_count,max_attempts');
  for (const [field, expression] of Object.entries(filters)) endpoint.searchParams.set(field, expression);
  endpoint.searchParams.set('order', 'created_at.asc');
  endpoint.searchParams.set('limit', '10');
  const res = await fetch(endpoint, { headers: headers(), signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error('Supabase outbox read failed: HTTP ' + res.status);
  return await res.json() as OutboxJob[];
}

export async function dispatchSupabaseOutboxOnce(): Promise<void> {
  if (running || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM ||
      !process.env.SUPABASE_URL || !key()) return;
  running = true;
  try {
    // Recover interrupted sends. Reuse the same Resend idempotency key on retries.
    const expired = new Date(Date.now() - 10 * 60_000).toISOString();
    const staleJobs = await list({ status: 'eq.processing', updated_at: 'lt.' + expired });
    for (const job of staleJobs) {
      await patch(
        'id=eq.' + encodeURIComponent(job.id) + '&status=eq.processing&attempt_count=eq.' + job.attempt_count,
        { status: job.attempt_count >= job.max_attempts ? 'failed' : 'pending',
          last_error: 'Previous send interrupted; recovered after processing lease expired' }
      );
    }

    const jobs = await list({
      status: 'eq.pending',
      next_attempt_at: 'lte.' + new Date().toISOString(),
    });
    for (const job of jobs) {
      if (job.attempt_count >= job.max_attempts) {
        await patch('id=eq.' + encodeURIComponent(job.id) + '&status=eq.pending', {
          status: 'failed', last_error: 'Maximum email attempts reached',
        });
        continue;
      }
      // Match the actual Supabase CHECK constraint: processing, NOT sending.
      const claimed = await patch(
        'id=eq.' + encodeURIComponent(job.id) + '&status=eq.pending&attempt_count=eq.' + job.attempt_count +
        '&next_attempt_at=lte.' + encodeURIComponent(new Date().toISOString()),
        { status: 'processing', attempt_count: job.attempt_count + 1 }
      );
      if (claimed.length !== 1) continue;
      try {
        const recipient = job.recipient_email.trim().toLowerCase();
        if (!AUTHORIZED_RECIPIENTS.has(recipient)) {
          throw new Error('Refusing notification to an unauthorized recipient');
        }
        const quote = job.payload?.quote || {};
        const lines = Object.entries(quote).map(([name, value]) =>
          name + ': ' + (typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''))
        );
        const body = [
          'New Momentum freight quote',
          'Reference: ' + (job.payload?.reference_number || ''),
          ...lines,
        ].join('\n');
        const sent = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
            'Content-Type': 'application/json',
            'Idempotency-Key': 'momentum-quote-' + job.id,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [recipient],
            subject: job.subject,
            text: body,
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!sent.ok) {
          const errorText = await sent.text().catch(() => '');
          throw new Error('Resend HTTP ' + sent.status + ': ' + errorText.slice(0, 120));
        }
        const response = await sent.json() as { id?: string };
        if (!response.id) throw new Error('Resend did not return a message ID');
        await patch('id=eq.' + encodeURIComponent(job.id) + '&status=eq.processing', {
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider_message_id: response.id,
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
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn('[Momentum] Supabase quote email delivery disabled: Resend not configured');
    return;
  }
  const dispatch = () => void dispatchSupabaseOutboxOnce()
    .catch(error => console.error('[Momentum] Supabase email worker:', error));
  const interval = setInterval(dispatch, 30_000);
  interval.unref?.();
  dispatch();
}
