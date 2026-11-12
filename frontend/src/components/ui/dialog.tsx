import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

/**
 * Diálogo modal sobre el elemento nativo `<dialog>`.
 *
 * El elemento nativo aporta trampa de foco, Escape y `autofocus` sin
 * dependencias extra. El cierre por clic en el fondo es intencional; el
 * cierre con Escape llega por el evento `close` del elemento.
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const element = dialogRef.current;
        if (!element) return;

        if (open && !element.open) {
            element.showModal();
        } else if (!open && element.open) {
            element.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(event) => {
                if (event.target === dialogRef.current) onClose();
            }}
            className="m-auto max-h-[90vh] w-[min(92vw,560px)] rounded-lg border border-rule bg-surface p-0 text-ink shadow-card backdrop:bg-ink/40"
        >
            <div className="flex items-start justify-between gap-4 border-b border-rule p-6 pb-4">
                <h2 className="font-display text-xl text-ink">{title}</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Cerrar"
                    className="-mr-2 -mt-1 size-9"
                    onClick={onClose}
                >
                    <X aria-hidden="true" />
                </Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
        </dialog>
    );
}
