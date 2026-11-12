import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';

interface AppProvidersProps {
    children: ReactNode;
}

/**
 * Providers globales de la aplicación.
 *
 * - TanStack Query: estado de servidor (caché, reintentos, invalidación).
 * - Sonner: notificaciones breves y accesibles.
 *
 * El estado de UI (filtros, pasos del asistente) vive en la URL o en
 * `useState`; no hay store global a propósito. Ver docs/DECISIONS.md (ADR-005).
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="bottom-right"
                closeButton
                toastOptions={{
                    className: 'font-sans',
                }}
            />
        </QueryClientProvider>
    );
}
