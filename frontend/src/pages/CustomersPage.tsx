import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMembership } from '@/features/panel/use-membership';
import { listCustomers } from '@/lib/api';
import { toUserMessage } from '@/lib/errors';
import { useDocumentTitle } from '@/lib/use-document-title';

/**
 * Directorio de clientes, solo lectura en esta fase.
 *
 * El buscador filtra en cliente sobre las primeras 500 fichas; el filtro
 * vive en la URL (`?q=`) para compartir resultados.
 */
export function CustomersPage() {
    const membership = useMembership();
    const [params, setParams] = useSearchParams();
    useDocumentTitle('Clientes — Panel');

    const business = membership.data?.business;
    const query = params.get('q') ?? '';

    const customers = useQuery({
        queryKey: ['customers', business?.id],
        queryFn: () => listCustomers(business!.id),
        enabled: Boolean(business),
    });

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const data = customers.data ?? [];

        if (!needle) return data;

        return data.filter((customer) =>
            [customer.full_name, customer.email, customer.phone ?? '']
                .join(' ')
                .toLowerCase()
                .includes(needle),
        );
    }, [customers.data, query]);

    function setQuery(value: string) {
        const next = new URLSearchParams(params);
        if (value.trim()) next.set('q', value.trim());
        else next.delete('q');
        setParams(next, { replace: true });
    }

    return (
        <div>
            <header>
                <h1 className="font-display text-3xl text-ink">Clientes</h1>
                <p className="mt-1 text-sm text-ink-soft">
                    Se crean automáticamente al recibir su primera reserva.
                </p>
            </header>

            <form
                role="search"
                className="mt-6 max-w-md"
                onSubmit={(event) => event.preventDefault()}
            >
                <label className="relative block">
                    <span className="sr-only">Buscar cliente</span>
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
                    />
                    <Input
                        type="search"
                        value={query}
                        placeholder="Nombre, correo o teléfono"
                        className="pl-9"
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </label>
            </form>

            <section aria-label="Listado de clientes" className="mt-6">
                {customers.isPending ? (
                    <div className="space-y-3">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                ) : customers.isError ? (
                    <p className="text-sm text-danger" role="alert">
                        {toUserMessage(customers.error)}
                    </p>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title={query ? 'Sin coincidencias' : 'Todavía no tienes clientes'}
                        body={
                            query
                                ? 'Prueba con otro nombre, correo o teléfono.'
                                : 'Cuando recibas tu primera reserva, el cliente aparecerá aquí.'
                        }
                        action={
                            query ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => setQuery('')}
                                >
                                    Limpiar búsqueda
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <ul className="divide-y divide-rule rounded-lg border border-rule bg-surface">
                            {filtered.map((customer) => (
                                <li
                                    key={customer.id}
                                    className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-ink">
                                            {customer.full_name}
                                        </p>
                                        <p className="truncate text-xs text-ink-muted">
                                            {customer.email}
                                            {customer.phone ? ` · ${customer.phone}` : ''}
                                        </p>
                                    </div>
                                    {customer.notes && (
                                        <p className="max-w-sm truncate text-xs text-ink-muted">
                                            {customer.notes}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-xs text-ink-muted">
                            {filtered.length} de {(customers.data ?? []).length} clientes.
                        </p>
                    </>
                )}
            </section>
        </div>
    );
}
