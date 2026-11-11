# TRD — Reserva2

> Technical Requirements Document ligero. Amplía `CONTEXT.md` con el contrato de las funciones RPC, el esquema de base de datos y las políticas RLS.

## 1. Principios técnicos

1. **La autoridad está en PostgreSQL.** El navegador nunca decide permisos ni disponibilidad.
2. **Una sola implementación por regla.** La disponibilidad se calcula en SQL; el cliente solo pinta.
3. **La concurrencia se resuelve en el motor**, no con bloqueos de aplicación.
4. **Las horas son instantes.** `timestamptz` en UTC; cada negocio tiene su `timezone` IANA.
5. **El dinero es entero.** Céntimos + código de moneda ISO 4217.

## 2. Esquema de datos

### 2.1 Enumeraciones

```sql
create type public.member_role   as enum ('owner', 'admin', 'staff');
create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.booking_source as enum ('public', 'admin');
```

### 2.2 Tablas

| Tabla | Propósito | Claves y restricciones relevantes |
|---|---|---|
| `businesses` | Tenant | `slug` UNIQUE; `timezone` IANA; `currency` ISO 4217; `is_published` |
| `memberships` | Usuario ↔ negocio | UNIQUE `(business_id, user_id)`; rol |
| `services` | Catálogo | `duration_minutes` 5–1440; `price_cents >= 0`; `buffer_minutes` 0–240 |
| `professionals` | Equipo | `is_active`; `color` de agenda |
| `professional_services` | Qué servicio hace quién | PK `(professional_id, service_id)` |
| `business_hours` | Horario semanal | PK `(business_id, weekday)`; `weekday` 0–6 (0 = domingo) |
| `professional_hours` | Horario propio | PK `(professional_id, weekday)`; si falta, hereda el del negocio |
| `time_off` | Ausencias | `professional_id` NULL = todo el negocio |
| `customers` | Directorio | UNIQUE `(business_id, lower(email))` |
| `bookings` | Reservas | `confirmation_token` UNIQUE; `blocked_until = ends_at + buffer` |
| `booking_events` | Historial de estados | FK a `bookings` con `on delete cascade` |

### 2.3 Restricción anti-solapamiento

```sql
create extension if not exists btree_gist;

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    professional_id with =,
    tstzrange(starts_at, blocked_until, '[)') with &&
  ) where (status in ('pending', 'confirmed'));
```

- Se excluyen `completed`, `cancelled` y `no_show` para que no bloqueen huecos futuros.
- `blocked_until` incluye el buffer del servicio, de modo que el descanso entre citas también se protege.
- La violación se traduce a `slot_unavailable` en la RPC.

### 2.4 Invariantes con `CHECK`

- `starts_at < ends_at` y `ends_at <= blocked_until`.
- `slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`.
- `weekday between 0 and 6`.
- `is_closed or opens_at < closes_at`.

## 3. Contrato de funciones RPC

### 3.1 `get_available_slots`

```sql
public.get_available_slots(
  p_business_id      uuid,
  p_service_id       uuid,
  p_date             date,
  p_professional_id  uuid default null
) returns table (starts_at timestamptz, professional_id uuid)
```

- **Roles:** `anon`, `authenticated`.
- **Reglas:** negocio publicado, servicio activo, fecha dentro de `[hoy, hoy + max_advance_days]`, ventana = intersección de horario del negocio y del profesional, menos ausencias, menos reservas activas, respetando `min_lead_minutes` y el `buffer`.
- **Salida:** un registro por combinación hueco/profesional. Con `p_professional_id` nulo, el cliente agrupa por `starts_at` para ofrecer "cualquier profesional".
- **Sin resultados:** devuelve cero filas (no es un error).

### 3.2 `create_booking`

```sql
public.create_booking(
  p_business_id      uuid,
  p_service_id       uuid,
  p_professional_id  uuid,
  p_starts_at        timestamptz,
  p_customer         jsonb,   -- { full_name, email, phone, notes }
  p_customer_notes   text default null
) returns jsonb
```

- **Roles:** `anon`, `authenticated`.
- **Flujo:** valida negocio publicado → servicio activo del negocio → profesional activo que realiza el servicio → ventana temporal → hueco dentro de `get_available_slots` → upsert de cliente → inserción de reserva → evento inicial.
- **Estado inicial:** `pending` si `businesses.requires_confirmation`, si no `confirmed`.
- **Respuesta:** `{ id, confirmation_token, starts_at, ends_at, status }`.
- **Errores:** `business_not_found`, `service_not_found`, `professional_not_available`, `too_soon`, `too_far`, `slot_unavailable`, `invalid_email`, `invalid_name`.
- **Concurrencia:** si la restricción `EXCLUDE` salta pese a la validación, se captura `exclusion_violation` y se devuelve `slot_unavailable`.

### 3.3 `get_booking_status`

```sql
public.get_booking_status(p_token uuid) returns jsonb
```

- **Roles:** `anon`, `authenticated`.
- **Devuelve:** `booking_id`, `status`, `starts_at`, `ends_at`, `service_name`, `professional_name`, `business_name`, `business_slug`, `business_timezone`, `price_cents`, `currency`, `cancellation_policy`.
- **No devuelve:** email, teléfono ni notas del cliente.

### 3.4 `cancel_booking_by_token`

```sql
public.cancel_booking_by_token(p_token uuid, p_reason text default null) returns jsonb
```

- **Roles:** `anon`, `authenticated`.
- **Reglas:** solo `pending` o `confirmed`; solo antes de `starts_at - cancellation_policy_hours`; idempotente si ya está cancelada.
- **Efecto:** estado `cancelled`, `cancelled_at`, evento en `booking_events`.

### 3.5 `create_business`

```sql
public.create_business(p_name text, p_slug text) returns uuid
```

- **Roles:** `authenticated`.
- **Efecto:** crea el negocio (no publicado), la membresía `owner` para `auth.uid()` y el horario por defecto (lun–sáb 09:00–18:00, domingo cerrado).
- **Errores:** `not_authenticated`, `slug_taken`.

## 4. Políticas RLS

| Tabla | anon | authenticated |
|---|---|---|
| `businesses` | SELECT si `is_published` | SELECT si es miembro; UPDATE si rol `owner`/`admin` |
| `memberships` | — | SELECT de las propias filas |
| `services`, `professionals`, `professional_services`, `business_hours`, `professional_hours` | SELECT si el negocio está publicado | CRUD si es miembro |
| `time_off` | — | CRUD si es miembro |
| `customers` | — | CRUD si es miembro |
| `bookings` | — | SELECT/UPDATE si es miembro |
| `booking_events` | — | SELECT si es miembro |

`INSERT` de `bookings` y `customers` desde el público solo ocurre dentro de `create_booking` (`SECURITY DEFINER`).

### Helper de pertenencia

```sql
create or replace function private.is_member(p_business_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.business_id = p_business_id
      and m.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_member(uuid) from public;
grant execute on function private.is_member(uuid) to authenticated;
```

## 5. Estrategia de pruebas

| Nivel | Herramienta | Qué cubre |
|---|---|---|
| Unitario | Vitest | Formato de dinero y fechas, utilidades puras, componentes de UI |
| Componentes | Testing Library | Formularios, estados, accesibilidad básica |
| Integración BD | Vitest + Supabase (proyecto de pruebas) | RPC y RLS contra base real |
| Concurrencia | Script de integración | Dos `create_booking` simultáneos → una sola reserva |
| E2E | Playwright | Flujo público completo y login del panel |

Los tests de integración usan un negocio de prueba creado y eliminado por el propio test. Nunca apuntan a producción.

## 6. Límites técnicos conocidos

- **Sin Docker:** no hay Supabase local; los tests de integración requieren el proyecto cloud de desarrollo.
- **Sin rate limiting nativo en Supabase:** se mitiga con honeypot y, si hace falta, con una función que limite por IP/token temporal.
- **Storage de logos:** límite de tamaño y tipos permitidos se validan en el cliente y en la política de Storage.
- **Un solo huso por negocio:** si un negocio opera en varias sedes con husos distintos, necesitará una entidad `locations` (fuera del MVP).
