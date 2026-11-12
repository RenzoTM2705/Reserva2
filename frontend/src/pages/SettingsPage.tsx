import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { ExternalLink, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useMembership } from '@/features/panel/use-membership';
import { listBusinessHours, upsertBusinessHours, updateBusiness } from '@/lib/api';
import type { BusinessHour } from '@/lib/types';
import { WEEKDAY_LABELS, WEEKDAYS_ORDER } from '@/lib/dates';
import { toUserMessage } from '@/lib/errors';
import { useDocumentTitle } from '@/lib/use-document-title';
import { zodResolver } from '@/lib/zod-resolver';

const CURRENCIES = ['PEN', 'USD', 'EUR'] as const;

const settingsSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Escribe el nombre del negocio.')
        .max(120, 'El nombre es demasiado largo.'),
    description: z
        .string()
        .trim()
        .max(300, 'Máximo 300 caracteres.')
        .optional()
        .or(z.literal('')),
    address: z.string().trim().max(200).optional().or(z.literal('')),
    phone: z.string().trim().max(40).optional().or(z.literal('')),
    currency: z.enum(CURRENCIES),
    timezone: z
        .string()
        .trim()
        .min(3, 'Escribe una zona horaria IANA.')
        .max(60)
        .regex(/^[A-Za-z_]+\/[A-Za-z_+\-0-9/]+$/, 'Formato IANA: p. ej. America/Lima'),
    minLeadMinutes: z.coerce
        .number()
        .int()
        .min(0)
        .max(1440, 'Máximo 24 horas de anticipación mínima.'),
    maxAdvanceDays: z.coerce
        .number()
        .int()
        .min(1, 'Al menos 1 día.')
        .max(365, 'Máximo 365 días.'),
    cancellationPolicyHours: z.coerce
        .number()
        .int()
        .min(0)
        .max(168, 'Máximo 7 días.'),
    isPublished: z.boolean(),
    requiresConfirmation: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

type HoursRow = Pick<BusinessHour, 'weekday' | 'is_closed' | 'opens_at' | 'closes_at'>;

/**
 * Configuración del negocio y su horario semanal.
 *
 * Dos guardados independientes: los datos del negocio (`updateBusiness`) y
 * el horario (`upsertBusinessHours`, una fila por día de la semana).
 */
export function SettingsPage() {
    const membership = useMembership();
    const queryClient = useQueryClient();
    useDocumentTitle('Configuración — Panel');

    const business = membership.data?.business;
    const hours = useQuery({
        queryKey: ['business-hours', business?.id],
        queryFn: () => listBusinessHours(business!.id),
        enabled: Boolean(business),
    });

    const [draftRows, setDraftRows] = useState<HoursRow[] | null>(null);

    // El borrador se deriva de los datos: si no hay ediciones locales, la
    // lista refleja la base; tras guardar se vuelve a derivar (dirty = null).
    function buildDraftRows(data: BusinessHour[] | undefined): HoursRow[] {
        return WEEKDAYS_ORDER.map((weekday) => {
            const found = data?.find((row) => row.weekday === weekday);
            return {
                weekday,
                is_closed: found?.is_closed ?? true,
                opens_at: found?.opens_at ?? '09:00',
                closes_at: found?.closes_at ?? '18:00',
            };
        });
    }

    const rows = useMemo(
        () => draftRows ?? buildDraftRows(hours.data),
        [draftRows, hours.data],
    );
    const hoursDirty = draftRows !== null;

    const saveHours = useMutation({
        mutationFn: () => upsertBusinessHours(business!.id, rows),
        onSuccess: async () => {
            toast.success('Horario guardado.');
            setDraftRows(null);
            await queryClient.invalidateQueries({ queryKey: ['business-hours'] });
        },
        onError: (error) => toast.error(toUserMessage(error)),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SettingsForm>({
        resolver: zodResolver(settingsSchema),
        // `defaultValues` y no `values`: así una invalidación de la caché no
        // pisa los cambios sin guardar del formulario.
        defaultValues: business
            ? {
                  name: business.name,
                  description: business.description ?? '',
                  address: business.address ?? '',
                  phone: business.phone ?? '',
                  currency: business.currency as (typeof CURRENCIES)[number],
                  timezone: business.timezone,
                  minLeadMinutes: business.min_lead_minutes,
                  maxAdvanceDays: business.max_advance_days,
                  cancellationPolicyHours: business.cancellation_policy_hours,
                  isPublished: business.is_published,
                  requiresConfirmation: business.requires_confirmation,
              }
            : undefined,
    });

    const saveBusiness = useMutation({
        mutationFn: async (form: SettingsForm) => {
            if (!business) return;
            await updateBusiness(business.id, {
                name: form.name,
                description: form.description || null,
                address: form.address || null,
                phone: form.phone || null,
                currency: form.currency,
                timezone: form.timezone,
                min_lead_minutes: form.minLeadMinutes,
                max_advance_days: form.maxAdvanceDays,
                cancellation_policy_hours: form.cancellationPolicyHours,
                is_published: form.isPublished,
                requires_confirmation: form.requiresConfirmation,
            });
        },
        onSuccess: async () => {
            toast.success('Configuración guardada.');
            await queryClient.invalidateQueries({ queryKey: ['membership'] });
        },
        onError: (error) => toast.error(toUserMessage(error)),
    });

    function updateRow(weekday: number, patch: Partial<HoursRow>) {
        setDraftRows(
            rows.map((row) =>
                row.weekday === weekday ? { ...row, ...patch } : row,
            ),
        );
    }

    if (!business) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <div className="max-w-3xl">
            <header>
                <h1 className="font-display text-3xl text-ink">Configuración</h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                    Página pública:
                    <Badge variant={business.is_published ? 'confirmed' : 'neutral'}>
                        {business.is_published ? 'Publicada' : 'No publicada'}
                    </Badge>
                    <Button asChild variant="link" size="sm">
                        <Link to={`/negocio/${business.slug}`}>
                            <ExternalLink aria-hidden="true" />
                            /negocio/{business.slug}
                        </Link>
                    </Button>
                </p>
            </header>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Datos del negocio</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        noValidate
                        onSubmit={handleSubmit(async (form) => {
                            await saveBusiness.mutateAsync(form);
                        })}
                        className="flex flex-col gap-5"
                    >
                        <Field label="Nombre" id="c-name" required error={errors.name?.message}>
                            <Input id="c-name" {...register('name')} />
                        </Field>

                        <Field
                            label="Descripción pública"
                            id="c-description"
                            hint="Una frase que describa tu oferta."
                            error={errors.description?.message}
                        >
                            <Textarea id="c-description" {...register('description')} />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Dirección (opcional)" id="c-address" error={errors.address?.message}>
                                <Input id="c-address" autoComplete="street-address" {...register('address')} />
                            </Field>
                            <Field label="Teléfono (opcional)" id="c-phone" error={errors.phone?.message}>
                                <Input id="c-phone" type="tel" autoComplete="tel" {...register('phone')} />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Moneda" id="c-currency" required error={errors.currency?.message}>
                                <Select id="c-currency" {...register('currency')}>
                                    {CURRENCIES.map((currency) => (
                                        <option key={currency} value={currency}>
                                            {currency}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field
                                label="Zona horaria (IANA)"
                                id="c-timezone"
                                required
                                hint="Toda la agenda se calcula en esta zona."
                                error={errors.timezone?.message}
                            >
                                <Input id="c-timezone" placeholder="America/Lima" {...register('timezone')} />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field
                                label="Anticipación mínima (min)"
                                id="c-lead"
                                hint="Ej. 60 = no aceptan citas de 0 a 60 min antes."
                                error={errors.minLeadMinutes?.message}
                            >
                                <Input id="c-lead" type="number" min={0} step={15} {...register('minLeadMinutes')} />
                            </Field>
                            <Field
                                label="Reservar hasta (días)"
                                id="c-advance"
                                error={errors.maxAdvanceDays?.message}
                            >
                                <Input id="c-advance" type="number" min={1} {...register('maxAdvanceDays')} />
                            </Field>
                            <Field
                                label="Política de cancelación (h)"
                                id="c-policy"
                                hint="Horas antes de la cita."
                                error={errors.cancellationPolicyHours?.message}
                            >
                                <Input
                                    id="c-policy"
                                    type="number"
                                    min={0}
                                    {...register('cancellationPolicyHours')}
                                />
                            </Field>
                        </div>

                        <div className="flex flex-col gap-2 rounded-md border border-rule p-4">
                            <label className="flex items-center gap-2.5 text-sm text-ink">
                                <input
                                    type="checkbox"
                                    className="size-4 accent-[var(--color-accent)]"
                                    {...register('isPublished')}
                                />
                                Página pública visible
                            </label>
                            <label className="flex items-center gap-2.5 text-sm text-ink">
                                <input
                                    type="checkbox"
                                    className="size-4 accent-[var(--color-accent)]"
                                    {...register('requiresConfirmation')}
                                />
                                Las reservas nuevas quedan «Pendiente» hasta que las confirmes
                            </label>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting || saveBusiness.isPending}>
                                {saveBusiness.isPending ? 'Guardando…' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe aria-hidden="true" className="size-5 text-accent" />
                        Horario semanal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {hours.isPending ? (
                        <Skeleton className="h-56 w-full" />
                    ) : hours.isError ? (
                        <p className="text-sm text-danger" role="alert">
                            {toUserMessage(hours.error)}
                        </p>
                    ) : (
                        <form
                            onSubmit={async (event) => {
                                event.preventDefault();
                                saveHours.mutate();
                            }}
                            className="flex flex-col gap-3"
                        >
                            <ul className="divide-y divide-rule rounded-md border border-rule">
                                {rows.map((row) => (
                                    <li
                                        key={row.weekday}
                                        className="flex flex-wrap items-center gap-3 px-3 py-2.5"
                                    >
                                        <span className="w-24 text-sm font-medium text-ink">
                                            {WEEKDAY_LABELS[row.weekday]}
                                        </span>
                                        <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                                            <input
                                                type="checkbox"
                                                className="size-4 accent-[var(--color-accent)]"
                                                checked={row.is_closed}
                                                aria-label={`${WEEKDAY_LABELS[row.weekday]} cerrado`}
                                                onChange={(event) =>
                                                    updateRow(row.weekday, {
                                                        is_closed: event.target.checked,
                                                    })
                                                }
                                            />
                                            Cerrado
                                        </label>
                                        {!row.is_closed && (
                                            <span className="flex items-center gap-2 text-xs text-ink-soft">
                                                <Input
                                                    type="time"
                                                    value={row.opens_at ?? '09:00'}
                                                    className="w-28"
                                                    aria-label={`Apertura de ${WEEKDAY_LABELS[row.weekday]}`}
                                                    onChange={(event) =>
                                                        updateRow(row.weekday, {
                                                            opens_at: event.target.value,
                                                        })
                                                    }
                                                />
                                                <span aria-hidden="true">–</span>
                                                <Input
                                                    type="time"
                                                    value={row.closes_at ?? '18:00'}
                                                    className="w-28"
                                                    aria-label={`Cierre de ${WEEKDAY_LABELS[row.weekday]}`}
                                                    onChange={(event) =>
                                                        updateRow(row.weekday, {
                                                            closes_at: event.target.value,
                                                        })
                                                    }
                                                />
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={!hoursDirty || saveHours.isPending}>
                                    {saveHours.isPending ? 'Guardando…' : 'Guardar horario'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
