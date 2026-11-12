import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/features/auth/use-session';
import { useMembership } from '@/features/panel/use-membership';
import { createBusiness } from '@/lib/api';
import { env } from '@/lib/env';
import { isDemoMode } from '@/lib/demo';
import { rpcErrorCode, toUserMessage } from '@/lib/errors';
import { useDocumentTitle } from '@/lib/use-document-title';
import { zodResolver } from '@/lib/zod-resolver';
import { slugify as slugifyName } from '@/lib/utils';

const onboardingSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Escribe el nombre de tu negocio.')
        .max(120, 'El nombre es demasiado largo.'),
    slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, 'Mínimo 3 caracteres.')
        .max(60, 'Máximo 60 caracteres.')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa letras, números y guiones (sin guiones al inicio o final).'),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

/**
 * Alta del negocio para usuarios autenticados sin membresía.
 *
 * Vive fuera del shell del panel para evitar bucles de redirección: el panel
 * manda aquí cuando no hay negocio, y aquí solo se piden nombre y slug.
 * La creación real es la RPC `create_business` (valida el slug en la base).
 */
export function OnboardingPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { session, loading } = useSession();
    const membership = useMembership();
    useDocumentTitle('Crea tu negocio — Reserva2');

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<OnboardingForm>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: { name: '', slug: '' },
    });

    const create = useMutation({
        mutationFn: (form: OnboardingForm) =>
            createBusiness(form.name, form.slug),
        onSuccess: async () => {
            toast.success('¡Negocio creado! Ya puedes configurar tu agenda.');
            await queryClient.invalidateQueries({ queryKey: ['membership'] });
            navigate('/panel');
        },
        onError: (error) => {
            if (rpcErrorCode(error) === 'slug_taken') {
                toast.error(
                    'Esa dirección ya está en uso. Prueba con otro slug.',
                );
            } else {
                toast.error(toUserMessage(error));
            }
        },
    });

    if (loading || membership.isPending) {
        return (
            <main className="mx-auto w-full max-w-md space-y-4 px-5 py-16 sm:px-8">
                <Skeleton className="h-9 w-64 max-w-full" />
                <Skeleton className="h-56 w-full" />
            </main>
        );
    }

    if (!session) {
        return <Navigate to="/entrar" replace />;
    }

    if (membership.data && !isDemoMode) {
        // Con negocio ya creado, el panel es el destino correcto. En modo
        // maqueta se permite ver el onboarding directamente por URL.
        return <Navigate to="/panel" replace />;
    }

    if (membership.isError) {
        return (
            <main className="mx-auto max-w-xl px-5 py-16">
                <h1 className="font-display text-2xl text-ink">
                    No pudimos verificar tu cuenta
                </h1>
                <p className="mt-3 text-sm text-ink-soft">
                    {toUserMessage(membership.error)}
                </p>
                <Button className="mt-6" onClick={() => membership.refetch()}>
                    Reintentar
                </Button>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-md px-5 py-16 sm:px-8">
            <Link to="/" className="font-display text-lg text-ink">
                Reserva2<span className="text-accent">.</span>
            </Link>

            <h1 className="mt-8 font-display text-3xl text-ink">
                Crea tu negocio
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Estos dos datos son los que después podrás cambiar en
                Configuración. El slug define la dirección pública donde tus
                clientes reservarán.
            </p>

            <form
                noValidate
                onSubmit={handleSubmit(async (form) => {
                    await create.mutateAsync(form);
                })}
                className="mt-8 flex flex-col gap-5"
            >
                <Field label="Nombre del negocio" id="name" required error={errors.name?.message}>
                    <Input
                        autoComplete="organization"
                        placeholder="Ej. Barbería Don Lucho"
                        {...register('name', {
                            onChange: (event) => {
                                // Sugerencia automática de slug, siempre editable.
                                const suggestion = slugifyName(event.target.value);
                                setValue('slug', suggestion, {
                                    shouldValidate: false,
                                });
                            },
                        })}
                    />
                </Field>

                <Field
                    label="Dirección pública (slug)"
                    id="slug"
                    required
                    hint={`Tu página quedará en ${env.appUrl}/negocio/<slug>`}
                    error={errors.slug?.message}
                >
                    <Input
                        placeholder="barberia-don-lucho"
                        {...register('slug')}
                    />
                </Field>

                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando…' : 'Crear negocio'}
                </Button>
            </form>

            <p className="mt-6 text-sm text-ink-soft">
                <Link className="text-accent hover:underline" to="/entrar">
                    Usar otra cuenta
                </Link>
            </p>
        </main>
    );
}
