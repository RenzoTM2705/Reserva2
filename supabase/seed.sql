-- ============================================================
-- seed.sql · Negocio de demostración
-- ============================================================
-- Datos ficticios para desarrollo y pruebas visuales. No contiene datos
-- personales reales. El negocio queda publicado para probar el flujo
-- público; no se crea membresía porque las cuentas viven en auth.users
-- y se crean desde la aplicación (onboarding).
--
-- Se ejecuta con `supabase db reset` o `supabase db seed`.

insert into public.businesses (
    id,
    slug,
    name,
    description,
    address,
    phone,
    timezone,
    currency,
    is_published,
    requires_confirmation,
    min_lead_minutes,
    max_advance_days,
    cancellation_policy_hours,
    slot_interval_minutes
)
values (
    '11111111-1111-4111-8111-111111111111',
    'barberia-don-lucho',
    'Barbería Don Lucho',
    'Cortes clásicos y modernos, con cita y sin espera.',
    'Av. Ejemplo 123, Lima',
    '+51 900 000 000',
    'America/Lima',
    'PEN',
    true,
    true,
    60,
    30,
    4,
    30
)
on conflict (id) do update
    set slug = excluded.slug,
        name = excluded.name,
        description = excluded.description,
        address = excluded.address,
        phone = excluded.phone,
        timezone = excluded.timezone,
        currency = excluded.currency,
        is_published = excluded.is_published,
        requires_confirmation = excluded.requires_confirmation,
        min_lead_minutes = excluded.min_lead_minutes,
        max_advance_days = excluded.max_advance_days,
        cancellation_policy_hours = excluded.cancellation_policy_hours,
        slot_interval_minutes = excluded.slot_interval_minutes;

-- Lunes a sábado 09:00–18:00; domingo cerrado.
insert into public.business_hours (
    business_id,
    weekday,
    is_closed,
    opens_at,
    closes_at
)
select
    '11111111-1111-4111-8111-111111111111',
    w,
    (w = 0),
    case when w = 0 then null else time '09:00' end,
    case when w = 0 then null else time '18:00' end
  from generate_series(0, 6) as w
on conflict (business_id, weekday) do nothing;

insert into public.services (
    id,
    business_id,
    name,
    description,
    duration_minutes,
    price_cents,
    buffer_minutes,
    is_active
)
values
    (
        '22222222-2222-4222-8222-222222222201',
        '11111111-1111-4111-8111-111111111111',
        'Corte de cabello',
        'Corte a máquina y tijera, lavado incluido.',
        40,
        3000,
        10,
        true
    ),
    (
        '22222222-2222-4222-8222-222222222202',
        '11111111-1111-4111-8111-111111111111',
        'Afeitado clásico',
        'Navaja, toalla caliente y acabado con bálsamo.',
        30,
        2500,
        5,
        true
    ),
    (
        '22222222-2222-4222-8222-222222222203',
        '11111111-1111-4111-8111-111111111111',
        'Corte + barba',
        'Combo completo para cuidar todo en una visita.',
        60,
        4500,
        10,
        true
    ),
    (
        '22222222-2222-4222-8222-222222222204',
        '11111111-1111-4111-8111-111111111111',
        'Tratamiento capilar',
        null,
        90,
        8000,
        15,
        false
    )
on conflict (id) do update
    set name = excluded.name,
        description = excluded.description,
        duration_minutes = excluded.duration_minutes,
        price_cents = excluded.price_cents,
        buffer_minutes = excluded.buffer_minutes,
        is_active = excluded.is_active;

insert into public.professionals (
    id,
    business_id,
    full_name,
    is_active,
    color
)
values
    (
        '33333333-3333-4333-8333-333333333301',
        '11111111-1111-4111-8111-111111111111',
        'Lucía Ramos',
        true,
        '#B4552D'
    ),
    (
        '33333333-3333-4333-8333-333333333302',
        '11111111-1111-4111-8111-111111111111',
        'Marco Torres',
        true,
        '#2E6E4F'
    )
on conflict (id) do update
    set full_name = excluded.full_name,
        is_active = excluded.is_active,
        color = excluded.color;

insert into public.professional_services (
    business_id,
    professional_id,
    service_id
)
values
    (
        '11111111-1111-4111-8111-111111111111',
        '33333333-3333-4333-8333-333333333301',
        '22222222-2222-4222-8222-222222222201'
    ),
    (
        '11111111-1111-4111-8111-111111111111',
        '33333333-3333-4333-8333-333333333301',
        '22222222-2222-4222-8222-222222222202'
    ),
    (
        '11111111-1111-4111-8111-111111111111',
        '33333333-3333-4333-8333-333333333301',
        '22222222-2222-4222-8222-222222222204'
    ),
    (
        '11111111-1111-4111-8111-111111111111',
        '33333333-3333-4333-8333-333333333302',
        '22222222-2222-4222-8222-222222222201'
    ),
    (
        '11111111-1111-4111-8111-111111111111',
        '33333333-3333-4333-8333-333333333302',
        '22222222-2222-4222-8222-222222222203'
    )
on conflict (professional_id, service_id) do nothing;
