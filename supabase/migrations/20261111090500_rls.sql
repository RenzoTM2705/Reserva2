-- ============================================================
-- 06 · RLS: helpers de pertenencia y políticas
-- ============================================================

create schema if not exists private;

-- SECURITY DEFINER + search_path vacío: la comprobación no puede ser
-- redirigida por un objeto malicioso en el search_path del llamador.
create or replace function private.is_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
          from public.memberships m
         where m.business_id = p_business_id
           and m.user_id = (select auth.uid())
    );
$$;

create or replace function private.is_business_admin(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
          from public.memberships m
         where m.business_id = p_business_id
           and m.user_id = (select auth.uid())
           and m.role in ('owner', 'admin')
    );
$$;

create or replace function private.is_published(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(
        (select b.is_published
           from public.businesses b
          where b.id = p_business_id),
        false
    );
$$;

alter table public.businesses enable row level security;
alter table public.memberships enable row level security;
alter table public.business_hours enable row level security;
alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_services enable row level security;
alter table public.professional_hours enable row level security;
alter table public.time_off enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;

-- ── businesses ───────────────────────────────────────────────

create policy businesses_select_published
    on public.businesses
    for select
    to anon, authenticated
    using (is_published);

create policy businesses_select_member
    on public.businesses
    for select
    to authenticated
    using (private.is_member(id));

create policy businesses_update_admin
    on public.businesses
    for update
    to authenticated
    using (private.is_business_admin(id))
    with check (private.is_business_admin(id));

-- ── memberships ──────────────────────────────────────────────

create policy memberships_select_own
    on public.memberships
    for select
    to authenticated
    using (user_id = (select auth.uid()));

-- ── business_hours ───────────────────────────────────────────

create policy business_hours_select_published
    on public.business_hours
    for select
    to anon, authenticated
    using (private.is_published(business_id));

create policy business_hours_select_member
    on public.business_hours
    for select
    to authenticated
    using (private.is_member(business_id));

create policy business_hours_write_member
    on public.business_hours
    for all
    to authenticated
    using (private.is_member(business_id))
    with check (private.is_member(business_id));

-- ── services ─────────────────────────────────────────────────

create policy services_select_published
    on public.services
    for select
    to anon, authenticated
    using (private.is_published(business_id));

create policy services_select_member
    on public.services
    for select
    to authenticated
    using (private.is_member(business_id));

create policy services_write_member
    on public.services
    for all
    to authenticated
    using (private.is_member(business_id))
    with check (private.is_member(business_id));

-- ── professionals ────────────────────────────────────────────

create policy professionals_select_published
    on public.professionals
    for select
    to anon, authenticated
    using (private.is_published(business_id));

create policy professionals_select_member
    on public.professionals
    for select
    to authenticated
    using (private.is_member(business_id));

create policy professionals_write_member
    on public.professionals
    for all
    to authenticated
    using (private.is_member(business_id))
    with check (private.is_member(business_id));

-- ── professional_services ────────────────────────────────────

create policy professional_services_select_published
    on public.professional_services
    for select
    to anon, authenticated
    using (private.is_published(business_id));

create policy professional_services_select_member
    on public.professional_services
    for select
    to authenticated
    using (private.is_member(business_id));

create policy professional_services_write_member
    on public.professional_services
    for all
    to authenticated
    using (private.is_member(business_id))
    with check (private.is_member(business_id));

-- ── professional_hours ───────────────────────────────────────

create policy professional_hours_select_published
    on public.professional_hours
    for select
    to anon, authenticated
    using (private.is_published(business_id));

create policy professional_hours_select_member
    on public.professional_hours
    for select
    to authenticated
    using (private.is_member(business_id));

create policy professional_hours_write_member
    on public.professional_hours
    for all
    to authenticated
    using (private.is_member(business_id))
    with check (private.is_member(business_id));

-- ── time_off ─────────────────────────────────────────────────

create policy time_off_write_member
    on public.time_off
    for all
    to authenticated
    using (private.is_member(business_id))
    with check (private.is_member(business_id));

-- ── customers ────────────────────────────────────────────────

create policy customers_write_member
    on public.customers
    for all
    to authenticated
    using (private.is_member(business_id))
    with check (private.is_member(business_id));

-- ── bookings ─────────────────────────────────────────────────

create policy bookings_select_member
    on public.bookings
    for select
    to authenticated
    using (private.is_member(business_id));

create policy bookings_update_member
    on public.bookings
    for update
    to authenticated
    using (private.is_member(business_id))
    with check (private.is_member(business_id));

-- ── booking_events ───────────────────────────────────────────

create policy booking_events_select_member
    on public.booking_events
    for select
    to authenticated
    using (private.is_member(business_id));
