type OutboxJob = {
  id: string;
  recipient_email: string;
  subject: string;
  payload: { reference_number?: string; quote?: Record<string, unknown> };
  attempt_count: number;
  max_attempts: number;
};
const url = () => (process.env.SUPABASE_URL || '').replace(/\/$/, '') + '/rest/v1/email_outbox';
const key = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const headers = () => ({
  apikey: key(), Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json',
  Prefer: 'return=representation',
});
let running = false;
async function patch(query: string, changes: Record<string, unknown>): Promise<OutboxJob[]> {
  const res = await fetch(url() + '?' + query, {
    method: 'PATCH', headers: headers(), body: JSON.stringify(changes),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error('Supabase outbox update failed: HTTP ' + res.status);
  return await res.json() as OutboxJob[];
}
export async function dispatchSupabaseOutboxOnce(): Promise<void> {
  if (running || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM ||
      !process.env.SUPABASE_URL || !key()) return;
  running = true;
  try {
    // Recover an interrupted job only after its claim lease has expired.
    // Resend uses the same idempotency key on retry.
    const stale = new Date(Date.now() - 10 * 60_000).toISOString();
    await patch('status=eq.sending&updated_at=lt.' + encodeURIComponent(stale), { status: 'pending' });
    const due = new URL(url());
    due.searchParams.set('select', 'id,recipient_email,subject,payload,attempt_count,max_attempts');
    due.searchParams.set('status', 'eq.pending');
    due.searchParams.set('next_attempt_at', 'lte.' + new Date().toISOString());
    due.searchParams.set('order', 'created_at.asc');
    due.searchParams.set('limit', '10');
    const res = await fetch(due, { headers: headers(), signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error('Supabase outbox read failed: HTTP ' + res.status);
    const jobs = await res.json() as OutboxJob[];
    for (const job of jobs) {
      // Conditional update ensures only one worker instance claims a pending row.
      const claimed = await patch(
        'id=eq.' + encodeURIComponent(job.id) + '&status=eq.pending&attempt_count=eq.' + job.attempt_count,
        { status: 'sending', attempt_count: job.attempt_count + 1 }
      );
      if (claimed.length !== 1) continue;
      try {
        const quote = job.payload?.quote || {};
        const lines = Object.entries(quote).map(([name, value]) =>
          name + ': ' + (typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''))
        );
        const body = ['New Momentum freight quote', 'Reference: ' + (job.payload?.reference_number || ''), ...lines].join('\n');
        const sent = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
            'Content-Type': 'application/json',
            'Idempotency-Key': 'momentum-quote-' + job.id,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [job.recipient_email],
            subject: job.subject,
            text: body,
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!sent.ok) throw new Error('Resend HTTP ' + sent.status);
        const response = await sent.json() as { id?: string };
        await patch('id=eq.' + encodeURIComponent(job.id) + '&status=eq.sending', {
          status: 'sent', sent_at: new Date().toISOString(), provider_message_id: response.id || null,
          last_error: null,
        });
      } catch (error) {
        const attempts = job.attempt_count + 1;
        const final = attempts >= job.max_attempts;
        await patch('id=eq.' + encodeURIComponent(job.id) + '&status=eq.sending', {
          status: final ? 'failed' : 'pending',
          last_error: String(error).slice(0, 400),
          next_attempt_at: new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000).toISOString(),
        });
      }
    }
  } finally { running = false; }
}
export function startSupabaseOutboxWorker(): void {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn('[Momentum] Supabase quote email delivery disabled: Resend not configured');
    return;
  }
  const interval = setInterval(() => {
    void dispatchSupabaseOutboxOnce().catch(e => console.error('[Momentum] Supabase email worker:', e));
  }, 30_000);
  interval.unref?.();
  void dispatchSupabaseOutboxOnce().catch(e => console.error('[Momentum] Supabase email worker:', e));
}
