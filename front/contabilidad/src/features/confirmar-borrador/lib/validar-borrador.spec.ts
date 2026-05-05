import { expect, test, describe } from 'vitest';
import { validarFormulario, type FormValues } from './validar-borrador';

// ---------------------------------------------------------------------------
// Helpers — FormValues completos por tipo (basados en docs/endpoints-oxp-*.md)
// ---------------------------------------------------------------------------

const COMPRA_VALIDA: FormValues = {
  medioPago: 'Credito',
  tercero: 'Amazon.com',
  moneda: 'COP',
  monto: '1500000',
  fechaTransaccion: '2026-03-15T00:00:00Z',
  descripcion: 'Compra de licencias',
  conceptosCount: 1,
  conceptos: [{ descripcion: 'Servicio de consultoria', cantidad: 1, valor: 500000 }],
};

const ANTICIPO_VALIDO: FormValues = {
  medioPago: 'Credito',
  tercero: 'Proveedor ABC',
  moneda: 'COP',
  monto: '5000000',
  fechaTransaccion: '2026-04-01T00:00:00Z',
  descripcion: 'Anticipo por inicio de proyecto de consultoria',
};

const EXTRACTO_VALIDO: FormValues = {
  entidadFinanciera: 'Bancolombia',
  tarjetaNumero: '4111111111111111',
  periodoDesde: '2026-03-01',
  periodoHasta: '2026-03-31',
  movimientosCount: 1,
  movimientos: [{ descripcion: 'AMZN*1X2Y3Z SEATTLE', fecha: '2026-03-10', valor: 150000 }],
};

// ---------------------------------------------------------------------------
// Tipo 1 — Compra
// ---------------------------------------------------------------------------

describe('validarFormulario — Compra (tipo 1)', () => {
  test('Si todos los campos estan completos y hay conceptos validos, debe retornar array vacio', () => {
    expect(validarFormulario(1, COMPRA_VALIDA)).toEqual([]);
  });

  test('Si falta medioPago, debe retornar error con campo medioPago', () => {
    const errors = validarFormulario(1, { ...COMPRA_VALIDA, medioPago: undefined });
    expect(errors).toContainEqual({ campo: 'medioPago', mensaje: 'Medio de pago' });
  });

  test('Si falta tercero, debe retornar error con campo tercero', () => {
    const errors = validarFormulario(1, { ...COMPRA_VALIDA, tercero: undefined });
    expect(errors).toContainEqual({ campo: 'tercero', mensaje: 'Tercero' });
  });

  test('Si faltan moneda, monto, fechaTransaccion y descripcion, debe retornar un error por cada campo', () => {
    const errors = validarFormulario(1, {
      ...COMPRA_VALIDA,
      moneda: undefined,
      monto: undefined,
      fechaTransaccion: undefined,
      descripcion: undefined,
    });

    expect(errors).toContainEqual({ campo: 'moneda', mensaje: 'Moneda' });
    expect(errors).toContainEqual({ campo: 'monto', mensaje: 'Monto' });
    expect(errors).toContainEqual({ campo: 'fechaTransaccion', mensaje: 'Fecha de transacción' });
    expect(errors).toContainEqual({ campo: 'descripcion', mensaje: 'Descripción' });
  });

  test('Si no hay conceptos (conceptosCount=0), debe retornar error de al menos un concepto', () => {
    const errors = validarFormulario(1, { ...COMPRA_VALIDA, conceptosCount: 0, conceptos: [] });
    expect(errors).toContainEqual({ campo: 'conceptos', mensaje: 'Al menos un concepto' });
  });

  test('Si hay conceptos incompletos, debe reportar cuantos', () => {
    const errors = validarFormulario(1, {
      ...COMPRA_VALIDA,
      conceptosCount: 2,
      conceptos: [
        { descripcion: 'Completo', cantidad: 1, valor: 100 },
        { descripcion: '', cantidad: 0, valor: 0 },
      ],
    });
    expect(errors).toContainEqual(
      expect.objectContaining({ campo: 'conceptos', mensaje: expect.stringContaining('1 concepto(s)') }),
    );
  });
});

// ---------------------------------------------------------------------------
// Tipo 2 — Anticipo
// ---------------------------------------------------------------------------

describe('validarFormulario — Anticipo (tipo 2)', () => {
  test('Si todos los campos estan completos, debe retornar array vacio', () => {
    expect(validarFormulario(2, ANTICIPO_VALIDO)).toEqual([]);
  });

  test('Si faltan medioPago, tercero, moneda, monto y fechaTransaccion, debe retornar errores', () => {
    const errors = validarFormulario(2, {});
    expect(errors).toContainEqual({ campo: 'medioPago', mensaje: 'Medio de pago' });
    expect(errors).toContainEqual({ campo: 'tercero', mensaje: 'Beneficiario' });
    expect(errors).toContainEqual({ campo: 'moneda', mensaje: 'Moneda' });
    expect(errors).toContainEqual({ campo: 'monto', mensaje: 'Monto' });
    expect(errors).toContainEqual({ campo: 'fechaTransaccion', mensaje: 'Fecha de transacción' });
  });

  test('Si falta descripcion pero hay soporte, debe NO retornar error de descripcion', () => {
    const errors = validarFormulario(2, {
      ...ANTICIPO_VALIDO,
      descripcion: undefined,
      soporte: 'archivo.pdf',
    });
    expect(errors.find((e) => e.campo === 'descripcion')).toBeUndefined();
  });

  test('Si falta descripcion y no hay soporte, debe retornar error de descripcion', () => {
    const errors = validarFormulario(2, {
      ...ANTICIPO_VALIDO,
      descripcion: undefined,
      soporte: undefined,
    });
    expect(errors).toContainEqual(
      expect.objectContaining({ campo: 'descripcion' }),
    );
  });
});

// ---------------------------------------------------------------------------
// Tipo 0 — Extracto
// ---------------------------------------------------------------------------

describe('validarFormulario — Extracto (tipo 0)', () => {
  test('Si todos los campos estan completos y hay movimientos validos, debe retornar array vacio', () => {
    expect(validarFormulario(0, EXTRACTO_VALIDO)).toEqual([]);
  });

  test('Si falta entidadFinanciera o tarjetaNumero, debe retornar errores', () => {
    const errors = validarFormulario(0, {
      ...EXTRACTO_VALIDO,
      entidadFinanciera: undefined,
      tarjetaNumero: undefined,
    });
    expect(errors).toContainEqual({ campo: 'entidadFinanciera', mensaje: 'Entidad financiera' });
    expect(errors).toContainEqual({ campo: 'tarjetaNumero', mensaje: 'Número de tarjeta' });
  });

  test('Si falta periodoDesde o periodoHasta, debe retornar error de periodo', () => {
    const errors = validarFormulario(0, { ...EXTRACTO_VALIDO, periodoDesde: undefined });
    expect(errors).toContainEqual(
      expect.objectContaining({ campo: 'periodo' }),
    );
  });

  test('Si no hay movimientos (movimientosCount=0), debe retornar error de al menos un movimiento', () => {
    const errors = validarFormulario(0, { ...EXTRACTO_VALIDO, movimientosCount: 0, movimientos: [] });
    expect(errors).toContainEqual({ campo: 'movimientos', mensaje: 'Al menos un movimiento' });
  });

  test('Si hay movimientos incompletos, debe reportar cuantos', () => {
    const errors = validarFormulario(0, {
      ...EXTRACTO_VALIDO,
      movimientosCount: 2,
      movimientos: [
        { descripcion: 'Completo', fecha: '2026-03-10', valor: 100 },
        { descripcion: '', fecha: '', valor: 0 },
      ],
    });
    expect(errors).toContainEqual(
      expect.objectContaining({ campo: 'movimientos', mensaje: expect.stringContaining('1 movimiento(s)') }),
    );
  });
});

// ---------------------------------------------------------------------------
// Tipo desconocido
// ---------------------------------------------------------------------------

test('Si recibe un tipo no reconocido, debe retornar array vacio', () => {
  expect(validarFormulario(99, {})).toEqual([]);
});
