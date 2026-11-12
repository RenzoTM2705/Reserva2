import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/lib/use-document-title';

export function NotFoundPage() {
    useDocumentTitle('Página no encontrada — Reserva2');

    return (
        <main className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-24 text-center">
            <p className="tabular font-display text-6xl text-accent">404</p>
            <h1 className="mt-4 font-display text-2xl text-ink sm:text-3xl">
                No encontramos esta página
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Puede que el enlace esté mal escrito o que el negocio haya
                dejado de publicar su página.
            </p>
            <Button asChild className="mt-8">
                <Link to="/">Volver al inicio</Link>
            </Button>
        </main>
    );
}
