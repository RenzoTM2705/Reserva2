import { useQuery } from '@tanstack/react-query';
import { getAvailableSlots } from '@/lib/api';
import type { Slot } from '@/lib/types';

/**
 * Disponibilidad desde la única fuente de verdad: la RPC SQL.
 *
 * El cliente NUNCA calcula huecos (ADR-002). `null` desactiva la consulta
 * hasta que el usuario elige servicio y fecha.
 */
export function useAvailableSlots(params: {
    businessId: string;
    serviceId: string;
    date: string;
    professionalId?: string | null;
} | null) {
    return useQuery({
        queryKey: [
            'slots',
            params?.businessId,
            params?.serviceId,
            params?.date,
            params?.professionalId ?? 'any',
        ],
        queryFn: () => getAvailableSlots(params as NonNullable<typeof params>),
        enabled: params !== null,
        staleTime: 15_000,
    });
}

/** Agrupa slots por instante para ofrecer «cualquier profesional». */
export function groupSlotsByTime(slots: Slot[]): { startsAt: string; professionalIds: string[] }[] {
    const map = new Map<string, string[]>();

    for (const slot of slots) {
        const list = map.get(slot.starts_at) ?? [];
        list.push(slot.professional_id);
        map.set(slot.starts_at, list);
    }

    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([startsAt, professionalIds]) => ({ startsAt, professionalIds }));
}
