import { useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { groupSlotsByTime, useAvailableSlots } from '@/features/booking/use-slots';
import {
    useBusiness,
    usePublicProfessionals,
    usePublicServices,
} from '@/features/public/use-business';
import { createBooking } from '@/lib/api';
import {
    formatCalendarDate,
    todayInZone,
    addDays,
} from '@/lib/dates';
import { rpcErrorCode, toUserMessage } from '@/lib/errors';
import { formatDuration, formatMoney, formatTimeInZone } from '@/lib/format';
import { useDocumentTitle } from '@/lib/use-document-title';
import { zodResolver } from '@/lib/zod-resolver';

/** Valor centinela en la URL para «cualquier profesional». */
const ANY_PROFESSIONAL = 'any';

const STEP_LABELS = ['Servicio', 'Profesional', 'Fecha', 'Hora', 'Tus datos'] as const;

const customerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, 'Escribe tu nombre completo.')
        .max(120, 'El nombre es demasiado largo.'),
    email: z.string().trim().email('Revisa el correo electrónico.'),
    phone: z
        .string()
        .trim()
        .max(40, 'El teléfono es demasiado largo.')
        .optional()
        .or(z.literal('')),
    notes: z
        .string()
        .trim()
        .max(500, 'Las notas son demasiado largas.')
        .optional()
        .or(z.literal('')),
});

type CustomerForm = z.infer<typeof customerSchema>;

/**
 * Asistente de reserva pública, en cinco pasos.
 *
 * Todo el estado vive en la URL (`?servicio=&profesional=&fecha=&hora=`) para
 * que cada paso sea compartible y el botón «atrás» funcione (ADR-005). La
 * disponibilidad proviene exclusivamente de la RPC `get_available_slots`.
 */
export function BookingPage() {
    const { slug = '' } = useParams();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();

    const business = useBusiness(slug);
    const services = usePublicServices(business.data?.id);
    const professionals = usePublicProfessionals(business.data?.id);

    const serviceId = params.get('servicio') ?? '';
    const professionalParam = params.get('profesional') ?? '';
    const fecha = params.get('fecha') ?? '';
    const hora = params.get('hora') ?? '';

    const step = currentStep(serviceId, professionalParam, fecha, hora);
    useDocumentTitle(`Reservar — ${business.data?.name ?? 'Negocio'}`);

    const timeZone = business.data?.timezone ?? 'America/Lima';    const slots = useAvailableSlots(
        business.data && serviceId && fecha
            ? {
                  businessId: business.data.id,
                  serviceId,
                  date: fecha,
                  professionalId:
                      professionalParam === ANY_PROFESSIONAL
                          ? null
                          : professionalParam,
              }
            : null,
    );

    const slotGroups = useMemo(
        () => groupSlotsByTime(slots.data ?? []),
        [slots.data],
    );

    const create = useMutation({
        mutationFn: createBooking,
        onSuccess: (booking) => {
            setParams({}, { replace: true });
            navigate(`/reserva/${booking.confirmation_token}`);
        },
        onError: (error) => {
            toast.error(toUserMessage(error));

            // El hueco se ocupó mientras completaba el formulario.
            if (rpcErrorCode(error) === 'slot_unavailable') {
                const next = new URLSearchParams(params);
                next.delete('hora');
                setParams(next, { replace: true });
            }
        },
    });

    function setParam(key: string, value: string) {
        const next = new URLSearchParams(params);

        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }

        setParams(next);
    }

    /** Vuelve al paso N descartando las elecciones posteriores. */
    function goToStep(target: number) {
        const next = new URLSearchParams(params);
        const keysByStep: Record<number, string[]> = {
            1: ['servicio', 'profesional', 'fecha', 'hora'],
            2: ['profesional', 'fecha', 'hora'],
            3: ['fecha', 'hora'],
            4: ['hora'],
            5: [],
        };

        for (const key of keysByStep[target] ?? []) {
            next.delete(key);
        }

        setParams(next);
    }

    const selectedService = services.data?.find((item) => item.id === serviceId);
    const today = todayInZone(timeZone);
    const maxDate = addDays(today, business.data?.max_advance_days ?? 30);

    if (business.isPending) {
        return (
            <main className="mx-auto w-full max-w-2xl space-y-4 px-5 py-10 sm:px-8">
                <Skeleton className="h-9 w-64 max-w-full" />
                <Skeleton className="h-4 w-96 max-w-full" />
                <Skeleton className="h-64 w-full" />
            </main>
        );
    }

    if (business.isError) {
        return (
            <ConfigNotice title="No pudimos cargar el negocio" body={toUserMessage(business.error)} />
        );
    }

    if (!business.data) {
        return (
            <ConfigNotice
                title="Este negocio no está disponible"
                body="Puede que la dirección sea incorrecta o que el negocio haya dejado de publicar su página."
                linkTo="/"
                linkLabel="Volver al inicio"
            />
        );
    }

    // Copia local para que la estrechez de tipos sobreviva a los callbacks.
    const data = business.data;

    return (
        <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
            <header>
                <p className="text-sm text-ink-muted">Reserva en</p>
                <h1 className="font-display text-3xl text-ink">
                    {data.name}
                </h1>
            </header>
            <StepStrip
                current={step}
                labels={STEP_LABELS}
                onSelect={goToStep}
            />

            <section className="mt-8" aria-label={`Paso ${step} de 5`}>
                {step === 1 && (
                    <StepServices
                        services={services}
                        selectedId={serviceId}
                        currency={data.currency}
                        onSelect={(id) => setParam('servicio', id)}
                    />
                )}

                {step === 2 && (
                    <StepProfessional
                        professionals={professionals}
                        selectedId={professionalParam}
                        onSelect={(id) => setParam('profesional', id)}
                    />
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-4">
                        <h2 className="font-display text-xl text-ink">
                            ¿Qué día te viene bien?
                        </h2>
                        <Field
                            label="Fecha de la cita"
                            id="fecha"
                            hint={`Puedes reservar hasta ${data.max_advance_days} días por adelantado.`}
                        >
                            <Input
                                id="fecha"
                                type="date"
                                min={today}
                                max={maxDate}
                                value={fecha}
                                onChange={(event) =>
                                    setParam('fecha', event.target.value)
                                }
                            />
                        </Field>
                    </div>
                )}

                {step === 4 && (
                    <StepSlots
                        slots={slots}
                        groups={slotGroups}
                        timeZone={timeZone}
                        fecha={fecha}
                        selected={hora}
                        onSelect={(startsAt) => setParam('hora', startsAt)}
                    />
                )}

                {step === 5 && selectedService && (
                    <StepCustomer
                        businessName={data.name}
                        currency={data.currency}
                        timeZone={timeZone}
                        service={selectedService}
                        professionalName={
                            professionalParam === ANY_PROFESSIONAL
                                ? 'Cualquier profesional disponible'
                                : (professionals.data?.find(
                                      (item) => item.id === professionalParam,
                                  )?.full_name ?? '—')
                        }
                        startsAt={hora}
                        pending={create.isPending}
                        onSubmit={(form) =>
                            create.mutateAsync({
                                businessId: data.id,
                                serviceId,
                                professionalId:
                                    professionalParam === ANY_PROFESSIONAL
                                        ? null
                                        : professionalParam,
                                startsAt: hora,
                                fullName: form.fullName,
                                email: form.email,
                                phone: form.phone || null,
                                notes: form.notes || null,
                            })
                        }
                    />
                )}
            </section>
        </main>
    );
}

function currentStep(
    serviceId: string,
    professionalParam: string,
    fecha: string,
    hora: string,
): number {
    if (!serviceId) return 1;
    if (!professionalParam) return 2;
    if (!fecha) return 3;
    if (!hora) return 4;
    return 5;
}

function ConfigNotice({
    title,
    body,
    linkTo,
    linkLabel,
}: {
    title: string;
    body?: string;
    linkTo?: string;
    linkLabel?: string;
}) {
    return (
        <main className="mx-auto max-w-xl px-5 py-16 text-center">
            <h1 className="font-display text-2xl text-ink">{title}</h1>
            {body && <p className="mt-3 text-sm text-ink-soft">{body}</p>}
            {linkTo && linkLabel && (
                <Button asChild className="mt-6">
                    <Link to={linkTo}>{linkLabel}</Link>
                </Button>
            )}
        </main>
    );
}

function StepStrip({
    current,
    labels,
    onSelect,
}: {
    current: number;
    labels: readonly string[];
    onSelect: (step: number) => void;
}) {
    return (
        <ol className="mt-6 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm" aria-label="Pasos de la reserva">
            {labels.map((label, index) => {
                const number = index + 1;
                const done = number < current;
                const active = number === current;

                return (
                    <li key={label} className="flex items-center gap-1">
                        {index > 0 && (
                            <span aria-hidden="true" className="mx-1 text-rule-strong">
                                ›
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => onSelect(number)}
                            aria-current={active ? 'step' : undefined}
                            className={[
                                'rounded-full px-3 py-1.5 transition-colors',
                                active
                                    ? 'bg-accent-soft font-medium text-accent-ink'
                                    : done
                                      ? 'text-ink-soft hover:bg-sunken'
                                      : 'text-ink-muted hover:bg-sunken',
                            ].join(' ')}
                        >
                            {done && (
                                <Check aria-hidden="true" className="mr-1 inline size-3.5 text-confirmed" />
                            )}
                            {number}. {label}
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}

function StepServices({
    services,
    selectedId,
    currency,
    onSelect,
}: {
    services: ReturnType<typeof usePublicServices>;
    selectedId: string;
    currency: string;
    onSelect: (id: string) => void;
}) {
    if (services.isPending) {
        return (
            <div className="grid gap-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    if (services.isError) {
        return (
            <p className="text-sm text-danger" role="alert">
                {toUserMessage(services.error)}
            </p>
        );
    }

    if (services.data.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-rule p-6 text-center text-sm text-ink-soft">
                Este negocio todavía no publica servicios.
            </p>
        );
    }

    return (
        <>
            <h2 className="font-display text-xl text-ink">Elige un servicio</h2>
            <ul className="mt-4 grid gap-3">
                {services.data.map((service) => (
                    <li key={service.id}>
                        <button
                            type="button"
                            onClick={() => onSelect(service.id)}
                            className={[
                                'w-full rounded-lg border p-4 text-left transition-colors',
                                service.id === selectedId
                                    ? 'border-accent bg-accent-soft'
                                    : 'border-rule bg-surface hover:border-rule-strong',
                            ].join(' ')}
                        >
                            <span className="flex items-baseline justify-between gap-3">
                                <span className="font-medium text-ink">
                                    {service.name}
                                </span>
                                <span className="tabular text-sm text-accent-ink">
                                    {formatMoney(service.price_cents, currency)}
                                </span>
                            </span>
                            {service.description && (
                                <span className="mt-1 block text-sm text-ink-soft">
                                    {service.description}
                                </span>
                            )}
                            <span className="tabular mt-2 block text-xs text-ink-muted">
                                {formatDuration(service.duration_minutes)}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </>
    );
}

function StepProfessional({
    professionals,
    selectedId,
    onSelect,
}: {
    professionals: ReturnType<typeof usePublicProfessionals>;
    selectedId: string;
    onSelect: (id: string) => void;
}) {
    return (
        <>
            <h2 className="font-display text-xl text-ink">¿Con quién?</h2>
            <ul className="mt-4 grid gap-3">
                <li>
                    <OptionRow
                        selected={selectedId === ANY_PROFESSIONAL}
                        title="Cualquier profesional"
                        body="Te asignamos el primer horario disponible."
                        onClick={() => onSelect(ANY_PROFESSIONAL)}
                    />
                </li>
                {professionals.isPending ? (
                    <li>
                        <Skeleton className="h-16 w-full" />
                    </li>
                ) : professionals.isError ? (
                    <li>
                        <p className="text-sm text-danger" role="alert">
                            {toUserMessage(professionals.error)}
                        </p>
                    </li>
                ) : (
                    professionals.data.map((professional) => (
                        <li key={professional.id}>
                            <OptionRow
                                selected={selectedId === professional.id}
                                title={professional.full_name}
                                body={null}
                                color={professional.color ?? undefined}
                                onClick={() => onSelect(professional.id)}
                            />
                        </li>
                    ))
                )}
            </ul>
        </>
    );
}

function OptionRow({
    selected,
    title,
    body,
    color,
    onClick,
}: {
    selected: boolean;
    title: string;
    body: string | null;
    color?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={[
                'flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                selected
                    ? 'border-accent bg-accent-soft'
                    : 'border-rule bg-surface hover:border-rule-strong',
            ].join(' ')}
        >
            {color && (
                <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                />
            )}
            <span className="min-w-0">
                <span className="block font-medium text-ink">{title}</span>
                {body && (
                    <span className="mt-0.5 block text-sm text-ink-soft">
                        {body}
                    </span>
                )}
            </span>
        </button>
    );
}

function StepSlots({
    slots,
    groups,
    timeZone,
    fecha,
    selected,
    onSelect,
}: {
    slots: ReturnType<typeof useAvailableSlots>;
    groups: ReturnType<typeof groupSlotsByTime>;
    timeZone: string;
    fecha: string;
    selected: string;
    onSelect: (startsAt: string) => void;
}) {
    return (
        <>
            <h2 className="font-display text-xl text-ink">Elige la hora</h2>
            {fecha && (
                <p className="mt-1 text-sm text-ink-soft">
                    {formatCalendarDate(fecha) ?? fecha}
                </p>
            )}

            {slots.isPending && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: 8 }, (_, index) => (
                        <Skeleton key={index} className="h-10 w-20" />
                    ))}
                </div>
            )}

            {slots.isError && (
                <p className="mt-4 text-sm text-danger" role="alert">
                    {toUserMessage(slots.error)}
                </p>
            )}

            {slots.data && groups.length === 0 && (
                <p className="mt-4 rounded-lg border border-dashed border-rule p-6 text-center text-sm text-ink-soft">
                    No hay horas libres para este día. Prueba con otra fecha.
                </p>
            )}

            <ul className="mt-4 flex flex-wrap gap-2">
                {groups.map((group) => {
                    const label = formatTimeInZone(group.startsAt, timeZone);
                    const isSelected = group.startsAt === selected;

                    return (
                        <li key={group.startsAt}>
                            <button
                                type="button"
                                onClick={() => onSelect(group.startsAt)}
                                aria-pressed={isSelected}
                                className={[
                                    'tabular rounded-md border px-4 py-2.5 text-sm transition-colors',
                                    isSelected
                                        ? 'border-accent bg-accent text-paper'
                                        : 'border-rule bg-surface text-ink hover:border-accent',
                                ].join(' ')}
                            >
                                {label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

function StepCustomer({
    businessName,
    currency,
    timeZone,
    service,
    professionalName,
    startsAt,
    pending,
    onSubmit,
}: {
    businessName: string;
    currency: string;
    timeZone: string;
    service: { name: string; price_cents: number; duration_minutes: number };
    professionalName: string;
    startsAt: string;
    pending: boolean;
    onSubmit: (form: CustomerForm) => Promise<unknown>;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CustomerForm>({
        resolver: zodResolver(customerSchema),
        defaultValues: { fullName: '', email: '', phone: '', notes: '' },
    });

    const summary = [
        formatTimeInZone(startsAt, timeZone),
        formatCalendarDate(startsAt.slice(0, 10)) ?? '',
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <form
            noValidate
            onSubmit={handleSubmit(async (form) => {
                await onSubmit(form);
            })}
            className="flex flex-col gap-5"
        >
            <h2 className="font-display text-xl text-ink">Tus datos</h2>

            <div className="rounded-lg border border-rule bg-sunken p-4 text-sm">
                <p className="font-medium text-ink">{service.name}</p>
                <p className="tabular mt-1 text-ink-soft">{summary}</p>
                <p className="mt-0.5 text-ink-soft">{professionalName}</p>
                <p className="tabular mt-2 text-accent-ink">
                    {formatMoney(service.price_cents, currency)} ·{' '}
                    {formatDuration(service.duration_minutes)}
                </p>
                <p className="mt-2 text-xs text-ink-muted">
                    Reserva en {businessName}
                </p>
            </div>

            <Field label="Nombre completo" id="fullName" required error={errors.fullName?.message}>
                <Input
                    autoComplete="name"
                    placeholder="Ej. Ana Quispe"
                    {...register('fullName')}
                />
            </Field>

            <Field
                label="Correo electrónico"
                id="email"
                required
                hint="Aquí recibirás el enlace para consultar o cancelar tu cita."
                error={errors.email?.message}
            >
                <Input
                    type="email"
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    {...register('email')}
                />
            </Field>

            <Field label="Teléfono (opcional)" id="phone" error={errors.phone?.message}>
                <Input
                    type="tel"
                    autoComplete="tel"
                    placeholder="999 999 999"
                    {...register('phone')}
                />
            </Field>

            <Field label="Notas (opcional)" id="notes" error={errors.notes?.message}>
                <Textarea
                    placeholder="Algo que el negocio deba saber"
                    {...register('notes')}
                />
            </Field>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button asChild variant="ghost" type="button">
                    <Link to="/entrar" tabIndex={-1}>
                        ¿Tienes cuenta? Inicia sesión
                    </Link>
                </Button>
                <Button type="submit" size="lg" disabled={pending}>
                    {pending ? 'Reservando…' : 'Confirmar reserva'}
                    {!pending && <ArrowRight aria-hidden="true" />}
                </Button>
            </div>

            <p className="text-xs leading-relaxed text-ink-muted">
                No necesitas crear una cuenta. Al confirmar, el negocio verá tu
                nombre, correo y notas para atenderte mejor.
            </p>
        </form>
    );
}
