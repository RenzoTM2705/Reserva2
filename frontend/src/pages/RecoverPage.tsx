import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { requestPasswordReset } from '@/lib/auth';
import { toAuthMessage } from '@/lib/errors';
import { useDocumentTitle } from '@/lib/use-document-title';
import { zodResolver } from '@/lib/zod-resolver';

const recoverSchema = z.object({
    email: z.string().trim().email('Revisa el correo electrónico.'),
});

type RecoverForm = z.infer<typeof recoverSchema>;

export function RecoverPage() {
    const [sent, setSent] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    useDocumentTitle('Recuperar contraseña — Reserva2');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RecoverForm>({
        resolver: zodResolver(recoverSchema),
        defaultValues: { email: '' },
    });

    if (sent) {
        return (
            <main className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-16 text-center sm:px-8">
                <h1 className="font-display text-2xl text-ink">
                    Revisa tu correo
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    Si la dirección está registrada, te enviamos un enlace para
                    restablecer la contraseña.
                </p>
                <Button asChild variant="secondary" className="mt-8">
                    <Link to="/entrar">Volver a iniciar sesión</Link>
                </Button>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-sm px-5 py-16 sm:px-8">
            <h1 className="font-display text-3xl text-ink">
                Recuperar contraseña
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
                Escribe tu correo y te enviaremos un enlace de restablecimiento.
            </p>

            <form
                noValidate
                onSubmit={handleSubmit(async (form) => {
                    setSubmitError(null);
                    try {
                        await requestPasswordReset(form.email);
                        setSent(true);
                    } catch (error) {
                        setSubmitError(toAuthMessage(error));
                        toast.error(toAuthMessage(error));
                    }
                })}
                className="mt-8 flex flex-col gap-5"
            >
                <Field label="Correo electrónico" id="email" required error={errors.email?.message}>
                    <Input
                        type="email"
                        autoComplete="email"
                        placeholder="tucorreo@ejemplo.com"
                        {...register('email')}
                    />
                </Field>

                {submitError && (
                    <p role="alert" className="rounded-md bg-cancelled-soft p-3 text-sm text-cancelled">
                        {submitError}
                    </p>
                )}

                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
                </Button>
            </form>

            <p className="mt-6 text-sm text-ink-soft">
                <Link className="text-accent hover:underline" to="/entrar">
                    Volver a iniciar sesión
                </Link>
            </p>
        </main>
    );
}
