import { expect, test, describe } from 'vitest';
import type { AgregadoOxpComercio } from '@/entities/borrador';
import { mapCompra } from './compra-mapper';

// ---------------------------------------------------------------------------
// Fixture basado en docs/endpoints-oxp-comercio.md
// ---------------------------------------------------------------------------

const COMERCIO_BASE: AgregadoOxpComercio = {
  id: 'com-001',
  estado: 2,
  informacionTercero: { nombre: 'Amazon.com', identificacion: { tipo: 'NIT', numero: '900123456' } },
  descripcion: 'Compra de licencias',
  valorMonetario: { moneda: 1, valor: 500000 },
  conceptos: [
    {
      id: 'c1', codigo: 'SRV-001', descripcion: 'Servicio', cantidad: 1,
      dinero: { moneda: 1, valor: 500000 }, tipo: 0,
      clasificacionTributaria: 'Gravado', conceptoPago: 'Servicios', referenciaOrigen: 'FAC-001',
      desgloseFiscal: {
        impuestos: [{ tipo: 'IVA', base: { moneda: 1, valor: 500000 }, tarifa: 0.19, valor: { moneda: 1, valor: 95000 } }],
        retenciones: [{ tipo: 'ReteFuente', base: { moneda: 1, valor: 500000 }, tarifa: 0.11, valor: { moneda: 1, valor: 55000 } }],
      },
      destinacionCostos: [],
    },
  ],
  medioPago: { tipo: 0, numero: '4111111111111111', entidadBancaria: 'Bancolombia' },
  documento: { numero: 'FAC-001', tipo: 0, fecha: '2026-03-15T00:00:00' },
  instruccionDistribucion: [],
  archivosVinculados: [],
  bloqueadaPorRegularizacion: false,
  pagosAplicados: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('mapCompra', () => {
  test('Si conceptos tienen desgloseFiscal, debe sumar impuestos y retenciones correctamente', () => {
    const result = mapCompra(COMERCIO_BASE);

    expect(result.totalImpuestos).toContain('95.000');
    expect(result.totalRetenciones).toContain('55.000');
    expect(result.totalBruto).toContain('500.000');
  });

  test('Si concepto tiene desgloseFiscal null, debe sumar 0 sin crashear', () => {
    const sinFiscal: AgregadoOxpComercio = {
      ...COMERCIO_BASE,
      conceptos: [{ ...COMERCIO_BASE.conceptos[0], desgloseFiscal: null }],
    };

    const result = mapCompra(sinFiscal);

    expect(result.totalImpuestos).toContain('0');
    expect(result.totalRetenciones).toContain('0');
  });

  test('Si estado=2, debe mapear a Confirmada', () => {
    const result = mapCompra(COMERCIO_BASE);
    expect(result.estado).toBe('Confirmada');
  });

  test('Si tiene TRM, debe calcular valor funcional', () => {
    const conTrm: AgregadoOxpComercio = {
      ...COMERCIO_BASE,
      valorMonetario: { moneda: 2, valor: 1000 },
      tasaRepresentativaMercado: { moneda: 2, valor: 4200 },
    };

    const result = mapCompra(conTrm);

    // 1000 * 4200 = 4,200,000
    expect(result.funcional).toContain('4.200.000');
  });
});
