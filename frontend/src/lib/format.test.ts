import { describe, expect, it } from 'vitest';
import { formatDuration, formatMoney, formatTimeInZone } from '@/lib/format';

describe('formatMoney', () => {
    it('convierte céntimos a texto monetario', () => {
        // Intl inserta un espacio duro (U+00A0) tras el símbolo.
        expect(formatMoney(2500)).toBe('S/\u00A025.00');
    });

    it('respeta la moneda indicada', () => {
        expect(formatMoney(1000, 'USD', 'es-PE')).toBe('USD\u00A010.00');
    });
});

describe('formatDuration', () => {
    it('muestra minutos simples', () => {
        expect(formatDuration(30)).toBe('30 min');
    });

    it('muestra horas redondas', () => {
        expect(formatDuration(60)).toBe('1 h');
    });

    it('muestra horas y minutos combinados', () => {
        expect(formatDuration(90)).toBe('1 h 30 min');
    });

    it('devuelve un guion para valores inválidos', () => {
        expect(formatDuration(-5)).toBe('—');
    });
});

describe('formatTimeInZone', () => {
    // 2026-03-10T15:30:00Z son 10:30 en Lima (UTC-5, sin DST).
    const instant = '2026-03-10T15:30:00Z';

    it('formatea en la zona del negocio, no en la del navegador', () => {
        expect(formatTimeInZone(instant, 'America/Lima')).toBe('10:30');
    });
});
