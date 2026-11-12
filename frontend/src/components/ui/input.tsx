import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
    return (
        <input
            type={type}
            className={cn(
                'h-11 w-full rounded-md border border-rule bg-surface px-3 text-sm text-ink',
                'placeholder:text-ink-muted',
                'transition-colors hover:border-rule-strong',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'aria-[invalid=true]:border-danger',
                className,
            )}
            {...props}
        />
    );
}
