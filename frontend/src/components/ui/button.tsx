import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                primary: 'bg-accent text-paper hover:bg-accent-hover',
                secondary: 'border border-ink bg-transparent text-ink hover:bg-sunken',
                ghost: 'text-ink hover:bg-sunken',
                danger: 'bg-danger text-paper hover:opacity-90',
                link: 'text-accent underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-9 px-3 text-sm',
                md: 'h-11 px-5 text-sm',
                lg: 'h-12 px-6 text-base',
                icon: 'size-11',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);

interface ButtonProps
    extends ComponentProps<'button'>,
        VariantProps<typeof buttonVariants> {
    /** Renderiza el hijo como único elemento, útil para envolver un `Link`. */
    asChild?: boolean;
}

export function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: ButtonProps) {
    const Component = asChild ? Slot : 'button';

    return (
        <Component
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        />
    );
}
