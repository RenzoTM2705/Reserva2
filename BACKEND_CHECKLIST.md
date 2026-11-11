# BACKEND_CHECKLIST.md

> Aplicar a este proyecto aunque no exista un servidor propio: el backend es Supabase (PostgreSQL + RLS + funciones RPC). Marca N/A con motivo; no declares algo verificado si no lo probaste. No sustituye una revisión de arquitectura ni de seguridad (ver `SECURITY_CHECKLIST.md`).

## Diseño del contrato (RPC)

- [ ] Cada función pública tiene nombre, parámetros, tipo de retorno y errores documentados en `docs/TRD.md`.
- [ ] Los nombres describen la operación: `get_available_slots`, `create_booking`, `get_booking_status`, `cancel_booking_by_token`.
- [ ] Validación server-side de tipos, formato, rango y campos permitidos en cada parámetro.
- [ ] Autorización por recurso (no basta autenticación): el negocio se resuelve en el servidor, no se acepta como dato de confianza del cliente.
- [ ] Errores con códigos estables y mensajes que no filtran detalles internos ni PII.
- [ ] Los listados tienen paginación y un límite máximo de filas.
- [ ] Las operaciones sensibles son idempotentes o deduplicadas (creación de reserva).
- [ ] Solo se devuelven los campos necesarios (evitar over-fetching de datos personales).

## Base de datos y migraciones

- [ ] Migraciones versionadas, pequeñas y numeradas en `supabase/migrations/`.
- [ ] Nunca se edita una migración ya aplicada; se añade una nueva.
- [ ] Migraciones destructivas (DROP, rename con pérdida de datos) solo con backup confirmado y aprobación explícita.
- [ ] Constraints de integridad definidos en todas las tablas: PK, FK, UNIQUE, NOT NULL, CHECK.
- [ ] `bookings` mantiene la restricción `EXCLUDE USING gist` que impide solapamientos.
- [ ] Índices para las consultas frecuentes: reservas por negocio y fecha, por profesional, por cliente.
- [ ] RLS habilitada y políticas probadas en todas las tablas con datos de negocio.
- [ ] Las funciones `SECURITY DEFINER` fijan `search_path` y revocan permisos de `PUBLIC`.
- [ ] Extensiones necesarias declaradas explícitamente (`pgcrypto`, `btree_gist`).
- [ ] Migraciones probadas en el proyecto de desarrollo antes de producción.
- [ ] Seeds de demostración separados de datos reales; nunca aplicar el seed en producción.
- [ ] Backups de Supabase con restauración probada al menos una vez.

## Fiabilidad y operación

- [ ] Comportamiento definido cuando Supabase no responde (mensaje de error y reintento).
- [ ] Rate limiting en la reserva pública y en operaciones costosas.
- [ ] Consultas revisadas para evitar N+1 desde el cliente (usar joins y select explícito).
- [ ] Variables de entorno documentadas en `.env.example` y validadas al arrancar (fail fast si faltan).
- [ ] Sin secretos de servidor en el bundle del cliente.

## Testing

- [ ] Pruebas de `get_available_slots`: día cerrado, sin profesional, con ausencia, con buffer, fuera de ventana.
- [ ] Pruebas de `create_booking`: caso feliz, servicio inactivo, profesional ajeno al servicio, fuera de horario, conflicto de hueco.
- [ ] Prueba de concurrencia: dos reservas simultáneas producen una sola.
- [ ] Prueba de aislamiento: un usuario del negocio A no lee ni escribe datos del negocio B.
- [ ] Prueba de `get_booking_status`: token válido, token inexistente, token de negocio no publicado.
- [ ] Mocks o proyecto de pruebas separado; los tests no dependen de producción ni de credenciales reales.
- [ ] Comprobación de rendimiento razonable en la consulta de disponibilidad.

## Datos personales

- [ ] Minimización: se recogen solo nombre, email, teléfono y notas opcionales.
- [ ] Retención y borrado definidos; los clientes inactivos se pueden eliminar o anonimizar.
- [ ] Cifrado en tránsito (TLS) y en reposo (gestionado por Supabase).
- [ ] Escala a revisión humana cualquier tratamiento de datos sensibles, pagos o requisitos regulatorios.
