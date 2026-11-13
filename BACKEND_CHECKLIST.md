# BACKEND_CHECKLIST.md

> Aplicar a este proyecto aunque no exista un servidor propio: el backend es Supabase (PostgreSQL + RLS + funciones RPC). Marca N/A con motivo; no declares algo verificado si no lo probaste. No sustituye una revisión de arquitectura ni de seguridad (ver `SECURITY_CHECKLIST.md`).

## Diseño del contrato (RPC)

- [x] Cada función pública tiene nombre, parámetros, tipo de retorno y errores documentados en `docs/TRD.md`.
- [x] Los nombres describen la operación: `get_available_slots`, `create_booking`, `get_booking_status`, `cancel_booking_by_token`.
- [x] Validación server-side de tipos, formato, rango y campos permitidos en cada parámetro.
- [x] Autorización por recurso (no basta autenticación): el negocio se resuelve en el servidor, no se acepta como dato de confianza del cliente.
- [x] Errores con códigos estables y mensajes que no filtran detalles internos ni PII.
- [ ] Los listados tienen paginación y un límite máximo de filas.
- [ ] Las operaciones sensibles son idempotentes o deduplicadas (creación de reserva).
- [x] Solo se devuelven los campos necesarios (evitar over-fetching de datos personales).

## Base de datos y migraciones

- [x] Migraciones versionadas, pequeñas y numeradas en `supabase/migrations/`.
- [x] Nunca se edita una migración ya aplicada; se añade una nueva.
- [x] Migraciones destructivas (DROP, rename con pérdida de datos) solo con backup confirmado y aprobación explícita.
- [x] Constraints de integridad definidos en todas las tablas: PK, FK, UNIQUE, NOT NULL, CHECK.
- [x] `bookings` mantiene la restricción `EXCLUDE USING gist` que impide solapamientos.
- [x] Índices para las consultas frecuentes: reservas por negocio y fecha, por profesional, por cliente.
- [x] RLS habilitada y políticas probadas en todas las tablas con datos de negocio.
- [x] Las funciones `SECURITY DEFINER` fijan `search_path` y revocan permisos de `PUBLIC`.
- [x] Extensiones necesarias declaradas explícitamente (`btree_gist`; `gen_random_uuid()` es nativo desde PostgreSQL 13).
- [x] Migraciones probadas en el proyecto de desarrollo antes de producción.
- [x] Seeds de demostración separados de datos reales; nunca aplicar el seed en producción.
- [ ] Backups de Supabase con restauración probada al menos una vez.

## Fiabilidad y operación

- [ ] Comportamiento definido cuando Supabase no responde (mensaje de error y reintento).
- [ ] Rate limiting en la reserva pública y en operaciones costosas.
- [ ] Consultas revisadas para evitar N+1 desde el cliente (usar joins y select explícito).
- [ ] Variables de entorno documentadas en `.env.example` y validadas al arrancar (fail fast si faltan).
- [ ] Sin secretos de servidor en el bundle del cliente.

## Testing

> Validación manual, no automatizada: en PostgreSQL 17 efímero (2026-11-13) y repetida contra el proyecto Supabase real con `anon` y dos cuentas sintéticas. Cubre flujo público completo, hueco ocupado y liberado al cancelar, validaciones de entrada, transiciones de estado, triggers y aislamiento RLS entre dos cuentas. Los checkboxes de esta sección se marcarán al incorporar tests automatizados.

- [ ] Pruebas de `get_available_slots`: día cerrado, sin profesional, con ausencia, con buffer, fuera de ventana.
- [ ] Pruebas de `create_booking`: caso feliz, servicio inactivo, profesional ajeno al servicio, fuera de horario, conflicto de hueco.
- [ ] Prueba de concurrencia: dos reservas simultáneas producen una sola.
- [x] Prueba de aislamiento: un usuario del negocio A no lee ni escribe datos del negocio B.
- [ ] Prueba de `get_booking_status`: token válido, token inexistente, token de negocio no publicado.
- [ ] Mocks o proyecto de pruebas separado; los tests no dependen de producción ni de credenciales reales.
- [ ] Comprobación de rendimiento razonable en la consulta de disponibilidad.

## Datos personales

- [ ] Minimización: se recogen solo nombre, email, teléfono y notas opcionales.
- [ ] Retención y borrado definidos; los clientes inactivos se pueden eliminar o anonimizar.
- [ ] Cifrado en tránsito (TLS) y en reposo (gestionado por Supabase).
- [ ] Escala a revisión humana cualquier tratamiento de datos sensibles, pagos o requisitos regulatorios.
