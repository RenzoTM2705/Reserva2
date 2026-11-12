import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/business/status-badge';
import { useMembership } from '@/features/panel/use-membership';
import { listBookings } from '@/lib/api';
import {
    isoToDateInZone,
    monthGrid,
    todayInZone,
    WEEKDAY_LABELS,
    WEEKDAYS_ORDER,
    zonedDateTimeToIso,
} from '@/lib/dates';
import { toUserMessage } from '@/lib/errors';
import { formatMoney, formatTimeInZone } from '@/lib/format';
import { useDocumentTitle } from '@/lib/use-document-title';

const MONTH_NAMES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
] as const;

function monthBounds(month: string): { first: string; last: string } {
    const [year, monthIndex] = month.split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
    return { first: `${month}-01`, last: `${month}-${String(lastDay).padStart(2, '0')}` };
}

/**
 * Calendario mensual con agenda del día seleccionado.
 *
 * El mes vive en la URL (`?mes=yyyy-mm&dia=yyyy-mm-dd`). Una sola consulta
 * cubre el rango completo del mes; la agenda del día se filtra en cliente.
 */
export function CalendarPage() {
    const membership = useMembership();
    const [params, setParams] = useSearchParams();
    useDocumentTitle('Calendario — Panel');

    const business = membership.data?.business;
    const timeZone = business?.timezone ?? 'UTC';
    const month = params.get('mes') ?? todayInZone(timeZone).slice(0, 7);
    const day = params.get('dia') ?? '';

    const bounds = useMemo(() => monthBounds(month), [month]);
    const cells = useMemo(() => monthGrid(`${month}-01`), [month]);
    const today = todayInZone(timeZone);

    const bookings = useQuery({
        queryKey: ['bookings', business?.id, 'month', month],
        queryFn: () =>
            listBookings(business!.id, {
                fromIso: zonedDateTimeToIso(bounds.first, '00:00', timeZone),
                toIso: zonedDateTimeToIso(bounds.last, '23:59', timeZone),
            }),
        enabled: Boolean(business),
    });

    const byDate = useMemo(() => {
        const map = new Map<string, typeof data>();
        for (const booking of bookings.data ?? []) {
            const key = isoToDateInZone(booking.starts_at, timeZone);
            map.set(key, [...(map.get(key) ?? []), booking]);
        }
        return map;
    }, [bookings.data, timeZone]);

    const data = bookings.data ?? [];
    const dayBookings = day ? (byDate.get(day) ?? []) : [];

    function shiftMonth(delta: number) {
        const [year, monthIndex] = month.split('-').map(Number);
        const next = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
        const nextMonth = next.toISOString().slice(0, 7);
        const nextParams = new URLSearchParams(params);
        nextParams.set('mes', nextMonth);
        nextParams.delete('dia');
        setParams(nextParams);
    }

    function selectDay(cell: string) {
        const nextParams = new URLSearchParams(params);
        nextParams.set('mes', month);
        if (cell === day) {
            nextParams.delete('dia');
        } else {
            nextParams.set('dia', cell);
        }
        setParams(nextParams);
    }

    return (
        <div>
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl text-ink">Calendario</h1>
                    <p className="mt-1 text-sm capitalize text-ink-soft">
                        {MONTH_NAMES[Number(month.slice(5)) - 1]} de {month.slice(0, 4)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => shiftMonth(-1)}>
                        <ChevronLeft aria-hidden="true" />
                        <span className="sr-only sm:not-sr-only">Mes anterior</span>
                    </Button>
                    <Button variant="secondary" onClick={() => shiftMonth(1)}>
                        <ChevronRight aria-hidden="true" />
                        <span className="sr-only sm:not-sr-only">Mes siguiente</span>
                    </Button>
                </div>
            </header>

            {bookings.isError && (
                <p className="mt-4 text-sm text-danger" role="alert">
                    {toUserMessage(bookings.error)}
                </p>
            )}

            <section aria-label="Calendario mensual" className="mt-6">
                <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-rule bg-rule">
                    {WEEKDAYS_ORDER.map((weekday) => (
                        <div
                            key={weekday}
                            aria-hidden="true"
                            className="bg-surface px-1 py-2 text-center text-xs font-medium text-ink-muted"
                        >
                            {WEEKDAY_LABELS[weekday].slice(0, 3)}
                        </div>
                    ))}

                    {cells.map((cell) => {
                        const count = byDate.get(cell)?.length ?? 0;
                        const outside = !cell.startsWith(month);
                        const isToday = cell === today;
                        const selected = cell === day;

                        return (
                            <button
                                key={cell}
                                type="button"
                                onClick={() => selectDay(cell)}
                                aria-pressed={selected}
                                aria-label={`Ver día ${cell}${count > 0 ? `, ${count} citas` : ', sin citas'}`}
                                className={[
                                    'flex flex-col items-center gap-1 bg-surface px-1 pb-2 pt-1.5 text-xs transition-colors',
                                    outside && 'opacity-40',
                                    selected ? 'bg-accent-soft' : 'hover:bg-sunken',
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'tabular flex size-6 items-center justify-center rounded-full',
                                        isToday && !selected
                                            ? 'font-semibold text-accent-ink ring-1 ring-accent'
                                            : 'text-ink',
                                    ].join(' ')}
                                >
                                    {Number(cell.slice(8))}
                                </span>
                                {count > 0 && (
                                    <span className="rounded-full bg-accent px-1.5 text-[10px] font-medium text-paper">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section aria-label="Agenda del día" className="mt-10">
                <h2 className="font-display text-xl text-ink">
                    {day ? `Agenda del ${day}` : 'Selecciona un día'}
                </h2>

                {bookings.isPending && (
                    <div className="mt-4 space-y-3">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                )}

                {!bookings.isPending && day && dayBookings.length === 0 && (
                    <EmptyState
                        className="mt-4"
                        icon={CalendarDays}
                        title="Sin citas ese día"
                        body="Los huecos libres quedan a disposición de tus clientes."
                        action={
                            <Button asChild variant="secondary">
                                <Link to="/panel/calendario">Volver al mes</Link>
                            </Button>
                        }
                    />
                )}

                {!bookings.isPending && !day && (
                    <p className="mt-3 text-sm text-ink-muted">
                        Elige una fecha en el calendario para ver su agenda.
                    </p>
                )}

                {dayBookings.length > 0 && (
                    <ul className="mt-4 divide-y divide-rule rounded-lg border border-rule bg-surface">
                        {dayBookings.map((booking) => (
                            <li
                                key={booking.id}
                                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3"
                            >
                                <span className="tabular w-16 font-medium text-ink">
                                    {formatTimeInZone(booking.starts_at, timeZone)}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm text-ink">
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

                <p className="mt-3 text-xs text-ink-muted">
                    {data.length} reservas cargadas este mes (máximo 300).
                </p>
            </section>
        </div>
    );
}
