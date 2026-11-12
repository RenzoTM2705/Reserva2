import { describe, expect, it } from 'vitest';
import {
    addDays,
    isoToDateInZone,
    monthGrid,
    zonedDateTimeToIso,
} from '@/lib/dates';

describe('addDays', () => {
    it('cruza el límite del mes', () => {
        expect(addDays('2026-03-31', 1)).toBe('2026-04-01');
    });

    it('acepta desplazamientos negativos', () => {
        expect(addDays('2026-01-05', -10)).toBe('2025-12-26');
    });
});

describe('monthGrid', () => {
    it('devuelve 42 fechas (6 semanas) lunes primero', () => {
        const grid = monthGrid('2026-03-01');

        expect(grid).toHaveLength(42);
        // El 1 de marzo de 2026 es domingo: la celda anterior es el lunes 23.
        expect(grid[0]).toBe('2026-02-23');
        expect(grid.at(-1)).toBe('2026-04-05');
    });
});

describe('zonedDateTimeToIso', () => {
    it('convierte una hora local del negocio a instante ISO', () => {
        // 10:00 en Lima (UTC-5) son 15:00 UTC.
        expect(zonedDateTimeToIso('2026-03-10', '10:00', 'America/Lima')).toBe(
            '2026-03-10T15:00:00.000Z',
        );
    });
});

describe('isoToDateInZone', () => {
    it('devuelve la fecha de calendario en la zona indicada', () => {
        // 2026-03-10T02:00:00Z ya es 2026-03-09 en Lima (21:00 del día 9).
        expect(isoToDateInZone('2026-03-10T02:00:00Z', 'America/Lima')).toBe(
            '2026-03-09',
        );
    });
});
