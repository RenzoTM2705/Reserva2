import { useQuery } from '@tanstack/react-query';
import {
    getBusinessHours,
    getPublicProfessionals,
    getPublicServices,
    getPublishedBusiness,
} from '@/lib/api';

/** Negocio publicado por slug; `null` = no existe o no está publicado. */
export function useBusiness(slug: string) {
    return useQuery({
        queryKey: ['business', slug],
        queryFn: () => getPublishedBusiness(slug),
        retry: false,
        staleTime: 60_000,
    });
}

export function useBusinessHours(businessId: string | undefined) {
    return useQuery({
        queryKey: ['business-hours', businessId],
        queryFn: () => getBusinessHours(businessId as string),
        enabled: Boolean(businessId),
        staleTime: 60_000,
    });
}

export function usePublicServices(businessId: string | undefined) {
    return useQuery({
        queryKey: ['public-services', businessId],
        queryFn: () => getPublicServices(businessId as string),
        enabled: Boolean(businessId),
        staleTime: 60_000,
    });
}

export function usePublicProfessionals(businessId: string | undefined) {
    return useQuery({
        queryKey: ['public-professionals', businessId],
        queryFn: () => getPublicProfessionals(businessId as string),
        enabled: Boolean(businessId),
        staleTime: 60_000,
    });
}
