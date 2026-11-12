import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
    {
        variants: {
            variant: {
                neutral: 'bg-sunken text-ink-soft',
                accent: 'bg-accent-soft text-accent-ink',
                pending: 'bg-pending-soft text-pending',
                confirmed: 'bg-confirmed-soft text-confirmed',
                completed: 'bg-completed-soft text-completed',
                cancelled: 'bg-cancelled-soft text-cancelled',
                noshow: 'bg-noshow-soft text-noshow',
            },
        },
        defaultVariants: {
            variant: 'neutral',
        },
    },
);

interface BadgeProps
    extends ComponentProps<'span'>,
        VariantProps<typeof badgeVariants> {}

/**
 * Etiqueta de estado. El color nunca es la única señal: el texto siempre
 * acompaña al color (ver docs/UX.md).
 */
export function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}
