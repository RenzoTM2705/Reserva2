import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/auth';
import { toAuthMessage } from '@/lib/errors';
import { useDocumentTitle } from '@/lib/use-document-title';
import { zodResolver } from '@/lib/zod-resolver';

const loginSchema = z.object({
    email: z.string().trim().email('Revisa el correo electrónico.'),
    password: z.string().min(1, 'Escribe tu contraseña.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState<string | null>(null);
    useDocumentTitle('Iniciar sesión — Reserva2');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    return (
        <main className="mx-auto w-full max-w-sm px-5 py-16 sm:px-8">
            <h1 className="font-display text-3xl text-ink">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-ink-soft">
                Entra para administrar tu negocio.
            </p>

            <form
                noValidate
                onSubmit={handleSubmit(async (form) => {
                    setSubmitError(null);
                    try {
                        await signIn(form.email, form.password);
                        navigate('/panel');
                    } catch (error) {
                        setSubmitError(toAuthMessage(error));
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

                <Field label="Contraseña" id="password" required error={errors.password?.message}>
                    <Input
                        type="password"
                        autoComplete="current-password"
                        {...register('password')}
                    />
                </Field>

                {submitError && (
                    <p role="alert" className="rounded-md bg-cancelled-soft p-3 text-sm text-cancelled">
                        {submitError}
                    </p>
                )}

                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Entrando…' : 'Entrar'}
                </Button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-sm text-ink-soft">
                <Link className="hover:text-ink hover:underline" to="/recuperar">
                    ¿Olvidaste tu contraseña?
                </Link>
                <p>
                    ¿No tienes cuenta?{' '}
                    <Link className="text-accent hover:underline" to="/crear-cuenta">
                        Crear cuenta
                    </Link>
                </p>
            </div>
        </main>
    );
}
