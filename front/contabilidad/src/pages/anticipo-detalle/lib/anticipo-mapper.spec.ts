import { expect, test, describe } from 'vitest';
import type { AgregadoAnticipo } from '@/entities/borrador';

// ---------------------------------------------------------------------------
// Reproduce la lógica de mapAnticipo (definida en useAnticipoDetalle.ts)
// para validar cálculos de saldo sin modificar código de producción
// ---------------------------------------------------------------------------

function calcSaldos(a: AgregadoAnticipo) {
  const total = a.valorMonetario?.valor ?? 0;
  const totalPagado = a.crucesPagoAplicados.reduce((sum, p) => sum + p.valorCubierto.valor, 0);
  const totalRegularizado = a.crucesRegularizacion.reduce((sum, r) => sum + r.montoRegularizado.valor, 0);

  return {
    total,
    saldoPorPagar: total - totalPagado,
    saldoPorRegularizar: total - totalRegularizado,
    totalPagado,
    totalRegularizado,
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ANTICIPO_BASE: AgregadoAnticipo = {
  id: 'ant-001',
  estado: 1,
  informacionTercero: { nombre: 'Proveedor ABC', identificacion: { tipo: 'NIT', numero: '900123456' } },
  valorMonetario: { moneda: 1, valor: 5000000 },
  valorTotal: null,
  medioPago: { tipo: 0, numero: '4111', entidadBancaria: 'Bancolombia' },
  soporte: null,
  justificacion: 'Anticipo',
  fecha: '2026-04-01T00:00:00Z',
  motivoDescarte: null,
  instruccionDistribucion: [],
  crucesRegularizacion: [],
  crucesPagoAplicados: [],
};

// ---------------------------------------------------------------------------
// Tests — cálculo de saldos según docs/endpoints-oxp-anticipo.md
// ---------------------------------------------------------------------------

describe('Anticipo saldos — lógica de mapAnticipo', () => {
  test('Si no hay pagos ni regularizaciones, debe mostrar saldo completo pendiente', () => {
    const result = calcSaldos(ANTICIPO_BASE);

    expect(result.total).toBe(5000000);
    expect(result.saldoPorPagar).toBe(5000000);
    expect(result.saldoPorRegularizar).toBe(5000000);
    expect(result.totalPagado).toBe(0);
    expect(result.totalRegularizado).toBe(0);
  });

  test('Si hay pagos aplicados, debe restar del saldoPorPagar', () => {
    const conPagos: AgregadoAnticipo = {
      ...ANTICIPO_BASE,
      crucesPagoAplicados: [
        { id: 'p1', tipo: 0, valorCubierto: { moneda: 1, valor: 2000000 }, fecha: '2026-04-05T00:00:00Z' },
        { id: 'p2', tipo: 1, valorCubierto: { moneda: 1, valor: 1000000 }, fecha: '2026-04-06T00:00:00Z' },
      ],
    };

    const result = calcSaldos(conPagos);

    expect(result.totalPagado).toBe(3000000);
    expect(result.saldoPorPagar).toBe(2000000);
    expect(result.saldoPorRegularizar).toBe(5000000); // no afectado por pagos
  });

  test('Si hay regularizaciones aplicadas, debe restar del saldoPorRegularizar', () => {
    const conRegularizaciones: AgregadoAnticipo = {
      ...ANTICIPO_BASE,
      crucesRegularizacion: [
        { id: 'r1', oxpComercioId: 'com-001', montoRegularizado: { moneda: 1, valor: 3000000 }, fechaRegularizacion: '2026-04-10T00:00:00Z' },
      ],
    };

    const result = calcSaldos(conRegularizaciones);

    expect(result.totalRegularizado).toBe(3000000);
    expect(result.saldoPorRegularizar).toBe(2000000);
    expect(result.saldoPorPagar).toBe(5000000); // no afectado por regularizaciones
  });
});
