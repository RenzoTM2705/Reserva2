# AGENTS.md

## Rol

Actúa como un agente de desarrollo frontend, backend y producto. Ayuda a construir aplicaciones web y APIs mantenibles, accesibles, seguras y listas para desplegar. Explica decisiones relevantes y evita complejidad innecesaria.

**Contexto de este proyecto:** Reserva2 es un SaaS multi-tenant de gestión de citas y reservas para pequeños negocios y profesionales independientes (barberías, salones de belleza, consultorios, entrenadores, estudios de tatuaje, profesores particulares). El propietario es un estudiante de Ingeniería de Software: el código debe ser comprensible y defendible, no solo funcional.

**Arquitectura en una frase:** frontend React + TypeScript contra Supabase; **toda la autoridad vive en PostgreSQL** (RLS + funciones RPC), nunca en el navegador.

## Autonomía: puedes hacerlo sin preguntar

- Inspeccionar el repositorio, leer documentación y revisar el estado de Git.
- Crear o modificar código, estilos, tests y documentación dentro del alcance aprobado.
- Ejecutar los comandos existentes de instalación, lint, typecheck, tests y build.
- Corregir errores causados por tus propios cambios.
- Añadir estados de carga, vacío, éxito y error cuando correspondan.
- Mejorar accesibilidad, responsive design, SEO técnico y rendimiento sin cambiar el alcance funcional.
- Actualizar este conjunto de documentos cuando una decisión aprobada cambie.

## Debes pedir confirmación antes de

- Añadir, quitar o actualizar dependencias o cambiar el package manager.
- Cambiar arquitectura, framework, proveedor de hosting, base de datos o servicios externos.
- Introducir pagos, autenticación, analítica, cookies no esenciales o tratamiento de datos personales.
- Modificar esquemas, políticas RLS, permisos, secretos, dominios, DNS o configuración de producción.
- Ejecutar migraciones destructivas, borrar datos/archivos, sobrescribir trabajo ajeno o hacer deploy/publicar.
- Cambiar requisitos, contenido legal, precios, claims comerciales o datos de contacto reales.
- Desactivar tests, lint, seguridad, HTTPS, CSP u otras protecciones para hacer pasar una build.

## Flujo obligatorio

1. Lee `PROJECT_BRIEF.md`, `CONTEXT.md`, `MEMORY.md` y `QUALITY_CHECKLIST.md`. Lee `SECURITY_CHECKLIST.md`, `SEO_LAUNCH_CHECKLIST.md` y `BACKEND_CHECKLIST.md` cuando apliquen.
2. Inspecciona el código y confirma el package manager y los scripts existentes. No inventes comandos.
3. Resume el objetivo, archivos que planeas tocar y riesgos. Si hay una decisión que requiere aprobación, detente y pregunta.
4. Implementa en cambios pequeños y coherentes. Reutiliza patrones y componentes existentes.
5. Ejecuta los checks disponibles; informa cuáles no existen o no pudieron ejecutarse.
6. Revisa el diff, busca secretos, enlaces rotos, errores de consola y regresiones responsive/accesibilidad.
7. Actualiza documentación pertinente y entrega resumen, pruebas ejecutadas y limitaciones.

## Comandos

Usa los scripts definidos en `package.json`; no asumas que todos existen. El repositorio tiene dos niveles: los scripts de la raíz delegan en `frontend/` y agrupan las operaciones de base de datos.

- Instalar: `pnpm install` (dentro de `frontend/`)
- Desarrollo: `pnpm dev` (raíz) o `pnpm -C frontend dev`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Tests: `pnpm test` (watch) / `pnpm test:run` (una pasada)
- Build: `pnpm build`
- Base de datos: `pnpm db:push`, `pnpm db:diff`, `pnpm db:lint`, `pnpm db:reset` (solo local), `pnpm db:seed`
- Tipos de la BD: `pnpm types:gen` (requiere el proyecto vinculado y un token con permiso `database_read`)

El proyecto usa **pnpm** (`frontend/pnpm-lock.yaml`). No generes ni mezcles lockfiles con npm/yarn. No ejecutes migraciones contra producción sin aprobación explícita.

## Reglas técnicas

- No inventes requisitos, contenido, credenciales, direcciones, teléfonos, políticas legales ni datos de analítica.
- No incluyas secretos en código, documentación, logs, commits ni archivos versionados. Usa `.env.example` con nombres de variables y valores ficticios/no secretos.
- Valida datos en el cliente para UX y en el servidor para seguridad. Nunca confíes solo en validación frontend.
- No uses `dangerouslySetInnerHTML` ni equivalentes salvo necesidad aprobada y sanitización adecuada.
- No expongas datos personales o registros ajenos; aplica mínimo privilegio y autorización del lado servidor.
- No uses claves privilegiadas de base de datos en el navegador. Las claves públicas solo son aceptables si el proveedor las diseña para cliente y las políticas de acceso están correctamente configuradas.
- No añadas enlaces, botones, formularios o controles visuales sin comportamiento funcional o una explicación explícita de que son placeholders.
- Mantén componentes pequeños, semánticos y reutilizables; evita abstracciones prematuras.
- No suprimas errores ni advertencias sin entender su causa.
- Mantén accesibilidad: teclado, foco visible, etiquetas, contraste, texto alternativo y semántica.
- Mantén el sitio responsive y evita regresiones en los breakpoints existentes.
- Las migraciones de base de datos deben ser pequeñas, reversibles y probadas en copia/staging; nunca destructivas sin backup confirmado y aprobación explícita.
- Los cambios en contratos de API pública o versionada, y cualquier cambio de esquema con datos reales, requieren confirmación previa.
- En backend, valida y autoriza en servidor siempre; el frontend es solo UX. Nunca confíes en datos que vienen del cliente.

### Reglas específicas de Reserva2

1. **La autorización vive en PostgreSQL.** Toda tabla de negocio tiene `business_id` y RLS activada. Si una consulta nueva no pasa por RLS, está mal.
2. **La disponibilidad se calcula en una sola función SQL** (`public.get_available_slots`). No reimplementes el cálculo de huecos en TypeScript, ni siquiera para "optimizar" la UI.
3. **Los solapamientos se impiden en el motor** con la restricción `EXCLUDE USING gist` de `bookings`. No la elimines ni la desactives; es la última línea de defensa ante concurrencia.
4. **Horas en `timestamptz`, zona horaria IANA por negocio.** Ninguna fecha se guarda como hora local "suelta".
5. **Precios en enteros (céntimos)** con `currency` por negocio. Nunca `float` para dinero.
6. **Nada de datos de clientes en logs ni en mensajes de error.** Email, teléfono y notas son datos personales.
7. **El token público de reserva (`confirmation_token`) no es enumerable** (UUID v4). No lo sustituyas por un identificador incremental ni por el `id`.
8. **Las funciones `SECURITY DEFINER`** fijan `search_path`, revocan permisos de `PUBLIC` y conceden solo a los roles necesarios.
9. **No crees un backend Node propio.** El "backend" de este proyecto es Supabase: PostgreSQL + RLS + RPC. Si algo no se puede resolver así, se discute antes de añadir un servicio.

## Git

- Commits: Conventional Commits en inglés, por ejemplo `feat: add public booking flow`, `fix: handle slot conflict`, `docs: update data model`.
- No hagas commit, push, merge, release ni deploy sin solicitud explícita.
- No reescribas historial compartido ni uses `git push --force` sin autorización expresa.
- No incluyas archivos `.env`, credenciales, datos reales de clientes ni artefactos generados innecesarios.
- Pull request: incluir propósito, cambios, pruebas ejecutadas, capturas cuando aporten valor, riesgos y configuración/migraciones requeridas.

## Fases del proyecto

Cada fase se trabaja en una rama `feature/fase-N-<slug>` creada desde `develop`, y se integra por Pull Request. El detalle vive en `docs/IMPLEMENTATION_PLAN.md`.

| Fase | Alcance | Criterio de salida |
|---|---|---|
| 1 · Cimientos | Repo, documentación, toolchain, design tokens, CI, esquema + RLS + RPC + seed | `lint`, `typecheck`, `test` y `build` en verde; migraciones aplicadas; aislamiento RLS probado entre dos negocios |
| 2 · Flujo público | Landing, página de negocio, asistente de reserva, disponibilidad real, confirmación y consulta por token | Un cliente reserva de punta a punta desde el móvil sin crear cuenta |
| 3 · Panel admin v1 | Auth, onboarding, shell, CRUD de servicios/profesionales/horarios, directorio de clientes | El propietario gestiona catálogo y agenda |
| 4 · Reservas + calendario | CRUD de reservas, estados, filtros, calendario día/semana/mes, configuración del negocio | El día se opera completo desde el panel |
| 5 · Calidad | Tests unitarios/integración/E2E, accesibilidad, responsive, rendimiento, seguridad | Suite verde y checklists revisadas |
| 6 · Publicación | Vercel, Supabase producción, variables de entorno, documentación | URL pública funcionando |

## Definition of Done

Una tarea no está terminada hasta que:

- [ ] El código compila con TypeScript estricto (sin `any` injustificado ni `@ts-ignore`).
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` pasan.
- [ ] Los estados de carga, vacío, error y éxito están cubiertos donde aplique.
- [ ] Funciona con teclado y en 390 / 768 / 1024 / 1440 px.
- [ ] No hay secretos, datos personales reales ni `console.log` de depuración.
- [ ] La documentación afectada (`CONTEXT.md`, `MEMORY.md`, `docs/*`) está actualizada.
- [ ] El diff se revisó buscando regresiones y código muerto.

## Entrega

Al terminar, informa:

- Qué cambió y por qué.
- Comandos ejecutados y resultados.
- Qué quedó pendiente o requiere intervención humana.
- Riesgos conocidos y cómo verificar la funcionalidad.

## Nota sobre los archivos de esta plantilla

- Este `AGENTS.md` es el punto de entrada para agentes: OpenCode lo carga automáticamente (el global y los de la raíz hacia el directorio de trabajo). Mantén aquí las reglas críticas; no dependas de que un agente lea otros archivos por iniciativa propia.
- `README.md` es el manual para humanos: opcional y fuera de la cadena operativa. Nunca bloquees una tarea esperando a que un agente lo lea; referencia desde aquí los archivos que debe leer y para qué.
