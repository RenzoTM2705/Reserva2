-- ============================================================
-- 01 · Extensiones y tipos
-- ============================================================
-- `btree_gist` habilita el operador de igualdad para uuid dentro de un
-- índice GiST, necesario para la restricción EXCLUDE anti-solapamiento.
-- Se instala en `extensions` para no exponer funciones de extensión en el
-- esquema `public`, que es el que publica PostgREST.
create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;

-- Las funciones nuevas nacen sin EXECUTE para roles de cliente; cada
-- migración concede solo lo imprescindible (ver 10_grants).
alter default privileges in schema public
    revoke execute on functions from public, anon, authenticated;

create type public.member_role as enum ('owner', 'admin', 'staff');
create type public.booking_status as enum (
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no_show'
);
create type public.booking_source as enum ('public', 'admin');
