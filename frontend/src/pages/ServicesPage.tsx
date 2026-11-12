import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Pencil, Plus, Scissors, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useMembership } from '@/features/panel/use-membership';
import { deleteService, listServices, upsertService } from '@/lib/api';
import type { Service } from '@/lib/types';
import { toUserMessage } from '@/lib/errors';
import { formatDuration, formatMoney } from '@/lib/format';
import { useDocumentTitle } from '@/lib/use-document-title';
import { zodResolver } from '@/lib/zod-resolver';

const serviceSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Escribe el nombre del servicio.')
        .max(80, 'El nombre es demasiado largo.'),
    description: z
        .string()
        .trim()
        .max(300, 'Máximo 300 caracteres.')
        .optional()
        .or(z.literal('')),
    durationMinutes: z.coerce
        .number()
        .int('Usa minutos completos.')
        .min(5, 'Mínimo 5 minutos.')
        .max(600, 'Máximo 10 horas.'),
    price: z.coerce
        .number()
        .min(0, 'El precio no puede ser negativo.')
        .max(100_000, 'El precio es demasiado alto.'),
    bufferMinutes: z.coerce
        .number()
        .int('Usa minutos completos.')
        .min(0, 'No puede ser negativo.')
        .max(120, 'Máximo 120 minutos.'),
    isActive: z.boolean(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

/**
 * CRUD del catálogo de servicios.
 *
 * El precio se captura en unidades y se convierte a céntimos: el dinero
 * nunca se maneja como float en la base.
 */
export function ServicesPage() {
    const membership = useMembership();
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState<Service | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState<Service | null>(null);
    useDocumentTitle('Servicios — Panel');

    const business = membership.data?.business;
    const services = useQuery({
        queryKey: ['services', business?.id],
        queryFn: () => listServices(business!.id),
        enabled: Boolean(business),
    });

    const save = useMutation({
        mutationFn: (input: { form: ServiceForm; id?: string }) =>
            upsertService(
                business!.id,
                {
                    name: input.form.name,
                    description: input.form.description || null,
                    duration_minutes: input.form.durationMinutes,
                    price_cents: Math.round(input.form.price * 100),
                    buffer_minutes: input.form.bufferMinutes,
                    is_active: input.form.isActive,
                },
                input.id,
            ),
        onSuccess: async () => {
            toast.success('Servicio guardado.');
            setDialogOpen(false);
            setEditing(null);
            await queryClient.invalidateQueries({ queryKey: ['services'] });
            await queryClient.invalidateQueries({ queryKey: ['public-services'] });
        },
        onError: (error) => toast.error(toUserMessage(error)),
    });

    const remove = useMutation({
        mutationFn: (id: string) => deleteService(id),
        onSuccess: async () => {
            toast.success('Servicio eliminado.');
            setDeleting(null);
            await queryClient.invalidateQueries({ queryKey: ['services'] });
        },
        onError: (error) => toast.error(toUserMessage(error)),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ServiceForm>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: '',
            description: '',
            durationMinutes: 30,
            price: 0,
            bufferMinutes: 0,
            isActive: true,
        },
    });

    function openCreate() {
        setEditing(null);
        reset({
            name: '',
            description: '',
            durationMinutes: 30,
            price: 0,
            bufferMinutes: 0,
            isActive: true,
        });
        setDialogOpen(true);
    }

    function openEdit(service: Service) {
        setEditing(service);
        reset({
            name: service.name,
            description: service.description ?? '',
            durationMinutes: service.duration_minutes,
            price: service.price_cents / 100,
            bufferMinutes: service.buffer_minutes,
            isActive: service.is_active,
        });
        setDialogOpen(true);
    }

    if (services.isPending) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    return (
        <div>
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl text-ink">Servicios</h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Lo que tus clientes pueden reservar.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus aria-hidden="true" />
                    Nuevo servicio
                </Button>
            </header>

            <section aria-label="Catálogo de servicios" className="mt-8">
                {services.isError ? (
                    <p className="text-sm text-danger" role="alert">
                        {toUserMessage(services.error)}
                    </p>
                ) : (services.data ?? []).length === 0 ? (
                    <EmptyState
                        icon={Scissors}
                        title="Aún no tienes servicios"
                        body="Crea tu primer servicio: define duración, precio y margen entre citas."
                        action={
                            <Button onClick={openCreate}>
                                <Plus aria-hidden="true" />
                                Nuevo servicio
                            </Button>
                        }
                    />
                ) : (
                    <ul className="divide-y divide-rule rounded-lg border border-rule bg-surface">
                        {(services.data ?? []).map((service) => (
                            <li
                                key={service.id}
                                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                                        {service.name}
                                        {service.is_active ? (
                                            <Badge variant="confirmed">Activo</Badge>
                                        ) : (
                                            <Badge variant="neutral">Oculto</Badge>
                                        )}
                                    </p>
                                    {service.description && (
                                        <p className="mt-0.5 truncate text-xs text-ink-muted">
                                            {service.description}
                                        </p>
                                    )}
                                </div>
                                <p className="tabular text-sm text-ink-soft">
                                    {formatDuration(service.duration_minutes)}
                                    {service.buffer_minutes > 0 &&
                                        ` + ${formatDuration(service.buffer_minutes)} de margen`}
                                </p>
                                <p className="tabular w-28 text-right font-medium text-ink">
                                    {formatMoney(
                                        service.price_cents,
                                        business?.currency,
                                    )}
                                </p>
                                <div className="flex gap-1.5">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openEdit(service)}
                                    >
                                        <Pencil aria-hidden="true" />
                                        <span className="sr-only sm:not-sr-only">Editar</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-danger"
                                        onClick={() => setDeleting(service)}
                                    >
                                        <Trash2 aria-hidden="true" />
                                        <span className="sr-only sm:not-sr-only">Eliminar</span>
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setEditing(null);
                }}
                title={editing ? 'Editar servicio' : 'Nuevo servicio'}
            >
                <form
                    noValidate
                    onSubmit={handleSubmit(async (form) => {
                        await save.mutateAsync({ form, id: editing?.id });
                    })}
                    className="flex flex-col gap-4"
                >
                    <Field label="Nombre" id="s-name" required error={errors.name?.message}>
                        <Input
                            id="s-name"
                            placeholder="Ej. Corte de cabello"
                            {...register('name')}
                        />
                    </Field>

                    <Field
                        label="Descripción (opcional)"
                        id="s-description"
                        error={errors.description?.message}
                    >
                        <Textarea id="s-description" {...register('description')} />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field
                            label="Duración (min)"
                            id="s-duration"
                            required
                            error={errors.durationMinutes?.message}
                        >
                            <Input id="s-duration" type="number" min={5} step={5} {...register('durationMinutes')} />
                        </Field>
                        <Field
                            label={`Precio (${business?.currency ?? ''})`}
                            id="s-price"
                            required
                            error={errors.price?.message}
                        >
                            <Input id="s-price" type="number" min={0} step="0.10" {...register('price')} />
                        </Field>
                        <Field
                            label="Margen (min)"
                            id="s-buffer"
                            hint="Descanso tras cada cita."
                            error={errors.bufferMinutes?.message}
                        >
                            <Input id="s-buffer" type="number" min={0} step={5} {...register('bufferMinutes')} />
                        </Field>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input
                            type="checkbox"
                            className="size-4 accent-[var(--color-accent)]"
                            {...register('isActive')}
                        />
                        Visible en la página pública
                    </label>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setDialogOpen(false);
                                setEditing(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={save.isPending}>
                            {save.isPending ? 'Guardando…' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </Dialog>

            <Dialog
                open={deleting !== null}
                onClose={() => setDeleting(null)}
                title="Eliminar servicio"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm leading-relaxed text-ink-soft">
                        «{deleting?.name}» desaparecerá del catálogo. Las citas
                        ya registradas no se borran.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setDeleting(null)}>
                            Volver
                        </Button>
                        <Button
                            variant="danger"
                            disabled={remove.isPending}
                            onClick={() => {
                                if (deleting) remove.mutate(deleting.id);
                            }}
                        >
                            {remove.isPending ? 'Eliminando…' : 'Eliminar'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
