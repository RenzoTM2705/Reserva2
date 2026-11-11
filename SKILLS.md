# SKILLS.md

> Procedimientos repetibles. Ejecuta solo los pasos aplicables y registra cualquier paso omitido con su motivo.

## 1. Implementar una página o sección

1. Revisar brief, rutas, diseño existente y componentes reutilizables de `components/ui`.
2. Confirmar contenido, CTA principal, estados y comportamiento responsive.
3. Implementar estructura semántica usando los tokens de `@theme`; no introducir hex sueltos.
4. Añadir estados de carga, vacío, error y éxito cuando aplique.
5. Añadir metadatos de página (`title`, `description`) y enlaces internos pertinentes.
6. Verificar teclado, foco, contraste, alt text y tamaños móviles (390 / 768 / 1024 / 1440).
7. Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build`; revisar el diff.

## 2. Implementar un formulario

1. Definir campos mínimos, propósito, destinatario y mensaje de éxito.
2. Esquema Zod único reutilizado por el formulario y por la validación previa al envío.
3. Validar en cliente para UX y en servidor (RPC / constraints) para seguridad.
4. Etiquetar cada campo; asociar errores con `aria-describedby` y `aria-invalid`.
5. Mostrar loading y bloquear envíos duplicados (`isSubmitting`).
6. Manejar errores de red, validación y servidor sin perder los datos introducidos.
7. Añadir honeypot o límite de intentos en formularios públicos.
8. Tras éxito, mostrar confirmación con el siguiente paso (código de reserva, enlace).
9. Probar campos vacíos, inválidos, envío exitoso, fallo y navegación por teclado.

## 3. Revisar una feature / pull request

1. Comparar cambios con requisitos y alcance de la fase.
2. Revisar errores, casos límite, accesibilidad y responsive.
3. Verificar que no hay secretos, datos sensibles ni dependencias no aprobadas.
4. Comprobar enlaces, navegación, estados y manejo de errores.
5. Confirmar que toda tabla nueva tiene RLS y que toda función `SECURITY DEFINER` fija `search_path`.
6. Ejecutar checks disponibles y reportar resultados reales.
7. Confirmar documentación y `.env.example` actualizados si corresponde.
8. Entregar hallazgos por severidad: bloqueante, alto, medio, bajo.

## 4. Preparar lanzamiento

1. Confirmar contenido real, datos de contacto y permisos de imágenes.
2. Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` de producción.
3. Verificar 404, rutas, formularios, enlaces, responsive y navegadores objetivo.
4. Revisar HTTPS, dominio canónico, redirecciones, headers y variables de entorno.
5. Revisar SEO técnico, sitemap, robots, canonical, Open Graph y datos estructurados aplicables.
6. Confirmar privacidad/cookies/aviso legal según jurisdicción y servicios usados; pedir revisión humana/legal cuando corresponda.
7. Configurar analítica solo con consentimiento cuando sea requerido.
8. Confirmar backups de Supabase y plan de rollback.
9. No desplegar ni publicar sin autorización explícita.

## 5. Implementar un endpoint o API

En este proyecto el "endpoint" es una función RPC de PostgreSQL.

1. Definir el contrato primero: nombre, parámetros, tipo de retorno, errores y roles autorizados.
2. Implementar `SECURITY DEFINER` con `set search_path = ''` y nombres cualificados (`public.tabla`).
3. `REVOKE ALL ... FROM PUBLIC` y `GRANT EXECUTE` solo a `anon` y/o `authenticated` según corresponda.
4. Validar entrada y autorización dentro de la función; no confiar en el cliente.
5. Lanzar errores con códigos estables (`P0001`, `P0002`, `42501`) y mensajes sin detalles internos.
6. Escribir pruebas: caso feliz, entrada inválida, sin sesión, sin permisos y caso límite.
7. Documentar el contrato en `docs/TRD.md` y actualizar `docs/TRD.md`/`CONTEXT.md` si cambia el esquema.

## 6. Cambiar el esquema / migración

1. Revisar el esquema actual y los datos existentes; confirmar backup antes de cualquier cambio destructivo (requiere aprobación).
2. Escribir una migración nueva en `supabase/migrations/` (nunca editar una ya aplicada).
3. Definir constraints e índices explícitos; añadir `CHECK` para invariantes de negocio.
4. Actualizar RLS/políticas y triggers si la tabla nueva o modificada lo requiere.
5. Aplicar con `pnpm db:push`, verificar con `pnpm db:lint` y regenerar tipos con `pnpm types:gen`.
6. Probar la app antes y después; documentar el cambio en `docs/TRD.md`.

## 7. Documentar una decisión

1. Explicar contexto y problema.
2. Registrar opciones consideradas y decisión tomada.
3. Añadir consecuencias y limitaciones.
4. Actualizar `CONTEXT.md` si es arquitectura; `MEMORY.md` si es una restricción estable; `docs/DECISIONS.md` si merece un ADR.

## 8. Implementar la pantalla de reserva (flujo público)

1. Confirmar el orden de pasos: servicio → profesional → fecha y hora → datos → confirmación.
2. Modelar el progreso en `searchParams` para que atrás/adelante y los enlaces compartibles funcionen.
3. Obtener disponibilidad exclusivamente de `get_available_slots`; no calcular huecos en el cliente.
4. Mostrar estados: cargando (skeleton), sin huecos para ese día, error de red y reintento.
5. Al confirmar, usar `create_booking` y tratar `slot_unavailable` con un mensaje claro y refresco de huecos.
6. Tras el éxito, mostrar código de reserva y enlace `/reserva/:token`; no permitir doble envío.
7. Verificar el flujo completo en móvil (390 px) y con teclado.

## 9. Probar la concurrencia de reservas

1. Preparar un negocio de prueba con un profesional, un servicio y un hueco libre.
2. Lanzar dos llamadas simultáneas a `create_booking` con el mismo `starts_at` y profesional.
3. Verificar que exactamente una devuelve éxito y la otra falla con `slot_unavailable`.
4. Verificar en base de datos que solo existe una reserva y que la restricción `EXCLUDE` sigue activa.
5. Repetir con 5–10 peticiones concurrentes para descartar intermitencias.
6. Documentar el resultado en `docs/TRD.md`.

## 10. Cerrar una fase

1. Comprobar el criterio de salida de la fase en `docs/IMPLEMENTATION_PLAN.md`.
2. Actualizar `CHANGELOG.md` con lo añadido, cambiado y pendiente.
3. Actualizar `MEMORY.md` (estado actual) y `CONTEXT.md` si cambió la arquitectura.
4. Ejecutar la suite completa y el build de producción.
5. Revisar el diff buscando secretos, código muerto y archivos generados.
6. Proponer el mensaje de commit y la rama correspondiente (la estrategia no se documenta en el repo).
