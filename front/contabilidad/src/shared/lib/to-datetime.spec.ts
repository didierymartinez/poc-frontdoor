import { expect, test } from 'vitest';
import { toDatetime } from './to-datetime';

test('Si recibe DD/MM/YYYY, debe convertir a ISO datetime', () => {
  expect(toDatetime('15/03/2024')).toBe('2024-03-15T00:00:00');
});

test('Si recibe fecha con dia y mes de un digito, debe convertir correctamente', () => {
  expect(toDatetime('01/01/2025')).toBe('2025-01-01T00:00:00');
});

test('Si recibe el ultimo dia del ano, debe convertir correctamente', () => {
  expect(toDatetime('31/12/2023')).toBe('2023-12-31T00:00:00');
});
