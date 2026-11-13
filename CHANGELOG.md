# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado se alinea con las fases de [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md).

## [Fase 1] — Cimientos

### Añadido

**Documentación**
- Plantilla maestra del vault adaptada al proyecto: `AGENTS.md`, `PROJECT_BRIEF.md`, `CONTEXT.md`, `MEMORY.md`, `SKILLS.md`, `QUALITY_CHECKLIST.md`, `SECURITY_CHECKLIST.md`, `BACKEND_CHECKLIST.md`, `SEO_LAUNCH_CHECKLIST.md`.
- `docs/PRD.md`, `docs/TRD.md`, `docs/FLOW.md`, `docs/UX.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/DECISIONS.md`.
- `README.md` y este `CHANGELOG.md`.

**Estructura base**
- Repositorio con `frontend/`, `supabase/`, `docs/` y `.github/workflows/`.
- Ejemplos de variables de entorno en la raíz y en `frontend/` (sin secretos reales).
- Scripts raíz para desarrollo y operaciones de Supabase.

**Toolchain**
- Vite 8 + React 19 + TypeScript estricto en `frontend/`.
- Tailwind CSS v4 con los tokens «Editorial cálida» definidos en `@theme` (sin interfaz construida todavía).
- ESLint, Vitest y Testing Library.
- Router base con una única ruta vacía y providers mínimos (TanStack Query).

**Cliente de datos**
- Cliente de Supabase creado de forma perezosa y validación de variables de entorno.

**Base de datos (aplicada a Supabase)**
- Migraciones numeradas en `supabase/migrations`: tipos y `btree_gist`; negocios, membresías y horario; catálogo y ausencias; clientes, reservas y bitácora; triggers de integridad; RLS y helpers de pertenencia; `get_available_slots`; RPC de reserva; `create_business`; privilegios por columna.
- Restricción `EXCLUDE USING gist` para impedir solapamientos por profesional, claves foráneas compuestas por negocio y transiciones de estado validadas en trigger.
- `supabase/seed.sql` con un negocio ficticio publicado (sin datos personales reales) para probar el flujo público.
- Validación local (2026-11-13): las diez migraciones y el seed se aplicaron sin errores; se probaron flujo público, solapamientos, liberación de huecos al cancelar, validaciones, transiciones, triggers y aislamiento RLS entre dos cuentas.
- `supabase/config.toml` y `supabase/.gitignore` generados con `supabase init`; seed declarado en `[db.seed]`.
- Aplicado al proyecto `ogdnpltdsjmxojbuwdhw` con `npx supabase link` + `db push` (10 migraciones) y `db push --include-seed`. Verificado en remoto: 11 tablas con RLS, `EXCLUDE` activo, 5 RPC `SECURITY DEFINER`, un negocio (`barberia-don-lucho`), flujo público con `anon` y aislamiento RLS entre dos cuentas.
- `supabase/seed.sql` deja la base sin reservas ni clientes: solo negocio, servicios, profesionales y horarios.
- Tipos generados en `frontend/src/types/database.generated.ts` (excluido de ESLint). `pnpm types:gen` usa `scripts/generate-types.mjs`, que solo reemplaza el archivo si la CLI termina bien.
- Scripts de base de datos operativos: `supabase@3.1.0` como devDependency en la raíz y `db:push`, `db:seed`, `db:diff`, `db:lint` y `types:gen` apuntando al proyecto vinculado con `--remote` (sin `$VAR`, compatible con Windows).
- Flujo público validado a través de PostgREST con la publishable key: `create_booking` (`pending`), `get_booking_status`, `cancel_booking_by_token` (`cancelled`) y rechazo del solapamiento del mismo profesional (`slot_unavailable`, código `P0001`). Los datos de prueba se eliminaron después.

**Integración continua**
- `.github/workflows/ci.yml`: en cada push a `develop`/`main` y en cada Pull Request instala con `pnpm --frozen-lockfile` y ejecuta lint, tipos, tests y build. Cancela ejecuciones anteriores de la misma rama y limita permisos a `contents: read`.

**Skills de diseño para agentes (nivel proyecto)**
- Instaladas en `.agents/skills` con `skills-lock.json` versionado: `frontend-design`, `web-design-guidelines`, `ui-ux-pro-max`, `emil-design-eng` y `shadcn`. Se evaluó y descartó `design-taste-frontend` (auditoría Gen fallida y ~38 MB de assets de terceros).

### Pendiente (se trabaja en ramas por fase)

- Primera ejecución del CI en GitHub (`.github/workflows/ci.yml`); se valida al abrir el PR.
- Tests automatizados de integración de RPC y concurrencia contra una base real.
- Adoptar los tipos generados en el código (hoy `lib/types.ts` es manual).
- Probar el flujo público y el onboarding en navegador con la publishable key (la API ya está validada por REST).
- Renovar el personal access token con `database_read`/`database_write` para que `types:gen`, `db:diff` y `db:lint` usen la API de administración.
- Dependencias específicas de fases posteriores (formularios, animación, gráficos, tipografías, iconos, E2E), que se añadirán con aprobación previa.
- Marca definitiva (logo, favicon, imagen Open Graph).
- Revisar el contenido de las skills antes de aplicarlas en trabajo real.
