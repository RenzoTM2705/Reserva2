# PRD — Reserva2

> Product Requirements Document ligero. Amplía `PROJECT_BRIEF.md` con métricas, priorización MoSCoW y criterios de aceptación detallados.

## 1. Problema

Los pequeños negocios gestionan sus citas con una mezcla de papel, WhatsApp y hojas de cálculo. Eso produce tres fallos recurrentes:

1. **Disponibilidad desactualizada:** el cliente no sabe qué horas están libres hasta que pregunta.
2. **Doble reserva:** dos personas apuntan la misma hora en soportes distintos.
3. **Pérdida de historial:** no hay forma de saber quién vino, cuándo ni cuánto gastó.

## 2. Propuesta de valor

Una página pública por negocio, con disponibilidad real, que el cliente usa sin cuenta; y un panel donde el propietario ve su día, su equipo y sus clientes en un solo lugar.

## 3. Usuarios

| Persona | Necesidad | Contexto de uso |
|---|---|---|
| Propietario (dueño de barbería/salón) | Ver el día de un vistazo y evitar huecos muertos | Escritorio en el local y móvil entre clientes |
| Personal / profesional | Saber sus citas y bloquear ausencias | Móvil |
| Cliente final | Reservar en menos de un minuto, sin cuenta | Móvil, desde un enlace de Instagram o Google |

## 4. Historias de usuario (MVP)

| ID | Como… | Quiero… | Para… |
|---|---|---|---|
| HU-01 | cliente | ver servicios, precios y duración del negocio | decidir qué reservar |
| HU-02 | cliente | elegir profesional | reservar con quien prefiero |
| HU-03 | cliente | ver solo horas realmente disponibles | no perder tiempo ni llamar |
| HU-04 | cliente | reservar dejando mis datos sin crear cuenta | terminar rápido |
| HU-05 | cliente | consultar y cancelar mi reserva con un enlace | no depender de llamar |
| HU-06 | propietario | crear mi negocio y publicarlo | empezar a recibir reservas |
| HU-07 | propietario | gestionar servicios, precios y duraciones | mantener el catálogo al día |
| HU-08 | propietario | añadir profesionales y sus horarios | reflejar la realidad del equipo |
| HU-09 | propietario | ver y cambiar el estado de las reservas | operar el día |
| HU-10 | propietario | ver el calendario por día, semana y mes | planificar |
| HU-11 | propietario | consultar el historial de un cliente | dar mejor servicio |
| HU-12 | propietario | configurar horarios y políticas | que la agenda se comporte como mi negocio |

## 5. Priorización MoSCoW

**Must**
- Reserva pública sin cuenta con disponibilidad real.
- Prevención de solapamientos a nivel de base de datos.
- Panel con reservas, servicios, profesionales, clientes y configuración.
- Aislamiento multi-tenant con RLS.
- Consulta y cancelación por token.

**Should**
- Calendario día/semana/mes.
- Dashboard con KPIs básicos.
- Página de presentación del producto.
- Onboarding guiado con datos por defecto.

**Could**
- Analítica avanzada (ingresos por período, horas punta, tasa de cancelación).
- Exportación de reservas a CSV.
- Imagen de portada por negocio.

**Won't (este MVP)**
- Pagos y señales.
- Notificaciones por email o WhatsApp.
- Asistente de IA.
- Planes de suscripción.
- App móvil nativa.

## 6. Criterios de aceptación clave

**RF-03 · Disponibilidad**
- Dado un negocio abierto de 09:00 a 18:00 en `America/Lima`, un servicio de 45 min y un profesional sin horario propio, la lista de huecos del día contiene 09:00, 09:30… siempre que 45 min quepan antes del cierre.
- Un día marcado como cerrado no devuelve huecos.
- Una ausencia de 12:00 a 14:00 elimina los huecos que se solapan con ese rango.
- Una reserva existente elimina los huecos que se solapan con su duración más su buffer.
- Un hueco anterior a `now() + min_lead_minutes` no se ofrece.

**RF-04 · Concurrencia**
- Dos peticiones simultáneas al mismo profesional y hora: exactamente una éxito, una `slot_unavailable`.
- Tras la prueba, existe una única fila en `bookings` para ese rango.

**RF-06 · Token**
- Un token válido muestra estado, servicio, profesional, fecha, hora y política de cancelación.
- Un token inexistente devuelve "reserva no encontrada" sin filtrar información.
- Cancele solo si la reserva está `pending` o `confirmed` y falta más que la política del negocio.

**RF-16 · Aislamiento**
- El usuario A, autenticado en el negocio 1, recibe cero filas al consultar `bookings`, `customers` o `services` del negocio 2.
- Un `insert` de A con `business_id` del negocio 2 es rechazado por RLS.

## 7. Métricas de éxito (producto)

| Métrica | Definición | Objetivo inicial |
|---|---|---|
| Tasa de finalización de reserva | reservas creadas / sesiones que inician el flujo | > 60 % |
| Reservas sin intervención manual | reservas públicas / total | > 80 % |
| Conflictos de agenda | solapamientos detectados | 0 |
| Tiempo hasta primera reserva | desde publicar el negocio | < 10 min |
| Errores 5xx / fallos de RPC | por 1000 reservas | < 5 |

> No se instrumentará analítica hasta que exista consentimiento y una decisión explícita.

## 8. Fuera de alcance y siguientes pasos

El MVP se cierra cuando un negocio real puede publicar su página y recibir reservas sin intervención del desarrollador. Todo lo demás (pagos, notificaciones, IA, planes) se evalúa después de validar el flujo principal con usuarios reales.
