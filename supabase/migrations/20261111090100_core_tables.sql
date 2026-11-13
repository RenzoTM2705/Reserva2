-- ============================================================
-- 02 · Núcleo multi-tenant: negocios, membresías y horario
-- ============================================================

create table public.businesses (
    id uuid primary key default gen_random_uuid(),
    slug text not null,
    name text not null,
    description text,
    address text,
    phone text,
    timezone text not null default 'America/Lima',
    currency text not null default 'PEN',
    is_published boolean not null default false,
    requires_confirmation boolean not null default true,
    min_lead_minutes integer not null default 60,
    max_advance_days integer not null default 30,
    cancellation_policy_hours integer not null default 4,
    -- Intervalo de la cuadrícula de huecos (ver docs/FLOW.md §5).
    slot_interval_minutes integer not null default 30,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint businesses_slug_key unique (slug),
    constraint businesses_slug_format
        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    constraint businesses_slug_length check (char_length(slug) between 3 and 60),
    constraint businesses_name_length
        check (char_length(btrim(name)) between 2 and 120),
    constraint businesses_currency_format check (currency ~ '^[A-Z]{3}$'),
    constraint businesses_min_lead_range
        check (min_lead_minutes between 0 and 10080),
    constraint businesses_max_advance_range
        check (max_advance_days between 1 and 365),
    constraint businesses_cancellation_range
        check (cancellation_policy_hours between 0 and 168),
    constraint businesses_slot_interval_range
        check (slot_interval_minutes between 5 and 240)
);

create table public.memberships (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null
        references public.businesses (id) on delete cascade,
    user_id uuid not null
        references auth.users (id) on delete cascade,
    role public.member_role not null default 'owner',
    created_at timestamptz not null default now(),

    constraint memberships_business_user_key unique (business_id, user_id),
    -- ADR-010: un negocio por cuenta en el MVP. También permite que
    -- `getMyMembership()` use `maybeSingle()` sin ambigüedad.
    constraint memberships_user_id_key unique (user_id)
);

create index memberships_business_id_idx on public.memberships (business_id);

create table public.business_hours (
    business_id uuid not null
        references public.businesses (id) on delete cascade,
    weekday smallint not null,
    is_closed boolean not null default false,
    opens_at time,
    closes_at time,

    constraint business_hours_pkey primary key (business_id, weekday),
    constraint business_hours_weekday_range check (weekday between 0 and 6),
    constraint business_hours_times check (
        is_closed
        or (
            opens_at is not null
            and closes_at is not null
            and opens_at < closes_at
        )
    )
);
