import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { NormalizedQuoteSubmission } from '../src/shared/quoteSchema.ts';

export interface StoredQuoteRequest {
  id: string;
  reference_number: string;
  idempotency_key: string;
  customer_name: string;
  company_name: string;
  email: string;
  phone: string;
  preferred_contact_method: 'email' | 'phone' | 'either';
  service_category: string;
  pickup_location: string;
  delivery_location: string;
  pickup_date: string;
  delivery_date: string | null;
  urgency: 'standard' | 'expedited' | 'same_day' | 'scheduled_contract';
  cargo_type: string;
  load_description: string;
  estimated_weight_lbs: number;
  dimensions: string;
  pallet_count_or_equipment: string;
  loading_requirements: string;
  is_oversized: boolean;
  is_hazmat: boolean;
  hazmat_details: string;
  special_handling: string;
  service_details: Record<string, unknown>;
  consent_granted: boolean;
  consent_timestamp: string;
  request_ip_hash: string | null;
  status: 'submitted' | 'reviewed' | 'quoted' | 'archived';
  retention_expires_at: string;
  created_at: string;
  updated_at: string;
}

export type OutboxStatus = 'pending' | 'sending' | 'sent' | 'retrying' | 'failed';

export interface StoredEmailOutbox {
  id: string;
  quote_request_id: string;
  reference_number: string;
  notification_type: string;
  recipient_email: string;
  reply_to_email: string;
  sender_email: string;
  subject: string;
  html_body: string;
  text_body: string;
  status: OutboxStatus;
  attempt_count: number;
  max_attempts: number;
  next_retry_at: string;
  locked_at: string | null;
  provider: string | null;
  provider_message_id: string | null;
  last_error: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DeliveryEventType =
  | 'queued'
  | 'attempt_started'
  | 'delivered'
  | 'retry_scheduled'
  | 'permanent_failure'
  | 'duplicate_prevented';

export interface StoredDeliveryEvent {
  id: string;
  outbox_id: string;
  quote_request_id: string;
  attempt_number: number;
  event_type: DeliveryEventType;
  provider: string | null;
  provider_message_id: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface LocalStoreState {
  quote_requests: StoredQuoteRequest[];
  email_outbox: StoredEmailOutbox[];
  email_delivery_events: StoredDeliveryEvent[];
}

export type PersistenceBackend = 'supabase' | 'local_durable_file';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export function getPersistenceBackend(): PersistenceBackend {
  return isSupabaseConfigured() ? 'supabase' : 'local_durable_file';
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'momentum-store.json');

function ensureLocalStore(): LocalStoreState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_STORE_FILE)) {
    const initial: LocalStoreState = {
      quote_requests: [],
      email_outbox: [],
      email_delivery_events: [],
    };
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<LocalStoreState>;
    return {
      quote_requests: Array.isArray(parsed.quote_requests) ? parsed.quote_requests : [],
      email_outbox: Array.isArray(parsed.email_outbox) ? parsed.email_outbox : [],
      email_delivery_events: Array.isArray(parsed.email_delivery_events) ? parsed.email_delivery_events : [],
    };
  } catch {
    return { quote_requests: [], email_outbox: [], email_delivery_events: [] };
  }
}

function writeLocalStore(state: LocalStoreState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${LOCAL_STORE_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tmpFile, LOCAL_STORE_FILE);
}

async function supabaseFetch<T>(
  tablePath: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SUPABASE_URL}/rest/v1/${tablePath}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    throw new Error(`Supabase REST error (${res.status}): ${bodyText || res.statusText}`);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export function hashClientIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'momentum-quote-salt';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

export function generateQuoteReference(): string {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MTH-Q-${year}-${suffix}`;
}

export async function findQuoteByIdempotencyKey(
  idempotencyKey: string
): Promise<{ quote: StoredQuoteRequest; outbox: StoredEmailOutbox | null } | null> {
  if (!idempotencyKey) return null;

  if (isSupabaseConfigured()) {
    const rows = await supabaseFetch<StoredQuoteRequest[]>(
      `quote_requests?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&limit=1`
    );
    const quote = rows[0];
    if (!quote) return null;
    const outboxRows = await supabaseFetch<StoredEmailOutbox[]>(
      `email_outbox?quote_request_id=eq.${encodeURIComponent(quote.id)}&limit=1`
    );
    return { quote, outbox: outboxRows[0] || null };
  }

  const state = ensureLocalStore();
  const quote = state.quote_requests.find((q) => q.idempotency_key === idempotencyKey);
  if (!quote) return null;
  const outbox = state.email_outbox.find((o) => o.quote_request_id === quote.id) || null;
  return { quote, outbox };
}

export async function createQuoteAndOutbox(params: {
  input: NormalizedQuoteSubmission;
  referenceNumber: string;
  idempotencyKey: string;
  ipHash: string | null;
  emailPayload: {
    recipientEmail: string;
    replyToEmail: string;
    senderEmail: string;
    subject: string;
    htmlBody: string;
    textBody: string;
  };
}): Promise<{ quote: StoredQuoteRequest; outbox: StoredEmailOutbox }> {
  const now = new Date();
  const nowIso = now.toISOString();
  const retentionIso = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const quoteRecord: Omit<StoredQuoteRequest, 'id'> = {
    reference_number: params.referenceNumber,
    idempotency_key: params.idempotencyKey,
    customer_name: params.input.customerName,
    company_name: params.input.companyName,
    email: params.input.email,
    phone: params.input.phone,
    preferred_contact_method: params.input.preferredContactMethod,
    service_category: params.input.serviceCategory,
    pickup_location: params.input.pickupLocation,
    delivery_location: params.input.deliveryLocation,
    pickup_date: params.input.pickupDate,
    delivery_date: params.input.deliveryDate || null,
    urgency: params.input.urgency,
    cargo_type: params.input.cargoType,
    load_description: params.input.loadDescription,
    estimated_weight_lbs: params.input.estimatedWeightLbs,
    dimensions: params.input.dimensions,
    pallet_count_or_equipment: params.input.palletCountOrEquipment,
    loading_requirements: params.input.loadingRequirements,
    is_oversized: params.input.isOversized,
    is_hazmat: params.input.isHazmat,
    hazmat_details: params.input.hazmatDetails,
    special_handling: params.input.specialHandling,
    service_details: params.input.serviceDetails as Record<string, unknown>,
    consent_granted: true,
    consent_timestamp: nowIso,
    request_ip_hash: params.ipHash,
    status: 'submitted',
    retention_expires_at: retentionIso,
    created_at: nowIso,
    updated_at: nowIso,
  };

  if (isSupabaseConfigured()) {
    const insertedQuotes = await supabaseFetch<StoredQuoteRequest[]>('quote_requests', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(quoteRecord),
    });
    const quote = insertedQuotes[0];
    if (!quote) {
      throw new Error('Failed to persist quote request to Supabase.');
    }

    const outboxInsert = {
      quote_request_id: quote.id,
      reference_number: quote.reference_number,
      notification_type: 'quote_notification',
      recipient_email: params.emailPayload.recipientEmail,
      reply_to_email: params.emailPayload.replyToEmail,
      sender_email: params.emailPayload.senderEmail,
      subject: params.emailPayload.subject,
      html_body: params.emailPayload.htmlBody,
      text_body: params.emailPayload.textBody,
      status: 'pending',
      attempt_count: 0,
      max_attempts: 5,
      next_retry_at: nowIso,
    };

    const insertedOutbox = await supabaseFetch<StoredEmailOutbox[]>('email_outbox', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(outboxInsert),
    });
    const outbox = insertedOutbox[0];
    if (!outbox) {
      throw new Error('Failed to persist email outbox record to Supabase.');
    }

    await recordDeliveryEvent({
      outboxId: outbox.id,
      quoteRequestId: quote.id,
      attemptNumber: 0,
      eventType: 'queued',
      metadata: { referenceNumber: quote.reference_number },
    });

    return { quote, outbox };
  }

  // Local durable JSON store fallback
  const state = ensureLocalStore();
  const quote: StoredQuoteRequest = {
    id: crypto.randomUUID(),
    ...quoteRecord,
  };
  const outbox: StoredEmailOutbox = {
    id: crypto.randomUUID(),
    quote_request_id: quote.id,
    reference_number: quote.reference_number,
    notification_type: 'quote_notification',
    recipient_email: params.emailPayload.recipientEmail,
    reply_to_email: params.emailPayload.replyToEmail,
    sender_email: params.emailPayload.senderEmail,
    subject: params.emailPayload.subject,
    html_body: params.emailPayload.htmlBody,
    text_body: params.emailPayload.textBody,
    status: 'pending',
    attempt_count: 0,
    max_attempts: 5,
    next_retry_at: nowIso,
    locked_at: null,
    provider: null,
    provider_message_id: null,
    last_error: null,
    sent_at: null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const event: StoredDeliveryEvent = {
    id: crypto.randomUUID(),
    outbox_id: outbox.id,
    quote_request_id: quote.id,
    attempt_number: 0,
    event_type: 'queued',
    provider: null,
    provider_message_id: null,
    error_message: null,
    metadata: { referenceNumber: quote.reference_number },
    created_at: nowIso,
  };

  state.quote_requests.unshift(quote);
  state.email_outbox.unshift(outbox);
  state.email_delivery_events.unshift(event);
  writeLocalStore(state);

  return { quote, outbox };
}

export async function recordDeliveryEvent(params: {
  outboxId: string;
  quoteRequestId: string;
  attemptNumber: number;
  eventType: DeliveryEventType;
  provider?: string | null;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured()) {
    await supabaseFetch('email_delivery_events', {
      method: 'POST',
      body: JSON.stringify({
        outbox_id: params.outboxId,
        quote_request_id: params.quoteRequestId,
        attempt_number: params.attemptNumber,
        event_type: params.eventType,
        provider: params.provider || null,
        provider_message_id: params.providerMessageId || null,
        error_message: params.errorMessage || null,
        metadata: params.metadata || {},
        created_at: nowIso,
      }),
    });
    return;
  }

  const state = ensureLocalStore();
  state.email_delivery_events.unshift({
    id: crypto.randomUUID(),
    outbox_id: params.outboxId,
    quote_request_id: params.quoteRequestId,
    attempt_number: params.attemptNumber,
    event_type: params.eventType,
    provider: params.provider || null,
    provider_message_id: params.providerMessageId || null,
    error_message: params.errorMessage || null,
    metadata: params.metadata || {},
    created_at: nowIso,
  });
  if (state.email_delivery_events.length > 2000) {
    state.email_delivery_events.length = 2000;
  }
  writeLocalStore(state);
}

export async function claimOutboxJobForSending(outboxId: string): Promise<StoredEmailOutbox | null> {
  const now = new Date();
  const nowIso = now.toISOString();
  const staleLockCutoff = new Date(now.getTime() - 2 * 60 * 1000).toISOString();

  if (isSupabaseConfigured()) {
    const rows = await supabaseFetch<StoredEmailOutbox[]>(
      `email_outbox?id=eq.${encodeURIComponent(outboxId)}&limit=1`
    );
    const job = rows[0];
    if (!job) return null;
    if (job.status === 'sent' || job.status === 'failed') return null;
    if (job.status === 'sending' && job.locked_at && job.locked_at > staleLockCutoff) {
      return null;
    }

    const updated = await supabaseFetch<StoredEmailOutbox[]>(
      `email_outbox?id=eq.${encodeURIComponent(outboxId)}&status=in.(pending,retrying,sending)`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          status: 'sending',
          locked_at: nowIso,
          updated_at: nowIso,
        }),
      }
    );
    return updated[0] || null;
  }

  const state = ensureLocalStore();
  const job = state.email_outbox.find((o) => o.id === outboxId);
  if (!job) return null;
  if (job.status === 'sent' || job.status === 'failed') return null;
  if (job.status === 'sending' && job.locked_at && job.locked_at > staleLockCutoff) {
    return null;
  }

  job.status = 'sending';
  job.locked_at = nowIso;
  job.updated_at = nowIso;
  writeLocalStore(state);
  return { ...job };
}

export async function updateOutboxJobResult(
  outboxId: string,
  patch: Partial<StoredEmailOutbox>
): Promise<StoredEmailOutbox | null> {
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const updated = await supabaseFetch<StoredEmailOutbox[]>(
      `email_outbox?id=eq.${encodeURIComponent(outboxId)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          ...patch,
          updated_at: nowIso,
        }),
      }
    );
    return updated[0] || null;
  }

  const state = ensureLocalStore();
  const idx = state.email_outbox.findIndex((o) => o.id === outboxId);
  if (idx === -1) return null;
  state.email_outbox[idx] = {
    ...state.email_outbox[idx],
    ...patch,
    updated_at: nowIso,
  };
  writeLocalStore(state);
  return { ...state.email_outbox[idx] };
}

export async function findDueOutboxJobs(limit = 10): Promise<StoredEmailOutbox[]> {
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured()) {
    return await supabaseFetch<StoredEmailOutbox[]>(
      `email_outbox?status=in.(pending,retrying)&next_retry_at=lte.${encodeURIComponent(nowIso)}&order=next_retry_at.asc&limit=${limit}`
    );
  }

  const state = ensureLocalStore();
  return state.email_outbox
    .filter(
      (o) =>
        (o.status === 'pending' || o.status === 'retrying') &&
        o.next_retry_at <= nowIso
    )
    .sort((a, b) => a.next_retry_at.localeCompare(b.next_retry_at))
    .slice(0, limit);
}

export async function listQuotesForAdmin(limit = 50): Promise<StoredQuoteRequest[]> {
  if (isSupabaseConfigured()) {
    return await supabaseFetch<StoredQuoteRequest[]>(
      `quote_requests?order=created_at.desc&limit=${limit}`
    );
  }
  const state = ensureLocalStore();
  return state.quote_requests.slice(0, limit);
}

export async function listOutboxForAdmin(limit = 50): Promise<StoredEmailOutbox[]> {
  if (isSupabaseConfigured()) {
    return await supabaseFetch<StoredEmailOutbox[]>(
      `email_outbox?order=created_at.desc&limit=${limit}`
    );
  }
  const state = ensureLocalStore();
  return state.email_outbox.slice(0, limit);
}

export async function purgeExpiredLocalRecords(): Promise<number> {
  if (isSupabaseConfigured()) {
    // Invokes security-definer retention RPC in Supabase if desired
    return 0;
  }
  const state = ensureLocalStore();
  const nowIso = new Date().toISOString();
  const expiredIds = new Set(
    state.quote_requests
      .filter((q) => q.retention_expires_at < nowIso)
      .map((q) => q.id)
  );
  if (expiredIds.size === 0) return 0;

  state.quote_requests = state.quote_requests.filter((q) => !expiredIds.has(q.id));
  state.email_outbox = state.email_outbox.filter((o) => !expiredIds.has(o.quote_request_id));
  state.email_delivery_events = state.email_delivery_events.filter(
    (e) => !expiredIds.has(e.quote_request_id)
  );
  writeLocalStore(state);
  return expiredIds.size;
}
