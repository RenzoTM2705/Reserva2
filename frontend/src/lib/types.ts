/**
 * Tipos de dominio de Reserva2.
 *
 * Reflejan el esquema de `docs/TRD.md`. Cuando la base esté conectada se
 * regenerarán desde Supabase (`pnpm types:gen`) y estos tipos se alinearán
 * con los generados.
 */

export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'no_show';

export type MemberRole = 'owner' | 'admin' | 'staff';

export interface Business {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    timezone: string;
    currency: string;
    is_published: boolean;
    requires_confirmation: boolean;
    min_lead_minutes: number;
    max_advance_days: number;
    cancellation_policy_hours: number;
}

export interface Service {
    id: string;
    business_id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    price_cents: number;
    buffer_minutes: number;
    is_active: boolean;
}

export interface Professional {
    id: string;
    business_id: string;
    full_name: string;
    is_active: boolean;
    color: string | null;
}

export interface ProfessionalService {
    professional_id: string;
    service_id: string;
}

export interface BusinessHour {
    business_id: string;
    weekday: number;
    is_closed: boolean;
    opens_at: string | null;
    closes_at: string | null;
}

export interface Customer {
    id: string;
    business_id: string;
    full_name: string;
    email: string;
    phone: string | null;
    notes: string | null;
    created_at: string;
}

export interface Booking {
    id: string;
    business_id: string;
    service_id: string;
    professional_id: string;
    customer_id: string;
    starts_at: string;
    ends_at: string;
    status: BookingStatus;
    price_cents: number;
    currency: string;
    notes: string | null;
    created_at: string;
    cancelled_at: string | null;
}

/** Reserva con referencias resueltas para listados del panel. */
export interface BookingWithRefs extends Booking {
    service: { name: string } | null;
    professional: { full_name: string } | null;
    customer: { full_name: string; email: string } | null;
}

export interface Membership {
    id: string;
    business_id: string;
    user_id: string;
    role: MemberRole;
    business: Business;
}

/** Hueco devuelto por `get_available_slots`. */
export interface Slot {
    starts_at: string;
    professional_id: string;
}

/** Respuesta de `create_booking`. */
export interface CreatedBooking {
    id: string;
    confirmation_token: string;
    starts_at: string;
    ends_at: string;
    status: BookingStatus;
}

/** Respuesta de `get_booking_status` (sin datos personales del cliente). */
export interface BookingStatusInfo {
    booking_id: string;
    status: BookingStatus;
    starts_at: string;
    ends_at: string;
    service_name: string;
    professional_name: string;
    business_name: string;
    business_slug: string;
    business_timezone: string;
    price_cents: number;
    currency: string;
    cancellation_policy_hours: number;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No asistió',
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no_show',
];

/** Transiciones válidas del panel (ver docs/FLOW.md §4). */
export const BOOKING_TRANSITIONS: Record<
    BookingStatus,
    { to: BookingStatus; label: string }[]
> = {
    pending: [
        { to: 'confirmed', label: 'Confirmar' },
        { to: 'cancelled', label: 'Cancelar' },
        { to: 'no_show', label: 'Marcar no asistió' },
    ],
    confirmed: [
        { to: 'completed', label: 'Marcar completada' },
        { to: 'cancelled', label: 'Cancelar' },
        { to: 'no_show', label: 'Marcar no asistió' },
    ],
    completed: [],
    cancelled: [],
    no_show: [],
};
