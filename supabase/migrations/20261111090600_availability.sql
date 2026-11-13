-- ============================================================
-- 07 · Disponibilidad (única fuente de verdad, ADR-002)
-- ============================================================

create or replace function public.get_available_slots(
    p_business_id uuid,
    p_service_id uuid,
    p_date date,
    p_professional_id uuid default null
)
returns table (starts_at timestamptz, professional_id uuid)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_business public.businesses%rowtype;
    v_service public.services%rowtype;
    v_today date;
    v_weekday integer;
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

    v_today := (now() at time zone v_business.timezone)::date;

    -- Fuera de rango no es un error: simplemente no hay huecos.
    if p_date is null
       or p_date < v_today
       or p_date > v_today + v_business.max_advance_days then
        return;
    end if;

    v_weekday := extract(dow from p_date)::integer;

    return query
    with business_window as (
        select
            (p_date + bh.opens_at) at time zone v_business.timezone as opens_at,
            (p_date + bh.closes_at) at time zone v_business.timezone as closes_at
          from public.business_hours bh
         where bh.business_id = p_business_id
           and bh.weekday = v_weekday
           and not bh.is_closed
           and bh.opens_at is not null
           and bh.closes_at is not null
    ),
    eligible_professionals as (
        select p.id
          from public.professionals p
         where p.business_id = p_business_id
           and p.is_active
           and (p_professional_id is null or p.id = p_professional_id)
           and exists (
                select 1
                  from public.professional_services ps
                 where ps.professional_id = p.id
                   and ps.service_id = p_service_id
           )
    ),
    windows as (
        select
            e.id as professional_id,
            case
                -- Sin horario propio: hereda el del negocio.
                when ph.professional_id is null then bw.opens_at
                -- Horario propio cerrado: el profesional no atiende.
                when ph.is_closed
                     or ph.opens_at is null
                     or ph.closes_at is null then null
                else greatest(
                    bw.opens_at,
                    (p_date + ph.opens_at) at time zone v_business.timezone
                )
            end as window_start,
            case
                when ph.professional_id is null then bw.closes_at
                when ph.is_closed
                     or ph.opens_at is null
                     or ph.closes_at is null then null
                else least(
                    bw.closes_at,
                    (p_date + ph.closes_at) at time zone v_business.timezone
                )
            end as window_end
          from eligible_professionals e
         cross join business_window bw
          left join public.professional_hours ph
            on ph.professional_id = e.id
           and ph.weekday = v_weekday
    )
    select candidate.starts_at, w.professional_id
      from windows w
     cross join lateral generate_series(
            w.window_start,
            w.window_end - make_interval(mins => v_service.duration_minutes),
            make_interval(mins => v_business.slot_interval_minutes)
     ) as candidate(starts_at)
     where w.window_start is not null
       and w.window_end is not null
       and w.window_end > w.window_start
       and candidate.starts_at
           >= now() + make_interval(mins => v_business.min_lead_minutes)
       and not exists (
            select 1
              from public.bookings b
             where b.professional_id = w.professional_id
               and b.status in ('pending', 'confirmed')
               and tstzrange(b.starts_at, b.blocked_until, '[)')
                   && tstzrange(
                        candidate.starts_at,
                        candidate.starts_at + make_interval(
                            mins => v_service.duration_minutes
                                  + v_service.buffer_minutes
                        ),
                        '[)'
                      )
       )
       and not exists (
            select 1
              from public.time_off t
             where t.business_id = p_business_id
               and (
                    t.professional_id is null
                    or t.professional_id = w.professional_id
               )
               and tstzrange(t.starts_at, t.ends_at, '[)')
                   && tstzrange(
                        candidate.starts_at,
                        candidate.starts_at + make_interval(
                            mins => v_service.duration_minutes
                                  + v_service.buffer_minutes
                        ),
                        '[)'
                      )
       )
     order by candidate.starts_at, w.professional_id;
end;
$$;
