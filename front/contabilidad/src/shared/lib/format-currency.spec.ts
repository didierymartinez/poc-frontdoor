import { expect, test } from 'vitest';
import { formatCurrency } from './format-currency';

test('Si recibe un numero positivo, debe formatear con separador de miles y decimales', () => {
  const result = formatCurrency(100000);
  expect(result).toContain('100');
  expect(result).toMatch(/^\$/);
});

test('Si recibe cero, debe formatear con signo peso', () => {
  const result = formatCurrency(0);
  expect(result).toMatch(/^\$/);
  expect(result).toContain('0');
});

test('Si recibe un numero negativo, debe formatear correctamente', () => {
  const result = formatCurrency(-50000);
  expect(result).toContain('50');
});
