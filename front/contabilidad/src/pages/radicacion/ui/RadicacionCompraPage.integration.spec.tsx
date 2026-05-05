import { screen, within, waitFor } from '@testing-library/react';
import { expect, test, describe, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, requestLog } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { useRegistroCompraStore } from '@/features/registrar-compra';
import { RadicacionCompraPage } from './RadicacionCompraPage';

// ---------------------------------------------------------------------------
// Mock data — basado en docs/endpoints-oxp-comercio.md
// GET /api/radicacion/consultas/OxpComercio/{id} → BorradorComercioDetalle
// ---------------------------------------------------------------------------

const OXP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

/**
 * AgregadoOxpComercio completo en estado Borrador (estado=0)
 * Estructura segun docs/endpoints-oxp-comercio.md y borrador-api.types.ts
 */
const BORRADOR_COMPLETO = {
  comercio: {
    id: OXP_ID,
    estado: 0,
    informacionTercero: {
      nombre: 'Amazon.com',
      identificacion: { tipo: 'NIT', numero: '900123456' },
    },
    descripcion: 'Compra de licencias de software',
    valorMonetario: { moneda: 1, valor: 500000 },
    conceptos: [
      {
        id: 'c1',
        codigo: 'SRV-001',
        descripcion: 'Servicio de consultoria',
        cantidad: 1,
        dinero: { moneda: 1, valor: 500000 },
        tipo: 0,
        clasificacionTributaria: 'Gravado',
        conceptoPago: 'Servicios',
        referenciaOrigen: 'FAC-2026-001',
        desgloseFiscal: {
          impuestos: [
            { tipo: 'IVA', base: { moneda: 1, valor: 500000 }, tarifa: 0.19, valor: { moneda: 1, valor: 95000 } },
          ],
          retenciones: [
            { tipo: 'ReteFuente', base: { moneda: 1, valor: 500000 }, tarifa: 0.11, valor: { moneda: 1, valor: 55000 } },
          ],
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
    motivoDevolucion: null,
    motivoDescarte: null,
    evidencia: null,
    tasaRepresentativaMercado: null,
    soportePresupuestal: null,
    referenciaSistemaContable: null,
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

/** Borrador con campos vacios — simula un borrador recien creado sin completar */
const BORRADOR_INCOMPLETO = {
  comercio: {
    ...BORRADOR_COMPLETO.comercio,
    informacionTercero: { nombre: '', identificacion: { tipo: '', numero: '' } },
    descripcion: '',
    valorMonetario: { moneda: 1, valor: 0 },
    conceptos: [],
    medioPago: { tipo: 0, numero: '', entidadBancaria: '' },
    documento: { numero: '', tipo: 0, fecha: '' },
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Borrador donde monto (500000) no coincide con el total del concepto (300000) */
const BORRADOR_MONTO_MISMATCH = {
  comercio: {
    ...BORRADOR_COMPLETO.comercio,
    valorMonetario: { moneda: 1, valor: 500000 },
    conceptos: [
      {
        ...BORRADOR_COMPLETO.comercio.conceptos[0],
        dinero: { moneda: 1, valor: 300000 },
      },
    ],
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

function setupHandlers(borrador: typeof BORRADOR_COMPLETO) {
  server.use(
    http.get(`*/api/radicacion/consultas/OxpComercio/${OXP_ID}`, () =>
      HttpResponse.json(borrador),
    ),
    http.post(`*/api/radicacion/comandos/OxpComercio/${OXP_ID}/CompletarBorrador`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
    http.post(`*/api/radicacion/comandos/OxpComercio/${OXP_ID}/DescartarBorrador`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
  );
}

function renderPage() {
  return renderWithProviders(<RadicacionCompraPage />, {
    path: 'registro-compra/:id',
    route: `/registro-compra/${OXP_ID}`,
  });
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  useRegistroCompraStore.getState().reset();
});

// ---------------------------------------------------------------------------
// Tests de integración — flujo Radicación → CompletarBorrador
// ---------------------------------------------------------------------------

describe('RadicacionCompraPage — Integración flujo CompletarBorrador', () => {
  test('Si el borrador tiene todos los campos completos y el usuario click "Enviar a confirmación", debe enviar POST /CompletarBorrador con el payload segun docs/endpoints-oxp-comercio.md', async () => {
    // Arrange
    setupHandlers(BORRADOR_COMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act — esperar que cargue el formulario y hacer click en enviar
    const botonEnviar = await screen.findByTestId('enviar-confirmacion-button');
    await user.click(botonEnviar);

    // Assert — verificar que se envió POST /CompletarBorrador
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/CompletarBorrador'),
      );
      expect(post).toBeDefined();

      const body = post!.body as Record<string, unknown>;

      // valor (segun docs: valorMonetario con moneda y valor)
      expect(body.valor).toEqual(expect.objectContaining({ moneda: 1, valor: 500000 }));

      // informacionTercero (segun docs: nombre + identificacion)
      expect(body.informacionTercero).toEqual(expect.objectContaining({
        nombre: 'Amazon.com',
        identificacion: expect.objectContaining({ tipo: 'NIT', numero: '900123456' }),
      }));

      // descripcion
      expect(body.descripcion).toBe('Compra de licencias de software');

      // conceptos (segun docs: al menos 1 con id, codigo, descripcion, cantidad, dinero)
      const conceptos = body.conceptos as Array<Record<string, unknown>>;
      expect(conceptos).toHaveLength(1);
      expect(conceptos[0]).toEqual(expect.objectContaining({
        id: 'c1',
        codigo: 'SRV-001',
        descripcion: 'Servicio de consultoria',
        cantidad: 1,
        dinero: expect.objectContaining({ moneda: 1, valor: 500000 }),
      }));

      // medioPago (segun docs: tipo 0=Credito, numero, entidadBancaria)
      expect(body.medioPago).toEqual(expect.objectContaining({
        tipo: 0,
        numero: '4111111111111111',
        entidadBancaria: 'Bancolombia',
      }));

      // documento (segun docs: numero, fecha en ISO datetime)
      expect(body.documento).toEqual(expect.objectContaining({
        numero: 'FAC-001',
      }));
    });
  });

  test('Si el borrador tiene campos vacios y el usuario click "Enviar a confirmación", debe NO enviar la petición', async () => {
    // Arrange
    setupHandlers(BORRADOR_INCOMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act
    const botonEnviar = await screen.findByTestId('enviar-confirmacion-button');
    await user.click(botonEnviar);

    // Assert — no se debe enviar POST /CompletarBorrador
    const post = requestLog.find(
      (r) => r.method === 'POST' && r.url.includes('/CompletarBorrador'),
    );
    expect(post).toBeUndefined();
  });

  test('Si el usuario modifica el medio de pago en el formulario y hace submit, debe enviar el valor actualizado al backend', async () => {
    // Arrange
    setupHandlers(BORRADOR_COMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act — esperar que cargue, cambiar medio de pago de Crédito a Débito
    const medioPagoField = await screen.findByTestId('combobox-medio-pago');
    const selectInput = within(medioPagoField).getByRole('combobox');
    await user.click(selectInput);
    await user.click(await screen.findByText('Débito'));

    // Click enviar
    const botonEnviar = screen.getByTestId('enviar-confirmacion-button');
    await user.click(botonEnviar);

    // Assert — medioPago.tipo debe ser 1 (Debito) en el payload, no 0 (Credito)
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/CompletarBorrador'),
      );
      expect(post).toBeDefined();
      const body = post!.body as Record<string, unknown>;
      const medioPago = body.medioPago as Record<string, unknown>;
      expect(medioPago.tipo).toBe(1); // Debito = 1
    });
  });
});

describe('RadicacionCompraPage — Descartar borrador', () => {
  test('Si el usuario descarta el borrador con motivo y observacion, debe enviar POST /DescartarBorrador', async () => {
    // Arrange
    setupHandlers(BORRADOR_COMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act — click en "Descartar" para abrir el diálogo
    const botonDescartar = await screen.findByRole('button', { name: 'Descartar' });
    await user.click(botonDescartar);

    // Seleccionar motivo en el diálogo
    const motivoSelect = await screen.findByLabelText(/Motivo de descarte/i);
    await user.click(motivoSelect);
    await user.click(await screen.findByText('Información incorrecta'));

    // Escribir observación (en el diálogo, distinguir por placeholder)
    const observacionInput = screen.getByPlaceholderText('Escribe un comentario sobre ...');
    await user.type(observacionInput, 'Datos del proveedor incorrectos');

    // Confirmar descarte
    const botonConfirmar = screen.getByRole('button', { name: 'Descartar' });
    await user.click(botonConfirmar);

    // Assert — se envió POST /DescartarBorrador con motivo
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/DescartarBorrador'),
      );
      expect(post).toBeDefined();
      const body = post!.body as Record<string, unknown>;
      expect(body.motivo).toBe('Información incorrecta');
    });
  });
});

describe('RadicacionCompraPage — Monto vs Total mismatch', () => {
  test('Si el monto del formulario no coincide con el total de conceptos, debe mostrar el dialogo de mismatch', async () => {
    // Arrange
    setupHandlers(BORRADOR_MONTO_MISMATCH);
    renderPage();
    const user = userEvent.setup();

    // Act — esperar que cargue y hacer click en enviar
    const botonEnviar = await screen.findByTestId('enviar-confirmacion-button');
    await user.click(botonEnviar);

    // Assert — debe aparecer el diálogo de mismatch
    expect(await screen.findByText('Monto no coincide con el total')).toBeInTheDocument();

    // Assert — no se envió POST /CompletarBorrador (mismatch bloquea)
    const post = requestLog.find(
      (r) => r.method === 'POST' && r.url.includes('/CompletarBorrador'),
    );
    expect(post).toBeUndefined();
  });

  test('Si el usuario acepta "Actualizar monto" en el dialogo de mismatch, debe enviar POST /CompletarBorrador con el monto corregido', async () => {
    // Arrange
    setupHandlers(BORRADOR_MONTO_MISMATCH);
    renderPage();
    const user = userEvent.setup();

    // Act — enviar para provocar mismatch
    const botonEnviar = await screen.findByTestId('enviar-confirmacion-button');
    await user.click(botonEnviar);

    // Click "Actualizar monto" en el diálogo
    const botonActualizar = await screen.findByRole('button', { name: 'Actualizar monto' });
    await user.click(botonActualizar);

    // Assert — se envió POST /CompletarBorrador con el monto del total de conceptos (300000)
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/CompletarBorrador'),
      );
      expect(post).toBeDefined();
      const body = post!.body as Record<string, unknown>;
      const valor = body.valor as Record<string, unknown>;
      expect(valor.valor).toBe(300000);
    });
  });
});

describe('RadicacionCompraPage — Error 422 del backend', () => {
  test('Si el backend responde 422 al completar borrador, debe NO navegar y el formulario debe permanecer visible', async () => {
    // Arrange — handler que devuelve 422 RFC 7807
    server.use(
      http.get(`*/api/radicacion/consultas/OxpComercio/${OXP_ID}`, () =>
        HttpResponse.json(BORRADOR_COMPLETO),
      ),
      http.post(`*/api/radicacion/comandos/OxpComercio/${OXP_ID}/CompletarBorrador`, () =>
        HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Business Rule Violation',
            status: 422,
            detail: 'La OXP requiere al menos un concepto con clasificación tributaria',
          },
          { status: 422 },
        ),
      ),
    );
    renderPage();
    const user = userEvent.setup();

    // Act
    const botonEnviar = await screen.findByTestId('enviar-confirmacion-button');
    await user.click(botonEnviar);

    // Assert — el formulario sigue visible (no navegó)
    await waitFor(() => {
      expect(screen.getByTestId('enviar-confirmacion-button')).toBeInTheDocument();
      expect(screen.getByTestId('combobox-medio-pago')).toBeInTheDocument();
    });
  });
});
