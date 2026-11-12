import { Link, Outlet, ScrollRestoration } from 'react-router-dom';
import { useSession } from '@/features/auth/use-session';
import { isDemoMode } from '@/lib/demo';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Layout público compartido (landing, negocio, reserva, consulta y auth).
 *
 * En modo maqueta se muestran las acciones de autenticación aunque exista
 * una sesión de ejemplo: así la maqueta conserva la apariencia del visitante.
 */
export function SiteLayout() {
    const { session, loading } = useSession();

    return (
        <div className="flex min-h-screen flex-col">
            <a
                href="#contenido"
                className="sr-only rounded-md bg-ink px-4 py-2 text-paper focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
            >
                Saltar al contenido
            </a>

            <header className="border-b border-rule bg-paper">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-8 sm:py-4">
                    <Link
                        to="/"
                        className="shrink-0 font-display text-lg tracking-tight text-ink"
                    >
                        Reserva2<span className="text-accent">.</span>
                    </Link>

                    <nav aria-label="Navegación principal" className="min-w-0">
                        <ul className="flex items-center justify-end gap-2 text-xs sm:gap-5 sm:text-sm">
                            <li>
                                <a
                                    href="/#como-funciona"
                                    className="hidden text-ink-soft transition-colors hover:text-ink sm:inline"
                                >
                                    Cómo funciona
                                </a>
                            </li>
                            {loading && !isDemoMode ? (
                                <li>
                                    <Skeleton className="h-6 w-20" />
                                </li>
                            ) : session && !isDemoMode ? (
                                <li>
                                    <Link
                                        to="/panel"
                                        className="block whitespace-nowrap rounded-md bg-ink px-3 py-2 font-medium text-paper transition-colors hover:opacity-90 sm:px-4 sm:text-sm"
                                    >
                                        Ir al panel
                                    </Link>
                                </li>
                            ) : (
                                <>
                                    <li>
                                        <Link
                                            to="/entrar"
                                            className="block whitespace-nowrap px-1 py-2 text-ink-soft transition-colors hover:text-ink sm:px-0 sm:text-sm"
                                        >
                                            Iniciar sesión
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/crear-cuenta"
                                            className="block whitespace-nowrap rounded-md bg-accent px-3 py-2 font-medium text-paper transition-colors hover:bg-accent-hover sm:px-4 sm:text-sm"
                                        >
                                            Crear cuenta
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>

            <main id="contenido" className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-rule">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1 px-5 py-6 text-center text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-8 sm:text-left">
                    <p className="whitespace-nowrap">© {new Date().getFullYear()} Reserva2</p>
                    <p className="text-balance sm:text-right">
                        La agenda de tu negocio, sin fricción
                    </p>
                </div>
            </footer>

            <ScrollRestoration />
        </div>
    );
}
