/**
 * Formateadores compartidos.
 *
 * Regla del proyecto: la UI muestra horas en la zona IANA del negocio, no en
 * la del navegador. Estas funciones siempre reciben `timeZone` explícita.
 */

const DEFAULT_LOCALE = 'es-PE';

/** Convierte céntimos a texto monetario. El dinero nunca se guarda como float. */
export function formatMoney(
    cents: number,
    currency = 'PEN',
    locale = DEFAULT_LOCALE,
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(cents / 100);
}

/** Fecha y hora en la zona del negocio. Devuelve `null` si la fecha es inválida. */
export function formatDateTimeInZone(
    isoDate: string,
    timeZone: string,
    locale = DEFAULT_LOCALE,
): string | null {
    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
    }).format(date);
}

/** Solo la hora (HH:mm) en la zona del negocio. */
export function formatTimeInZone(
    isoDate: string,
    timeZone: string,
    locale = DEFAULT_LOCALE,
): string | null {
    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
    }).format(date);
}

/** Duración legible: 30 → «30 min», 90 → «1 h 30 min». */
export function formatDuration(minutes: number): string {
    if (!Number.isFinite(minutes) || minutes < 0) {
        return '—';
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (hours === 0) {
        return `${rest} min`;
    }

    return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
