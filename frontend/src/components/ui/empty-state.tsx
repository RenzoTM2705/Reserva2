import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    body: string;
    action?: ReactNode;
    className?: string;
}

/**
 * Estado vacío: icono lineal, título en serif, una frase y una acción.
 * Ver docs/UX.md §6.
 */
export function EmptyState({ icon: Icon, title, body, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-3 rounded-lg border border-dashed border-rule px-6 py-12 text-center',
                className,
            )}
        >
            {Icon && <Icon aria-hidden="true" className="size-8 text-ink-muted" strokeWidth={1.5} />}
            <h3 className="font-display text-xl text-ink">{title}</h3>
            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">{body}</p>
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
