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

- **Fase:** 1 · Cimientos (en curso).
- **Hecho:** estructura del repositorio, documentación base adaptada, configuración raíz, toolchain del frontend y tokens de diseño. Sin páginas, componentes visuales, migraciones ni CI todavía (decisión del propietario para trabajar por ramas).
- **Próximo:** iniciar la Fase 1 en su rama: migraciones, RLS, RPC, seed, CI y prueba de aislamiento entre dos negocios.
- **Bloqueos:** credenciales del proyecto Supabase.

## Mantenimiento

Eliminar notas obsoletas. Mover decisiones arquitectónicas vigentes a `CONTEXT.md`; registrar cambios temporales en el sistema de issues/PR, no aquí.
