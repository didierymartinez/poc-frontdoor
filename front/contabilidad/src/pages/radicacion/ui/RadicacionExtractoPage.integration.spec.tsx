import { screen, waitFor } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, requestLog } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { RadicacionExtractoPage } from './RadicacionExtractoPage';

// ---------------------------------------------------------------------------
// Mock data — basado en docs/endpoints-oxp-extracto.md
// GET /api/radicacion/consultas/OxPExtracto/{id} → BorradorExtractoDetalle
// ---------------------------------------------------------------------------

const EXTRACTO_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

/**
 * AgregadoOxpExtracto completo en estado Borrador (estado=0)
 * Estructura segun docs/endpoints-oxp-extracto.md:
 * - partidas[]: { id, fechaTransaccion, valor: {moneda,valor}, descripcion, estado, informacionTercero }
 * - medioPago: { tipo (0=Credito), numero, entidadBancaria }
 * - periodo: { desde, hasta }
 * - informacionTercero: { nombre, identificacion }
 * - cargosFinancieros[]: { id, tipo (0=4x1000), valor, periodo }
 */
const EXTRACTO_BORRADOR_COMPLETO = {
  extracto: {
    id: EXTRACTO_ID,
    estado: 0,
    partidas: [
      {
        id: 'p1',
        fechaTransaccion: '2026-03-10T00:00:00',
        valor: { moneda: 1, valor: 150000 },
        valorOriginal: null,
        descripcion: 'AMZN*1X2Y3Z SEATTLE',
        estado: 1,
        informacionTercero: { nombre: 'Amazon.com', identificacion: { tipo: 'NIT', numero: '900123456' } },
      },
      {
        id: 'p2',
        fechaTransaccion: '2026-03-12T00:00:00',
        valor: { moneda: 1, valor: 75000 },
        valorOriginal: null,
        descripcion: 'UBER*TRIP BOGOTA',
        estado: 1,
        informacionTercero: null,
      },
    ],
    cargosFinancieros: [
      {
        id: 'cf1',
        tipo: 0,
        valor: { moneda: 1, valor: 4000 },
        periodo: { desde: '2026-03-01', hasta: '2026-03-31' },
        distribucionCentroCostos: [],
      },
    ],
    periodo: { desde: '2026-03-01', hasta: '2026-03-31' },
    medioPago: { tipo: 0, numero: '4111111111111111', entidadBancaria: 'Bancolombia' },
    evidencia: null,
    informacionTercero: {
      nombre: 'Bancolombia',
      identificacion: { tipo: 'NIT', numero: '890903938' },
    },
    referenciaSistemaContable: null,
    crucesPagoAplicados: [],
    vinculaciones: [],
    ajustesPorTolerancia: [],
    ajustesPorDiferenciaCambio: [],
    coberturasAnticipo: [],
    coberturasDevolucion: [],
    instruccionDistribucion: [],
    motivoDescarte: null,
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

/** Extracto sin partidas — simula borrador sin movimientos */
const EXTRACTO_BORRADOR_SIN_PARTIDAS = {
  extracto: {
    ...EXTRACTO_BORRADOR_COMPLETO.extracto,
    partidas: [],
    cargosFinancieros: [],
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupHandlers(detalle: typeof EXTRACTO_BORRADOR_COMPLETO) {
  server.use(
    http.get(`*/api/radicacion/consultas/OxPExtracto/${EXTRACTO_ID}`, () =>
      HttpResponse.json(detalle),
    ),
    http.post(`*/api/radicacion/comandos/OxpExtracto/${EXTRACTO_ID}/CompletarBorrador`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
    http.post(`*/api/radicacion/comandos/OxpExtracto/${EXTRACTO_ID}/DescartarBorrador`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
  );
}

function renderPage() {
  return renderWithProviders(<RadicacionExtractoPage />, {
    path: 'registro-extracto/:id',
    route: `/registro-extracto/${EXTRACTO_ID}`,
  });
}

// ---------------------------------------------------------------------------
// Tests de integración — flujo Radicación Extracto
// ---------------------------------------------------------------------------

describe('RadicacionExtractoPage — Completar borrador', () => {
  test('Si el extracto tiene partidas completas, debe enviar POST /CompletarBorrador con payload segun docs/endpoints-oxp-extracto.md', async () => {
    // Arrange
    setupHandlers(EXTRACTO_BORRADOR_COMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act
    const botonEnviar = await screen.findByTestId('enviar-confirmacion-button');
    await user.click(botonEnviar);

    // Assert — verificar POST /CompletarBorrador con payload correcto
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/CompletarBorrador'),
      );
      expect(post).toBeDefined();

      const body = post!.body as Record<string, unknown>;

      // partidas (segun docs: array con id, fechaTransaccion, valor, descripcion, estado)
      const partidas = body.partidas as Array<Record<string, unknown>>;
      expect(partidas).toHaveLength(2);
      expect(partidas[0]).toEqual(expect.objectContaining({
        id: 'p1',
        descripcion: 'AMZN*1X2Y3Z SEATTLE',
      }));
      expect(partidas[1]).toEqual(expect.objectContaining({
        id: 'p2',
        descripcion: 'UBER*TRIP BOGOTA',
      }));

      // medioPago (segun docs: tipo 0=Credito, numero, entidadBancaria)
      expect(body.medioPago).toEqual(expect.objectContaining({
        tipo: 0,
        numero: '4111111111111111',
        entidadBancaria: 'Bancolombia',
      }));

      // periodo (segun docs: desde + hasta)
      expect(body.periodo).toEqual(expect.objectContaining({
        desde: '2026-03-01',
        hasta: '2026-03-31',
      }));

      // informacionTercero (segun docs: nombre + identificacion)
      expect(body.informacionTercero).toEqual(expect.objectContaining({
        nombre: 'Bancolombia',
        identificacion: expect.objectContaining({ tipo: 'NIT', numero: '890903938' }),
      }));

      // cargosFinancieros (segun docs: R19 — 4x1000, cuota manejo, intereses)
      const cargos = body.cargosFinancieros as Array<Record<string, unknown>>;
      expect(cargos).toHaveLength(1);
      expect(cargos[0]).toEqual(expect.objectContaining({
        id: 'cf1',
        tipo: 0,
      }));
    });
  });

  test('Si el extracto no tiene partidas y el usuario click "Enviar a confirmación", debe NO enviar la petición', async () => {
    // Arrange
    setupHandlers(EXTRACTO_BORRADOR_SIN_PARTIDAS);
    renderPage();
    const user = userEvent.setup();

    // Act
    const botonEnviar = await screen.findByTestId('enviar-confirmacion-button');
    await user.click(botonEnviar);

    // Assert — no se envía POST (validación: al menos 1 movimiento)
    const post = requestLog.find(
      (r) => r.method === 'POST' && r.url.includes('/CompletarBorrador'),
    );
    expect(post).toBeUndefined();
  });
});

describe('RadicacionExtractoPage — Descartar borrador', () => {
  test('Si el usuario descarta el extracto con motivo, debe enviar POST /DescartarBorrador', async () => {
    // Arrange
    setupHandlers(EXTRACTO_BORRADOR_COMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act — click Descartar para abrir diálogo
    const botonDescartar = await screen.findByRole('button', { name: 'Descartar' });
    await user.click(botonDescartar);

    // Seleccionar motivo
    const motivoSelect = await screen.findByLabelText(/Motivo de descarte/i);
    await user.click(motivoSelect);
    await user.click(await screen.findByText('Documento ilegible'));

    // Escribir observación (en el diálogo, por placeholder)
    const observacionInput = screen.getByPlaceholderText('Escribe un comentario sobre ...');
    await user.type(observacionInput, 'Extracto bancario ilegible');

    // Confirmar descarte
    const botonConfirmar = screen.getByRole('button', { name: 'Descartar' });
    await user.click(botonConfirmar);

    // Assert — se envió POST /DescartarBorrador
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/DescartarBorrador'),
      );
      expect(post).toBeDefined();
    });
  });
});
