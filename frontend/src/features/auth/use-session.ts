import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { isDemoMode } from '@/lib/demo';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * Sesión activa de Supabase Auth, reactiva a cambios de sesión.
 *
 * Sin credenciales configuradas, la maqueta expone una sesión de ejemplo
 * para poder recorrer el panel; el aviso está en la consola (lib/demo.ts).
 */

const DEMO_SESSION = {
    user: { id: 'demo-user', email: 'demo@reserva2.app' },
    access_token: 'demo',
} as unknown as Session;

export function useSession() {
    const [session, setSession] = useState<Session | null>(
        isDemoMode ? DEMO_SESSION : null,
    );
    // Sin credenciales no hay nada que cargar: arrancamos ya resueltos.
    const [loading, setLoading] = useState(env.isSupabaseConfigured);

    useEffect(() => {
        if (isDemoMode || !env.isSupabaseConfigured) {
            return;
        }

        const client = getSupabaseClient();
        let cancelled = false;

        client.auth
            .getSession()
            .then(({ data }) => {
                if (!cancelled) {
                    setSession(data.session);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });

        const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
        });

        return () => {
            cancelled = true;
            data.subscription.unsubscribe();
        };
    }, []);

    return { session, loading };
}
