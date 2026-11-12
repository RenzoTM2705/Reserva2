import { useQuery } from '@tanstack/react-query';
import { getMyMembership } from '@/lib/api';

/**
 * Membresía del usuario autenticado con su negocio.
 *
 * RLS garantiza que solo se leen las membresías propias; `null` significa
 * que el usuario no tiene negocio todavía (onboarding).
 */
export function useMembership() {
    return useQuery({
        queryKey: ['membership'],
        queryFn: getMyMembership,
        retry: false,
        staleTime: 60_000,
    });
}
