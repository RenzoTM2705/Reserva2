import { env } from '@/lib/env';
import { addDays, todayInZone, zonedDateTimeToIso } from '@/lib/dates';
import type {
    Booking,
    BookingStatus,
    BookingStatusInfo,
    BookingWithRefs,
    Business,
    BusinessHour,
    CreatedBooking,
    Customer,
    Membership,
    Professional,
    ProfessionalService,
    Service,
    Slot,
} from '@/lib/types';

/**
 * Modo maqueta visual.
 *
 * Cuando faltan las credenciales de Supabase, la capa de datos sirve un
 * juego de datos de ejemplo **en memoria** para poder apreciar la interfaz.
 * Nada de esto es disponibilidad ni lógica real: el cálculo de huecos sigue
 * siendo exclusivo de la RPC `get_available_slots` (ADR-002). Los cambios
 * no persisten: se descartan al recargar.
 *
 * El aviso correspondiente aparece solo en la consola, nunca en la UI.
 */
export const isDemoMode = !env.isSupabaseConfigured;

const DEMO_TIMEZONE = 'America/Lima';
const DEMO_CURRENCY = 'PEN';

if (isDemoMode) {
    // Aviso intencional: solo consola, la UI no menciona la tecnología.
    console.info(
        '[Reserva2] Sin conexión a datos: se muestran datos de ejemplo (maqueta visual, no persistente).',
    );
}

interface DemoState {
    business: Business;
    services: Service[];
    professionals: Professional[];
    assignments: ProfessionalService[];
    customers: Customer[];
    bookings: BookingWithRefs[];
    hours: BusinessHour[];
    /** Id de la reserva creada en la maqueta, para la pantalla de estado. */
    tokenBookingId: string | null;
    cancelled: boolean;
    /** false hasta que se «crea» el negocio en la maqueta (flujo de onboarding). */
    businessCreated: boolean;
}

const state: DemoState = {
    business: {
        id: 'demo-business',
        slug: 'barberia-don-lucho',
        name: 'Barbería Don Lucho',
        description: 'Cortes clásicos y modernos, con cita y sin espera.',
        address: 'Av. Ejemplo 123, Lima',
        phone: '+51 900 000 000',
        timezone: DEMO_TIMEZONE,
        currency: DEMO_CURRENCY,
        is_published: true,
        requires_confirmation: true,
        min_lead_minutes: 60,
        max_advance_days: 30,
        cancellation_policy_hours: 4,
    },
    services: [
        {
            id: 'demo-svc-1',
            business_id: 'demo-business',
            name: 'Corte de cabello',
            description: 'Corte a máquina y tijera, lavado incluido.',
            duration_minutes: 40,
            price_cents: 3000,
            buffer_minutes: 10,
            is_active: true,
        },
        {
            id: 'demo-svc-2',
            business_id: 'demo-business',
            name: 'Afeitado clásico',
            description: 'Navaja, toalla caliente y acabado con bálsamo.',
            duration_minutes: 30,
            price_cents: 2500,
            buffer_minutes: 5,
            is_active: true,
        },
        {
            id: 'demo-svc-3',
            business_id: 'demo-business',
            name: 'Corte + barba',
            description: 'Combo completo para cuidar todo en una visita.',
            duration_minutes: 60,
            price_cents: 4500,
            buffer_minutes: 10,
            is_active: true,
        },
        {
            id: 'demo-svc-4',
            business_id: 'demo-business',
            name: 'Tratamiento capilar',
            description: null,
            duration_minutes: 90,
            price_cents: 8000,
            buffer_minutes: 15,
            is_active: false,
        },
    ],
    professionals: [
        {
            id: 'demo-pro-1',
            business_id: 'demo-business',
            full_name: 'Lucía Ramos',
            is_active: true,
            color: '#B4552D',
        },
        {
            id: 'demo-pro-2',
            business_id: 'demo-business',
            full_name: 'Marco Torres',
            is_active: true,
            color: '#2E6E4F',
        },
    ],
    assignments: [
        { professional_id: 'demo-pro-1', service_id: 'demo-svc-1' },
        { professional_id: 'demo-pro-1', service_id: 'demo-svc-2' },
        { professional_id: 'demo-pro-1', service_id: 'demo-svc-4' },
        { professional_id: 'demo-pro-2', service_id: 'demo-svc-1' },
        { professional_id: 'demo-pro-2', service_id: 'demo-svc-3' },
    ],
    customers: [
        {
            id: 'demo-cus-1',
            business_id: 'demo-business',
            full_name: 'Ana Quispe',
            email: 'ana@example.com',
            phone: '+51 900 000 001',
            notes: null,
            created_at: '2026-01-10T15:00:00Z',
        },
        {
            id: 'demo-cus-2',
            business_id: 'demo-business',
            full_name: 'Luis Ramos',
            email: 'luis@example.com',
            phone: '+51 900 000 002',
            notes: 'Prefiere tarde.',
            created_at: '2026-01-12T18:30:00Z',
        },
        {
            id: 'demo-cus-3',
            business_id: 'demo-business',
            full_name: 'Carla Medina',
            email: 'carla@example.com',
            phone: null,
            notes: null,
            created_at: '2026-02-02T20:00:00Z',
        },
        {
            id: 'demo-cus-4',
            business_id: 'demo-business',
            full_name: 'Diego Torres',
            email: 'diego@example.com',
            phone: '+51 900 000 004',
            notes: null,
            created_at: '2026-02-14T16:00:00Z',
        },
        {
            id: 'demo-cus-5',
            business_id: 'demo-business',
            full_name: 'Elena Rojas',
            email: 'elena@example.com',
            phone: null,
            notes: null,
            created_at: '2026-03-01T12:00:00Z',
        },
    ],
    hours: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
        business_id: 'demo-business',
        weekday,
        is_closed: weekday === 0,
        opens_at: weekday === 0 ? null : '09:00',
        closes_at: weekday === 0 ? null : '18:00',
    })),
    bookings: [],
    tokenBookingId: null,
    cancelled: false,
    // true: el panel (reservas, calendario, etc.) se aprecia directo, sin
    // pasar por el onboarding. Este último sigue visible en /panel/onboarding.
    businessCreated: true,
};

// ── Reservas de ejemplo, relativas a «hoy» para que la agenda luzca viva ──

interface DemoBookingSpec {
    dayOffset: number;
    time: string;
    customerId: string;
    serviceId: string;
    professionalId: string;
    status: BookingStatus;
}

const DEMO_BOOKING_SPECS: DemoBookingSpec[] = [
    { dayOffset: -2, time: '11:00', customerId: 'demo-cus-3', serviceId: 'demo-svc-1', professionalId: 'demo-pro-1', status: 'no_show' },
    { dayOffset: -1, time: '10:00', customerId: 'demo-cus-1', serviceId: 'demo-svc-1', professionalId: 'demo-pro-1', status: 'completed' },
    { dayOffset: -1, time: '15:30', customerId: 'demo-cus-2', serviceId: 'demo-svc-2', professionalId: 'demo-pro-2', status: 'cancelled' },
    { dayOffset: 0, time: '09:00', customerId: 'demo-cus-2', serviceId: 'demo-svc-1', professionalId: 'demo-pro-1', status: 'confirmed' },
    { dayOffset: 0, time: '10:30', customerId: 'demo-cus-1', serviceId: 'demo-svc-3', professionalId: 'demo-pro-2', status: 'confirmed' },
    { dayOffset: 0, time: '15:00', customerId: 'demo-cus-3', serviceId: 'demo-svc-2', professionalId: 'demo-pro-1', status: 'pending' },
    { dayOffset: 0, time: '16:30', customerId: 'demo-cus-4', serviceId: 'demo-svc-1', professionalId: 'demo-pro-2', status: 'completed' },
    { dayOffset: 1, time: '09:00', customerId: 'demo-cus-5', serviceId: 'demo-svc-4', professionalId: 'demo-pro-1', status: 'pending' },
    { dayOffset: 1, time: '11:30', customerId: 'demo-cus-4', serviceId: 'demo-svc-3', professionalId: 'demo-pro-2', status: 'confirmed' },
    { dayOffset: 3, time: '09:30', customerId: 'demo-cus-4', serviceId: 'demo-svc-4', professionalId: 'demo-pro-2', status: 'pending' },
];

function buildDemoBookings(): BookingWithRefs[] {
    const today = todayInZone(DEMO_TIMEZONE);
    let counter = 0;

    return DEMO_BOOKING_SPECS.map((spec) => {
        counter += 1;
        const date = addDays(today, spec.dayOffset);
        const startsAt = zonedDateTimeToIso(date, spec.time, DEMO_TIMEZONE);
        const service = state.services.find((item) => item.id === spec.serviceId);
        const professional = state.professionals.find((item) => item.id === spec.professionalId);
        const customer = state.customers.find((item) => item.id === spec.customerId);
        const endsAt = zonedDateTimeToIso(
            date,
            minutesToTime(timeToMinutes(spec.time) + (service?.duration_minutes ?? 30)),
            DEMO_TIMEZONE,
        );

        const booking: Booking = {
            id: `demo-b${counter}`,
            business_id: 'demo-business',
            service_id: spec.serviceId,
            professional_id: spec.professionalId,
            customer_id: spec.customerId,
            starts_at: startsAt,
            ends_at: endsAt,
            status: spec.status,
            price_cents: service?.price_cents ?? 0,
            currency: DEMO_CURRENCY,
            notes: null,
            created_at: '2026-01-01T12:00:00Z',
            cancelled_at: spec.status === 'cancelled' ? '2026-01-01T12:00:00Z' : null,
        };

        return {
            ...booking,
            service: service ? { name: service.name } : null,
            professional: professional ? { full_name: professional.full_name } : null,
            customer: customer ? { full_name: customer.full_name, email: customer.email } : null,
        };
    });
}

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(total: number): string {
    const hours = Math.floor(total / 60) % 24;
    const minutes = total % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

state.bookings = buildDemoBookings();

/** Horas de ejemplo para recorrer el asistente (no es cálculo real). */
const DEMO_SLOT_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const DEMO_SLOT_PROFESSIONALS = ['demo-pro-1', 'demo-pro-2'];

/**
 * API de la maqueta: mismas firmas que la capa real, respuesta inmediata.
 * Solo existe para apreciar la interfaz sin backend.
 */
export const demoApi = {
    getPublishedBusiness(slug: string): Business | null {
        return state.business.is_published && slug === state.business.slug
            ? state.business
            : null;
    },

    getBusinessHours(): BusinessHour[] {
        return state.hours.map((row) => ({ ...row }));
    },

    listServices(): Service[] {
        return state.services.map((service) => ({ ...service }));
    },

    listProfessionals(): Professional[] {
        return state.professionals.map((professional) => ({ ...professional }));
    },

    getAvailableSlots(params: { date: string; professionalId?: string | null }): Slot[] {
        const slots: Slot[] = [];

        DEMO_SLOT_TIMES.forEach((time, index) => {
            const professionalId = DEMO_SLOT_PROFESSIONALS[index % DEMO_SLOT_PROFESSIONALS.length];

            if (params.professionalId && params.professionalId !== professionalId) {
                return;
            }

            slots.push({
                starts_at: zonedDateTimeToIso(params.date, time, DEMO_TIMEZONE),
                professional_id: professionalId,
            });
        });

        return slots;
    },

    createBooking(payload: {
        serviceId: string;
        startsAt: string;
        notes: string | null;
    }): CreatedBooking {
        const service = state.services.find((item) => item.id === payload.serviceId);
        const duration = service?.duration_minutes ?? 30;
        const startMs = new Date(payload.startsAt).getTime();
        const endsAt = new Date(startMs + duration * 60_000).toISOString();
        const id = `demo-b${state.bookings.length + 1}`;

        const booking: BookingWithRefs = {
            id,
            business_id: state.business.id,
            service_id: payload.serviceId,
            professional_id: 'demo-pro-1',
            customer_id: 'demo-cus-1',
            starts_at: payload.startsAt,
            ends_at: endsAt,
            status: state.business.requires_confirmation ? 'pending' : 'confirmed',
            price_cents: service?.price_cents ?? 0,
            currency: DEMO_CURRENCY,
            notes: payload.notes,
            created_at: new Date().toISOString(),
            cancelled_at: null,
            service: service ? { name: service.name } : null,
            professional: { full_name: state.professionals[0]?.full_name ?? 'Profesional' },
            customer: { full_name: 'Ana Quispe', email: 'ana@example.com' },
        };

        state.bookings.push(booking);
        state.tokenBookingId = id;
        state.cancelled = false;

        return {
            id,
            confirmation_token: 'demo-reserva',
            starts_at: booking.starts_at,
            ends_at: booking.ends_at,
            status: booking.status,
        };
    },

    getBookingStatus(): BookingStatusInfo {
        const booking =
            state.bookings.find((item) => item.id === state.tokenBookingId) ??
            state.bookings[0];

        return {
            booking_id: booking?.id ?? 'demo-b1',
            status: state.cancelled ? 'cancelled' : (booking?.status ?? 'confirmed'),
            starts_at: booking?.starts_at ?? new Date().toISOString(),
            ends_at: booking?.ends_at ?? new Date().toISOString(),
            service_name: booking?.service?.name ?? 'Servicio de ejemplo',
            professional_name: booking?.professional?.full_name ?? 'Profesional',
            business_name: state.business.name,
            business_slug: state.business.slug,
            business_timezone: state.business.timezone,
            price_cents: booking?.price_cents ?? 0,
            currency: DEMO_CURRENCY,
            cancellation_policy_hours: state.business.cancellation_policy_hours,
        };
    },

    cancelBookingByToken(): void {
        state.cancelled = true;
    },

    getMyMembership(): Membership | null {
        if (!state.businessCreated) return null;

        return {
            id: 'demo-m1',
            business_id: state.business.id,
            user_id: 'demo-user',
            role: 'owner',
            business: { ...state.business },
        };
    },

    createBusiness(name: string, slug: string): string {
        state.business = {
            ...state.business,
            name,
            slug,
        };
        state.businessCreated = true;
        return state.business.id;
    },

    updateBusiness(
        patch: Partial<
            Pick<
                Business,
                | 'name'
                | 'description'
                | 'address'
                | 'phone'
                | 'currency'
                | 'timezone'
                | 'is_published'
                | 'requires_confirmation'
                | 'min_lead_minutes'
                | 'max_advance_days'
                | 'cancellation_policy_hours'
            >
        >,
    ): void {
        state.business = { ...state.business, ...patch };
    },

    upsertService(
        businessId: string,
        service: Omit<Service, 'id' | 'business_id'>,
        serviceId?: string,
    ): void {
        if (serviceId) {
            state.services = state.services.map((item) =>
                item.id === serviceId ? { ...item, ...service } : item,
            );
            return;
        }

        state.services.push({
            ...service,
            id: `demo-svc-${state.services.length + 1}`,
            business_id: businessId,
        });
    },

    deleteService(serviceId: string): void {
        state.services = state.services.filter((item) => item.id !== serviceId);
    },

    upsertProfessional(
        businessId: string,
        professional: Omit<Professional, 'id' | 'business_id'>,
        professionalId?: string,
    ): void {
        if (professionalId) {
            state.professionals = state.professionals.map((item) =>
                item.id === professionalId ? { ...item, ...professional } : item,
            );
            return;
        }

        state.professionals.push({
            ...professional,
            id: `demo-pro-${state.professionals.length + 1}`,
            business_id: businessId,
        });
    },

    deleteProfessional(professionalId: string): void {
        state.professionals = state.professionals.filter(
            (item) => item.id !== professionalId,
        );
    },

    listProfessionalServices(): ProfessionalService[] {
        return state.assignments.map((row) => ({ ...row }));
    },

    setProfessionalServices(professionalId: string, serviceIds: string[]): void {
        state.assignments = state.assignments.filter(
            (row) => row.professional_id !== professionalId,
        );
        state.assignments.push(
            ...serviceIds.map((serviceId) => ({ professional_id: professionalId, service_id: serviceId })),
        );
    },

    upsertBusinessHours(
        rows: Pick<BusinessHour, 'weekday' | 'is_closed' | 'opens_at' | 'closes_at'>[],
    ): void {
        state.hours = rows.map((row) => ({ ...row, business_id: state.business.id }));
    },

    listCustomers(): Customer[] {
        return state.customers.map((customer) => ({ ...customer }));
    },

    listBookings(filters: { fromIso?: string; toIso?: string; status?: BookingStatus }): BookingWithRefs[] {
        return state.bookings
            .filter((booking) => {
                if (filters.fromIso && booking.starts_at < filters.fromIso) return false;
                if (filters.toIso && booking.starts_at > filters.toIso) return false;
                if (filters.status && booking.status !== filters.status) return false;
                return true;
            })
            .map((booking) => ({ ...booking }));
    },

    updateBookingStatus(bookingId: string, status: BookingStatus): void {
        const booking = state.bookings.find((item) => item.id === bookingId);
        if (!booking) return;

        booking.status = status;
        booking.cancelled_at = status === 'cancelled' ? new Date().toISOString() : null;
    },
};
