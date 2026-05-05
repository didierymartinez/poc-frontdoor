import { screen, waitFor } from '@testing-library/react';
import { expect, test, describe, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, requestLog } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { useRegistroAnticipoStore } from '@/features/registrar-anticipo';
import { RadicacionAnticipoPage } from './RadicacionAnticipoPage';

// ---------------------------------------------------------------------------
// Mock data — basado en docs/endpoints-oxp-anticipo.md
// GET /api/radicacion/consultas/Anticipo/{id} → AnticipoDetalle
// ---------------------------------------------------------------------------

const ANTICIPO_ID = 'd4e5f6a7-b8c9-0123-defa-234567890123';

/**
 * AgregadoAnticipo completo en estado Borrador (estado=0)
 * Estructura segun docs/endpoints-oxp-anticipo.md:
 * - informacionTercero: { nombre, identificacion: { tipo, numero } }
 * - valorMonetario: { moneda (1=COP), valor }
 * - medioPago: { tipo (0=Credito), numero, entidadBancaria }
 * - justificacion: motivo del anticipo
 * - instruccionDistribucion: destinos de costo
 */
const ANTICIPO_BORRADOR_COMPLETO = {
  anticipo: {
    id: ANTICIPO_ID,
    estado: 0,
    informacionTercero: {
      nombre: 'Proveedor ABC',
      identificacion: { tipo: 'NIT', numero: '900123456' },
    },
    valorMonetario: { moneda: 1, valor: 5000000 },
    valorTotal: null,
    medioPago: { tipo: 0, numero: '4111111111111111', entidadBancaria: 'Bancolombia' },
    soporte: null,
    justificacion: 'Anticipo por inicio de proyecto de consultoria',
    fecha: '2026-04-01T00:00:00Z',
    motivoDescarte: null,
    instruccionDistribucion: [],
    crucesRegularizacion: [],
    crucesPagoAplicados: [],
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

/** Borrador sin campos obligatorios — simula borrador recien creado */
const ANTICIPO_BORRADOR_INCOMPLETO = {
  anticipo: {
    ...ANTICIPO_BORRADOR_COMPLETO.anticipo,
    informacionTercero: { nombre: '', identificacion: { tipo: '', numero: '' } },
    valorMonetario: { moneda: 1, valor: 0 },
    medioPago: { tipo: 0, numero: '', entidadBancaria: '' },
    justificacion: null,
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

/** Borrador sin descripcion pero con soporte — regla R03: descripcion XOR soporte */
const ANTICIPO_SIN_DESCRIPCION_CON_SOPORTE = {
  anticipo: {
    ...ANTICIPO_BORRADOR_COMPLETO.anticipo,
    justificacion: null,
    soporte: { container: 'soportes', key: '2026/04/soporte.pdf' } as { container: string; key: string } | null,
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupHandlers(detalle: any) {
  server.use(
    http.get(`*/api/radicacion/consultas/Anticipo/${ANTICIPO_ID}`, () =>
      HttpResponse.json(detalle),
    ),
    http.post(`*/api/radicacion/comandos/Anticipo/${ANTICIPO_ID}/Completar`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
    http.post(`*/api/radicacion/comandos/Anticipo/${ANTICIPO_ID}/DescartarBorrador`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
  );
}

function renderPage() {
  return renderWithProviders(<RadicacionAnticipoPage />, {
    path: 'registro-anticipo/:id',
    route: `/registro-anticipo/${ANTICIPO_ID}`,
  });
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  useRegistroAnticipoStore.getState().reset();
});

// ---------------------------------------------------------------------------
// Tests de integración — flujo Radicación Anticipo
// ---------------------------------------------------------------------------

describe('RadicacionAnticipoPage — Completar borrador', () => {
  test('Si el borrador tiene todos los campos completos, debe enviar POST /Completar con el payload segun docs/endpoints-oxp-anticipo.md', async () => {
    // Arrange
    setupHandlers(ANTICIPO_BORRADOR_COMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act
    const botonEnviar = await screen.findByRole('button', { name: /Enviar a confirmación/i });
    await user.click(botonEnviar);

    // Assert — verificar POST /Completar con payload correcto
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/Completar'),
      );
      expect(post).toBeDefined();

      const body = post!.body as Record<string, unknown>;

      // informacionTercero (segun docs: nombre + identificacion)
      expect(body.informacionTercero).toEqual(expect.objectContaining({
        nombre: 'Proveedor ABC',
        identificacion: expect.objectContaining({ tipo: 'NIT', numero: '900123456' }),
      }));

      // valorMonetario (segun docs: moneda + valor)
      expect(body.valorMonetario).toEqual(expect.objectContaining({ moneda: 1, valor: 5000000 }));

      // medioPago (segun docs: tipo 0=Credito, numero, entidadBancaria)
      expect(body.medioPago).toEqual(expect.objectContaining({
        tipo: 0,
        entidadBancaria: 'Bancolombia',
      }));

      // justificacion
      expect(body.justificacion).toBe('Anticipo por inicio de proyecto de consultoria');
    });
  });

  test('Si el borrador tiene campos vacios y el usuario click "Enviar a confirmación", debe NO enviar la petición', async () => {
    // Arrange
    setupHandlers(ANTICIPO_BORRADOR_INCOMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act
    const botonEnviar = await screen.findByRole('button', { name: /Enviar a confirmación/i });
    await user.click(botonEnviar);

    // Assert — no se envia POST
    const post = requestLog.find(
      (r) => r.method === 'POST' && r.url.includes('/Completar'),
    );
    expect(post).toBeUndefined();
  });
});

describe('RadicacionAnticipoPage — Regla R03: descripcion XOR soporte', () => {
  test('Si el borrador tiene soporte en el backend pero el usuario no adjunta archivo ni escribe descripcion, debe bloquear el envio', async () => {
    // Arrange — borrador con soporte en backend (soporte: {container, key}) pero sin justificacion
    // COMPORTAMIENTO DOCUMENTADO: el soporte del borrador NO se mapea al archivoSoporte del store
    // La validación solo considera: formulario.archivoSoporte (File del store) O descripcion (texto)
    // Si el borrador ya tiene soporte en el backend, el usuario igual debe escribir descripcion
    // o adjuntar un nuevo archivo para que la validación R03 pase
    setupHandlers(ANTICIPO_SIN_DESCRIPCION_CON_SOPORTE);
    renderPage();
    const user = userEvent.setup();

    // Act
    const botonEnviar = await screen.findByRole('button', { name: /Enviar a confirmación/i });
    await user.click(botonEnviar);

    // Assert — la validación bloquea porque:
    // 1. descripcion está vacía (justificacion: null en el borrador)
    // 2. archivoSoporte es null en el store (soporte del borrador no se sincroniza)
    const post = requestLog.find(
      (r) => r.method === 'POST' && r.url.includes('/Completar'),
    );
    expect(post).toBeUndefined();
  });

  test('Si el borrador tiene descripcion completa, debe enviar sin necesidad de soporte (regla R03)', async () => {
    // Arrange — borrador con justificacion, sin soporte → R03 se satisface con descripcion
    setupHandlers(ANTICIPO_BORRADOR_COMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act
    const botonEnviar = await screen.findByRole('button', { name: /Enviar a confirmación/i });
    await user.click(botonEnviar);

    // Assert — descripcion presente → validación R03 pasa → se envía POST
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/Completar'),
      );
      expect(post).toBeDefined();
      const body = post!.body as Record<string, unknown>;
      expect(body.justificacion).toBe('Anticipo por inicio de proyecto de consultoria');
    });
  });
});

describe('RadicacionAnticipoPage — Descartar borrador', () => {
  test('Si el usuario descarta el borrador con motivo, debe enviar POST /DescartarBorrador', async () => {
    // Arrange
    setupHandlers(ANTICIPO_BORRADOR_COMPLETO);
    renderPage();
    const user = userEvent.setup();

    // Act — click en Descartar para abrir diálogo
    const botonDescartar = await screen.findByRole('button', { name: 'Descartar' });
    await user.click(botonDescartar);

    // Seleccionar motivo
    const motivoSelect = await screen.findByLabelText(/Motivo de descarte/i);
    await user.click(motivoSelect);
    await user.click(await screen.findByText('Información incorrecta'));

    // Escribir observación (en el diálogo, por placeholder)
    const observacionInput = screen.getByPlaceholderText('Escribe un comentario sobre ...');
    await user.type(observacionInput, 'Proveedor no corresponde');

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
