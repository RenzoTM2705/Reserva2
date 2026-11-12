import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * Resolvedor mínimo entre Zod y react-hook-form.
 *
 * Evita la dependencia `@hookform/resolvers`: solo mapeamos los `issues` de
 * Zod al formato `errors` que espera react-hook-form.
 */
export function zodResolver<T extends FieldValues>(
    schema: ZodType<T>,
): Resolver<T> {
    return async (values) => {
        const result = schema.safeParse(values);

        if (result.success) {
            return { values: result.data, errors: {} };
        }

        const errors: Record<string, { type: string; message: string }> = {};

        for (const issue of result.error.issues) {
            const key = issue.path.join('.') || 'root';
            // Primera incidencia por campo: suficiente para la UI.
            errors[key] ??= { type: issue.code, message: issue.message };
        }

        return {
            values: {},
            errors: errors as FieldErrors<T>,
        };
    };
}
