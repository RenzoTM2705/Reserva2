import { getSupabaseClient } from '@/lib/supabase';
import { isDemoMode } from '@/lib/demo';

/**
 * Autenticación del panel, delegada en Supabase Auth.
 *
 * El cliente solo orquesta; la autorización real (qué puede hacer cada
 * usuario) vive en RLS.
 *
 * En modo maqueta las acciones resuelven al instante (sin persistencia)
 * para poder recorrer la interfaz; el aviso está en la consola.
 */

export async function signIn(email: string, password: string): Promise<void> {
    if (isDemoMode) return;

    const { error } = await getSupabaseClient().auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
}

/**
 * Registro. Si el proyecto exige verificación de correo, `session` llega
 * nula y la UI pide revisar el buzón.
 */
export async function signUp(
    email: string,
    password: string,
): Promise<{ needsEmailConfirmation: boolean }> {
    if (isDemoMode) return { needsEmailConfirmation: false };

    const { data, error } = await getSupabaseClient().auth.signUp({
        email,
        password,
    });

    if (error) throw error;
    return { needsEmailConfirmation: data.session === null };
}

export async function signOut(): Promise<void> {
    if (isDemoMode) return;

    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
    if (isDemoMode) return;

    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email);
    if (error) throw error;
}
