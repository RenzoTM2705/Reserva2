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

**Skills de diseño para agentes (nivel proyecto)**
- Instaladas en `.agents/skills` con `skills-lock.json` versionado: `frontend-design`, `web-design-guidelines`, `ui-ux-pro-max`, `emil-design-eng` y `shadcn`. Se evaluó y descartó `design-taste-frontend` (auditoría Gen fallida y ~38 MB de assets de terceros).

### Pendiente (se trabaja en ramas por fase)

- Migraciones de esquema, RLS, disponibilidad, reservas y `seed.sql`.
- CI de GitHub Actions.
- Conexión del proyecto Supabase de desarrollo y prueba de aislamiento RLS entre dos negocios.
- Tipos generados desde la base de datos.
- Maqueta e interfaz del producto (Fase 2 en adelante).
- Dependencias específicas de fases posteriores (formularios, animación, gráficos, tipografías, iconos, E2E), que se añadirán con aprobación previa.
- Marca definitiva (logo, favicon, imagen Open Graph).
- Revisar el contenido de las skills antes de aplicarlas en trabajo real.
