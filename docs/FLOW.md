# FLOW — Flujos de usuario

> Diagramas en Mermaid. Se renderizan en GitHub y en Obsidian sin plugins extras.

## 1. Reserva pública (sin cuenta)

```mermaid
flowchart TD
    A[Cliente abre /negocio/:slug] --> B[Elige servicio]
    B --> C{¿Hay varios profesionales?}
    C -- Sí --> D[Elige profesional o 'cualquiera']
    C -- No --> E[Profesional asignado automáticamente]
    D --> F[Elige fecha]
    E --> F
    F --> G[get_available_slots]
    G --> H{¿Hay huecos?}
    H -- No --> I[Mensaje: sin disponibilidad + sugerir otro día]
    I --> F
    H -- Sí --> J[Elige hora]
    J --> K[Introduce nombre, email, teléfono y notas]
    K --> L[create_booking]
    L --> M{Resultado}
    M -- Éxito --> N[Confirmación: código + enlace /reserva/:token]
    M -- slot_unavailable --> O[Aviso: ese hueco se ocupó + refrescar huecos]
    O --> F
    M -- Error de validación --> K
```

**Passos visibles para el usuario:** 5. Servicio → Profesional → Fecha y hora → Datos → Confirmación.

**Estado en la URL:** `?servicio=<id>&profesional=<id>&fecha=<yyyy-mm-dd>&hora=<iso>` para que atrás/adelante funcione y el enlace sea compartible.

## 2. Consulta y cancelación por token

```mermaid
flowchart TD
    A[Cliente abre /reserva/:token] --> B[get_booking_status]
    B --> C{¿Existe?}
    C -- No --> D[404: reserva no encontrada]
    C -- Sí --> E[Muestra estado, servicio, profesional, fecha y hora]
    E --> F{¿Se puede cancelar?}
    F -- No --> G[Muestra la política aplicable]
    F -- Sí --> H[Botón Cancelar]
    H --> I[Confirmación explícita]
    I --> J[cancel_booking_by_token]
    J --> K[Estado actualizado + hueco liberado]
```

## 3. Registro y onboarding del propietario

```mermaid
flowchart TD
    A[/crear-cuenta] --> B[Supabase Auth: email + contraseña]
    B --> C[Verificación de email]
    C --> D[/entrar]
    D --> E{¿Tiene negocio?}
    E -- No --> F[Formulario: nombre y slug del negocio]
    F --> G[create_business]
    G --> H[Horario por defecto lun-sáb 09:00-18:00]
    H --> I[Añadir primer servicio]
    I --> J[Añadir primer profesional y asignarle el servicio]
    J --> K[Revisar página pública]
    K --> L[Publicar negocio]
    L --> M[/panel]
    E -- Sí --> M
```

## 4. Gestión de una reserva en el panel

```mermaid
stateDiagram-v2
    [*] --> pending: create_booking (requiere confirmación)
    [*] --> confirmed: create_booking (auto-confirmar)
    pending --> confirmed: Confirmar
    pending --> cancelled: Cancelar
    confirmed --> completed: Marcar completada
    confirmed --> cancelled: Cancelar
    confirmed --> no_show: Marcar no asistió
    pending --> no_show: Marcar no asistió
    completed --> [*]
    cancelled --> [*]
    no_show --> [*]
```

Cada transición escribe una fila en `booking_events` con estado origen, destino, actor y nota opcional.

## 5. Cálculo de disponibilidad

```mermaid
flowchart LR
    A[Fecha solicitada] --> B[Negocio publicado y servicio activo]
    B --> C[Horario del negocio para ese día]
    C --> D{¿Cerrado?}
    D -- Sí --> Z[Sin huecos]
    D -- No --> E[Intersección con horario del profesional]
    E --> F[Restar ausencias]
    F --> G[Restar reservas activas + buffer]
    G --> H[Filtrar por anticipación mínima y máxima]
    H --> I[Generar inicios cada slot_interval_minutes]
    I --> J[Lista de huecos por profesional]
```

## 6. Navegación del panel

```mermaid
flowchart LR
    P[/panel] --> R[Reservas]
    P --> C[Calendario]
    P --> S[Servicios]
    P --> F[Profesionales]
    P --> K[Clientes]
    P --> G[Configuración]
    R --> D[Detalle de reserva]
    C --> D
    K --> H[Historial del cliente]
```
