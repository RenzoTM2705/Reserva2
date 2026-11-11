/**
 * Variables de entorno públicas del frontend.
 *
 * Solo se leen variables `VITE_*`, que Vite incrusta en el bundle y por
 * tanto son visibles para cualquiera. La `anon key` está diseñada para el
 * cliente; la protección real es Row Level Security. Nunca añadir aquí la
 * `service_role` key (ver SECURITY_CHECKLIST.md).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const env = {
    supabaseUrl,
    supabaseAnonKey,
    appUrl: import.meta.env.VITE_APP_URL?.trim() || window.location.origin,
    /** Permite renderizar estados de configuración sin lanzar excepciones al importar. */
    isSupabaseConfigured: supabaseUrl.length > 0 && supabaseAnonKey.length > 0,
} as const;
