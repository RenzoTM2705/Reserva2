import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
    return (
        <textarea
            className={cn(
                'min-h-24 w-full rounded-md border border-rule bg-surface px-3 py-2.5 text-sm text-ink',
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
