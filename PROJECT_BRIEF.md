# PROJECT_BRIEF.md

> Brief ligero para iniciar el proyecto. Completa lo conocido; marca lo desconocido como `Por definir`. No inventes datos. Este documento no sustituye un SRS/PRD completo; el detalle funcional vive en `docs/PRD.md`.

## Resumen

- **Nombre:** Reserva2
- **Tipo:** aplicación web SaaS multi-tenant (dashboard + páginas públicas de reserva)
- **Objetivo de negocio:** centralizar la gestión de citas y reservas de pequeños negocios y profesionales independientes, y ofrecer a sus clientes una página pública desde la que reservar sin llamar ni escribir.
- **Audiencia primaria:** propietarios y personal de barberías, salones de belleza, consultorios, entrenadores personales, estudios de tatuaje, profesores particulares y profesionales independientes.
- **Audiencia secundaria:** clientes finales de esos negocios, que reservan desde el móvil y sin crear cuenta.
- **Problema que resuelve:** sustituye agendas en papel, mensajes de WhatsApp y hojas de cálculo por una agenda compartida con disponibilidad real, estados de reserva y control de clientes.

## Alcance inicial

- **Páginas/rutas:**
  - Público: `/` (landing del producto), `/negocio/:slug` (página del negocio + reserva), `/reserva/:token` (consulta y cancelación de una reserva).
  - Autenticación: `/entrar`, `/crear-cuenta`, `/recuperar`.
  - Panel: `/panel`, `/panel/reservas`, `/panel/calendario`, `/panel/servicios`, `/panel/profesionales`, `/panel/clientes`, `/panel/configuracion`.
  - Sistema: `*` (404).
- **Funcionalidades imprescindibles:**
  - Reserva pública sin cuenta con disponibilidad real.
  - Panel con dashboard, reservas, calendario, servicios, profesionales, clientes y configuración.
  - Aislamiento multi-tenant por Row Level Security.
  - Prevención de reservas solapadas a nivel de base de datos.
  - Consulta y cancelación de la propia reserva mediante token.
- **Fuera de alcance (MVP):** pagos, planes de suscripción, notificaciones por email/WhatsApp, asistente de IA, analítica avanzada, aplicación móvil nativa, multiidioma, facturación.
- **CTA principal (landing):** crear una cuenta y publicar el negocio.
- **CTA principal (página de negocio):** reservar una cita.

## Contenido y marca

- **Nombre comercial y descripción:** Reserva2 — «La agenda de tu negocio, sin fricción».
- **Tono:** directo, profesional y cálido. Sin superlativos ni promesas de resultados que no se puedan demostrar.
- **Logo/identidad disponible:** `Por definir` (se necesita marca tipográfica y favicon antes de la Fase 2).
- **Colores/tipografía existentes:** identidad «Editorial cálida» definida en `docs/UX.md` — papel `#FAF7F2`, tinta `#1A1714`, terracota `#B4552D`; Fraunces (display) + Instrument Sans (UI).
- **Imágenes y derechos de uso:** `Por definir`. No se usarán fotos de stock sin licencia verificada.
- **Dirección, teléfono, correo y redes reales:** `Por definir` — pertenecen a cada negocio y los introduce el propietario. La plataforma no publica datos de contacto propios hasta que existan.

## Requisitos funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Página pública del negocio | Must | `/negocio/:slug` muestra nombre, descripción, dirección, servicios, precios y duración; responde 404 si el negocio no está publicado |
| RF-02 | Reserva pública sin cuenta | Must | Un visitante completa servicio → profesional → fecha/hora → datos → confirmación sin registrarse |
| RF-03 | Disponibilidad real | Must | Los huecos mostrados respetan horario del negocio, horario del profesional, ausencias, buffer y reservas existentes |
| RF-04 | Prevención de solapamientos | Must | Dos solicitudes simultáneas para el mismo profesional y hora producen una sola reserva; la otra recibe un error claro |
| RF-05 | Confirmación de reserva | Must | Tras reservar se muestra un código y un enlace `/reserva/:token` con el estado |
| RF-06 | Consulta y cancelación por token | Must | El cliente consulta su reserva y puede cancelarla si la política lo permite, sin crear cuenta |
| RF-07 | Autenticación del propietario | Must | Registro, inicio de sesión, recuperación de contraseña y sesión persistente |
| RF-08 | Onboarding del negocio | Must | El propietario crea su negocio con slug único y horario por defecto |
| RF-09 | Gestión de servicios | Must | Crear, editar, activar/desactivar servicios con duración, precio y buffer |
| RF-10 | Gestión de profesionales | Must | Crear, editar, asignar servicios y configurar horario propio y ausencias |
| RF-11 | Gestión de reservas | Must | Crear manualmente, editar, confirmar, completar, cancelar y marcar no asistió; buscar y filtrar |
| RF-12 | Calendario | Must | Vistas día, semana y mes con carriles por profesional y color por estado |
| RF-13 | Directorio de clientes | Must | Lista con contacto, número de reservas y última visita; historial por cliente |
| RF-14 | Dashboard | Must | Reservas de hoy, próximas, pendientes, canceladas, ingresos estimados y servicios más solicitados |
| RF-15 | Configuración del negocio | Must | Nombre, descripción, logo, dirección, contacto, horarios, días no laborables, anticipación mínima y máxima, política de cancelación y publicación |
| RF-16 | Aislamiento multi-tenant | Must | Un usuario de un negocio no puede leer ni escribir datos de otro, ni por API ni por consulta directa |
| RF-17 | Página de presentación del producto | Should | `/` explica qué es Reserva2 y enlaza al registro |
| RF-18 | Analítica de rendimiento | Could | Ingresos por período, horas de mayor demanda, tasa de cancelación y rendimiento por profesional |

## Requisitos no funcionales

- **Responsive:** 390 / 768 / 1024 / 1440 px sin overflow horizontal; el flujo de reserva es mobile-first.
- **Accesibilidad:** objetivo WCAG 2.2 AA; foco visible, navegación por teclado, contraste, `aria-live` en estados asíncronos y `prefers-reduced-motion`.
- **SEO/indexación:** la landing y las páginas públicas de negocio son indexables con metadatos propios; el panel va con `noindex`.
- **Rendimiento:** JS inicial contenido; sin librerías de calendario genéricas; fuentes autoalojadas con subset latino; carga diferida de rutas del panel.
- **Seguridad/privacidad:** RLS en todas las tablas; `service_role` nunca en el navegador; datos personales de clientes minimizados y no registrados en logs.
- **Navegadores objetivo:** últimas dos versiones de Chrome, Edge, Firefox y Safari (incluido iOS).

## Integraciones

- **Formulario / email:** `Por definir` — sin proveedor en el MVP.
- **CRM / API:** ninguna.
- **Analítica:** no implementada; requerirá consentimiento si se añade.
- **CMS:** ninguno; el contenido del negocio lo edita el propietario desde el panel.
- **Base de datos:** PostgreSQL gestionado por Supabase, con RLS y funciones RPC.
- **Autenticación:** Supabase Auth (email + contraseña).
- **Almacenamiento:** Supabase Storage para logos de negocio.
- **Hosting:** Vercel (frontend) + Supabase (base de datos y auth).
- **Otros:** ninguna pasarela de pago en el MVP.

## Entregables y aceptación

- [ ] Páginas y funcionalidades acordadas completadas.
- [ ] Contenido y datos reales aprobados.
- [ ] Pruebas y checklist completados.
- [ ] Build y deploy aprobados por el responsable.

## Preguntas abiertas

- [ ] Proyecto Supabase de desarrollo: `URL`, `anon key`, `service_role key` y `project_id` — responsable: propietario.
- [ ] Moneda por defecto: se asume `PEN`; confirmar si el producto debe soportar varias monedas por negocio desde el MVP.
- [ ] Jurisdicción y textos legales (privacidad, cookies): definir antes de publicar la landing.
- [ ] Marca definitiva (logo, favicon, imagen Open Graph): necesaria antes de la Fase 2.
- [ ] Política de cancelación por defecto: se propone 24 horas de antelación, editable por negocio.
