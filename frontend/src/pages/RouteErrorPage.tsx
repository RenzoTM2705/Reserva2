import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/lib/use-document-title';

/**
 * Pantalla de error de ruta.
 *
 * Muestra un mensaje humano; los detalles técnicos solo aparecen en
 * desarrollo (nunca en producción).
 */
export function RouteErrorPage() {
    const error = useRouteError();
    useDocumentTitle('Algo salió mal — Reserva2');

    const isNotFound = isRouteErrorResponse(error) && error.status === 404;
    const technical =
        import.meta.env.DEV && error instanceof Error ? error.message : null;

    return (
        <main className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-24 text-center">
            <p className="tabular font-display text-6xl text-accent">
                {isNotFound ? '404' : '500'}
            </p>
            <h1 className="mt-4 font-display text-2xl text-ink sm:text-3xl">
                {isNotFound ? 'No encontramos esta página' : 'Algo salió mal'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {isNotFound
                    ? 'Puede que el enlace esté mal escrito o que el contenido se haya movido.'
                    : 'Ocurrió un problema inesperado. Inténtalo de nuevo en unos minutos.'}
            </p>

            {technical && (
                <p className="mt-6 max-w-md break-words rounded-md bg-sunken p-3 font-mono text-xs text-ink-soft">
                    {technical}
                </p>
            )}

            <div className="mt-8 flex gap-3">
                <Button asChild>
                    <Link to="/">Volver al inicio</Link>
                </Button>
                <Button variant="secondary" onClick={() => window.location.reload()}>
                    Reintentar
                </Button>
            </div>
        </main>
    );
}
