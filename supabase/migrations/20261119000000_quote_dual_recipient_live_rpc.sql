-- Momentum live Supabase quote schema migration (2026-11-19).
-- REQUIRED BEFORE deploying the updated per-recipient worker.
-- Applies to the live RPC-backed schema: quote_requests + email_outbox(message_type).
-- Does not send historical quotes. Preserves all existing records and outbox IDs.
begin;

alter table public.email_outbox
  drop constraint if exists email_outbox_quote_request_id_message_type_key;

alter table public.email_outbox
  add constraint email_outbox_quote_type_recipient_key
  unique (quote_request_id, message_type, recipient_email);

-- The former default silently sent notifications to a legacy single recipient.
alter table public.email_outbox alter column recipient_email drop default;

create or replace function public.submit_quote_request(p_quote jsonb, p_key text)
returns table(reference_number text, quote_id uuid, created boolean)
language plpgsql
set search_path to ''
as $function$
declare
  v_quote public.quote_requests%rowtype;
  v_created boolean := false;
  v_hash text;
begin
  if p_key is null or length(p_key) < 16 or length(p_key) > 128
     or p_quote is null or jsonb_typeof(p_quote) <> 'object' then
    raise exception 'INVALID_QUOTE_REQUEST' using errcode = '22023';
  end if;
  v_hash := md5(p_quote::text);

  insert into public.quote_requests (
    idempotency_key, request_hash, customer_name, company_name, email, phone,
    service_type, pickup_location, delivery_location, pickup_date, delivery_date,
    freight_description, freight_weight_lbs, dimensions,
    special_requirements, additional_details, source
  )
  values (
    p_key, v_hash, p_quote->>'customer_name', p_quote->>'company_name',
    p_quote->>'email', p_quote->>'phone', p_quote->>'service_type',
    p_quote->>'pickup_location', p_quote->>'delivery_location',
    nullif(p_quote->>'pickup_date', '')::date,
    nullif(p_quote->>'delivery_date', '')::date,
    p_quote->>'freight_description',
    nullif(p_quote->>'freight_weight_lbs', '')::numeric,
    p_quote->>'dimensions', p_quote->>'special_requirements',
    coalesce(p_quote->'additional_details', '{}'::jsonb), 'website'
  )
  on conflict (idempotency_key) do nothing
  returning * into v_quote;
  if found then
    v_created := true;
  else
    select * into v_quote from public.quote_requests q
    where q.idempotency_key = p_key;
    if not found or v_quote.request_hash is distinct from v_hash then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = '23505';
    end if;
  end if;

  -- One durable, independently retryable notification for EACH official inbox.
  insert into public.email_outbox (
    quote_request_id, recipient_email, subject, payload, status
  )
  select
    v_quote.id, recipient.address,
    '[MOMENTUM] New Freight Quotation Request — ' || v_quote.reference_number,
    jsonb_build_object('reference_number', v_quote.reference_number, 'quote', p_quote),
    'pending'
  from (values
    ('wright.wendell@icloud.com'),
    ('info@momentumtransporthauling.com')
  ) as recipient(address)
  on conflict (quote_request_id, message_type, recipient_email) do nothing;

  return query select v_quote.reference_number, v_quote.id, v_created;
end
$function$;

-- Keep the RPC accessible only to trusted server-side roles.
revoke all on function public.submit_quote_request(jsonb, text) from public, anon, authenticated;
grant execute on function public.submit_quote_request(jsonb, text) to service_role;
commit;
