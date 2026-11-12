import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useBusiness,
    useBusinessHours,
    usePublicServices,
} from '@/features/public/use-business';
import { WEEKDAY_LABELS, WEEKDAYS_ORDER } from '@/lib/dates';
import { formatDuration, formatMoney } from '@/lib/format';
import { useDocumentTitle } from '@/lib/use-document-title';
import { toUserMessage } from '@/lib/errors';

/**
 * Página pública del negocio: presentación, horario y catálogo de servicios
 * con llamada a la acción hacia el asistente de reserva.
 */
export function BusinessPage() {
    const { slug = '' } = useParams();
    const business = useBusiness(slug);
    const hours = useBusinessHours(business.data?.id);
    const services = usePublicServices(business.data?.id);

    const name = business.data?.name ?? 'Negocio';
    useDocumentTitle(`${name} — Reserva2`);

    if (business.isPending) {
        return (
            <main className="mx-auto w-full max-w-4xl space-y-4 px-5 py-10 sm:px-8">
                <Skeleton className="h-10 w-72 max-w-full" />
                <Skeleton className="h-4 w-96 max-w-full" />
                <div className="grid gap-4 pt-6 sm:grid-cols-2">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            </main>
        );
    }

    if (business.isError) {
        return (
            <main className="mx-auto max-w-xl px-5 py-16">
                <EmptyState
                    title="No pudimos cargar esta página"
                    body={toUserMessage(business.error)}
                    action={
                        <Button asChild>
                            <Link to="/">Volver al inicio</Link>
                        </Button>
                    }
                />
            </main>
        );
    }

    if (!business.data) {
        return (
            <main className="mx-auto max-w-xl px-5 py-16">
                <EmptyState
                    title="Este negocio no está disponible"
                    body="Puede que la dirección sea incorrecta o que el negocio haya dejado de publicar su página."
                    action={
                        <Button asChild>
                            <Link to="/">Volver al inicio</Link>
                        </Button>
                    }
                />
            </main>
        );
    }

    const data = business.data;
    const closedDays = new Set(
        (hours.data ?? []).filter((row) => row.is_closed).map((row) => row.weekday),
    );
    const opensAt = (weekday: number) =>
        hours.data?.find((row) => row.weekday === weekday);

    return (
        <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
            <header className="max-w-2xl">
                <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
                    {data.name}
                </h1>
                {data.description && (
                    <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                        {data.description}
                    </p>
                )}

                <ul className="mt-6 flex flex-col gap-1.5 text-sm text-ink-soft">
                    {data.address && (
                        <li className="flex items-center gap-2">
                            <MapPin aria-hidden="true" className="size-4 text-accent" />
                            {data.address}
                        </li>
                    )}
                    {data.phone && (
                        <li className="flex items-center gap-2">
                            <Phone aria-hidden="true" className="size-4 text-accent" />
                            <a className="hover:underline" href={`tel:${data.phone}`}>
                                {data.phone}
                            </a>
                        </li>
                    )}
                </ul>

                <Button asChild size="lg" className="mt-8">
                    <Link to={`/negocio/${data.slug}/reservar`}>
                        Reservar una cita
                        <ArrowRight aria-hidden="true" />
                    </Link>
                </Button>
            </header>

            <section aria-labelledby="horario" className="mt-14">
                <h2 id="horario" className="font-display text-2xl text-ink">
                    Horario
                </h2>
                {hours.isPending ? (
                    <Skeleton className="mt-4 h-40 w-full max-w-md" />
                ) : hours.data && hours.data.length > 0 ? (
                    <ul className="mt-4 max-w-md divide-y divide-rule border-y border-rule">
                        {WEEKDAYS_ORDER.map((weekday) => {
                            const row = opensAt(weekday);
                            const closed = closedDays.has(weekday);

                            return (
                                <li
                                    key={weekday}
                                    className="flex items-center justify-between gap-4 py-2.5 text-sm"
                                >
                                    <span className="font-medium text-ink">
                                        {WEEKDAY_LABELS[weekday]}
                                    </span>
                                    <span className="tabular text-ink-soft">
                                        {closed || !row?.opens_at
                                            ? 'Cerrado'
                                            : `${row.opens_at} – ${row.closes_at ?? ''}`}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="mt-4 text-sm text-ink-muted">
                        El negocio aún no publica su horario.
                    </p>
                )}
            </section>

            <section aria-labelledby="servicios" className="mt-14">
                <h2 id="servicios" className="font-display text-2xl text-ink">
                    Servicios
                </h2>

                {services.isPending ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : services.isError ? (
                    <p className="mt-4 text-sm text-danger" role="alert">
                        {toUserMessage(services.error)}
                    </p>
                ) : services.data.length === 0 ? (
                    <p className="mt-4 text-sm text-ink-muted">
                        Todavía no hay servicios publicados.
                    </p>
                ) : (
                    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                        {services.data.map((service) => (
                            <li
                                key={service.id}
                                className="rounded-lg border border-rule bg-surface p-5"
                            >
                                <div className="flex items-baseline justify-between gap-3">
                                    <h3 className="font-display text-lg text-ink">
                                        {service.name}
                                    </h3>
                                    <span className="tabular font-medium text-accent-ink">
                                        {formatMoney(service.price_cents, data.currency)}
                                    </span>
                                </div>
                                {service.description && (
                                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                                        {service.description}
                                    </p>
                                )}
                                <p className="tabular mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
                                    <Clock aria-hidden="true" className="size-3.5" />
                                    {formatDuration(service.duration_minutes)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
