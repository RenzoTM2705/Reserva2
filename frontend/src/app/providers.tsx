import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

interface AppProvidersProps {
    children: ReactNode;
}

/**
 * Providers globales de la aplicación.
 *
 * Por ahora solo TanStack Query (estado de servidor). El resto de providers
 * se añadirá en la fase que los necesite, no antes.
 *
 * Ver docs/DECISIONS.md (ADR-005: sin store global; estado de UI en la URL).
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
