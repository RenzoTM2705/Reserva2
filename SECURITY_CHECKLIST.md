# SECURITY_CHECKLIST.md

## Secretos y configuración

- [ ] `.env*` local está ignorado; `.env.example` contiene solo nombres y placeholders.
- [ ] No hay API keys privadas, tokens, contraseñas ni `service_role` keys en frontend.
- [ ] Si un secreto fue committeado, se revocó/rotó; borrarlo del último commit no basta.
- [ ] Variables públicas se consideran visibles para cualquier usuario.
- [x] La `anon key` se trata como pública: su seguridad depende de RLS, no del secreto.

## Datos y acceso

> RLS y permisos validados manualmente en PostgreSQL 17 efímero (2026-11-13) con dos cuentas y dos negocios. Falta repetirlo contra el proyecto Supabase real.

- [x] Validación y autorización se ejecutan en servidor.
- [x] Queries parametrizadas; no concatenar input en SQL.
- [x] RLS habilitada y políticas probadas para todas las tablas accesibles desde cliente.
- [x] Mínimo privilegio: usuarios solo acceden a los registros de sus negocios.
- [x] El servidor permite únicamente campos editables explícitamente (evitar mass assignment).
- [x] Se devuelven solo los datos necesarios.
- [ ] Datos sensibles cifrados en tránsito y, cuando corresponda, en reposo.
- [ ] Contraseñas gestionadas por Supabase Auth; nunca se almacenan ni se registran en claro.
- [ ] Sesiones gestionadas por Supabase Auth con tokens de corta duración y refresco.

### Específico de Reserva2

- [x] Toda tabla de negocio incluye `business_id` con FK y política RLS.
- [x] El helper de pertenencia (`private.is_member`) es `SECURITY DEFINER`, fija `search_path` y no es invocable por `PUBLIC`.
- [x] Las funciones RPC públicas solo exponen lo mínimo necesario.
- [x] `confirmation_token` es un UUID v4 no enumerable; no se acepta el `id` de la reserva como identificador público.
- [x] `get_booking_status` no devuelve email, teléfono ni notas del cliente.
- [x] La cancelación pública solo se permite dentro de la política del negocio y antes del inicio de la cita.
- [x] La restricción `EXCLUDE USING gist` de `bookings` está activa y no se elimina en ninguna migración.

## Datos personales

- [x] Se recogen solo los datos necesarios: nombre, email, teléfono y notas opcionales.
- [x] Los datos personales no aparecen en logs, mensajes de error ni en URLs.
- [ ] El propietario puede eliminar o anonimizar clientes inactivos.
- [x] No se comparten datos entre negocios en ningún caso.
- [ ] Se documenta la base legal y la política de privacidad antes de publicar.

## Entradas, archivos y abuso

- [ ] Validar tipo, tamaño y contenido de archivos; no confiar en extensión/MIME del cliente (logos).
- [ ] Sanitizar contenido solo cuando se renderice como HTML; preferir evitar HTML arbitrario.
- [ ] Rate limiting o honeypot en el formulario público de reserva.
- [ ] Protección anti-bot/spam proporcional al riesgo y accesible.
- [x] Errores no filtran stack traces, mensajes de Postgres ni datos internos.
- [x] Logs no contienen credenciales, tokens ni datos personales innecesarios.

## Transporte y dependencias

- [ ] HTTPS forzado; headers de seguridad configurados y probados.
- [ ] CSP definida y ajustada a recursos realmente usados; evitar `unsafe-eval`.
- [ ] CORS restringido a orígenes necesarios (Supabase + dominio de la app).
- [ ] Dependencias y lockfile auditados; revisar alertas antes de actualizar.
- [ ] Backups de Supabase protegidos y restauración evaluada.

## Reglas

- No prometas seguridad absoluta ni cumplimiento legal automático.
- No implementes controles que requieren backend solo en frontend.
- Escala a revisión humana los datos sensibles, pagos, autenticación, permisos y requisitos regulatorios.
