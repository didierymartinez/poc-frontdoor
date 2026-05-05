import { expect, test, describe } from 'vitest';
import { ESTADO_PARTIDA } from '@/entities/borrador';
import { resolveEstadoTipo, resolveEstadoLabel, mapPartidas } from './partidas-mapper';

// ---------------------------------------------------------------------------
// resolveEstadoTipo + resolveEstadoLabel — bitwise flag resolution
// Segun docs/endpoints-oxp-extracto.md: PartidaExtracto.estado es bitwise
// ---------------------------------------------------------------------------

describe('resolveEstadoTipo — prioridad de flags', () => {
  test('Si flag=Pendiente (1), debe retornar sin_vincular', () => {
    expect(resolveEstadoTipo(ESTADO_PARTIDA.Pendiente)).toBe('sin_vincular');
  });

  test('Si flag=Vinculada (4), debe retornar link', () => {
    expect(resolveEstadoTipo(ESTADO_PARTIDA.Vinculada)).toBe('link');
  });

  test('Si flag=Disputa (8), debe retornar disputa', () => {
    expect(resolveEstadoTipo(ESTADO_PARTIDA.Disputa)).toBe('disputa');
  });

  test('Si flag=Disputa|Vinculada (12), debe priorizar disputa sobre link', () => {
    expect(resolveEstadoTipo(ESTADO_PARTIDA.Disputa | ESTADO_PARTIDA.Vinculada)).toBe('disputa');
  });

  test('Si flag=Anticipo (32), debe retornar anticipo', () => {
    expect(resolveEstadoTipo(ESTADO_PARTIDA.Anticipo)).toBe('anticipo');
  });

  test('Si flag=Descartada (16), debe retornar none', () => {
    expect(resolveEstadoTipo(ESTADO_PARTIDA.Descartada)).toBe('none');
  });

  test('Si flag=Descartada|Disputa (24), debe priorizar none sobre disputa', () => {
    expect(resolveEstadoTipo(ESTADO_PARTIDA.Descartada | ESTADO_PARTIDA.Disputa)).toBe('none');
  });
});

describe('resolveEstadoLabel', () => {
  test('Si flag=Pendiente, debe retornar "Por asignar"', () => {
    expect(resolveEstadoLabel(ESTADO_PARTIDA.Pendiente)).toBe('Por asignar');
  });

  test('Si flag=Vinculada, debe retornar "Vinculada"', () => {
    expect(resolveEstadoLabel(ESTADO_PARTIDA.Vinculada)).toBe('Vinculada');
  });

  test('Si flag=Disputa, debe retornar "En disputa"', () => {
    expect(resolveEstadoLabel(ESTADO_PARTIDA.Disputa)).toBe('En disputa');
  });
});

// ---------------------------------------------------------------------------
// mapPartidas — transformación de extracto a PartidaRow[]
// ---------------------------------------------------------------------------

describe('mapPartidas', () => {
  test('Si recibe undefined, debe retornar array vacio', () => {
    expect(mapPartidas(undefined)).toEqual([]);
  });

  test('Si tiene partidas con vinculaciones, debe mapear vinculadoA con primeros 8 chars del ID', () => {
    const result = mapPartidas({
      id: 'ext-001',
      estado: 1,
      partidas: [
        { id: 'p1', fechaTransaccion: '2026-03-10T00:00:00', valor: { moneda: 1, valor: 150000 }, valorOriginal: null, descripcion: 'AMZN', estado: 4, informacionTercero: null },
      ],
      vinculaciones: [
        { referenciaId: 'com-001-abcd-efgh-1234', partidaId: 'p1', tipo: 0, origen: 0 },
      ],
      cargosFinancieros: [],
      periodo: null,
      medioPago: null,
      evidencia: null,
      informacionTercero: { nombre: 'Bancolombia' },
      referenciaSistemaContable: null,
      crucesPagoAplicados: [],
      ajustesPorTolerancia: [],
      ajustesPorDiferenciaCambio: [],
      coberturasAnticipo: [],
      coberturasDevolucion: [],
      instruccionDistribucion: [],
      motivoDescarte: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0].vinculadoA).toBe('com-001-');
    expect(result[0].estadoTipo).toBe('link');
    expect(result[0].estado).toBe('Vinculada');
  });
});
