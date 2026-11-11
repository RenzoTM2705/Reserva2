import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente único de TanStack Query.
 *
 * Criterios:
 * - Los datos de agenda cambian con frecuencia: `staleTime` corto.
 * - Un reintento basta; los errores de RLS o validación no se arreglan reintentando.
 * - No refrescar al enfocar la ventana evita peticiones sorpresa en el panel.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 0,
        },
    },
});
