-- ============================================================
-- 04 · Clientes, reservas e historial de estados
-- ============================================================

create table public.customers (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null
        references public.businesses (id) on delete cascade,
    full_name text not null,
    email text not null,
    phone text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint customers_id_business_key unique (id, business_id),
    constraint customers_full_name_length
        check (char_length(btrim(full_name)) between 2 and 120),
    constraint customers_email_format
        check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
    constraint customers_email_lowercase check (email = lower(email)),
    constraint customers_phone_length
        check (phone is null or char_length(phone) <= 40),
    constraint customers_notes_length
        check (notes is null or char_length(notes) <= 1000)
);

create unique index customers_business_email_key
    on public.customers (business_id, lower(email));

create table public.bookings (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null
        references public.businesses (id) on delete cascade,
    service_id uuid not null,
    professional_id uuid not null,
    customer_id uuid not null,
    starts_at timestamptz not null,
    ends_at timestamptz not null,
    -- `ends_at` + buffer del servicio. Lo calcula un trigger BEFORE INSERT.
    blocked_until timestamptz not null,
    status public.booking_status not null default 'pending',
    source public.booking_source not null default 'public',
    -- Instantánea del precio: si el catálogo cambia, la reserva no.
    price_cents integer not null default 0,
    currency text not null default 'PEN',
    notes text,
    -- Identificador público no enumerable (UUID v4).
    confirmation_token uuid not null default gen_random_uuid(),
    cancelled_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint bookings_confirmation_token_key unique (confirmation_token),
    constraint bookings_id_business_key unique (id, business_id),
    constraint bookings_service_fk
        foreign key (service_id, business_id)
        references public.services (id, business_id),
    constraint bookings_professional_fk
        foreign key (professional_id, business_id)
        references public.professionals (id, business_id),
    constraint bookings_customer_fk
        foreign key (customer_id, business_id)
        references public.customers (id, business_id),
    constraint bookings_range check (starts_at < ends_at),
    constraint bookings_blocked_range check (ends_at <= blocked_until),
    constraint bookings_price_non_negative check (price_cents >= 0),
    constraint bookings_currency_format check (currency ~ '^[A-Z]{3}$'),
    constraint bookings_notes_length
        check (notes is null or char_length(notes) <= 500),
    constraint bookings_cancelled_at_required
        check (status <> 'cancelled' or cancelled_at is not null),

    -- Última línea de defensa ante concurrencia (ADR-003). Excluye las
    -- reservas que ya no ocupan agenda para no bloquear huecos futuros.
    constraint bookings_no_overlap exclude using gist (
        professional_id with =,
        tstzrange(starts_at, blocked_until, '[)') with &&
    ) where (status in ('pending', 'confirmed'))
);

create index bookings_business_starts_idx
    on public.bookings (business_id, starts_at);
create index bookings_professional_starts_idx
    on public.bookings (professional_id, starts_at);
create index bookings_customer_id_idx on public.bookings (customer_id);
create index bookings_business_status_idx
    on public.bookings (business_id, status);

create table public.booking_events (
    id bigint generated always as identity primary key,
    booking_id uuid not null,
    business_id uuid not null,
    from_status public.booking_status,
    to_status public.booking_status not null,
    actor_id uuid references auth.users (id) on delete set null,
    note text,
    created_at timestamptz not null default now(),

    constraint booking_events_booking_fk
        foreign key (booking_id, business_id)
        references public.bookings (id, business_id) on delete cascade,
    constraint booking_events_note_length
        check (note is null or char_length(note) <= 500)
);

create index booking_events_booking_idx
    on public.booking_events (booking_id, created_at);
create index booking_events_business_idx
    on public.booking_events (business_id, created_at);
