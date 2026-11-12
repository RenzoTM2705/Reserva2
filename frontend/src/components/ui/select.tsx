import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * `<select>` nativo con la estética del sistema.
 *
 * Los docs/UX.md reservan Radix Select para casos complejos; en formularios
 * simples el control nativo es más ligero y accesible por defecto.
 */
export function Select({ className, children, ...props }: ComponentProps<'select'>) {
    return (
        <div className="relative">
            <select
                className={cn(
                    'h-11 w-full appearance-none rounded-md border border-rule bg-surface pl-3 pr-9 text-sm text-ink',
                    'transition-colors hover:border-rule-strong',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'aria-[invalid=true]:border-danger',
                    className,
                )}
                {...props}
            >
                {children}
            </select>
            <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            />
        </div>
    );
}
