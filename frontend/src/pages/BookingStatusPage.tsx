import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarClock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/business/status-badge';
import { cancelBookingByToken, getBookingStatus } from '@/lib/api';
import { toUserMessage } from '@/lib/errors';
import { formatDateTimeInZone, formatMoney } from '@/lib/format';
import { useDocumentTitle } from '@/lib/use-document-title';

/**
 * Consulta pública de una reserva mediante su `confirmation_token`.
 *
 * Es el enlace que recibe el cliente por correo: muestra el estado y permite
 * cancelar. No expone datos personales adicionales del cliente.
 */
export function BookingStatusPage() {
    const { token = '' } = useParams();
    const queryClient = useQueryClient();
    const [cancelOpen, setCancelOpen] = useState(false);
    const [reason, setReason] = useState('');

    const status = useQuery({
        queryKey: ['booking-status', token],
        queryFn: () => getBookingStatus(token),
        enabled: token.length > 0,
        retry: false,
    });

    const cancel = useMutation({
        mutationFn: () => cancelBookingByToken(token, reason.trim() || null),
        onSuccess: async () => {
            setCancelOpen(false);
            setReason('');
            toast.success('Tu reserva fue cancelada.');
            await queryClient.invalidateQueries({
                queryKey: ['booking-status', token],
            });
        },
        onError: (error) => toast.error(toUserMessage(error)),
    });

    useDocumentTitle('Tu reserva — Reserva2');

    if (status.isPending) {
        return (
            <main className="mx-auto w-full max-w-lg space-y-4 px-5 py-12 sm:px-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-56 w-full" />
            </main>
        );
    }

    if (status.isError) {
        return (
            <main className="mx-auto max-w-xl px-5 py-16">
                <EmptyState
                    icon={XCircle}
                    title="No encontramos esta reserva"
                    body="El enlace puede haber cambiado o la reserva ya no existe."
                />
            </main>
        );
    }

    const info = status.data;
    const cancellable = info.status === 'pending' || info.status === 'confirmed';
    const cancelled = info.status === 'cancelled';

    return (
        <main className="mx-auto w-full max-w-lg px-5 py-12 sm:px-8">
            <header className="text-center">
                <p className="text-sm text-ink-muted">Tu reserva en</p>
                <h1 className="mt-1 font-display text-3xl text-ink">
                    {info.business_name}
                </h1>
                <div className="mt-4 flex justify-center">
                    <StatusBadge status={info.status} />
                </div>
            </header>

            <dl className="mt-8 divide-y divide-rule rounded-lg border border-rule bg-surface px-6">
                <Row
                    label="Fecha y hora"
                    value={
                        formatDateTimeInZone(
                            info.starts_at,
                            info.business_timezone,
                        ) ?? '—'
                    }
                />
                <Row label="Servicio" value={info.service_name} />
                <Row label="Profesional" value={info.professional_name} />
                <Row
                    label="Precio"
                    value={formatMoney(info.price_cents, info.currency)}
                />
                <Row
                    label="Duración"
                    value={`${durationMinutes(info.starts_at, info.ends_at)} min`}
                />
            </dl>

            {cancelled && (
                <p className="mt-6 rounded-md bg-cancelled-soft p-4 text-center text-sm text-cancelled">
                    Esta reserva fue cancelada.
                </p>
            )}

            {cancellable && (
                <div className="mt-8 text-center">
                    <Button
                        variant="secondary"
                        onClick={() => setCancelOpen(true)}
                    >
                        <XCircle aria-hidden="true" />
                        Cancelar reserva
                    </Button>
                    {info.cancellation_policy_hours > 0 && (
                        <p className="mt-3 text-xs text-ink-muted">
                            Puedes cancelar hasta{' '}
                            {info.cancellation_policy_hours} h antes de la cita.
                        </p>
                    )}
                </div>
            )}

            <Dialog
                open={cancelOpen}
                onClose={() => setCancelOpen(false)}
                title="Cancelar reserva"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm leading-relaxed text-ink-soft">
                        Se liberará el horario. Esta acción no se puede deshacer.
                    </p>
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
                        Motivo (opcional)
                        <Textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            maxLength={300}
                            placeholder="Cuéntanos brevemente por qué cancelas"
                        />
                    </label>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setCancelOpen(false)}
                        >
                            Volver
                        </Button>
                        <Button
                            variant="danger"
                            disabled={cancel.isPending}
                            onClick={() => cancel.mutate()}
                        >
                            {cancel.isPending ? 'Cancelando…' : 'Confirmar cancelación'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            <p className="mt-10 flex items-center justify-center gap-2 text-xs text-ink-muted">
                <CalendarClock aria-hidden="true" className="size-3.5" />
                Guarda este enlace para volver a consultar tu reserva.
            </p>
        </main>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="text-right font-medium text-ink">{value}</dd>
        </div>
    );
}

function durationMinutes(startsAt: string, endsAt: string): number {
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) return 0;

    return Math.max(0, Math.round((end - start) / 60_000));
}
