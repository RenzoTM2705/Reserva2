import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn('rounded-lg border border-rule bg-surface', className)}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn('flex flex-col gap-1.5 p-6', className)}
            {...props}
        />
    );
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
    return (
        <h3
            className={cn('font-display text-xl leading-tight text-ink', className)}
            {...props}
        />
    );
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
    return (
        <p
            className={cn('text-sm leading-relaxed text-ink-soft', className)}
            {...props}
        />
    );
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn('px-6 pb-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn('flex items-center gap-3 border-t border-rule px-6 py-4', className)}
            {...props}
        />
    );
}
