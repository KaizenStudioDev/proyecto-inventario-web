import { describe, it, expect } from 'vitest';
import { formatCurrency } from './hooks';

describe('formatCurrency', () => {
    it('formats numbers as currency', () => {
        expect(formatCurrency(1000)).toBe('$1,000.00');
        expect(formatCurrency(0)).toBe('$0.00');
        expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('handles invalid inputs', () => {
        expect(formatCurrency(null)).toBe('$0.00');
        expect(formatCurrency(undefined)).toBe('$0.00');
    });
});
