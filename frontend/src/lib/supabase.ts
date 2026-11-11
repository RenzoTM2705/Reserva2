import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

let client: SupabaseClient | null = null;

/**
 * Cliente de Supabase creado de forma perezosa.
 *
 * Se crea en el primer uso para que la app pueda arrancar (y mostrar un
 * diagnóstico claro) cuando faltan las variables de entorno.
 */
export function getSupabaseClient(): SupabaseClient {
    if (!env.isSupabaseConfigured) {
        throw new Error(
            'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Revisa frontend/.env.local.',
        );
    }

    client ??= createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });

    return client;
}
