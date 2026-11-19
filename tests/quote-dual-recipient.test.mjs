import assert from 'node:assert/strict';
import test from 'node:test';
import { dispatchSupabaseOutboxOnce } from '../server/supabaseEmailWorker.ts';
import fs from 'node:fs';
import { supabaseAuthHeaders, supabaseErrorStatus } from '../server/supabaseRest.ts';

test('Supabase REST authentication selects headers by key type and retains only diagnostic codes', async () => {
  assert.deepEqual(supabaseAuthHeaders('sb_secret_example'), { apikey: 'sb_secret_example' });
  assert.deepEqual(supabaseAuthHeaders('eyJ.example.jwt'), {
    apikey: 'eyJ.example.jwt',
    Authorization: 'Bearer eyJ.example.jwt',
  });
  const error = Response.json({ code: 'PGRST204', message: 'Private row data' }, { status: 400 });
  assert.equal(await supabaseErrorStatus(error), 'HTTP 400 (PGRST204)');
});

const first = 'wright.wendell@icloud.com';
const second = 'info@momentumtransporthauling.com';
const sql = fs.readFileSync(new URL('../supabase/migrations/20261119000000_quote_dual_recipient_live_rpc.sql', import.meta.url), 'utf8');

test('SQL migration requires separate durable rows for both inboxes', () => {
  assert.match(sql, /unique\s*\(quote_request_id, message_type, recipient_email\)/i);
  assert.match(sql, /on conflict \(quote_request_id, message_type, recipient_email\) do nothing/i);
  assert.ok(sql.includes(first));
  assert.ok(sql.includes(second));
  assert.match(sql, /revoke all on function public\.submit_quote_request/i);
});

test('Resend dispatcher sends independently, retries one inbox, and does not duplicate the other', async () => {
  const oldFetch = globalThis.fetch;
  const oldEnv = Object.fromEntries(['RESEND_API_KEY', 'EMAIL_FROM', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY'].map(k => [k, process.env[k]]));
  process.env.RESEND_API_KEY = 'test-key';
  process.env.EMAIL_FROM = 'Momentum Dispatch <quotes@momentumtransporthauling.com>';
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_test-key';
  const queue = [
    { id: 'id-w', recipient_email: first, status: 'pending', subject: 'New quote', payload: { reference_number: 'TEST-001', quote: { customer_name: 'Sample Customer', pickup_location: 'SC' } }, attempt_count: 0, max_attempts: 5, next_attempt_at: '2000-01-01T00:00:00Z', updated_at: '2026-11-19T00:00:00Z', created_at: '2026-11-19T00:00:00Z' },
    { id: 'id-i', recipient_email: second, status: 'pending', subject: 'New quote', payload: { reference_number: 'TEST-001', quote: { customer_name: 'Sample Customer' } }, attempt_count: 0, max_attempts: 5, next_attempt_at: '2000-01-01T00:00:00Z', updated_at: '2026-11-19T00:00:00Z', created_at: '2026-11-19T00:00:00Z' },
  ];
  const sends = [];
  let failSecondOnce = true;
  const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
  globalThis.fetch = async (target, options = {}) => {
    const uri = new URL(String(target));
    if (uri.hostname === 'api.resend.com') {
      const request = JSON.parse(options.body);
      sends.push({ to: request.to, key: options.headers['Idempotency-Key'], text: request.text });
      if (request.to[0] === second && failSecondOnce) {
        failSecondOnce = false;
        return response({ message: 'Temporary provider throttling' }, 429);
      }
      return response({ id: 'resend-' + request.to[0] });
    }
    assert.equal(uri.pathname, '/rest/v1/email_outbox');
    assert.equal(options.headers.apikey, 'sb_secret_test-key');
    assert.equal(options.headers.Authorization, undefined);
    const matches = (job) => {
      for (const [field, expression] of uri.searchParams) {
        if (['select', 'order', 'limit'].includes(field)) continue;
        const [op, ...rest] = expression.split('.');
        const value = rest.join('.');
        if (op === 'eq' && String(job[field]) !== value) return false;
        if (op === 'lte' && !(new Date(job[field]) <= new Date(value))) return false;
        if (op === 'lt' && !(new Date(job[field]) < new Date(value))) return false;
      }
      return true;
    };
    const matching = queue.filter(matches);
    if (options.method === 'PATCH') {
      const changes = JSON.parse(options.body);
      for (const job of matching) Object.assign(job, changes);
      return response(matching);
    }
    assert.equal(options.method, undefined);
    return response(matching);
  };
  try {
    await dispatchSupabaseOutboxOnce();
    assert.equal(queue[0].status, 'sent');
    assert.equal(queue[1].status, 'pending');
    assert.equal(queue[0].provider_message_id, 'resend-' + first);
    assert.equal(queue[1].attempt_count, 1);
    assert.deepEqual(sends.map(s => s.to), [[first], [second]]);
    assert.equal(sends[0].text.includes('Sample Customer'), true);
    assert.notEqual(sends[0].key, sends[1].key);

    // Simulate the retry schedule becoming due.
    queue[1].next_attempt_at = '2000-01-01T00:00:00Z';
    await dispatchSupabaseOutboxOnce();
    assert.equal(queue[1].status, 'sent');
    assert.equal(queue[1].provider_message_id, 'resend-' + second);
    assert.equal(queue[0].attempt_count, 1);
    assert.equal(queue[1].attempt_count, 2);
    assert.equal(sends.length, 3);
    assert.equal(sends[1].key, sends[2].key);
  } finally {
    globalThis.fetch = oldFetch;
    for (const [name, value] of Object.entries(oldEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
