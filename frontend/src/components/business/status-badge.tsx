import type { BookingStatus } from '@/lib/types';
import { BOOKING_STATUS_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const VARIANTS: Record<BookingStatus, 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'noshow'> = {
    pending: 'pending',
    confirmed: 'confirmed',
    completed: 'completed',
    cancelled: 'cancelled',
    no_show: 'noshow',
};

/**
 * Estado de reserva como texto + color: nunca solo color (docs/UX.md).
 */
export function StatusBadge({ status }: { status: BookingStatus }) {
    return <Badge variant={VARIANTS[status]}>{BOOKING_STATUS_LABELS[status]}</Badge>;
}
