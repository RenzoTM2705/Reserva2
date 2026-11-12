import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, ScrollRestoration, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExternalLink, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from '@/lib/auth';
import { toUserMessage } from '@/lib/errors';
import { useSession } from '@/features/auth/use-session';
import { useMembership } from '@/features/panel/use-membership';

const NAV_ITEMS = [
    { to: '/panel', label: 'Panel', end: true },
    { to: '/panel/reservas', label: 'Reservas' },
    { to: '/panel/calendario', label: 'Calendario' },
    { to: '/panel/servicios', label: 'Servicios' },
    { to: '/panel/profesionales', label: 'Profesionales' },
    { to: '/panel/clientes', label: 'Clientes' },
    { to: '/panel/configuracion', label: 'Configuración' },
];

/**
 * Shell del panel con guardia de sesión.
 *
 * Sin sesión redirige a /entrar; sin negocio redirige al onboarding. La
 * autorización fina la aplica RLS en cada consulta, no este shell.
 */
export function PanelLayout() {
    const { session, loading } = useSession();
    const membership = useMembership();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [menuOpen, setMenuOpen] = useState(false);

    if (loading || membership.isPending) {
        return (
            <div className="mx-auto w-full max-w-6xl space-y-4 px-5 py-10">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/entrar" replace />;
    }

    if (membership.isError) {
        return (
            <main className="mx-auto max-w-xl px-5 py-16 text-center">
                <h1 className="font-display text-2xl text-ink">No pudimos cargar tu negocio</h1>
                <p className="mt-3 text-sm text-ink-soft">{toUserMessage(membership.error)}</p>
                <Button className="mt-6" onClick={() => membership.refetch()}>
                    Reintentar
                </Button>
            </main>
        );
    }

    if (!membership.data) {
        return <Navigate to="/panel/onboarding" replace />;
    }

    const business = membership.data.business;

    async function handleSignOut() {
        try {
            await signOut();
            queryClient.clear();
            navigate('/entrar');
        } catch (error) {
            toast.error(toUserMessage(error));
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-paper">
            <header className="border-b border-rule bg-surface">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={menuOpen}
                            className="rounded-md p-2 text-ink-soft hover:bg-sunken lg:hidden"
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <Menu aria-hidden="true" className="size-5" />
                        </button>
                        <Link to="/panel" className="font-display text-lg text-ink">
                            Reserva2<span className="text-accent">.</span>
                        </Link>
                        <span className="hidden text-sm text-ink-muted sm:inline">
                            {business.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm">
                            <Link to={`/negocio/${business.slug}`}>
                                <ExternalLink aria-hidden="true" />
                                <span className="hidden sm:inline">Ver página pública</span>
                                <span className="sm:hidden">Pública</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleSignOut}>
                            <LogOut aria-hidden="true" />
                            <span className="hidden sm:inline">Salir</span>
                        </Button>
                    </div>
                </div>

                <nav
                    aria-label="Secciones del panel"
                    className={`${menuOpen ? 'block' : 'hidden'} border-t border-rule lg:hidden`}
                >
                    <ul className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-5 py-2 sm:px-8">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className="block whitespace-nowrap rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-sunken hover:text-ink"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-5 py-8 sm:px-8">
                <aside className="hidden w-52 shrink-0 lg:block">
                    <nav aria-label="Secciones del panel">
                        <ul className="space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <li key={item.to}>
                                    <PanelNavLink
                                        to={item.to}
                                        label={item.label}
                                        end={item.end}
                                    />
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <div className="min-w-0 flex-1">
                    <Outlet />
                </div>
            </div>

            <footer className="border-t border-rule py-4 text-center text-xs text-ink-muted">
                Reserva2 · {business.name}
            </footer>

            <ScrollRestoration />
        </div>
    );
}

function PanelNavLink({ to, label, end }: { to: string; label: string; end?: boolean }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                [
                    'block rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                        ? 'bg-accent-soft font-medium text-accent-ink'
                        : 'text-ink-soft hover:bg-sunken hover:text-ink',
                ].join(' ')
            }
        >
            {label}
        </NavLink>
    );
}
