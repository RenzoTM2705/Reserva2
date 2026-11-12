/**
 * Utilidades de fechas por zona horaria.
 *
 * El proyecto guarda instantes en `timestamptz` y cada negocio tiene su zona
 * IANA. Estas funciones convierten entre fechas de calendario («2026-03-10»,
 * siempre en la zona del negocio) e instantes ISO.
 */

/** Fecha de hoy en la zona indicada, formato `yyyy-mm-dd`. */
export function todayInZone(timeZone: string): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
}

/**
 * Nombres de los días de la semana según la convención de la base de datos:
 * `weekday` 0–6 con 0 = domingo (ver docs/TRD.md).
 */
export const WEEKDAY_LABELS: Record<number, string> = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
};

/** Orden de presentación: semana de lunes a domingo. */
export const WEEKDAYS_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

/** Desplaza una fecha de calendario N días (sin zona horaria implicada). */
export function addDays(dateStr: string, days: number): string {
    const date = new Date(`${dateStr}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

/** Etiqueta legible de una fecha de calendario: «martes, 10 de marzo». */
export function formatCalendarDate(
    dateStr: string,
    locale = 'es-PE',
): string | null {
    const date = new Date(`${dateStr}T12:00:00Z`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
    }).format(date);
}

/**
 * Convierte una hora local del negocio a un instante ISO UTC.
 *
 * Itera como máximo dos veces (suficiente para absorber cambios de horario
 * de verano) recomputando siempre desde la hora ingenua: así el ajuste no
 * se aplica dos veces.
 */
export function zonedDateTimeToIso(
    dateStr: string,
    timeStr: string,
    timeZone: string,
): string {
    const naiveMs = new Date(`${dateStr}T${timeStr}:00Z`).getTime();
    let candidate = naiveMs;

    for (let i = 0; i < 2; i += 1) {
        const offset = zonedOffsetMs(new Date(candidate), timeZone);
        const next = naiveMs - offset;

        if (next === candidate) break;
        candidate = next;
    }

    return new Date(candidate).toISOString();
}

/** Instante ISO a fecha de calendario en la zona indicada (`yyyy-mm-dd`). */
export function isoToDateInZone(iso: string, timeZone: string): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(iso));
}

/** Desfase en ms de `timeZone` respecto a UTC en el instante dado. */
function zonedOffsetMs(date: Date, timeZone: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(date);

    const get = (type: string) =>
        Number(parts.find((part) => part.type === type)?.value ?? '0');

    // `hour` puede venir como «24» en algunos entornos con hour12: false.
    const hour = get('hour') % 24;

    const asUtc = Date.UTC(
        get('year'),
        get('month') - 1,
        get('day'),
        hour,
        get('minute'),
        get('second'),
    );

    return asUtc - date.getTime();
}

/** Cuadrícula de un mes (lunes primero): 6 semanas × 7 fechas `yyyy-mm-dd`. */
export function monthGrid(dateStr: string): string[] {
    const [year, month] = dateStr.split('-').map(Number);
    const first = new Date(Date.UTC(year, month - 1, 1));
    // JS: 0 = domingo … 6 = sábado. Con semana de lunes primero:
    const weekdayOffset = (first.getUTCDay() + 6) % 7;

    const start = new Date(first);
    start.setUTCDate(start.getUTCDate() - weekdayOffset);

    const cells: string[] = [];
    for (let i = 0; i < 42; i += 1) {
        const cell = new Date(start);
        cell.setUTCDate(start.getUTCDate() + i);
        cells.push(cell.toISOString().slice(0, 10));
    }

    return cells;
}
