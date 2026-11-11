import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind resolviendo conflictos.
 * Única utilidad de estilo compartida; no crear variantes paralelas.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
