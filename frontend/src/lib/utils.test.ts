import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
    it('combina clases', () => {
        expect(cn('a', 'b')).toBe('a b');
    });

    it('resuelve conflictos de Tailwind quedándose con la última clase', () => {
        expect(cn('p-2', 'p-4')).toBe('p-4');
    });

    it('ignora valores falsy', () => {
        expect(cn('a', false, undefined, null)).toBe('a');
    });
});
