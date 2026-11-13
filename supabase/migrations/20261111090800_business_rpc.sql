-- ============================================================
-- 09 · RPC de alta de negocio (onboarding)
-- ============================================================

create or replace function public.create_business(p_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := (select auth.uid());
    v_name text := btrim(coalesce(p_name, ''));
    v_slug text := lower(btrim(coalesce(p_slug, '')));
    v_business_id uuid;
    v_constraint text;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
    end if;

    if char_length(v_name) < 2 or char_length(v_name) > 120 then
        raise exception 'invalid_name' using errcode = 'P0001';
    end if;

    if char_length(v_slug) < 3
       or char_length(v_slug) > 60
       or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
        raise exception 'invalid_slug' using errcode = 'P0001';
    end if;

    -- ADR-010: un negocio por cuenta en el MVP.
    if exists (
        select 1
          from public.memberships m
         where m.user_id = v_user_id
    ) then
        raise exception 'business_exists' using errcode = 'P0001';
    end if;

    if exists (
        select 1
          from public.businesses b
         where b.slug = v_slug
    ) then
        raise exception 'slug_taken' using errcode = 'P0001';
    end if;

    insert into public.businesses (name, slug)
    values (v_name, v_slug)
    returning id into v_business_id;

    insert into public.memberships (business_id, user_id, role)
    values (v_business_id, v_user_id, 'owner');

    -- Horario por defecto del onboarding (docs/FLOW.md §3):
    -- lunes a sábado 09:00–18:00, domingo cerrado.
    insert into public.business_hours (
        business_id,
        weekday,
        is_closed,
        opens_at,
        closes_at
    )
    select
        v_business_id,
        w,
        (w = 0),
        case when w = 0 then null else time '09:00' end,
        case when w = 0 then null else time '18:00' end
      from generate_series(0, 6) as w;

    return v_business_id;
exception
    when unique_violation then
        get stacked diagnostics v_constraint = constraint_name;

        if v_constraint in (
            'memberships_user_id_key',
            'memberships_business_user_key'
        ) then
            raise exception 'business_exists' using errcode = 'P0001';
        end if;

        raise exception 'slug_taken' using errcode = 'P0001';
end;
$$;
