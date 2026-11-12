import { useEffect } from 'react';

const DEFAULT_TITLE = 'Reserva2 — La agenda de tu negocio';

/**
 * Fija el título del documento por pantalla y lo restaura al salir.
 * Cada página llama a este hook en lugar de manipular `document` a mano.
 */
export function useDocumentTitle(title: string): void {
    useEffect(() => {
        document.title = title;

        return () => {
            document.title = DEFAULT_TITLE;
        };
    }, [title]);
}
