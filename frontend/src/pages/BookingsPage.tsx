import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ListChecks, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/business/status-badge';
import { useMembership } from '@/features/panel/use-membership';
import { listBookings, updateBookingStatus } from '@/lib/api';
import {
    BOOKING_STATUS_LABELS,
    BOOKING_STATUS_ORDER,
    BOOKING_TRANSITIONS,
    type BookingStatus,
    type BookingWithRefs,
} from '@/lib/types';
import { zonedDateTimeToIso } from '@/lib/dates';
import { toUserMessage } from '@/lib/errors';
import { formatDateTimeInZone, formatMoney } from '@/lib/format';
import { useDocumentTitle } from '@/lib/use-document-title';

type BookingWithId = BookingWithRefs & { id: string };

/**
 * Listado de reservas con filtros vivos en la URL (ADR-005).
 *
 * El rango de fechas se convierte a instantes ISO en la zona del negocio.
 * Máximo 300 filas por consulta: es un directorio operativo, no un informe.
 */
export function BookingsPage() {
    const membership = useMembership();
    const queryClient = useQueryClient();
    const [params, setParams] = useSearchParams();
    useDocumentTitle('Reservas — Panel');

    const business = membership.data?.business;
    const statusFilter = (params.get('estado') ?? '') as BookingStatus | '';
    const from = params.get('desde') ?? '';
    const to = params.get('hasta') ?? '';

    const fromIso =
        business && from ? zonedDateTimeToIso(from, '00:00', business.timezone) : undefined;
    const toIso =
        business && to ? zonedDateTimeToIso(to, '23:59', business.timezone) : undefined;

    const bookings = useQuery({
        queryKey: ['bookings', business?.id, { status: statusFilter, from, to }],
        queryFn: () =>
            listBookings(business!.id, {
                fromIso,
                toIso,
                status: statusFilter || undefined,
            }),
        enabled: Boolean(business),
    });

    const transition = useMutation({
        mutationFn: ({ id, to: next }: { id: string; to: BookingStatus }) =>
            updateBookingStatus(id, next),
        onSuccess: async () => {
            toast.success('Estado actualizado.');
            await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
        onError: (error) => toast.error(toUserMessage(error)),
    });

    // La cancelación pide confirmación; el resto de transiciones son leves.
    const [cancelTarget, setCancelTarget] = useState<BookingWithId | null>(null);

    const rows = useMemo(() => bookings.data ?? [], [bookings.data]);

    function setFilter(key: string, value: string) {
        const next = new URLSearchParams(params);
        if (value) next.set(key, value);
        else next.delete(key);
        setParams(next, { replace: true });
    }

    const hasFilters = Boolean(statusFilter || from || to);

    return (
        <div>
            <header>
                <h1 className="font-display text-3xl text-ink">Reservas</h1>
                <p className="mt-1 text-sm text-ink-soft">
                    Últimas 300 reservas dentro del rango filtrado.
                </p>
            </header>

            <form
                className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end"
                role="search"
                onSubmit={(event) => event.preventDefault()}
            >
                <Field label="Estado" id="f-estado">
                    <Select
                        id="f-estado"
                        value={statusFilter}
                        onChange={(event) => setFilter('estado', event.target.value)}
                    >
                        <option value="">Todos</option>
                        {BOOKING_STATUS_ORDER.map((status) => (
                            <option key={status} value={status}>
                                {BOOKING_STATUS_LABELS[status]}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label="Desde" id="f-desde">
                    <Input
                        id="f-desde"
                        type="date"
                        value={from}
                        onChange={(event) => setFilter('desde', event.target.value)}
                    />
                </Field>
                <Field label="Hasta" id="f-hasta">
                    <Input
                        id="f-hasta"
                        type="date"
                        value={to}
                        onChange={(event) => setFilter('hasta', event.target.value)}
                    />
                </Field>
                <div className="flex gap-2 pb-0.5">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => bookings.refetch()}
                        aria-label="Actualizar listado"
                    >
                        <RefreshCw aria-hidden="true" />
                    </Button>
                    {hasFilters && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setParams({}, { replace: true })}
                        >
                            Limpiar
                        </Button>
                    )}
                </div>
            </form>

            <section aria-label="Listado de reservas" className="mt-8">
                {bookings.isPending ? (
                    <div className="space-y-3">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                ) : bookings.isError ? (
                    <p className="text-sm text-danger" role="alert">
                        {toUserMessage(bookings.error)}
                    </p>
                ) : rows.length === 0 ? (
                    <EmptyState
                        icon={ListChecks}
                        title="Sin reservas"
                        body={
                            hasFilters
                                ? 'Ninguna reserva coincide con los filtros. Prueba ampliando el rango o el estado.'
                                : 'Cuando tus clientes reserven, las verás aquí.'
                        }
                        action={
                            hasFilters ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => setParams({}, { replace: true })}
                                >
                                    Limpiar filtros
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <ul className="divide-y divide-rule rounded-lg border border-rule bg-surface">
                        {rows.map((booking) => (
                            <li
                                key={booking.id}
                                className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-ink">
                                        {booking.customer?.full_name ?? 'Cliente'}
                                        <span className="ml-2 text-xs font-normal text-ink-muted">
                                            {booking.customer?.email}
                                        </span>
                                    </p>
                                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                                        {booking.service?.name ?? '—'}
                                        {booking.professional?.full_name
                                            ? ` · ${booking.professional.full_name}`
                                            : ''}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-sm">
                                        <p className="tabular text-ink">
                                            {formatDateTimeInZone(
                                                booking.starts_at,
                                                business?.timezone ?? 'UTC',
                                            )}
                                        </p>
                                        <p className="tabular mt-0.5 text-xs text-ink-muted">
                                            {formatMoney(
                                                booking.price_cents,
                                                booking.currency,
                                            )}
                                        </p>
                                    </div>
                                    <StatusBadge status={booking.status} />
                                    <Transitions
                                        booking={booking as BookingWithId}
                                        onTransition={(next) =>
                                            transition.mutate({ id: booking.id, to: next })
                                        }
                                        onCancelRequest={() =>
                                            setCancelTarget(booking as BookingWithId)
                                        }
                                        busy={transition.isPending}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <Dialog
                open={cancelTarget !== null}
                onClose={() => setCancelTarget(null)}
                title="Cancelar reserva"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm leading-relaxed text-ink-soft">
                        La reserva pasará a «Cancelada». Esta operación queda
                        registrada con la fecha actual.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setCancelTarget(null)}>
                            Volver
                        </Button>
                        <Button
                            variant="danger"
                            disabled={transition.isPending}
                            onClick={() => {
                                if (!cancelTarget) return;
                                transition.mutate(
                                    { id: cancelTarget.id, to: 'cancelled' },
                                    {
                                        onSettled: () => setCancelTarget(null),
                                    },
                                );
                            }}
                        >
                            Confirmar
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

function Transitions({
    booking,
    onTransition,
    onCancelRequest,
    busy,
}: {
    booking: BookingWithId;
    onTransition: (to: BookingStatus) => void;
    onCancelRequest: () => void;
    busy: boolean;
}) {
    const options = BOOKING_TRANSITIONS[booking.status];
    if (options.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map(({ to, label }) => (
                <Button
                    key={to}
                    size="sm"
                    variant={to === 'cancelled' ? 'secondary' : 'ghost'}
                    disabled={busy}
                    onClick={() => (to === 'cancelled' ? onCancelRequest() : onTransition(to))}
                >
                    {label}
                </Button>
            ))}
        </div>
    );
}
