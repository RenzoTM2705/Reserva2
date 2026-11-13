import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Traducción de errores de la capa de datos a mensajes en lenguaje humano.
 *
 * Los códigos de error de las RPC están definidos en docs/TRD.md. Ningún
 * mensaje expone detalles internos ni datos personales (SECURITY_CHECKLIST).
 */

const RPC_ERROR_MESSAGES: Record<string, string> = {
    business_not_found: 'El negocio no está disponible.',
    service_not_found: 'El servicio ya no está disponible.',
    professional_not_available: 'El profesional ya no está disponible.',
    too_soon: 'Esa hora es demasiado pronto. Elige una hora más tarde.',
    too_far: 'Esa fecha está fuera del rango permitido.',
    slot_unavailable:
        'Ese hueco acaba de ocuparse. Elige otro horario disponible.',
    invalid_email: 'Revisa el correo electrónico.',
    invalid_name: 'Revisa el nombre del cliente.',
    invalid_phone: 'Revisa el teléfono.',
    invalid_notes: 'Las notas son demasiado largas.',
    invalid_slug: 'Revisa la dirección del negocio.',
    invalid_transition: 'Ese cambio de estado no es válido.',
    invalid_timezone: 'Revisa la zona horaria (formato IANA, p. ej. America/Lima).',
    not_authenticated: 'Necesitas iniciar sesión para continuar.',
    slug_taken: 'Esa dirección ya está en uso. Prueba con otro nombre.',
    business_exists: 'Tu cuenta ya tiene un negocio.',
    booking_not_found: 'No encontramos esa reserva. Revisa el enlace.',
    not_cancellable: 'Esta reserva ya no se puede cancelar.',
    cancellation_window_closed:
        'El plazo para cancelar ya venció. Contacta al negocio.',
};

const POSTGREST_HINTS: Record<string, string> = {
    '42501': 'No tienes permisos para esta operación.',
    PGRST301: 'La sesión expiró. Vuelve a iniciar sesión.',
    '42P01': 'La base de datos aún no tiene las migraciones aplicadas.',
    '23503': 'No se puede eliminar: tiene reservas asociadas. Desactívalo en su lugar.',
};

/** Mensaje humano para un error conocido, o uno genérico seguro. */
export function toUserMessage(error: unknown): string {
    if (isPostgrestError(error)) {
        const byCode = POSTGREST_HINTS[error.code ?? ''];
        if (byCode) return byCode;

        const byName = RPC_ERROR_MESSAGES[normalizeKey(error.message)];
        if (byName) return byName;
    }

    if (error instanceof Error && RPC_ERROR_MESSAGES[normalizeKey(error.message)]) {
        return RPC_ERROR_MESSAGES[normalizeKey(error.message)];
    }

    return 'Ocurrió un problema inesperado. Inténtalo de nuevo.';
}

/** Código lógico de una RPC (`slot_unavailable`, `slug_taken`…) si lo hay. */
export function rpcErrorCode(error: unknown): string | null {
    if (!isPostgrestError(error)) return null;
    const key = normalizeKey(error.message);
    return key in RPC_ERROR_MESSAGES ? key : null;
}

function isPostgrestError(error: unknown): error is PostgrestError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'code' in error
    );
}

function normalizeKey(message: string): string {
    return message.trim().toLowerCase();
}

/**
 * Errores de Supabase Auth: `error.message` llega en inglés. Se mapea a
 * frases humanas sin exponer detalles internos del servidor.
 */
const AUTH_ERROR_MESSAGES: [RegExp, string][] = [
    [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
    [/already registered/i, 'Ya existe una cuenta con ese correo. Inicia sesión.'],
    [/email not confirmed/i, 'Confirma tu correo antes de iniciar sesión.'],
    [/password should be/i, 'La contraseña es demasiado corta o débil.'],
    [/rate limit/i, 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'],
    [/user not found/i, 'No encontramos una cuenta con ese correo.'],
    [/same password/i, 'La nueva contraseña debe ser distinta a la anterior.'],
];

/** Mensaje humano para un error de autenticación. */
export function toAuthMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : '';

    for (const [pattern, text] of AUTH_ERROR_MESSAGES) {
        if (pattern.test(message)) return text;
    }

    return toUserMessage(error);
}
