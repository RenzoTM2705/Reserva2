import { getSupabaseClient } from '@/lib/supabase';
import { demoApi, isDemoMode } from '@/lib/demo';
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
 * Capa de acceso a datos.
 *
 * Toda lectura/escritura pasa por Supabase: RLS decide qué puede ver cada
 * rol. El cliente nunca calcula disponibilidad ni autoriza; solo pinta y
 * llama a las RPC definidas en docs/TRD.md.
 *
 * Sin credenciales configuradas, la capa sirve datos de ejemplo en memoria
 * (modo maqueta, `lib/demo.ts`) para poder apreciar la interfaz. El aviso
 * va solo a la consola, nunca a la UI.
 */

type Supabase = ReturnType<typeof getSupabaseClient>;

function db(): Supabase {
    return getSupabaseClient();
}

// ──────────────────────────────────────────────────────────────
// Público (anon): página del negocio y flujo de reserva
// ──────────────────────────────────────────────────────────────

export async function getPublishedBusiness(slug: string): Promise<Business | null> {
    if (isDemoMode) return demoApi.getPublishedBusiness(slug);

    const { data, error } = await db()
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

    if (error) throw error;
    return (data as Business) ?? null;
}

export async function getBusinessHours(businessId: string): Promise<BusinessHour[]> {
    if (isDemoMode) return demoApi.getBusinessHours();

    const { data, error } = await db()
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)
        .order('weekday');

    if (error) throw error;
    return (data as BusinessHour[]) ?? [];
}

export async function getPublicServices(businessId: string): Promise<Service[]> {
    if (isDemoMode) return demoApi.listServices();

    const { data, error } = await db()
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');

    if (error) throw error;
    return (data as Service[]) ?? [];
}

export async function getPublicProfessionals(businessId: string): Promise<Professional[]> {
    if (isDemoMode) return demoApi.listProfessionals();

    const { data, error } = await db()
        .from('professionals')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('full_name');

    if (error) throw error;
    return (data as Professional[]) ?? [];
}

export async function getAvailableSlots(params: {
    businessId: string;
    serviceId: string;
    date: string;
    professionalId?: string | null;
}): Promise<Slot[]> {
    if (isDemoMode) return demoApi.getAvailableSlots(params);

    const { data, error } = await db().rpc('get_available_slots', {
        p_business_id: params.businessId,
        p_service_id: params.serviceId,
        p_date: params.date,
        ...(params.professionalId ? { p_professional_id: params.professionalId } : {}),
    });

    if (error) throw error;
    return (data as Slot[]) ?? [];
}

export async function createBooking(payload: {
    businessId: string;
    serviceId: string;
    /** `null` = «cualquier profesional»; la RPC asigna el mejor hueco. */
    professionalId: string | null;
    startsAt: string;
    fullName: string;
    email: string;
    phone: string | null;
    notes: string | null;
}): Promise<CreatedBooking> {
    if (isDemoMode) return demoApi.createBooking(payload);

    const { data, error } = await db().rpc('create_booking', {
        p_business_id: payload.businessId,
        p_service_id: payload.serviceId,
        p_professional_id: payload.professionalId,
        p_starts_at: payload.startsAt,
        p_customer: {
            full_name: payload.fullName,
            email: payload.email,
            phone: payload.phone,
        },
        p_customer_notes: payload.notes,
    });

    if (error) throw error;
    return data as CreatedBooking;
}

export async function getBookingStatus(token: string): Promise<BookingStatusInfo> {
    if (isDemoMode) return demoApi.getBookingStatus();

    const { data, error } = await db().rpc('get_booking_status', {
        p_token: token,
    });

    if (error) throw error;
    return data as BookingStatusInfo;
}

export async function cancelBookingByToken(token: string, reason: string | null): Promise<void> {
    if (isDemoMode) return demoApi.cancelBookingByToken();

    const { error } = await db().rpc('cancel_booking_by_token', {
        p_token: token,
        p_reason: reason,
    });

    if (error) throw error;
}

// ──────────────────────────────────────────────────────────────
// Autenticado: onboarding y datos del negocio propio
// ──────────────────────────────────────────────────────────────

export async function getMyMembership(): Promise<Membership | null> {
    if (isDemoMode) return demoApi.getMyMembership();

    const { data, error } = await db()
        .from('memberships')
        .select('*, business:businesses(*)')
        .maybeSingle();

    if (error) throw error;
    return (data as Membership) ?? null;
}

export async function createBusiness(name: string, slug: string): Promise<string> {
    if (isDemoMode) return demoApi.createBusiness(name, slug);

    const { data, error } = await db().rpc('create_business', {
        p_name: name,
        p_slug: slug,
    });

    if (error) throw error;
    return data as string;
}

export async function updateBusiness(
    businessId: string,
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
): Promise<void> {
    if (isDemoMode) return demoApi.updateBusiness(patch);

    const { error } = await db()
        .from('businesses')
        .update(patch)
        .eq('id', businessId);

    if (error) throw error;
}

// ──────────────────────────────────────────────────────────────
// Autenticado: catálogo (servicios, profesionales, horarios)
// ──────────────────────────────────────────────────────────────

export async function listServices(businessId: string): Promise<Service[]> {
    if (isDemoMode) return demoApi.listServices();

    const { data, error } = await db()
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .order('name');

    if (error) throw error;
    return (data as Service[]) ?? [];
}

export async function upsertService(
    businessId: string,
    service: Omit<Service, 'id' | 'business_id'>,
    serviceId?: string,
): Promise<void> {
    if (isDemoMode) return demoApi.upsertService(businessId, service, serviceId);

    const payload = { ...service, business_id: businessId };
    const query = db().from('services');

    const { error } = serviceId
        ? await query.update(payload).eq('id', serviceId)
        : await query.insert(payload);

    if (error) throw error;
}

export async function deleteService(serviceId: string): Promise<void> {
    if (isDemoMode) return demoApi.deleteService(serviceId);

    const { error } = await db().from('services').delete().eq('id', serviceId);
    if (error) throw error;
}

export async function listProfessionals(businessId: string): Promise<Professional[]> {
    if (isDemoMode) return demoApi.listProfessionals();

    const { data, error } = await db()
        .from('professionals')
        .select('*')
        .eq('business_id', businessId)
        .order('full_name');

    if (error) throw error;
    return (data as Professional[]) ?? [];
}

export async function upsertProfessional(
    businessId: string,
    professional: Omit<Professional, 'id' | 'business_id'>,
    professionalId?: string,
): Promise<void> {
    if (isDemoMode) return demoApi.upsertProfessional(businessId, professional, professionalId);

    const payload = { ...professional, business_id: businessId };
    const query = db().from('professionals');

    const { error } = professionalId
        ? await query.update(payload).eq('id', professionalId)
        : await query.insert(payload);

    if (error) throw error;
}

export async function deleteProfessional(professionalId: string): Promise<void> {
    if (isDemoMode) return demoApi.deleteProfessional(professionalId);

    const { error } = await db()
        .from('professionals')
        .delete()
        .eq('id', professionalId);

    if (error) throw error;
}

export async function listProfessionalServices(businessId: string): Promise<ProfessionalService[]> {
    if (isDemoMode) return demoApi.listProfessionalServices();

    const { data, error } = await db()
        .from('professional_services')
        .select('professional_id, service_id, services!inner(business_id)')
        .eq('services.business_id', businessId);

    if (error) throw error;
    return (data as unknown as ProfessionalService[]) ?? [];
}

/** Reemplaza la asignación completa de servicios de un profesional. */
export async function setProfessionalServices(
    professionalId: string,
    serviceIds: string[],
): Promise<void> {
    if (isDemoMode) return demoApi.setProfessionalServices(professionalId, serviceIds);

    const client = db();

    const { error: deleteError } = await client
        .from('professional_services')
        .delete()
        .eq('professional_id', professionalId);

    if (deleteError) throw deleteError;

    if (serviceIds.length === 0) return;

    const { error: insertError } = await client
        .from('professional_services')
        .insert(serviceIds.map((serviceId) => ({ professional_id: professionalId, service_id: serviceId })));

    if (insertError) throw insertError;
}

export async function listBusinessHours(businessId: string): Promise<BusinessHour[]> {
    return getBusinessHours(businessId);
}

/** Crea o actualiza el horario semanal del negocio (una fila por día). */
export async function upsertBusinessHours(
    businessId: string,
    rows: Pick<BusinessHour, 'weekday' | 'is_closed' | 'opens_at' | 'closes_at'>[],
): Promise<void> {
    if (isDemoMode) return demoApi.upsertBusinessHours(rows);

    const { error } = await db()
        .from('business_hours')
        .upsert(
            rows.map((row) => ({ ...row, business_id: businessId })),
            { onConflict: 'business_id,weekday' },
        );

    if (error) throw error;
}

// ──────────────────────────────────────────────────────────────
// Autenticado: clientes y reservas
// ──────────────────────────────────────────────────────────────

export async function listCustomers(businessId: string): Promise<Customer[]> {
    if (isDemoMode) return demoApi.listCustomers();

    const { data, error } = await db()
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .order('full_name')
        .limit(500);

    if (error) throw error;
    return (data as Customer[]) ?? [];
}

export async function listBookings(
    businessId: string,
    filters: { fromIso?: string; toIso?: string; status?: BookingStatus } = {},
): Promise<BookingWithRefs[]> {
    if (isDemoMode) return demoApi.listBookings(filters);

    let query = db()
        .from('bookings')
        .select('*, service:services(name), professional:professionals(full_name), customer:customers(full_name, email)')
        .eq('business_id', businessId)
        .order('starts_at')
        .limit(300);

    if (filters.fromIso) query = query.gte('starts_at', filters.fromIso);
    if (filters.toIso) query = query.lte('starts_at', filters.toIso);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return (data as BookingWithRefs[]) ?? [];
}

export async function updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
): Promise<void> {
    if (isDemoMode) return demoApi.updateBookingStatus(bookingId, status);

    const patch: Partial<Booking> = { status };
    if (status === 'cancelled') patch.cancelled_at = new Date().toISOString();

    const { error } = await db().from('bookings').update(patch).eq('id', bookingId);
    if (error) throw error;
}
