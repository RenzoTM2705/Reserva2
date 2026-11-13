# QUALITY_CHECKLIST.md

> Checklist base. Marca N/A con motivo. No declares algo verificado si no lo probaste.

## Funcionalidad

- [ ] Todas las rutas esperadas cargan.
- [ ] Enlaces internos/externos funcionan y no llevan a placeholders.
- [ ] Botones tienen acción clara; no hay controles decorativos engañosos.
- [ ] Formularios validan, muestran errores por campo y error global.
- [ ] Formularios muestran loading, evitan doble envío y confirman éxito.
- [ ] Estados loading, vacío, error y éxito cubiertos donde corresponda.
- [ ] Página 404 personalizada y navegación de retorno.
- [ ] Página de confirmación si el flujo de conversión la requiere.
- [ ] No queda contenido de prueba, lorem ipsum ni datos ficticios visibles.

## Diseño y responsive

- [ ] Diseño coherente con `docs/UX.md`, jerarquía visual y CTA principal claro.
- [ ] Breakpoints probados a 390, 768, 1024 y 1440 px.
- [ ] No hay overflow horizontal ni contenido cortado.
- [ ] Imágenes optimizadas, proporciones correctas y lazy loading donde convenga.
- [ ] Favicon personalizado y recursos de marca correctos.
- [ ] Los tokens de color y tipografía se usan desde `@theme`; no hay hex sueltos en componentes.

## Accesibilidad

- [ ] Navegación completa con teclado y foco visible.
- [ ] HTML semántico, landmarks y orden de encabezados lógico.
- [ ] Inputs con labels; errores accesibles (`aria-invalid`, `aria-describedby`).
- [ ] Contraste suficiente (objetivo WCAG 2.2 AA).
- [ ] Imágenes informativas con alt útil; decorativas con alt vacío.
- [ ] No depender solo del color para indicar el estado de una reserva.
- [ ] Iconos interactivos tienen nombre accesible.
- [ ] `prefers-reduced-motion` respetado en todas las animaciones.

## Reservas y disponibilidad

- [ ] Los huecos mostrados respetan el horario del negocio.
- [ ] Se respeta el horario propio del profesional y sus ausencias.
- [ ] Se aplica el `buffer` posterior al servicio cuando corresponde.
- [ ] Se respeta la anticipación mínima y la máxima.
- [ ] Los días no laborables no ofrecen huecos.
- [ ] Un servicio no se puede reservar fuera de la ventana del profesional que lo realiza.
- [ ] Dos reservas simultáneas para el mismo profesional y hora producen una sola reserva.
- [ ] Cambiar de fecha, profesional o servicio refresca la disponibilidad.
- [ ] Una reserva cancelada o "no asistió" libera el hueco.
- [ ] La hora se muestra en la zona horaria del negocio, no en la del navegador.

## Aislamiento multi-inquilino

- [ ] Todas las tablas con datos de negocio tienen `business_id` y RLS activada.
- [ ] Un usuario del negocio A no puede leer ni escribir datos del negocio B, ni por consulta directa ni por RPC.
- [ ] Las políticas cubren `SELECT`, `INSERT`, `UPDATE` y `DELETE` (o bloquean explícitamente).
- [ ] Las funciones `SECURITY DEFINER` fijan `search_path` y revocan permisos de `PUBLIC`.
- [ ] Los formularios públicos no pueden escribir en tablas que no les corresponden.
- [ ] Existe una prueba automatizada de aislamiento entre dos negocios.

## SEO y compartir

- [ ] Título único y meta description por página indexable.
- [ ] Canonical correcto y URLs limpias.
- [ ] Open Graph (y Twitter/X card si aplica) con imagen válida.
- [ ] `sitemap.xml` y `robots.txt` correctos para producción.
- [ ] No bloquear indexación accidentalmente; `noindex` en el panel.
- [ ] Datos estructurados solo si corresponden y son veraces.
- [ ] Jerarquía de enlaces internos coherente.

## Seguridad y privacidad

- [ ] No hay secretos en repositorio, bundle, logs ni historial reciente.
- [ ] Inputs validados en servidor; consultas parametrizadas.
- [ ] Autorización server-side y acceso a registros restringido.
- [ ] RLS activada y probada.
- [ ] Headers de seguridad y HTTPS revisados en hosting.
- [ ] Cookies/sesiones seguras; política de cookies si corresponde.
- [ ] Protección anti-spam/rate limiting en el formulario público de reserva.
- [ ] Dependencias revisadas; no se ignoran vulnerabilidades relevantes.

## Backend y base de datos (si aplica)

- [ ] `BACKEND_CHECKLIST.md` completado, o marcado N/A con motivo en la entrega.

## Operación y lanzamiento

- [ ] Analítica y eventos de conversión aprobados y probados; consentimiento configurado cuando aplique.
- [ ] Teléfono, correo, WhatsApp y redes enlazan a destinos reales y funcionan en móvil.
- [ ] Pruebas en navegadores objetivo.
- [ ] Consola sin errores relevantes; requests sin fallos inesperados.
- [ ] Caché configurada para assets apropiados.
- [ ] Backups y restauración de Supabase definidos.
- [x] CI básica (lint, typecheck, tests, build) configurada en `.github/workflows/ci.yml`.
- [ ] Certificado TLS y renovación automática confirmados por plataforma.
- [ ] Search Console/Bing Webmaster configurados solo si aplican y el propietario tiene acceso.
