-- ============================================================
-- 08 · RPC públicas de reserva
-- ============================================================

create or replace function public.create_booking(
    p_business_id uuid,
    p_service_id uuid,
    p_professional_id uuid,
    p_starts_at timestamptz,
    p_customer jsonb,
    p_customer_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_business public.businesses%rowtype;
    v_service public.services%rowtype;
    v_full_name text;
    v_email text;
    v_phone text;
    v_notes text;
    v_customer_id uuid;
    v_professional_id uuid;
    v_booking public.bookings%rowtype;
    v_date date;
    v_status public.booking_status;
begin
    select *
      into v_business
      from public.businesses b
     where b.id = p_business_id
       and b.is_published;

    if not found then
        raise exception 'business_not_found' using errcode = 'P0001';
    end if;

    select *
      into v_service
      from public.services s
     where s.id = p_service_id
       and s.business_id = p_business_id
       and s.is_active;

    if not found then
        raise exception 'service_not_found' using errcode = 'P0001';
    end if;

    if p_customer is null or jsonb_typeof(p_customer) <> 'object' then
        raise exception 'invalid_name' using errcode = 'P0001';
    end if;

    v_full_name := btrim(coalesce(p_customer ->> 'full_name', ''));
    v_email := lower(btrim(coalesce(p_customer ->> 'email', '')));
    v_phone := nullif(btrim(coalesce(p_customer ->> 'phone', '')), '');
    v_notes := nullif(btrim(coalesce(p_customer_notes, '')), '');

    if char_length(v_full_name) < 2 or char_length(v_full_name) > 120 then
        raise exception 'invalid_name' using errcode = 'P0001';
    end if;

    if char_length(v_email) > 254
       or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
        raise exception 'invalid_email' using errcode = 'P0001';
    end if;

    if v_phone is not null and char_length(v_phone) > 40 then
        raise exception 'invalid_phone' using errcode = 'P0001';
    end if;

    if v_notes is not null and char_length(v_notes) > 500 then
        raise exception 'invalid_notes' using errcode = 'P0001';
    end if;

    if p_starts_at is null then
        raise exception 'slot_unavailable' using errcode = 'P0001';
    end if;

    if p_professional_id is not null
       and not exists (
            select 1
              from public.professionals p
             where p.id = p_professional_id
               and p.business_id = p_business_id
               and p.is_active
               and exists (
                    select 1
                      from public.professional_services ps
                     where ps.professional_id = p.id
                       and ps.service_id = p_service_id
               )
       ) then
        raise exception 'professional_not_available' using errcode = 'P0001';
    end if;

    v_date := (p_starts_at at time zone v_business.timezone)::date;

    if p_starts_at
       < now() + make_interval(mins => v_business.min_lead_minutes) then
        raise exception 'too_soon' using errcode = 'P0001';
    end if;

    if v_date
       > (now() at time zone v_business.timezone)::date
         + v_business.max_advance_days then
        raise exception 'too_far' using errcode = 'P0001';
    end if;

    -- La disponibilidad se reutiliza tal cual: misma función que pinta la UI.
    select s.professional_id
      into v_professional_id
      from public.get_available_slots(
            p_business_id,
            p_service_id,
            v_date,
            p_professional_id
      ) s
     where s.starts_at = p_starts_at
     order by s.professional_id
     limit 1;

    if v_professional_id is null then
        raise exception 'slot_unavailable' using errcode = 'P0001';
    end if;

    insert into public.customers as c (business_id, full_name, email, phone)
    values (p_business_id, v_full_name, v_email, v_phone)
    on conflict (business_id, (lower(email))) do update
        set full_name = excluded.full_name,
            phone = coalesce(excluded.phone, c.phone),
            updated_at = now()
    returning c.id into v_customer_id;

    v_status := case
        when v_business.requires_confirmation
            then 'pending'::public.booking_status
        else 'confirmed'::public.booking_status
    end;

    insert into public.bookings (
        business_id,
        service_id,
        professional_id,
        customer_id,
        starts_at,
        ends_at,
        status,
        source,
        price_cents,
        currency,
        notes
    )
    values (
        p_business_id,
        p_service_id,
        v_professional_id,
        v_customer_id,
        p_starts_at,
        p_starts_at + make_interval(mins => v_service.duration_minutes),
        v_status,
        'public',
        v_service.price_cents,
        v_business.currency,
        v_notes
    )
    returning * into v_booking;

    return jsonb_build_object(
        'id', v_booking.id,
        'confirmation_token', v_booking.confirmation_token,
        'starts_at', v_booking.starts_at,
        'ends_at', v_booking.ends_at,
        'status', v_booking.status
    );
exception
    when exclusion_violation then
        -- Dos reservas simultáneas sobre el mismo hueco: gana la primera.
        raise exception 'slot_unavailable' using errcode = 'P0001';
end;
$$;

create or replace function public.get_booking_status(p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_result jsonb;
begin
    select jsonb_build_object(
        'booking_id', b.id,
        'status', b.status,
        'starts_at', b.starts_at,
        'ends_at', b.ends_at,
        'service_name', s.name,
        'professional_name', p.full_name,
        'business_name', biz.name,
        'business_slug', biz.slug,
        'business_timezone', biz.timezone,
        'price_cents', b.price_cents,
        'currency', b.currency,
        'cancellation_policy_hours', biz.cancellation_policy_hours
    )
      into v_result
      from public.bookings b
      join public.services s on s.id = b.service_id
      join public.professionals p on p.id = b.professional_id
      join public.businesses biz on biz.id = b.business_id
     where b.confirmation_token = p_token;

    if v_result is null then
        raise exception 'booking_not_found' using errcode = 'P0001';
    end if;

    return v_result;
end;
$$;

create or replace function public.cancel_booking_by_token(
    p_token uuid,
    p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_booking public.bookings%rowtype;
    v_business public.businesses%rowtype;
begin
    select *
      into v_booking
      from public.bookings b
     where b.confirmation_token = p_token
       for update;

    if not found then
        raise exception 'booking_not_found' using errcode = 'P0001';
    end if;

    select *
      into v_business
      from public.businesses b
     where b.id = v_booking.business_id;

    if v_booking.status = 'cancelled' then
        return jsonb_build_object(
            'booking_id', v_booking.id,
            'status', v_booking.status,
            'cancelled_at', v_booking.cancelled_at
        );
    end if;

    if v_booking.status not in ('pending', 'confirmed') then
        raise exception 'not_cancellable' using errcode = 'P0001';
    end if;

    if now()
       > v_booking.starts_at
         - make_interval(hours => v_business.cancellation_policy_hours) then
        raise exception 'cancellation_window_closed' using errcode = 'P0001';
    end if;

    -- El trigger de bitácora recoge esta nota sin exponerla al cliente.
    perform set_config(
        'reserva2.event_note',
        left(coalesce(p_reason, ''), 500),
        true
    );

    update public.bookings
       set status = 'cancelled',
           cancelled_at = now()
     where id = v_booking.id
    returning * into v_booking;

    perform set_config('reserva2.event_note', '', true);

    return jsonb_build_object(
        'booking_id', v_booking.id,
        'status', v_booking.status,
        'cancelled_at', v_booking.cancelled_at
    );
end;
$$;
