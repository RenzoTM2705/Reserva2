-- ============================================================
-- 10 · Privilegios: mínimo necesario por rol
-- ============================================================
-- RLS decide filas; estos GRANT deciden tablas, columnas y funciones.
-- El panel solo puede actualizar las columnas que edita de verdad.

grant usage on schema public to anon, authenticated;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

-- ── businesses ───────────────────────────────────────────────

revoke all on public.businesses from anon, authenticated;
grant select on public.businesses to anon, authenticated;
grant update (
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
) on public.businesses to authenticated;

-- ── memberships ──────────────────────────────────────────────

revoke all on public.memberships from anon, authenticated;
grant select on public.memberships to authenticated;

-- ── business_hours ───────────────────────────────────────────

revoke all on public.business_hours from anon, authenticated;
grant select on public.business_hours to anon, authenticated;
grant insert, update, delete on public.business_hours to authenticated;

-- ── services ─────────────────────────────────────────────────

revoke all on public.services from anon, authenticated;
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;

-- ── professionals ────────────────────────────────────────────

revoke all on public.professionals from anon, authenticated;
grant select on public.professionals to anon, authenticated;
grant insert, update, delete on public.professionals to authenticated;

-- ── professional_services ────────────────────────────────────

revoke all on public.professional_services from anon, authenticated;
grant select on public.professional_services to anon, authenticated;
grant insert, delete on public.professional_services to authenticated;

-- ── professional_hours ───────────────────────────────────────

revoke all on public.professional_hours from anon, authenticated;
grant select on public.professional_hours to anon, authenticated;
grant insert, update, delete on public.professional_hours to authenticated;

-- ── time_off ─────────────────────────────────────────────────

revoke all on public.time_off from anon, authenticated;
grant select, insert, update, delete on public.time_off to authenticated;

-- ── customers ────────────────────────────────────────────────

revoke all on public.customers from anon, authenticated;
grant select, insert, update, delete on public.customers to authenticated;

-- ── bookings ─────────────────────────────────────────────────

revoke all on public.bookings from anon, authenticated;
grant select on public.bookings to authenticated;
grant update (status, cancelled_at, notes) on public.bookings to authenticated;

-- ── booking_events ───────────────────────────────────────────

revoke all on public.booking_events from anon, authenticated;
grant select on public.booking_events to authenticated;

-- ── helpers de RLS ───────────────────────────────────────────

revoke all on function private.is_member(uuid)
    from public, anon, authenticated;
grant execute on function private.is_member(uuid) to authenticated;

revoke all on function private.is_business_admin(uuid)
    from public, anon, authenticated;
grant execute on function private.is_business_admin(uuid) to authenticated;

revoke all on function private.is_published(uuid)
    from public, anon, authenticated;
grant execute on function private.is_published(uuid) to anon, authenticated;

-- ── funciones de trigger (no invocables desde el cliente) ────

revoke all on function private.set_updated_at()
    from public, anon, authenticated;
revoke all on function private.set_booking_blocked_until()
    from public, anon, authenticated;
revoke all on function private.validate_booking_transition()
    from public, anon, authenticated;
revoke all on function private.log_booking_event()
    from public, anon, authenticated;
revoke all on function private.set_professional_service_business()
    from public, anon, authenticated;
revoke all on function private.set_professional_hours_business()
    from public, anon, authenticated;
revoke all on function private.validate_business_timezone()
    from public, anon, authenticated;

-- ── RPC públicas ─────────────────────────────────────────────

revoke all on function public.get_available_slots(uuid, uuid, date, uuid)
    from public, anon, authenticated;
grant execute on function public.get_available_slots(uuid, uuid, date, uuid)
    to anon, authenticated;

revoke all on function public.create_booking(
    uuid, uuid, uuid, timestamptz, jsonb, text
) from public, anon, authenticated;
grant execute on function public.create_booking(
    uuid, uuid, uuid, timestamptz, jsonb, text
) to anon, authenticated;

revoke all on function public.get_booking_status(uuid)
    from public, anon, authenticated;
grant execute on function public.get_booking_status(uuid)
    to anon, authenticated;

revoke all on function public.cancel_booking_by_token(uuid, text)
    from public, anon, authenticated;
grant execute on function public.cancel_booking_by_token(uuid, text)
    to anon, authenticated;

revoke all on function public.create_business(text, text)
    from public, anon, authenticated;
grant execute on function public.create_business(text, text)
    to authenticated;
