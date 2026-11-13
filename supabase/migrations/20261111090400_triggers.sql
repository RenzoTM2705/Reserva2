-- ============================================================
-- 05 · Triggers de integridad y bitácora de reservas
-- ============================================================

create schema if not exists private;

-- Mantiene `updated_at` en todas las tablas editables.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger businesses_set_updated_at
    before update on public.businesses
    for each row execute function private.set_updated_at();

create trigger services_set_updated_at
    before update on public.services
    for each row execute function private.set_updated_at();

create trigger professionals_set_updated_at
    before update on public.professionals
    for each row execute function private.set_updated_at();

create trigger customers_set_updated_at
    before update on public.customers
    for each row execute function private.set_updated_at();

create trigger bookings_set_updated_at
    before update on public.bookings
    for each row execute function private.set_updated_at();

-- `blocked_until` se deriva del buffer del servicio, no del cliente.
create or replace function private.set_booking_blocked_until()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_buffer_minutes integer;
begin
    select s.buffer_minutes
      into v_buffer_minutes
      from public.services s
     where s.id = new.service_id;

    new.blocked_until :=
        new.ends_at + make_interval(mins => coalesce(v_buffer_minutes, 0));

    return new;
end;
$$;

create trigger bookings_set_blocked_until
    before insert or update of ends_at, service_id on public.bookings
    for each row execute function private.set_booking_blocked_until();

-- Solo las transiciones del diagrama de docs/FLOW.md §4 son válidas.
create or replace function private.validate_booking_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.status = old.status then
        return new;
    end if;

    if not (
        (old.status = 'pending'
            and new.status in ('confirmed', 'cancelled', 'no_show'))
        or (old.status = 'confirmed'
            and new.status in ('completed', 'cancelled', 'no_show'))
    ) then
        raise exception 'invalid_transition' using errcode = 'P0001';
    end if;

    if new.status = 'cancelled' and new.cancelled_at is null then
        new.cancelled_at := now();
    end if;

    return new;
end;
$$;

create trigger bookings_validate_transition
    before update of status on public.bookings
    for each row execute function private.validate_booking_transition();

-- Cada alta o cambio de estado deja rastro. El actor es el usuario
-- autenticado que opera el panel; en el flujo público queda nulo.
create or replace function private.log_booking_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_actor_id uuid;
    v_from_status public.booking_status;
begin
    if tg_op = 'UPDATE' then
        if old.status is not distinct from new.status then
            return null;
        end if;

        v_from_status := old.status;
        v_actor_id := (select auth.uid());
    else
        v_from_status := null;

        if new.source = 'admin' then
            v_actor_id := (select auth.uid());
        else
            v_actor_id := null;
        end if;
    end if;

    insert into public.booking_events (
        booking_id,
        business_id,
        from_status,
        to_status,
        actor_id,
        note
    )
    values (
        new.id,
        new.business_id,
        v_from_status,
        new.status,
        v_actor_id,
        nullif(current_setting('reserva2.event_note', true), '')
    );

    return null;
end;
$$;

create trigger bookings_log_event
    after insert or update of status on public.bookings
    for each row
    execute function private.log_booking_event();

-- ── Integridad del catálogo y de la zona horaria ─────────────

-- El panel inserta asignaciones sin `business_id`; se deriva del
-- profesional para que la clave foránea compuesta siga protegiendo.
create or replace function private.set_professional_service_business()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.business_id := (
        select p.business_id
          from public.professionals p
         where p.id = new.professional_id
    );

    return new;
end;
$$;

create trigger professional_services_set_business
    before insert or update of professional_id on public.professional_services
    for each row execute function private.set_professional_service_business();

create or replace function private.set_professional_hours_business()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.business_id := (
        select p.business_id
          from public.professionals p
         where p.id = new.professional_id
    );

    return new;
end;
$$;

create trigger professional_hours_set_business
    before insert or update of professional_id on public.professional_hours
    for each row execute function private.set_professional_hours_business();

-- La zona horaria debe existir en la base de datos de zonas IANA;
-- de lo contrario el cálculo de disponibilidad fallaría en tiempo de uso.
create or replace function private.validate_business_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if not exists (
        select 1
          from pg_timezone_names tz
         where tz.name = new.timezone
    ) then
        raise exception 'invalid_timezone' using errcode = 'P0001';
    end if;

    return new;
end;
$$;

create trigger businesses_validate_timezone
    before insert or update of timezone on public.businesses
    for each row execute function private.validate_business_timezone();
