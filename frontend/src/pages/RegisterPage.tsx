import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/auth';
import { toAuthMessage } from '@/lib/errors';
import { useDocumentTitle } from '@/lib/use-document-title';
import { zodResolver } from '@/lib/zod-resolver';

const registerSchema = z
    .object({
        email: z.string().trim().email('Revisa el correo electrónico.'),
        password: z
            .string()
            .min(8, 'Usa al menos 8 caracteres.')
            .max(72, 'La contraseña es demasiado larga.'),
        confirmPassword: z.string(),
    })
    .refine((form) => form.password === form.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden.',
    });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [needsConfirmation, setNeedsConfirmation] = useState(false);
    useDocumentTitle('Crear cuenta — Reserva2');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: '', password: '', confirmPassword: '' },
    });

    if (needsConfirmation) {
        return (
            <main className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-16 text-center sm:px-8">
                <MailCheck aria-hidden="true" className="size-10 text-accent" strokeWidth={1.5} />
                <h1 className="mt-4 font-display text-2xl text-ink">
                    Revisa tu correo
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    Te enviamos un enlace de verificación. Confírmalo y vuelve
                    aquí para iniciar sesión.
                </p>
                <Button asChild className="mt-8">
                    <Link to="/entrar">Ir a iniciar sesión</Link>
                </Button>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-sm px-5 py-16 sm:px-8">
            <h1 className="font-display text-3xl text-ink">Crear cuenta</h1>
            <p className="mt-2 text-sm text-ink-soft">
                Solo necesitas un correo. Después configurarás tu negocio.
            </p>

            <form
                noValidate
                onSubmit={handleSubmit(async (form) => {
                    setSubmitError(null);
                    try {
                        const result = await signUp(form.email, form.password);

                        if (result.needsEmailConfirmation) {
                            setNeedsConfirmation(true);
                        } else {
                            navigate('/panel/onboarding');
                        }
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

                <Field
                    label="Contraseña"
                    id="password"
                    required
                    hint="Mínimo 8 caracteres."
                    error={errors.password?.message}
                >
                    <Input
                        type="password"
                        autoComplete="new-password"
                        {...register('password')}
                    />
                </Field>

                <Field
                    label="Repite la contraseña"
                    id="confirmPassword"
                    required
                    error={errors.confirmPassword?.message}
                >
                    <Input
                        type="password"
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                    />
                </Field>

                {submitError && (
                    <p role="alert" className="rounded-md bg-cancelled-soft p-3 text-sm text-cancelled">
                        {submitError}
                    </p>
                )}

                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando…' : 'Crear cuenta'}
                </Button>
            </form>

            <p className="mt-6 text-sm text-ink-soft">
                ¿Ya tienes cuenta?{' '}
                <Link className="text-accent hover:underline" to="/entrar">
                    Iniciar sesión
                </Link>
            </p>
        </main>
    );
}
