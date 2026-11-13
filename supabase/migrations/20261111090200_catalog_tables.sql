-- ============================================================
-- 03 · Catálogo: servicios, profesionales, asignaciones y ausencias
-- ============================================================

create table public.services (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null
        references public.businesses (id) on delete cascade,
    name text not null,
    description text,
    duration_minutes integer not null default 30,
    price_cents integer not null default 0,
    buffer_minutes integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Clave compuesta para que las tablas hijas no puedan cruzar negocios.
    constraint services_id_business_key unique (id, business_id),
    constraint services_name_length
        check (char_length(btrim(name)) between 2 and 120),
    constraint services_duration_range
        check (duration_minutes between 5 and 1440),
    constraint services_price_non_negative check (price_cents >= 0),
    constraint services_buffer_range check (buffer_minutes between 0 and 240)
);

create index services_business_id_idx on public.services (business_id);

create table public.professionals (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null
        references public.businesses (id) on delete cascade,
    full_name text not null,
    is_active boolean not null default true,
    color text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint professionals_id_business_key unique (id, business_id),
    constraint professionals_full_name_length
        check (char_length(btrim(full_name)) between 2 and 120),
    constraint professionals_color_format
        check (color is null or color ~ '^#[0-9A-Fa-f]{6}$')
);

create index professionals_business_id_idx on public.professionals (business_id);

create table public.professional_services (
    business_id uuid not null,
    professional_id uuid not null,
    service_id uuid not null,

    constraint professional_services_pkey
        primary key (professional_id, service_id),
    constraint professional_services_professional_fk
        foreign key (professional_id, business_id)
        references public.professionals (id, business_id) on delete cascade,
    constraint professional_services_service_fk
        foreign key (service_id, business_id)
        references public.services (id, business_id) on delete cascade
);

create index professional_services_service_id_idx
    on public.professional_services (service_id);

create table public.professional_hours (
    business_id uuid not null,
    professional_id uuid not null,
    weekday smallint not null,
    is_closed boolean not null default false,
    opens_at time,
    closes_at time,

    constraint professional_hours_pkey primary key (professional_id, weekday),
    constraint professional_hours_professional_fk
        foreign key (professional_id, business_id)
        references public.professionals (id, business_id) on delete cascade,
    constraint professional_hours_weekday_range check (weekday between 0 and 6),
    constraint professional_hours_times check (
        is_closed
        or (
            opens_at is not null
            and closes_at is not null
            and opens_at < closes_at
        )
    )
);

create table public.time_off (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null
        references public.businesses (id) on delete cascade,
    -- NULL = ausencia de todo el negocio.
    professional_id uuid,
    starts_at timestamptz not null,
    ends_at timestamptz not null,
    reason text,
    created_at timestamptz not null default now(),

    constraint time_off_professional_fk
        foreign key (professional_id, business_id)
        references public.professionals (id, business_id) on delete cascade,
    constraint time_off_range check (starts_at < ends_at),
    constraint time_off_reason_length
        check (reason is null or char_length(reason) <= 200)
);

create index time_off_business_starts_idx
    on public.time_off (business_id, starts_at);
create index time_off_professional_starts_idx
    on public.time_off (professional_id, starts_at);
