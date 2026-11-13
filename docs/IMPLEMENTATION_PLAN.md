# IMPLEMENTATION_PLAN — Reserva2

> Plan de ejecución por fases. Cada fase se desarrolla en una rama `feature/fase-N-<slug>` y se integra a `develop` por Pull Request. `main` recibe únicamente cierres de fase o el cierre del MVP.

## Resumen

| Fase | Nombre | Estado | Criterio de salida |
|---|---|---|---|
| 1 | Cimientos | Cierre pendiente del CI | Toolchain, documentación, esquema, RLS, RPC y CI en verde |
| 2 | Flujo público | Pendiente | Reserva real de punta a punta sin cuenta |
| 3 | Panel admin v1 | Pendiente | Catálogo y agenda gestionables |
| 4 | Reservas + calendario | Pendiente | Operación diaria completa |
| 5 | Calidad | Pendiente | Suite completa y checklists |
| 6 | Publicación | Pendiente | URL pública en producción |

---

## Fase 1 — Cimientos

**Objetivo:** dejar un repositorio sano, con documentación, diseño base y base de datos definida antes de escribir producto.

**Entregables**
- Estructura del repositorio (`frontend/`, `supabase/`, `docs/`, `.github/`).
- Documentación operativa adaptada desde la plantilla maestra.
- Toolchain: Vite 8 + React 19 + TypeScript estricto, Tailwind v4, ESLint, Vitest.
- Design tokens «Editorial cálida» y primitivas de UI reutilizables.
- Cliente de Supabase y TanStack Query configurados.
- Migraciones: esquema, RLS, disponibilidad, reservas.
- `seed.sql` con datos de demostración etiquetados como tales.
- CI: lint, typecheck, test y build.

**Criterio de salida**
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
- Migraciones aplicadas al proyecto de desarrollo.
- Tipos generados desde la base.
- Prueba de aislamiento RLS entre dos negocios documentada.

**Riesgos**
- La disponibilidad en SQL es la pieza más delicada. Se prueba con casos límite antes de tocar la UI.
- Sin credenciales de Supabase, la fase queda "escrita" pero no "verificada". Se marca explícitamente.

**Estado de cierre (2026-11-13)**

- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde en local.
- [x] Migraciones aplicadas al proyecto Supabase `ogdnpltdsjmxojbuwdhw` y seed de un negocio.
- [x] Tipos generados en `frontend/src/types/database.generated.ts`.
- [x] Aislamiento RLS entre dos negocios probado en PostgreSQL efímero y en el proyecto real.
- [x] CI en `.github/workflows/ci.yml` (lint, tipos, tests y build).
- [ ] Primera ejecución del CI en verde: se comprueba al abrir el Pull Request.

---

## Fase 2 — Flujo público

**Objetivo:** que un cliente reserve sin cuenta y con disponibilidad real.

**Entregables**
- Landing del producto en `/`.
- Página de negocio `/negocio/:slug`.
- Asistente de reserva en cinco pasos con estado en la URL.
- Integración con `get_available_slots` y `create_booking`.
- Confirmación y página `/reserva/:token`.
- Metadatos, Open Graph y 404.

**Criterio de salida**
- Reserva completa desde un móvil de 390 px.
- El hueco reservado desaparece de la lista sin recargar la página.
- Dos pestañas que intentan el mismo hueco: una gana, la otra ve un mensaje claro.
- Un negocio despublicado devuelve 404.

**Riesgos**
- Zona horaria: probar con `America/Lima` y un navegador en otro huso.
- Duplicados por doble clic: bloquear el envío y hacer la operación idempotente.

---

## Fase 3 — Panel admin v1

**Objetivo:** que el propietario pueda configurar su negocio y su equipo.

**Entregables**
- Auth: registro, login, recuperación y sesión persistente.
- Onboarding: crear negocio, horario por defecto, primer servicio y primer profesional.
- Shell del panel con navegación responsive.
- CRUD de servicios, profesionales, horarios y ausencias.
- Directorio de clientes con historial.

**Criterio de salida**
- Un usuario nuevo publica su negocio y añade su primer servicio en menos de 10 minutos.
- Un usuario del negocio A no ve ni puede modificar datos del negocio B desde la UI.
- Todas las mutaciones muestran estados de carga y error.

---

## Fase 4 — Reservas, calendario y configuración

**Objetivo:** operar el día completo desde el panel.

**Entregables**
- Listado de reservas con búsqueda y filtros persistentes.
- Creación manual y edición de reservas.
- Transiciones de estado con historial (`booking_events`).
- Calendario día/semana/mes con carriles por profesional.
- Configuración del negocio: datos, logo, horarios, días no laborables, anticipación, política de cancelación y publicación.

**Criterio de salida**
- Crear una reserva manual que respete la disponibilidad.
- Cambiar estados y ver el reflejo inmediato en dashboard y calendario.
- Publicar y despublicar el negocio con efecto real en la página pública.

---

## Fase 5 — Calidad

**Objetivo:** cerrar deuda técnica y demostrar que el producto resiste.

**Entregables**
- Unitarios de utilidades y componentes.
- Integración de RPC y RLS contra el proyecto de desarrollo.
- E2E del flujo público y del login.
- Revisión de accesibilidad (WCAG 2.2 AA) y de rendimiento.
- Auditoría de dependencias y de cabeceras.

**Criterio de salida**
- Suite verde en CI.
- `QUALITY_CHECKLIST.md`, `SECURITY_CHECKLIST.md` y `BACKEND_CHECKLIST.md` completadas o marcadas N/A con motivo.
- Sin hallazgos bloqueantes.

---

## Fase 6 — Publicación

**Objetivo:** llevar el producto a producción con un proceso repetible.

**Entregables**
- Proyecto Supabase de producción y migraciones aplicadas.
- Frontend en Vercel con variables de entorno y dominio.
- Cabeceras de seguridad, `robots.txt` y sitemap.
- Documentación de despliegue y de rollback.
- `README.md` y `CHANGELOG.md` finales.

**Criterio de salida**
- URL pública con reserva funcional verificada de punta a punta.
- Backups de Supabase configurados y restauración probada.
- Sin secretos en el repositorio ni en el bundle.

---

## Plan de rollback

| Situación | Acción |
|---|---|
| Una migración rompe la app | Revertir con una migración correctiva nueva; nunca editar la aplicada |
| Un despliegue del frontend falla | Volver al deployment anterior en Vercel (rollback instantáneo) |
| RLS mal configurada en producción | Pausar la escritura pública (`is_published = false`), corregir políticas y republicar |
| Pérdida de datos | Restaurar desde el backup de Supabase más reciente y documentar el incidente |

## Convención de trabajo

- Una rama por fase: `feature/fase-N-<slug>`.
- Commits atómicos con Conventional Commits en inglés.
- Pull Request con propósito, cambios, pruebas, riesgos y migraciones.
- No se integra una fase sin su criterio de salida cumplido.
