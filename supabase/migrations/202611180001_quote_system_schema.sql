-- =============================================================================
-- MOMENTUM TRANSPORTATION & HAULING LLC
-- Supabase Persistence Migration: Freight Quote Requests & Durable Email Outbox
-- =============================================================================

create extension if not exists pgcrypto;

-- 1. Quote Requests Table
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  idempotency_key text not null unique,

  -- Customer Contact
  customer_name text not null,
  company_name text not null default '',
  email text not null,
  phone text not null,
  preferred_contact_method text not null default 'either'
    check (preferred_contact_method in ('email', 'phone', 'either')),

  -- Service & Route
  service_category text not null,
  pickup_location text not null,
  delivery_location text not null,
  pickup_date date not null,
  delivery_date date null,
  urgency text not null default 'standard'
    check (urgency in ('standard', 'expedited', 'same_day', 'scheduled_contract')),

  -- Cargo & Specifications
  cargo_type text not null,
  load_description text not null,
  estimated_weight_lbs integer not null check (estimated_weight_lbs between 1 and 250000),
  dimensions text not null default '',
  pallet_count_or_equipment text not null default '',
  loading_requirements text not null default 'dock_to_dock',

  -- Declarations & Handling
  is_oversized boolean not null default false,
  is_hazmat boolean not null default false,
  hazmat_details text not null default '',
  special_handling text not null default '',

  -- Service-Specific Details (dry van, flatbed, cargo van, heavy haul)
  service_details jsonb not null default '{}'::jsonb,

  -- Consent & Retention Metadata
  consent_granted boolean not null default false check (consent_granted = true),
  consent_timestamp timestamptz not null default now(),
  request_ip_hash text null,
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewed', 'quoted', 'archived')),
  retention_expires_at timestamptz not null default (now() + interval '365 days'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quote_requests_created_at
  on public.quote_requests (created_at desc);

create index if not exists idx_quote_requests_retention
  on public.quote_requests (retention_expires_at);

-- 2. Durable Email Outbox Table
create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  reference_number text not null,
  notification_type text not null default 'quote_notification',

  recipient_email text not null,
  reply_to_email text not null,
  sender_email text not null,
  subject text not null,
  html_body text not null,
  text_body text not null,

  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'retrying', 'failed')),
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  next_retry_at timestamptz not null default now(),
  locked_at timestamptz null,

  provider text null,
  provider_message_id text null,
  last_error text null,
  sent_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Prevents duplicate notification creation/sends for the same quote
  constraint uq_email_outbox_quote_notification unique (quote_request_id, notification_type)
);

create index if not exists idx_email_outbox_pending_retry
  on public.email_outbox (status, next_retry_at)
  where status in ('pending', 'retrying');

-- 3. Append-Only Email Delivery Events Table
create table if not exists public.email_delivery_events (
  id uuid primary key default gen_random_uuid(),
  outbox_id uuid not null references public.email_outbox(id) on delete cascade,
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  attempt_number integer not null,
  event_type text not null
    check (event_type in ('queued', 'attempt_started', 'delivered', 'retry_scheduled', 'permanent_failure', 'duplicate_prevented')),
  provider text null,
  provider_message_id text null,
  error_message text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_delivery_events_outbox
  on public.email_delivery_events (outbox_id, created_at desc);

-- 4. Updated-At Maintenance Trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_quote_requests_updated_at on public.quote_requests;
create trigger trg_quote_requests_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

drop trigger if exists trg_email_outbox_updated_at on public.email_outbox;
create trigger trg_email_outbox_updated_at
  before update on public.email_outbox
  for each row execute function public.set_updated_at();

-- 5. Least-Privilege Row Level Security (RLS)
-- Public / anonymous browser keys CANNOT read, insert, update, or delete any table.
-- Only the server backend using SUPABASE_SERVICE_ROLE_KEY may access these tables.
alter table public.quote_requests enable row level security;
alter table public.email_outbox enable row level security;
alter table public.email_delivery_events enable row level security;

revoke all on table public.quote_requests from anon, authenticated, public;
revoke all on table public.email_outbox from anon, authenticated, public;
revoke all on table public.email_delivery_events from anon, authenticated, public;

-- 6. Retention Control Function (can be invoked by pg_cron or scheduled admin job)
create or replace function public.purge_expired_quote_records()
returns integer
language plpgsql
security definer
as $$
declare
  deleted_count integer;
begin
  delete from public.quote_requests
  where retention_expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
