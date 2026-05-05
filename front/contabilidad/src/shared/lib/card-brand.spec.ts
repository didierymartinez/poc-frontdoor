import { expect, test, describe } from 'vitest';
import { detectCardBrand, formatCardNumber } from './card-brand';

describe('detectCardBrand', () => {
  test('Si el primer digito es 4, debe detectar Visa', () => {
    expect(detectCardBrand('4111111111111111')).toBe('visa');
  });

  test('Si el prefijo esta en rango 51-55, debe detectar Mastercard', () => {
    expect(detectCardBrand('5111111111111111')).toBe('mastercard');
    expect(detectCardBrand('5511111111111111')).toBe('mastercard');
  });

  test('Si el prefijo esta en rango 2221-2720, debe detectar Mastercard', () => {
    expect(detectCardBrand('2221001111111111')).toBe('mastercard');
    expect(detectCardBrand('2720991111111111')).toBe('mastercard');
  });

  test('Si el prefijo es 34 o 37, debe detectar Amex', () => {
    expect(detectCardBrand('341111111111111')).toBe('amex');
    expect(detectCardBrand('371111111111111')).toBe('amex');
  });

  test('Si el prefijo es 36, 38 o 300-305, debe detectar Diners', () => {
    expect(detectCardBrand('36111111111111')).toBe('diners');
    expect(detectCardBrand('38111111111111')).toBe('diners');
    expect(detectCardBrand('30011111111111')).toBe('diners');
    expect(detectCardBrand('30511111111111')).toBe('diners');
  });

  test('Si el numero no coincide con ninguna marca, debe retornar unknown', () => {
    expect(detectCardBrand('9999999999999999')).toBe('unknown');
  });

  test('Si recibe undefined o string vacio, debe retornar unknown', () => {
    expect(detectCardBrand(undefined)).toBe('unknown');
    expect(detectCardBrand('')).toBe('unknown');
  });

  test('Si el numero tiene guiones o espacios, debe ignorarlos y detectar la marca', () => {
    expect(detectCardBrand('4111-1111-1111-1111')).toBe('visa');
    expect(detectCardBrand('4111 1111 1111 1111')).toBe('visa');
  });
});

describe('formatCardNumber', () => {
  test('Si recibe un numero completo, debe mostrar los ultimos 4 digitos con mascara', () => {
    expect(formatCardNumber('4111111111111111')).toBe('•••• 1111');
  });

  test('Si recibe undefined o vacio, debe retornar guion', () => {
    expect(formatCardNumber(undefined)).toBe('—');
    expect(formatCardNumber('')).toBe('—');
  });

  test('Si el numero tiene guiones, debe ignorarlos y mostrar los ultimos 4 digitos', () => {
    expect(formatCardNumber('4111-1111-1111-5678')).toBe('•••• 5678');
  });
});
