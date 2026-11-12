import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    CalendarDays,
    ListChecks,
    Scissors,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/business/status-badge';
import { useMembership } from '@/features/panel/use-membership';
import { listBookings } from '@/lib/api';
import { todayInZone, zonedDateTimeToIso } from '@/lib/dates';
import { toUserMessage } from '@/lib/errors';
import { formatMoney, formatTimeInZone } from '@/lib/format';
import { useDocumentTitle } from '@/lib/use-document-title';

const QUICK_LINKS = [
    { to: '/panel/reservas', label: 'Reservas', icon: ListChecks },
    { to: '/panel/calendario', label: 'Calendario', icon: CalendarDays },
    { to: '/panel/servicios', label: 'Servicios', icon: Scissors },
    { to: '/panel/clientes', label: 'Clientes', icon: Users },
] as const;

/**
 * Resumen del día en la zona horaria del negocio.
 *
 * El rango se convierte a instantes ISO porque `starts_at` es `timestamptz`.
 */
export function DashboardPage() {
    const membership = useMembership();
    useDocumentTitle('Panel — Reserva2');

    // El rango se resuelve en la zona horaria del negocio porque `starts_at`
    // es `timestamptz`; la consulta solo se activa con negocio disponible.
    const business = membership.data?.business;
    const today = todayInZone(business?.timezone ?? 'America/Lima');
    const fromIso = business
        ? zonedDateTimeToIso(today, '00:00', business.timezone)
        : '';
    const toIso = business
        ? zonedDateTimeToIso(today, '23:59', business.timezone)
        : '';

    const bookings = useQuery({
        queryKey: ['bookings', business?.id, 'today', today],
        queryFn: () => listBookings(business!.id, { fromIso, toIso }),
        enabled: Boolean(business),
    });

    if (membership.isPending) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-9 w-64" />
                <div className="grid gap-4 sm:grid-cols-3">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            </div>
        );
    }

    if (!membership.data || !business) return null;

    const data = bookings.data ?? [];
    const pending = data.filter((item) => item.status === 'pending').length;
    const confirmed = data.filter((item) => item.status === 'confirmed').length;
    const revenue = data
        .filter((item) => item.status === 'completed')
        .reduce((sum, item) => sum + item.price_cents, 0);

    return (
        <div>
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl text-ink">
                        {business.name}
                    </h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Resumen de hoy, {today}
                    </p>
                </div>
                <Button asChild>
                    <Link to="/panel/calendario">Ver calendario</Link>
                </Button>
            </header>

            <section aria-label="Accesos rápidos" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-2.5 rounded-lg border border-rule bg-surface px-4 py-3.5 text-sm font-medium text-ink transition-colors hover:border-rule-strong hover:bg-sunken"
                    >
                        <Icon aria-hidden="true" className="size-4 text-accent" />
                        {label}
                    </Link>
                ))}
            </section>

            <section aria-labelledby="metricas" className="mt-10">
                <h2 id="metricas" className="sr-only">
                    Métricas de hoy
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    <Metric label="Citas de hoy" value={String(data.length)} />
                    <Metric label="Pendientes" value={String(pending)} />
                    <Metric label="Confirmadas" value={String(confirmed)} />
                </div>
            </section>

            <section aria-labelledby="agenda-hoy" className="mt-10">
                <h2 id="agenda-hoy" className="font-display text-xl text-ink">
                    Agenda de hoy
                </h2>

                {bookings.isPending ? (
                    <div className="mt-4 space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : bookings.isError ? (
                    <p className="mt-4 text-sm text-danger" role="alert">
                        {toUserMessage(bookings.error)}
                    </p>
                ) : data.length === 0 ? (
                    <EmptyState
                        className="mt-4"
                        icon={CalendarDays}
                        title="Hoy no tienes citas"
                        body="Cuando lleguen reservas aparecerán aquí y podrás gestionarlas desde Reservas."
                        action={
                            <Button asChild variant="secondary">
                                <Link to="/panel/reservas">Ir a reservas</Link>
                            </Button>
                        }
                    />
                ) : (
                    <ul className="mt-4 divide-y divide-rule rounded-lg border border-rule bg-surface">
                        {data.map((booking) => (
                            <li
                                key={booking.id}
                                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:flex-nowrap"
                            >
                                <span className="tabular w-16 shrink-0 font-medium text-ink">
                                    {formatTimeInZone(
                                        booking.starts_at,
                                        business.timezone,
                                    )}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-ink">
                                        {booking.customer?.full_name ?? 'Cliente'}
                                    </span>
                                    <span className="block truncate text-xs text-ink-muted">
                                        {booking.service?.name ?? '—'}
                                        {booking.professional?.full_name
                                            ? ` · ${booking.professional.full_name}`
                                            : ''}
                                    </span>
                                </span>
                                <span className="tabular text-sm text-ink-soft">
                                    {formatMoney(booking.price_cents, booking.currency)}
                                </span>
                                <StatusBadge status={booking.status} />
                            </li>
                        ))}
                    </ul>
                )}

                <p className="mt-4 text-xs text-ink-muted">
                    Ingresos completados hoy:{' '}
                    <span className="tabular">
                        {formatMoney(revenue, business.currency)}
                    </span>
                </p>
            </section>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <Card>
            <CardHeader className="p-5 pb-2">
                <CardTitle className="tabular text-3xl">{value}</CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
                <p className="text-sm text-ink-soft">{label}</p>
            </CardContent>
        </Card>
    );
}
