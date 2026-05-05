import { expect, test, describe } from 'vitest';
import type { AgregadoOxpComercio, AgregadoOxpExtracto, AgregadoAnticipo } from './borrador-api.types';
import { agregadoComercioToComercio, agregadoExtractoToExtracto, agregadoAnticipoToAnticipo } from './adapters';

// ---------------------------------------------------------------------------
// Fixtures mínimos basados en docs/endpoints-oxp-*.md
// ---------------------------------------------------------------------------

const COMERCIO_AGG: AgregadoOxpComercio = {
  id: 'com-001',
  estado: 1,
  informacionTercero: { nombre: 'Amazon.com', identificacion: { tipo: 'NIT', numero: '900123456' } },
  descripcion: 'Compra de licencias',
  valorMonetario: { moneda: 1, valor: 500000 },
  conceptos: [
    { id: 'c1', codigo: 'SRV-001', descripcion: 'Servicio', cantidad: 2, dinero: { moneda: 1, valor: 100000 }, tipo: 0, clasificacionTributaria: '', conceptoPago: '', referenciaOrigen: '', destinacionCostos: [] },
  ],
  medioPago: { tipo: 0, numero: '4111111111111111', entidadBancaria: 'Bancolombia' },
  documento: { numero: 'FAC-001', tipo: 0, fecha: '2026-03-15T00:00:00' },
  instruccionDistribucion: [],
  archivosVinculados: [],
  bloqueadaPorRegularizacion: false,
  pagosAplicados: [],
};

const EXTRACTO_AGG: AgregadoOxpExtracto = {
  id: 'ext-001',
  estado: 1,
  partidas: [
    { id: 'p1', fechaTransaccion: '2026-03-10T00:00:00', valor: { moneda: 1, valor: 150000 }, valorOriginal: null, descripcion: 'AMZN*1X2Y3Z', estado: 1, informacionTercero: null },
  ],
  cargosFinancieros: [],
  periodo: { desde: '2026-03-01', hasta: '2026-03-31' },
  medioPago: { tipo: 0, numero: '4111111111111111', entidadBancaria: 'Bancolombia' },
  evidencia: null,
  informacionTercero: { nombre: 'Bancolombia', identificacion: { tipo: 'NIT', numero: '890903938' } },
  referenciaSistemaContable: null,
  crucesPagoAplicados: [],
  vinculaciones: [],
  ajustesPorTolerancia: [],
  ajustesPorDiferenciaCambio: [],
  coberturasAnticipo: [],
  coberturasDevolucion: [],
  instruccionDistribucion: [],
  motivoDescarte: null,
};

const ANTICIPO_AGG: AgregadoAnticipo = {
  id: 'ant-001',
  estado: 1,
  informacionTercero: { nombre: 'Proveedor ABC', identificacion: { tipo: 'NIT', numero: '900123456' } },
  valorMonetario: { moneda: 1, valor: 5000000 },
  valorTotal: null,
  medioPago: { tipo: 0, numero: '4111111111111111', entidadBancaria: 'Bancolombia' },
  soporte: null,
  justificacion: 'Anticipo por consultoria',
  fecha: '2026-04-01T00:00:00Z',
  motivoDescarte: null,
  instruccionDistribucion: [],
  crucesRegularizacion: [],
  crucesPagoAplicados: [],
};

// ---------------------------------------------------------------------------
// agregadoComercioToComercio
// ---------------------------------------------------------------------------

describe('agregadoComercioToComercio', () => {
  test('Si recibe undefined, debe retornar undefined', () => {
    expect(agregadoComercioToComercio(undefined)).toBeUndefined();
  });

  test('Si concepto tiene cantidad=0, debe calcular valorUnitario sin division por cero', () => {
    // Arrange — concepto con cantidad=0, dinero.valor=100000
    const agg: AgregadoOxpComercio = {
      ...COMERCIO_AGG,
      conceptos: [{ ...COMERCIO_AGG.conceptos[0], cantidad: 0, dinero: { moneda: 1, valor: 100000 } }],
    };

    // Act
    const result = agregadoComercioToComercio(agg);

    // Assert — usa (cantidad || 1) como divisor, no divide por 0
    expect(result!.conceptos[0].valorUnitario).toBe(100000);
  });

  test('Si medioPago.tipo=0, debe mapear a Credito; tipo=1 a Debito', () => {
    const credito = agregadoComercioToComercio({ ...COMERCIO_AGG, medioPago: { tipo: 0, numero: '', entidadBancaria: '' } });
    const debito = agregadoComercioToComercio({ ...COMERCIO_AGG, medioPago: { tipo: 1, numero: '', entidadBancaria: '' } });

    expect(credito!.medioPago).toBe('Credito');
    expect(debito!.medioPago).toBe('Debito');
  });

  test('Si moneda=1, debe mapear a COP via MONEDA_MAP', () => {
    const result = agregadoComercioToComercio(COMERCIO_AGG);
    expect(result!.moneda).toBe('COP');
  });
});

// ---------------------------------------------------------------------------
// agregadoExtractoToExtracto
// ---------------------------------------------------------------------------

describe('agregadoExtractoToExtracto', () => {
  test('Si recibe undefined, debe retornar undefined', () => {
    expect(agregadoExtractoToExtracto(undefined)).toBeUndefined();
  });

  test('Si partidas esta vacio, debe retornar extracto con movimientos vacios y total 0', () => {
    const agg: AgregadoOxpExtracto = { ...EXTRACTO_AGG, partidas: [] };
    const result = agregadoExtractoToExtracto(agg);

    expect(result!.movimientos).toEqual([]);
    expect(result!.totales[0].subtotal?.valor).toBe(0);
    expect(result!.totales[0].totalAPagar?.valor).toBe(0);
  });

  test('Si tiene partidas, debe sumar valores en totales', () => {
    const result = agregadoExtractoToExtracto(EXTRACTO_AGG);

    expect(result!.movimientos).toHaveLength(1);
    expect(result!.totales[0].subtotal?.valor).toBe(150000);
  });
});

// ---------------------------------------------------------------------------
// agregadoAnticipoToAnticipo
// ---------------------------------------------------------------------------

describe('agregadoAnticipoToAnticipo', () => {
  test('Si recibe undefined, debe retornar undefined', () => {
    expect(agregadoAnticipoToAnticipo(undefined)).toBeUndefined();
  });

  test('Si tiene todos los campos, debe mapear tercero, moneda y medioPago correctamente', () => {
    const result = agregadoAnticipoToAnticipo(ANTICIPO_AGG);

    expect(result!.$tipo).toBe('anticipo');
    expect(result!.beneficiario?.nombre?.valor).toBe('Proveedor ABC');
    expect(result!.beneficiario?.identificacion?.valor).toBe('900123456');
    expect(result!.moneda).toBe('COP');
    expect(result!.medioPago).toBe('Credito');
    expect(result!.concepto?.valor).toBe(5000000);
    expect(result!.concepto?.descripcion).toBe('Anticipo por consultoria');
  });
});
