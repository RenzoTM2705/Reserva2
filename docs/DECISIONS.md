# DECISIONS — ADR de Reserva2

> Registro de decisiones de arquitectura. Cada ADR describe contexto, opciones, decisión y consecuencias. Las decisiones estables también se resumen en `CONTEXT.md` y `MEMORY.md`.

## ADR-001 · Supabase como backend completo

**Fecha:** Fase 1
**Estado:** Aceptada

**Contexto.** El producto necesita autenticación, base de datos relacional, aislamiento multi-tenant y despliegue económico.

**Opciones**
1. Backend Node propio (Fastify/Express) + Postgres.
2. Supabase: PostgreSQL + Auth + RLS + RPC, consumido directamente desde el frontend.

**Decisión.** Opción 2.

**Consecuencias**
- Menos infraestructura y menos código de autorización duplicado.
- Toda la seguridad depende de que las políticas RLS estén bien escritas y probadas.
- La lógica de negocio compleja se escribe en SQL/PLpgSQL, lo que exige disciplina y pruebas específicas.

---

## ADR-002 · Disponibilidad calculada en PostgreSQL

**Fecha:** Fase 1
**Estado:** Aceptada

**Contexto.** Calcular huecos en el navegador es rápido de escribir pero produce dos fuentes de verdad: la UI y la creación de la reserva. Con el tiempo divergen.

**Opciones**
1. Calcular en TypeScript y validar de nuevo en el servidor.
2. Calcular en una función SQL y consumirla desde la UI y desde la creación de reserva.

**Decisión.** Opción 2.

**Consecuencias**
- Una sola implementación de la regla de negocio.
- La UI depende de la latencia de la RPC (mitigada con caché de TanStack Query por fecha/servicio).
- El cálculo no es testeable en Vitest puro; se prueba con integración contra la base.

---

## ADR-003 · Restricción `EXCLUDE` para impedir solapamientos

**Fecha:** Fase 1
**Estado:** Aceptada

**Contexto.** Dos clientes pueden pulsar "reservar" en el mismo hueco con milisegundos de diferencia. Una comprobación `SELECT` seguida de `INSERT` no es atómica.

**Opciones**
1. Bloqueo a nivel de aplicación con un advisory lock.
2. Comprobación dentro de la transacción de la RPC.
3. Restricción de exclusión de PostgreSQL sobre el rango ocupado por profesional.

**Decisión.** Opción 3, complementada con la validación de la opción 2 para dar un mensaje claro.

**Consecuencias**
- El motor garantiza la invariante incluso si la lógica de aplicación falla.
- Requiere la extensión `btree_gist`.
- Las reservas canceladas deben excluirse del índice mediante un predicado parcial.

---

## ADR-004 · `timestamptz` + zona horaria IANA por negocio

**Fecha:** Fase 1
**Estado:** Aceptada

**Contexto.** Un negocio en Lima y un cliente en Madrid deben ver la misma cita a la hora correcta.

**Opciones**
1. Guardar horas locales como `timestamp` sin zona.
2. Guardar instantes en `timestamptz` y la zona del negocio en `businesses.timezone`.

**Decisión.** Opción 2.

**Consecuencias**
- Conversiones explícitas en la UI y en SQL al generar huecos.
- Los cambios de horario de verano se resuelven con la base de datos de zonas de PostgreSQL.

---

## ADR-005 · Sin Zustand; estado de servidor y de URL

**Fecha:** Fase 1
**Estado:** Aceptada

**Contexto.** El asistente de reserva tiene estado compartido entre pasos y el calendario tiene filtros y vista activa.

**Opciones**
1. Store global con Zustand.
2. TanStack Query para datos + `searchParams` para estado de navegación.

**Decisión.** Opción 2.

**Consecuencias**
- El flujo es navegable con atrás/adelante y compartible por enlace.
- Menos estado duplicado y menos dependencias.
- Los estados efímeros (modales, hover) se quedan en `useState` local.

---

## ADR-006 · Calendario propio en lugar de una librería

**Fecha:** Fase 1
**Estado:** Aceptada

**Contexto.** El calendario del panel necesita carriles por profesional, altura proporcional a la duración y un lenguaje visual propio.

**Opciones**
1. FullCalendar / React Big Calendar.
2. Componente propio sobre date-fns.

**Decisión.** Opción 2.

**Consecuencias**
- Control total del diseño y del comportamiento.
- Más trabajo de implementación y de accesibilidad (navegación por teclado).
- Se documenta la estructura de datos del calendario para no reinventarla en cada vista.

---

## ADR-007 · shadcn/ui re-tematizado

**Fecha:** Fase 1
**Estado:** Aceptada

**Contexto.** Se necesitan primitivas accesibles (diálogos, selects, popovers) sin adoptar la estética de plantilla SaaS.

**Opciones**
1. Librería cerrada (MUI, Chakra).
2. shadcn/ui: código copiado sobre Radix, con tokens propios.

**Decisión.** Opción 2.

**Consecuencias**
- Las primitivas son propiedad del proyecto y se pueden adaptar.
- La accesibilidad de Radix se conserva.
- Hay que mantener el código copiado y evitar que el theme base reaparezca.

---

## ADR-008 · Tokens de diseño en `@theme` de Tailwind v4

**Fecha:** Fase 1
**Estado:** Aceptada

**Contexto.** Tailwind v4 usa CSS como fuente de verdad en lugar de `tailwind.config.js`.

**Decisión.** Definir todos los tokens en `frontend/src/styles/index.css` bajo `@theme` y prohibir hex sueltos en componentes.

**Consecuencias**
- Un único lugar para cambiar la identidad visual.
- Los nombres de los tokens son parte del contrato del equipo.

---

## ADR-009 · Skills de diseño a nivel de proyecto, en conjunto curado

**Fecha:** Fase 1
**Estado:** Aceptada

**Contexto.** El propietario pidió integrar en Reserva2 las skills de diseño más populares y mejor valoradas, en una carpeta `skills`.

**Opciones**
1. Instalar las mejor valoradas del ranking `skills.sh` sin más criterios.
2. Instalar un conjunto curado de cinco skills populares y con auditoría aceptable, documentando descartes.

**Decisión.** Opción 2. Se instala en `.agents/skills` (ubicación estándar de OpenCode a nivel de proyecto):

- `frontend-design` (`anthropics/skills`, ~1,1 M instalaciones).
- `web-design-guidelines` (`vercel-labs/agent-skills`, ~852 K).
- `ui-ux-pro-max` (`nextlevelbuilder/ui-ux-pro-max-skill`, ~447 K; Seguro · Bajo).
- `emil-design-eng` (`emilkowalski/skills`, ~440 K; Seguro · Bajo).
- `shadcn` (`shadcn/ui`, ~271 K; Seguro · Medio).

Se descarta `design-taste-frontend` (`leonxlnx/taste-skill`, ~764 K): Gen Agent Trust Hub **Falla**, Snyk avisa, y su repositorio redistribuye ~38 MB de fotos y assets de terceros (`assets/photos/`, `assets/objects/`…) con su propio archivo de créditos, que no conviene versionar ni usar sin revisión.

**Consecuencias**
- `skills-lock.json` se versiona para poder restaurarlas (`npx skills experimental_install`) y auditar su hash.
- Las skills se ejecutan con los permisos completos del agente: se revisan antes de aplicarlas.
- Volver a evaluar skills descartadas cuando su auditoría cambie.
