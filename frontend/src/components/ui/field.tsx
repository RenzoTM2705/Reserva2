import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FieldProps {
    label: string;
    /** `id` del control; se clona en el hijo junto con los atributos ARIA. */
    id?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
}

/**
 * Etiqueta + control + mensaje de error accesible.
 *
 * Clona el control hijo para inyectar `id`, `aria-invalid` y
 * `aria-describedby`, evitando repetir el cableado ARIA en cada formulario.
 */
export function Field({ label, id, error, hint, required, children }: FieldProps) {
    const describedBy =
        error && id
            ? `${id}-error`
            : hint && id
              ? `${id}-hint`
              : undefined;

    const control = Children.only(children);
    const wired = isValidElement(control)
        ? cloneElement(
              control as React.ReactElement<Record<string, unknown>>,
              {
                  id,
                  'aria-invalid': error ? true : undefined,
                  'aria-describedby': describedBy,
              },
          )
        : control;

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>
                {label}
                {required && (
                    <span aria-hidden="true" className="text-accent">
                        {' '}
                        *
                    </span>
                )}
            </Label>
            {wired}
            {hint && !error && (
                <p id={id ? `${id}-hint` : undefined} className="text-xs text-ink-muted">
                    {hint}
                </p>
            )}
            {error && (
                <p id={id ? `${id}-error` : undefined} role="alert" className="text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
