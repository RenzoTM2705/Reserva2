# MEMORY.md

> Conserva solo información estable que evite repetir contexto. No es un diario ni un changelog.

## Decisiones cerradas

- **Supabase cloud + migraciones locales.** El entorno de desarrollo es un proyecto Supabase en la nube; las migraciones se versionan en `supabase/migrations` y se aplican con `pnpm db:push`. Motivo: Docker no está disponible en la máquina de desarrollo.
- **Sin backend Node propio.** Postgres (RLS + RPC) es la única autoridad. Motivo: menos superficie y validación real del lado servidor.
- **Disponibilidad en SQL, no en TypeScript.** Una sola función (`public.get_available_slots`) alimenta la UI y la creación de reservas.
- **Solapamientos bloqueados por el motor** con `EXCLUDE USING gist (professional_id, tstzrange(starts_at, blocked_until))`.
- **Identidad «Editorial cálida»:** papel `#FAF7F2`, tinta `#1A1714`, terracota `#B4552D`; Fraunces + Instrument Sans.
- **Orden de construcción:** flujo público antes que panel administrativo. Motivo: es la pieza de mayor riesgo técnico y la más demostrable.
- **Sin Zustand, sin axios, sin librería de calendario genérica.** Estado de servidor con TanStack Query; estado de UI en la URL.
- **La plantilla documental se copia del vault** (`Boveda-Obsidian/Proyectos`) y se adapta en este repo. La bóveda es capa personal; el repo es la fuente de verdad.
- **Skills de diseño instaladas a nivel proyecto** en `.agents/skills` con `skills-lock.json` versionado, por preferencia del propietario de usar skills populares y bien valoradas. Se eligió un conjunto curado de cinco (`frontend-design`, `web-design-guidelines`, `ui-ux-pro-max`, `emil-design-eng`, `shadcn`) y se descartó `design-taste-frontend` por auditoría Gen fallida y ~38 MB de assets de terceros. Las skills se revisan antes de aplicarlas; se ejecutan con permisos completos.

## Restricciones vigentes

- **Docker no está disponible** en la máquina de desarrollo: no se puede usar `supabase start` ni tests que dependan de un stack local.
- **Sin credenciales de Supabase todavía.** Hasta que existan, las migraciones no se aplican y RLS no puede probarse contra una base real.
- **Moneda por defecto `PEN`.** Cambiarla requiere decisión del propietario.
- **Los datos de clientes son datos personales:** no se registran en logs, no se incluyen en mensajes de error y no se comparten entre negocios.
- **No se inventan datos de negocio, precios, direcciones ni políticas legales.** Los placeholders se marcan como tales.

## Errores resueltos relevantes

- **Docker Desktop apagado → `supabase start` falla.** Se eligió proyecto cloud con migraciones versionadas en lugar de forzar Docker.
- *(Se irán registrando aquí los errores con causa raíz y prevención.)*

## Preferencias de colaboración

- Preferir cambios pequeños y explicaciones claras.
- Antes de decisiones irreversibles o fuera del alcance, pedir confirmación.
- No asumir datos reales, secretos, contenido legal ni servicios contratados.
- Documentación y UI en español; código, commits y nombres de variables en inglés.
- Cada fase se entrega con su guía de commit y rama correspondiente; la estrategia de ramas no se escribe en los documentos del repo.

## Estado actual

- **Fase:** 2 · Flujo público + 3 · Panel (interfaz web, en curso).
- **Hecho:** estructura del repositorio, documentación base adaptada, toolchain del frontend y tokens de diseño. Interfaz web completa (fase de UI): landing, página pública de negocio, asistente de reserva en 5 pasos con estado en la URL, consulta por `confirmation_token`, auth (entrar/crear cuenta/recuperar), onboarding y panel completo (resumen, reservas con filtros y transiciones de estado, calendario mensual, CRUD de servicios y profesionales con asignación de servicios, clientes y configuración con horario semanal). Disponibilidad solo vía RPC `get_available_slots`; estado de UI en `searchParams`; `zod-resolver` propio (sin `@hookform/resolvers`). Checks `lint`, `typecheck`, `test:run` y `build` en verde.
- **Modo maqueta visual:** sin credenciales de Supabase, la capa de datos sirve datos de ejemplo en memoria (`lib/demo.ts`) para apreciar la interfaz; los cambios no persisten y el aviso va solo a la consola, nunca a la UI (decisión del propietario). No es cálculo de disponibilidad ni lógica real.
- **Próximo:** credenciales de Supabase para probar el flujo real punta a punta; luego criterios de salida de las fases (reserva real desde móvil, RLS contra base real).
- **Bloqueos:** credenciales del proyecto Supabase (`frontend/.env.local` aún no existe).

## Mantenimiento

Eliminar notas obsoletas. Mover decisiones arquitectónicas vigentes a `CONTEXT.md`; registrar cambios temporales en el sistema de issues/PR, no aquí.
