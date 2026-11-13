# MEMORY.md

> Conserva solo información estable que evite repetir contexto. No es un diario ni un changelog.

## Decisiones cerradas

- **Supabase cloud + migraciones locales.** El entorno de desarrollo es un proyecto Supabase en la nube; las migraciones se versionan en `supabase/migrations` y se aplican con `pnpm db:push`. La CLI de Supabase está en `devDependencies` (versión fijada) y los scripts apuntan al proyecto vinculado con `--remote`.
- **Sin backend Node propio.** Postgres (RLS + RPC) es la única autoridad. Motivo: menos superficie y validación real del lado servidor.
- **Disponibilidad en SQL, no en TypeScript.** Una sola función (`public.get_available_slots`) alimenta la UI y la creación de reservas.
- **Solapamientos bloqueados por el motor** con `EXCLUDE USING gist (professional_id, tstzrange(starts_at, blocked_until))`.
- **Identidad «Editorial cálida»:** papel `#FAF7F2`, tinta `#1A1714`, terracota `#B4552D`; Fraunces + Instrument Sans.
- **Orden de construcción:** flujo público antes que panel administrativo. Motivo: es la pieza de mayor riesgo técnico y la más demostrable.
- **Sin Zustand, sin axios, sin librería de calendario genérica.** Estado de servidor con TanStack Query; estado de UI en la URL.
- **La plantilla documental se copia del vault** (`Boveda-Obsidian/Proyectos`) y se adapta en este repo. La bóveda es capa personal; el repo es la fuente de verdad.
- **Skills de diseño instaladas a nivel proyecto** en `.agents/skills` con `skills-lock.json` versionado, por preferencia del propietario de usar skills populares y bien valoradas. Se eligió un conjunto curado de cinco (`frontend-design`, `web-design-guidelines`, `ui-ux-pro-max`, `emil-design-eng`, `shadcn`) y se descartó `design-taste-frontend` por auditoría Gen fallida y ~38 MB de assets de terceros. Las skills se revisan antes de aplicarlas; se ejecutan con permisos completos.

## Restricciones vigentes

- **Supabase cloud como entorno de desarrollo.** Proyecto `ogdnpltdsjmxojbuwdhw` (`Reserva2`), región `us-east-2`. La CLI lo trata como entorno `production` porque es el único proyecto y su rama principal.
- **Token de Supabase:** el actual concede `projects_read` y `database_read`; con eso funcionan `projects list`, `db:lint` y `types:gen`. `db:push` y `db:seed` solo necesitan la contraseña de la base. `db:diff` requiere Docker por el shadow DB.
- **Moneda por defecto `PEN`.** Cambiarla requiere decisión del propietario.
- **Los datos de clientes son datos personales:** no se registran en logs, no se incluyen en mensajes de error y no se comparten entre negocios.
- **No se inventan datos de negocio, precios, direcciones ni políticas legales.** Los placeholders se marcan como tales.

## Errores resueltos relevantes

- **Conexión directa a Postgres en Windows:** la conexión directa (`db.<ref>.supabase.co`) solo resuelve a IPv6 y Docker no la alcanza. La validación por `psql` se hace con el pooler `aws-1-us-east-2.pooler.supabase.com:5432` y usuario `postgres.<ref>`.
- **Docker Desktop apagado → `supabase start` falla.** Se eligió proyecto cloud con migraciones versionadas. La validación del esquema se hizo después con un contenedor PostgreSQL 17 efímero, no con el stack completo de Supabase.
- *(Se irán registrando aquí los errores con causa raíz y prevención.)*

## Preferencias de colaboración

- Preferir cambios pequeños y explicaciones claras.
- Antes de decisiones irreversibles o fuera del alcance, pedir confirmación.
- No asumir datos reales, secretos, contenido legal ni servicios contratados.
- Documentación y UI en español; código, commits y nombres de variables en inglés.
- Cada fase se entrega con su guía de commit y rama correspondiente; la estrategia de ramas no se escribe en los documentos del repo.

## Estado actual

- **Fase:** 2 · Flujo público + 3 · Panel (interfaz web) + backend base (SQL).
- **Hecho:** estructura del repositorio, documentación base adaptada, toolchain del frontend y tokens de diseño. Interfaz web completa (fase de UI): landing, página pública de negocio, asistente de reserva en 5 pasos con estado en la URL, consulta por `confirmation_token`, auth (entrar/crear cuenta/recuperar), onboarding y panel completo (resumen, reservas con filtros y transiciones de estado, calendario mensual, CRUD de servicios y profesionales con asignación de servicios, clientes y configuración con horario semanal). Disponibilidad solo vía RPC `get_available_slots`; estado de UI en `searchParams`; `zod-resolver` propio (sin `@hookform/resolvers`). Checks `lint`, `typecheck`, `test:run` y `build` en verde.
- **Backend SQL validado en PostgreSQL 17 efímero (2026-11-13):** las diez migraciones y `supabase/seed.sql` se aplicaron sin errores con `psql`. Se probaron el flujo público (`get_available_slots`, `create_booking`, `get_booking_status`, `cancel_booking_by_token`), el rechazo de solapamientos (`slot_unavailable` y `EXCLUDE` directo), la liberación del hueco al cancelar, las validaciones de entrada, las transiciones de estado, los triggers de `business_id` y zona horaria, y el aislamiento RLS entre dos cuentas. Incluye `EXCLUDE USING gist`, claves foráneas compuestas por negocio y bitácora `booking_events`.
- **Backend aplicado al proyecto Supabase real (2026-11-13):** `supabase link` + `db push` aplicaron las diez migraciones y el seed. Verificado en remoto: 11 tablas con RLS y políticas, `btree_gist` en `extensions`, `EXCLUDE` activo, 5 RPC `SECURITY DEFINER` con `search_path` vacío, y un único negocio (`barberia-don-lucho`) con 4 servicios, 2 profesionales, 5 asignaciones y 7 franjas horarias. Flujo público probado con `anon` (34 huecos, reserva, consulta, cancelación, solapamiento rechazado) y aislamiento RLS probado con dos cuentas sintéticas, eliminadas después. La base queda solo con los datos del seed.
- **Tipos generados:** `frontend/src/types/database.generated.ts` desde el esquema real. Excluido de ESLint por ser artefacto generado; todavía no se usan en el código (siguen los tipos manuales de `lib/types.ts`).
- **Frontend conectado al backend real:** `frontend/.env.local` tiene URL y publishable key, así que `isDemoMode` es `false` y la UI usa Supabase. `lib/demo.ts` queda solo como respaldo cuando faltan variables.
- **Próximo:** abrir el PR de esta rama y confirmar el CI en verde; después completar la activación del onboarding (primer servicio y profesional) y la Fase 4.
- **Bloqueos:** `pnpm db:diff` y `db:reset` necesitan Docker (shadow DB y base local). El resto funciona con el token actual, que ya tiene `projects_read` y `database_read`.

## Mantenimiento

Eliminar notas obsoletas. Mover decisiones arquitectónicas vigentes a `CONTEXT.md`; registrar cambios temporales en el sistema de issues/PR, no aquí.
