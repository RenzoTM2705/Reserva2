# UX — Identidad visual y sistema de diseño

## 1. Concepto

**«Editorial cálida».** La interfaz se comporta como una publicación bien maquetada, no como un panel de control genérico: papel cálido, tinta profunda, reglas finas, jerarquía tipográfica marcada y un único acento terracota.

Referencias de tono: papelería de oficio, carteles de barbería clásicos, revistas impresas. Nada de degradados, glassmorphism, sombras difusas ni animaciones que llamen más atención que el contenido.

## 2. Paleta

Los tokens viven en `frontend/src/styles/index.css` dentro de `@theme`. **No se usan hex sueltos en componentes.**

| Token | Valor | Uso |
|---|---|---|
| `--color-paper` | `#FAF7F2` | Fondo general |
| `--color-surface` | `#FFFFFF` | Tarjetas, modales, inputs |
| `--color-sunken` | `#F3EEE6` | Filas alternas, zonas inertes |
| `--color-ink` | `#1A1714` | Texto principal |
| `--color-ink-soft` | `#55504A` | Texto secundario |
| `--color-ink-muted` | `#8A8178` | Metadatos, placeholders |
| `--color-rule` | `#E4DCCF` | Bordes de 1 px |
| `--color-rule-strong` | `#D3C7B6` | Bordes de énfasis |
| `--color-accent` | `#B4552D` | CTA, enlaces, foco |
| `--color-accent-hover` | `#99461F` | Hover del acento |
| `--color-accent-soft` | `#F6E9E1` | Fondo de acento suave |
| `--color-accent-ink` | `#7A3618` | Texto sobre acento suave |
| `--color-pending` / `--color-pending-soft` | `#B8862F` / `#FBF3E3` | Estado pendiente |
| `--color-confirmed` / `--color-confirmed-soft` | `#2E6E4F` / `#E7F2EB` | Estado confirmada |
| `--color-completed` / `--color-completed-soft` | `#55504A` / `#EFEAE2` | Estado completada |
| `--color-cancelled` / `--color-cancelled-soft` | `#A33A2A` / `#F9E9E6` | Estado cancelada |
| `--color-noshow` / `--color-noshow-soft` | `#6B5E8C` / `#EFEAF5` | Estado no asistió |
| `--color-danger` | `#A33A2A` | Errores |
| `--color-success` | `#2E6E4F` | Éxito |

Contraste: el acento `#B4552D` sobre papel cumple AA para texto normal (≈4.9:1) y AAA para texto grande.

## 3. Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Display | **Fraunces Variable** (serif) | H1, H2, cifras destacadas del dashboard, nombre del negocio |
| UI | **Instrument Sans Variable** (sans) | Cuerpo, navegación, formularios, tablas |
| Datos | Instrument Sans con `font-variant-numeric: tabular-nums` | Horas, precios, contadores |

Escala (rem, base 16 px):

```
display-xl 3.5  · display-lg 2.5 · display-md 2 · title 1.5
body-lg 1.125 · body 1 · small 0.875 · micro 0.75
```

Reglas:
- Un solo `h1` por página.
- El serif se usa con moderación: si todo es serif, deja de ser un acento.
- Las horas y los precios siempre con numerales tabulares para que no "bailen" al actualizarse.

## 4. Espaciado, radios y profundidad

- Escala de espaciado en múltiplos de 4 px (Tailwind por defecto).
- Radios: `--radius-sm 6px`, `--radius-md 10px`, `--radius-lg 14px`, `--radius-xl 20px`.
- Sombras: una sola (`--shadow-card`), muy sutil. Sin sombras de color.
- Bordes de 1 px con `--color-rule` como separador principal. La estructura se comunica con reglas, no con cajas flotantes.

## 5. Componentes

| Componente | Notas de diseño |
|---|---|
| `Button` | Variantes `primary` (terracota), `secondary` (borde tinta), `ghost`, `danger`. Altura mínima 44 px en móvil |
| `Input` / `Textarea` | Fondo `surface`, borde `rule`, foco con anillo `accent` |
| `Select` | Radix; nunca `<select>` nativo salvo en formularios muy simples |
| `Card` | Sin sombra por defecto; borde de 1 px y padding generoso |
| `Badge` de estado | Fondo `*-soft`, texto `*`, punto de color + etiqueta (nunca solo color) |
| `Dialog` / `Sheet` | Radix; el móvil usa Sheet |
| `Calendar` | Construido a medida sobre date-fns; no usar FullCalendar |
| `EmptyState` | Icono lineal, título en serif, una frase y una acción |
| `Skeleton` | Bloques con `sunken`; sin animación de brillo llamativa |

## 6. Estados

Toda vista con datos remotos debe cubrir:

1. **Carga:** skeleton con la forma del contenido final.
2. **Vacío:** explicación de por qué no hay datos y acción siguiente.
3. **Error:** mensaje en lenguaje humano, botón de reintento y sin detalles técnicos.
4. **Éxito:** confirmación explícita con el siguiente paso.

## 7. Movimiento

- Librería: `motion/react`.
- Duraciones: 120–200 ms para microinteracciones, 240 ms para transiciones de vista.
- Easing: `ease-out` para entradas, `ease-in` para salidas.
- Se animan opacidad y desplazamientos cortos (≤ 8 px). Nunca escalas agresivas.
- `prefers-reduced-motion` desactiva todo salvo los cambios de estado necesarios.

## 8. Responsive

| Breakpoint | Comportamiento |
|---|---|
| `< 640` | Una columna; navegación inferior en el panel; flujo de reserva a pantalla completa con barra de progreso |
| `640–1023` | Dos columnas en listados; sidebar colapsable |
| `≥ 1024` | Sidebar fija; calendario semanal completo; tablas densas |

Objetivo: cero scroll horizontal en 390 px.

## 9. Página pública del negocio

Orden de lectura:

1. Nombre del negocio + especialidad.
2. Descripción breve.
3. Dirección y horario de hoy.
4. Servicios con duración y precio.
5. Equipo (si hay más de un profesional).
6. CTA fija en móvil: «Reservar cita».

Sin carruseles, sin contadores falsos, sin testimonios inventados.

## 10. Panel administrativo

- Barra superior con negocio activo, fecha y acceso a la página pública.
- Sidebar con las secciones del producto.
- Dashboard: cuatro KPIs, agenda del día y servicios más solicitados.
- Calendario: carriles por profesional, color por estado, altura proporcional a la duración.
- Tablas: densidad media, acciones en un menú, filtros persistentes en la URL.
