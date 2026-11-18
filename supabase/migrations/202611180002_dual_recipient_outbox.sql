-- =============================================================================
-- MOMENTUM TRANSPORTATION & HAULING LLC
-- Additive Migration: Dual-Recipient Email Outbox & submit_quote_request RPC
-- Preserves existing quote data, idempotency, and least-privilege RLS.
-- =============================================================================

-- 1. Ensure email_outbox supports per-recipient rows and worker payload columns
alter table public.email_outbox
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists next_attempt_at timestamptz not null default now();

alter table public.email_outbox
  alter column reply_to_email set default '',
  alter column sender_email set default 'Momentum Dispatch <quotes@momentumtransporthauling.com>',
  alter column html_body set default '',
  alter column text_body set default '';

-- Drop old single-recipient constraint and replace with per-recipient uniqueness
alter table public.email_outbox
  drop constraint if exists uq_email_outbox_quote_notification;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'uq_email_outbox_quote_notification_recipient'
  ) then
    alter table public.email_outbox
      add constraint uq_email_outbox_quote_notification_recipient
      unique (quote_request_id, notification_type, recipient_email);
  end if;
end $$;

create index if not exists idx_email_outbox_worker_pending
  on public.email_outbox (status, next_attempt_at)
  where status = 'pending';

-- 2. Dual-recipient atomic quote submission RPC
-- Creates 1 quote_requests row and 2 independent email_outbox rows:
--   1) wright.wendell@icloud.com (Dispatch & Operations)
--   2) info@momentumtransporthauling.com (General Business Inquiries)
create or replace function public.submit_quote_request(
  p_quote jsonb,
  p_key text
)
returns table (
  reference_number text,
  quote_id uuid,
  created boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.quote_requests%rowtype;
  v_quote_id uuid;
  v_ref text;
  v_additional jsonb;
  v_pickup_date date;
  v_delivery_date date;
  v_weight integer;
  v_recipient text;
  v_outbox_id uuid;
  v_recipients constant text[] := array[
    'wright.wendell@icloud.com',
    'info@momentumtransporthauling.com'
  ];
  v_subject text;
  v_sender text;
  v_customer_email text;
begin
  if coalesce(trim(p_key), '') = '' then
    raise exception 'Idempotency key is required';
  end if;

  select *
  into v_existing
  from public.quote_requests q
  where q.idempotency_key = p_key
  limit 1;

  if found then
    return query select v_existing.reference_number, v_existing.id, false;
    return;
  end if;

  v_additional := coalesce(p_quote -> 'additional_details', p_quote);
  v_customer_email := lower(trim(coalesce(p_quote ->> 'email', v_additional ->> 'email', '')));
  v_pickup_date := coalesce(nullif(trim(p_quote ->> 'pickup_date'), '')::date, current_date + 1);
  v_delivery_date := nullif(trim(coalesce(p_quote ->> 'delivery_date', '')), '')::date;
  v_weight := greatest(1, least(250000, coalesce(nullif(p_quote ->> 'freight_weight_lbs', '')::integer, 15000)));
  v_ref := 'MTH-Q-' || extract(year from now())::integer::text || '-' || upper(substring(encode(gen_random_bytes(3), 'hex') from 1 for 6));

  insert into public.quote_requests (
    reference_number,
    idempotency_key,
    customer_name,
    company_name,
    email,
    phone,
    preferred_contact_method,
    service_category,
    pickup_location,
    delivery_location,
    pickup_date,
    delivery_date,
    urgency,
    cargo_type,
    load_description,
    estimated_weight_lbs,
    dimensions,
    pallet_count_or_equipment,
    loading_requirements,
    is_oversized,
    is_hazmat,
    hazmat_details,
    special_handling,
    service_details,
    consent_granted,
    status
  )
  values (
    v_ref,
    p_key,
    coalesce(p_quote ->> 'customer_name', v_additional ->> 'customerName', 'Customer'),
    coalesce(p_quote ->> 'company_name', v_additional ->> 'companyName', ''),
    v_customer_email,
    coalesce(p_quote ->> 'phone', v_additional ->> 'phone', ''),
    coalesce(v_additional ->> 'preferredContactMethod', 'either'),
    coalesce(p_quote ->> 'service_type', v_additional ->> 'serviceCategory', 'dry_van'),
    coalesce(p_quote ->> 'pickup_location', v_additional ->> 'pickupLocation', ''),
    coalesce(p_quote ->> 'delivery_location', v_additional ->> 'deliveryLocation', ''),
    v_pickup_date,
    v_delivery_date,
    coalesce(v_additional ->> 'urgency', 'standard'),
    coalesce(v_additional ->> 'cargoType', 'Commercial Freight'),
    coalesce(p_quote ->> 'freight_description', v_additional ->> 'loadDescription', ''),
    v_weight,
    coalesce(p_quote ->> 'dimensions', v_additional ->> 'dimensions', ''),
    coalesce(v_additional ->> 'palletCountOrEquipment', ''),
    coalesce(v_additional ->> 'loadingRequirements', 'dock_to_dock'),
    coalesce((v_additional ->> 'isOversized')::boolean, false),
    coalesce((v_additional ->> 'isHazmat')::boolean, false),
    coalesce(v_additional ->> 'hazmatDetails', ''),
    coalesce(p_quote ->> 'special_requirements', v_additional ->> 'specialHandling', ''),
    coalesce(v_additional -> 'serviceDetails', '{}'::jsonb),
    true,
    'submitted'
  )
  returning id into v_quote_id;

  v_subject := '[MOMENTUM QUOTE] ' || v_ref || ' — '
    || coalesce(p_quote ->> 'pickup_location', '') || ' to '
    || coalesce(p_quote ->> 'delivery_location', '');
  v_sender := 'Momentum Dispatch <quotes@momentumtransporthauling.com>';

  foreach v_recipient in array v_recipients loop
    insert into public.email_outbox (
      quote_request_id,
      reference_number,
      notification_type,
      recipient_email,
      reply_to_email,
      sender_email,
      subject,
      html_body,
      text_body,
      payload,
      status,
      attempt_count,
      max_attempts,
      next_attempt_at,
      next_retry_at
    )
    values (
      v_quote_id,
      v_ref,
      'quote_notification',
      v_recipient,
      v_customer_email,
      v_sender,
      v_subject,
      coalesce(p_quote ->> 'html_body', ''),
      coalesce(p_quote ->> 'text_body', ''),
      jsonb_build_object(
        'reference_number', v_ref,
        'quote', p_quote
      ),
      'pending',
      0,
      5,
      now(),
      now()
    )
    returning id into v_outbox_id;

    insert into public.email_delivery_events (
      outbox_id,
      quote_request_id,
      attempt_number,
      event_type,
      metadata
    )
    values (
      v_outbox_id,
      v_quote_id,
      0,
      'queued',
      jsonb_build_object(
        'referenceNumber', v_ref,
        'recipientEmail', v_recipient
      )
    );
  end loop;

  return query select v_ref, v_quote_id, true;
end;
$$;

revoke all on function public.submit_quote_request(jsonb, text) from anon, authenticated, public;
grant execute on function public.submit_quote_request(jsonb, text) to service_role;
