import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMembership } from '@/features/panel/use-membership';
import {
    deleteProfessional,
    listProfessionalServices,
    listProfessionals,
    listServices,
    setProfessionalServices,
    upsertProfessional,
} from '@/lib/api';
import type { Professional } from '@/lib/types';
import { toUserMessage } from '@/lib/errors';
import { useDocumentTitle } from '@/lib/use-document-title';
import { zodResolver } from '@/lib/zod-resolver';

const staffSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, 'Escribe el nombre.')
        .max(120, 'El nombre es demasiado largo.'),
    color: z
        .string()
        .regex(/^#[0-9a-f]{6}$/i, 'Usa un color hexadecimal (#rrggbb).'),
    isActive: z.boolean(),
});

type StaffForm = z.infer<typeof staffSchema>;

/**
 * CRUD del equipo y su asignación de servicios.
 *
 * La asignación se guarda como una sola operación de reemplazo
 * (`setProfessionalServices`): borrar e insertar en la misma acción.
 */
export function StaffPage() {
    const membership = useMembership();
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState<Professional | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState<Professional | null>(null);
    const [assigning, setAssigning] = useState<Professional | null>(null);
    useDocumentTitle('Profesionales — Panel');

    const business = membership.data?.business;
    const professionals = useQuery({
        queryKey: ['professionals', business?.id],
        queryFn: () => listProfessionals(business!.id),
        enabled: Boolean(business),
    });
    const services = useQuery({
        queryKey: ['services', business?.id],
        queryFn: () => listServices(business!.id),
        enabled: Boolean(business),
    });
    const assignments = useQuery({
        queryKey: ['professional-services', business?.id],
        queryFn: () => listProfessionalServices(business!.id),
        enabled: Boolean(business),
    });

    const save = useMutation({
        mutationFn: (input: { form: StaffForm; id?: string }) =>
            upsertProfessional(
                business!.id,
                {
                    full_name: input.form.fullName,
                    color: input.form.color,
                    is_active: input.form.isActive,
                },
                input.id,
            ),
        onSuccess: async () => {
            toast.success('Profesional guardado.');
            setDialogOpen(false);
            setEditing(null);
            await queryClient.invalidateQueries({
                queryKey: ['professionals'],
            });
        },
        onError: (error) => toast.error(toUserMessage(error)),
    });

    const saveAssignments = useMutation({
        mutationFn: (input: { professionalId: string; serviceIds: string[] }) =>
            setProfessionalServices(input.professionalId, input.serviceIds),
        onSuccess: async () => {
            toast.success('Servicios actualizados.');
            setAssigning(null);
            await queryClient.invalidateQueries({
                queryKey: ['professional-services'],
            });
        },
        onError: (error) => toast.error(toUserMessage(error)),
    });

    const remove = useMutation({
        mutationFn: (id: string) => deleteProfessional(id),
        onSuccess: async () => {
            toast.success('Profesional eliminado.');
            setDeleting(null);
            await queryClient.invalidateQueries({
                queryKey: ['professionals'],
            });
        },
        onError: (error) => toast.error(toUserMessage(error)),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<StaffForm>({
        resolver: zodResolver(staffSchema),
        defaultValues: { fullName: '', color: '#B4552D', isActive: true },
    });

    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    function openCreate() {
        setEditing(null);
        reset({ fullName: '', color: '#B4552D', isActive: true });
        setDialogOpen(true);
    }

    function openEdit(professional: Professional) {
        setEditing(professional);
        reset({
            fullName: professional.full_name,
            color: professional.color ?? '#B4552D',
            isActive: professional.is_active,
        });
        setDialogOpen(true);
    }

    function openAssign(professional: Professional) {
        setAssigning(professional);
        setSelectedServices(
            (assignments.data ?? [])
                .filter((row) => row.professional_id === professional.id)
                .map((row) => row.service_id),
        );
    }

    if (professionals.isPending) {
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
                    <h1 className="font-display text-3xl text-ink">Profesionales</h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Tu equipo y qué servicios puede atender.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus aria-hidden="true" />
                    Nuevo profesional
                </Button>
            </header>

            <section aria-label="Equipo" className="mt-8">
                {professionals.isError ? (
                    <p className="text-sm text-danger" role="alert">
                        {toUserMessage(professionals.error)}
                    </p>
                ) : (professionals.data ?? []).length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="Sin profesionales"
                        body="Si trabajas solo, date de alta igualmente: así tu agenda puede calcular huecos por persona."
                        action={
                            <Button onClick={openCreate}>
                                <Plus aria-hidden="true" />
                                Nuevo profesional
                            </Button>
                        }
                    />
                ) : (
                    <ul className="divide-y divide-rule rounded-lg border border-rule bg-surface">
                        {(professionals.data ?? []).map((professional) => {
                            const assigned = (assignments.data ?? []).filter(
                                (row) => row.professional_id === professional.id,
                            ).length;

                            return (
                                <li
                                    key={professional.id}
                                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <span
                                            aria-hidden="true"
                                            className="size-3.5 shrink-0 rounded-full border border-rule"
                                            style={{
                                                backgroundColor:
                                                    professional.color ?? 'transparent',
                                            }}
                                        />
                                        <div className="min-w-0">
                                            <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                                                {professional.full_name}
                                                {professional.is_active ? (
                                                    <Badge variant="confirmed">Activo</Badge>
                                                ) : (
                                                    <Badge variant="neutral">Inactivo</Badge>
                                                )}
                                            </p>
                                            <p className="mt-0.5 text-xs text-ink-muted">
                                                {assigned === 0
                                                    ? 'Sin servicios asignados'
                                                    : `${assigned} ${assigned === 1 ? 'servicio' : 'servicios'}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => openAssign(professional)}
                                        >
                                            Asignar servicios
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEdit(professional)}
                                        >
                                            <Pencil aria-hidden="true" />
                                            <span className="sr-only sm:not-sr-only">Editar</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-danger"
                                            onClick={() => setDeleting(professional)}
                                        >
                                            <Trash2 aria-hidden="true" />
                                            <span className="sr-only sm:not-sr-only">Eliminar</span>
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setEditing(null);
                }}
                title={editing ? 'Editar profesional' : 'Nuevo profesional'}
            >
                <form
                    noValidate
                    onSubmit={handleSubmit(async (form) => {
                        await save.mutateAsync({ form, id: editing?.id });
                    })}
                    className="flex flex-col gap-4"
                >
                    <Field
                        label="Nombre completo"
                        id="p-name"
                        required
                        error={errors.fullName?.message}
                    >
                        <Input id="p-name" placeholder="Ej. Lucía Ramos" {...register('fullName')} />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Color en el calendario"
                            id="p-color"
                            hint="Distingue sus citas a simple vista."
                            error={errors.color?.message}
                        >
                            <input
                                id="p-color"
                                type="color"
                                className="h-11 w-full rounded-md border border-rule bg-surface p-1"
                                {...register('color')}
                            />
                        </Field>
                        <label className="flex items-end gap-2 pb-2 text-sm text-ink">
                            <input
                                type="checkbox"
                                className="size-4 accent-[var(--color-accent)]"
                                {...register('isActive')}
                            />
                            Activo para reservar
                        </label>
                    </div>

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
                open={assigning !== null}
                onClose={() => setAssigning(null)}
                title={`Servicios de ${assigning?.full_name ?? ''}`}
            >
                {services.isPending ? (
                    <Skeleton className="h-32 w-full" />
                ) : (services.data ?? []).length === 0 ? (
                    <p className="text-sm text-ink-soft">
                        Primero crea servicios en la sección Servicios.
                    </p>
                ) : (
                    <form
                        onSubmit={async (event) => {
                            event.preventDefault();
                            if (!assigning) return;
                            await saveAssignments.mutateAsync({
                                professionalId: assigning.id,
                                serviceIds: selectedServices,
                            });
                        }}
                        className="flex flex-col gap-4"
                    >
                        <fieldset className="flex flex-col gap-2">
                            <legend className="sr-only">
                                Servicios que puede atender
                            </legend>
                            {(services.data ?? []).map((service) => (
                                <label
                                    key={service.id}
                                    className="flex items-center gap-2.5 rounded-md border border-rule px-3 py-2.5 text-sm text-ink"
                                >
                                    <input
                                        type="checkbox"
                                        className="size-4 accent-[var(--color-accent)]"
                                        checked={selectedServices.includes(service.id)}
                                        onChange={(event) =>
                                            setSelectedServices((current) =>
                                                event.target.checked
                                                    ? [...current, service.id]
                                                    : current.filter((id) => id !== service.id),
                                            )
                                        }
                                    />
                                    {service.name}
                                </label>
                            ))}
                        </fieldset>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setAssigning(null)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saveAssignments.isPending}>
                                {saveAssignments.isPending ? 'Guardando…' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                )}
            </Dialog>

            <Dialog
                open={deleting !== null}
                onClose={() => setDeleting(null)}
                title="Eliminar profesional"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm leading-relaxed text-ink-soft">
                        «{deleting?.full_name}» dejará de aparecer en el equipo.
                        Sus citas ya registradas se conservan.
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
