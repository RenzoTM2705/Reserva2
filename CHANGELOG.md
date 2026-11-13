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

**Base de datos (validada en PostgreSQL 17 efímero, pendiente de aplicar a Supabase)**
- Migraciones numeradas en `supabase/migrations`: tipos y `btree_gist`; negocios, membresías y horario; catálogo y ausencias; clientes, reservas y bitácora; triggers de integridad; RLS y helpers de pertenencia; `get_available_slots`; RPC de reserva; `create_business`; privilegios por columna.
- Restricción `EXCLUDE USING gist` para impedir solapamientos por profesional, claves foráneas compuestas por negocio y transiciones de estado validadas en trigger.
- `supabase/seed.sql` con un negocio ficticio publicado (sin datos personales reales) para probar el flujo público.
- Validación local (2026-11-13): las diez migraciones y el seed se aplicaron sin errores; se probaron flujo público, solapamientos, liberación de huecos al cancelar, validaciones, transiciones, triggers y aislamiento RLS entre dos cuentas.

**Skills de diseño para agentes (nivel proyecto)**
- Instaladas en `.agents/skills` con `skills-lock.json` versionado: `frontend-design`, `web-design-guidelines`, `ui-ux-pro-max`, `emil-design-eng` y `shadcn`. Se evaluó y descartó `design-taste-frontend` (auditoría Gen fallida y ~38 MB de assets de terceros).

### Pendiente (se trabaja en ramas por fase)

- Aplicar las migraciones al proyecto Supabase de desarrollo y ejecutar `seed.sql`.
- CI de GitHub Actions.
- Repetir la prueba de aislamiento RLS contra el proyecto Supabase (ya validada en PostgreSQL efímero).
- Tests automatizados de integración de RPC y concurrencia contra una base real.
- Tipos generados desde la base de datos.
- Flujo público real conectado a Supabase (sustituir el modo maqueta).
- Dependencias específicas de fases posteriores (formularios, animación, gráficos, tipografías, iconos, E2E), que se añadirán con aprobación previa.
- Marca definitiva (logo, favicon, imagen Open Graph).
- Revisar el contenido de las skills antes de aplicarlas en trabajo real.
