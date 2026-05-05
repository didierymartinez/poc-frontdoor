import { screen, waitFor, within } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, requestLog } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { ConciliarExtractoPage } from './ConciliarExtractoPage';

// ---------------------------------------------------------------------------
// Mock data — basado en docs/endpoints-oxp-extracto.md
// Extracto en estado Pendiente (estado=1) con partidas sin conciliar
// ---------------------------------------------------------------------------

const EXTRACTO_ID = 'ext-001';

/**
 * AgregadoOxpExtracto con 2 partidas en estado Pendiente (1)
 * Segun docs: partida.estado es bitwise flag (1=Pendiente, 4=Vinculada, 8=Disputa, 32=Anticipo)
 */
const EXTRACTO_PENDIENTE = {
  extracto: {
    id: EXTRACTO_ID,
    estado: 1,
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
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

/**
 * Extracto con TODAS las partidas resueltas (100% conciliación)
 * Partida p1: estado Vinculada (4), p2: estado Anticipo (32)
 */
const EXTRACTO_100_CONCILIADO = {
  extracto: {
    ...EXTRACTO_PENDIENTE.extracto,
    estado: 2,
    partidas: [
      { ...EXTRACTO_PENDIENTE.extracto.partidas[0], estado: 4 },
      { ...EXTRACTO_PENDIENTE.extracto.partidas[1], estado: 32 },
    ],
    vinculaciones: [
      { referenciaId: 'com-001', partidaId: 'p1', tipo: 0, origen: 0 },
    ] as { referenciaId: string; partidaId: string; tipo: number; origen: number }[],
    coberturasAnticipo: [
      { id: 'ca1', partidaId: 'p2', anticipoId: 'ant-001', valorCubierto: { moneda: 1, valor: 75000 } },
    ] as { id: string; partidaId: string; anticipoId: string; valorCubierto: { moneda: number; valor: number } }[],
  },
  archivo: undefined,
  fuenteTipo: 0,
  ocr: undefined,
};

/** VistaOxpComercio disponible para vincular (Causada) */
const COMERCIO_CAUSADA = {
  id: 'com-001',
  estado: 3,
  terceroNombre: 'Amazon.com',
  terceroIdentificacion: '900123456',
  terceroTipoIdentificacion: 'NIT',
  descripcion: 'Compra de licencias',
  valor: 150000,
  moneda: 'COP',
  documentoNumero: 'FAC-001',
  documentoTipo: null,
  documentoFecha: '2026-03-10T00:00:00Z',
  medioPago: 'Credito',
  soportePresupuestal: null,
  referenciaContable: null,
  referenciaContableFecha: null,
  totalPagado: 0,
  saldoPorPagar: 150000,
  bloqueadaPorRegularizacion: false,
  fechaRadicacion: '2026-03-16T00:00:00Z',
  fechaConfirmacion: '2026-03-20T00:00:00Z',
  fechaCausacion: '2026-03-21T00:00:00Z',
  fechaPago: null,
};

/** VistaAnticipo disponible para cubrir */
const ANTICIPO_VIGENTE = {
  id: 'ant-001',
  estado: 1,
  terceroNombre: 'Amazon.com',
  terceroIdentificacion: '900123456',
  terceroTipoIdentificacion: 'NIT',
  valor: 75000,
  moneda: 'COP',
  medioPago: 'Credito',
  justificacion: 'Anticipo por consultoria',
  totalRegularizado: 0,
  saldoPorRegularizar: 75000,
  totalPagado: 0,
  saldoPorPagar: 75000,
  fechaRegistro: '2026-04-01T00:00:00Z',
};

/** VistaDevolucion disponible para cubrir */
const DEVOLUCION_PENDIENTE = {
  id: 'dev-001',
  estado: 0,
  origen: 'Comercio',
  terceroNombre: 'Amazon.com',
  terceroIdentificacion: '900123456',
  terceroTipoIdentificacion: 'NIT',
  descripcion: 'Devolucion parcial por error',
  valor: 50000,
  moneda: 'COP',
  fechaRadicacion: '2026-04-01T00:00:00Z',
  fechaConfirmacion: null,
  fechaCausacion: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupHandlers(extracto: any) {
  server.use(
    http.get(`*/api/radicacion/consultas/OxPExtracto/${EXTRACTO_ID}`, () =>
      HttpResponse.json(extracto),
    ),
    // Comercios para vincular (Causadas)
    http.get('*/api/radicacion/consultas/OxpComercio/Causadas', () =>
      HttpResponse.json([COMERCIO_CAUSADA]),
    ),
    // Anticipos para cubrir
    http.get('*/api/radicacion/consultas/Anticipo/Vigentes', () =>
      HttpResponse.json([ANTICIPO_VIGENTE]),
    ),
    // Devoluciones para cubrir
    http.get('*/api/radicacion/consultas/Devolucion/Pendientes', () =>
      HttpResponse.json([DEVOLUCION_PENDIENTE]),
    ),
    // Mutations
    http.post(`*/api/radicacion/comandos/OxpExtracto/${EXTRACTO_ID}/Vinculacion`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
    http.post(`*/api/radicacion/comandos/OxpExtracto/${EXTRACTO_ID}/Partidas/CubrirConAnticipo`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
    http.post(`*/api/radicacion/comandos/OxpExtracto/${EXTRACTO_ID}/Partidas/CubrirConDevolucion`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
    http.post(`*/api/radicacion/comandos/OxpExtracto/${EXTRACTO_ID}/Partidas/Disputa`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
    http.post(`*/api/radicacion/comandos/OxpExtracto/${EXTRACTO_ID}/Confirmar`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
  );
}

function renderPage() {
  return renderWithProviders(<ConciliarExtractoPage />, {
    path: 'conciliar-extracto/:id',
    route: `/conciliar-extracto/${EXTRACTO_ID}`,
  });
}

// ---------------------------------------------------------------------------
// Tests de integración — Conciliación de Extracto
// ---------------------------------------------------------------------------

describe('ConciliarExtractoPage — Carga inicial', () => {
  test('Si el extracto tiene partidas pendientes, debe mostrar la tabla con estado "Por asignar" y progreso 0%', async () => {
    // Arrange
    setupHandlers(EXTRACTO_PENDIENTE);

    // Act
    renderPage();

    // Assert — partidas visibles con sus descripciones
    expect(await screen.findByText('AMZN*1X2Y3Z SEATTLE')).toBeInTheDocument();
    expect(screen.getByText('UBER*TRIP BOGOTA')).toBeInTheDocument();

    // Progreso 0% (ninguna partida resuelta)
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });
});

describe('ConciliarExtractoPage — Vincular partida a comercio (R06)', () => {
  test('Si el usuario vincula una partida a un comercio, debe enviar POST /Vinculacion con partidaId y oxpComercioId', async () => {
    // Arrange
    setupHandlers(EXTRACTO_PENDIENTE);
    renderPage();
    const user = userEvent.setup();

    // Act — esperar que cargue, click en estado "Por asignar" de la primera partida
    await screen.findByText('AMZN*1X2Y3Z SEATTLE');
    const porAsignar = screen.getAllByText('Por asignar');
    await user.click(porAsignar[0]);

    // Click en "Vincular compra" del menú contextual
    const vincularCompra = await screen.findByText('Vincular compra');
    await user.click(vincularCompra);

    // En el diálogo, esperar que cargue la lista de comercios y seleccionar
    const comercioOption = await screen.findByText(/Amazon.com/);
    await user.click(comercioOption);

    // Click en "Vincular"
    const botonVincular = await screen.findByRole('button', { name: /Vincular/i });
    await user.click(botonVincular);

    // Assert — se envió POST /Vinculacion
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/Vinculacion'),
      );
      expect(post).toBeDefined();
      const body = post!.body as Record<string, unknown>;
      expect(body.partidaId).toBe('p1');
      expect(body.oxpComercioId).toBe('com-001');
    });
  });
});

describe('ConciliarExtractoPage — Cubrir con anticipo (R08)', () => {
  test('Si el usuario cubre una partida con anticipo, debe enviar POST /CubrirConAnticipo', async () => {
    // Arrange
    setupHandlers(EXTRACTO_PENDIENTE);
    renderPage();
    const user = userEvent.setup();

    // Act — click en estado de la segunda partida
    await screen.findByText('UBER*TRIP BOGOTA');
    const porAsignar = screen.getAllByText('Por asignar');
    await user.click(porAsignar[1]);

    // Click en "Vincular anticipo"
    const vincularAnticipo = await screen.findByText('Vincular anticipo');
    await user.click(vincularAnticipo);

    // Seleccionar anticipo disponible
    const anticipoOption = await screen.findByText(/Amazon.com/);
    await user.click(anticipoOption);

    // Assert — se envió POST /CubrirConAnticipo
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/CubrirConAnticipo'),
      );
      expect(post).toBeDefined();
      const body = post!.body as Record<string, unknown>;
      expect(body.partidaId).toBe('p2');
      expect(body.anticipoId).toBe('ant-001');
    });
  });
});

describe('ConciliarExtractoPage — Cubrir con devolución', () => {
  test('Si el usuario cubre una partida con devolución, debe enviar POST /CubrirConDevolucion', async () => {
    // Arrange
    setupHandlers(EXTRACTO_PENDIENTE);
    renderPage();
    const user = userEvent.setup();

    // Act — click en estado de la primera partida
    await screen.findByText('AMZN*1X2Y3Z SEATTLE');
    const porAsignar = screen.getAllByText('Por asignar');
    await user.click(porAsignar[0]);

    // Click en "Vincular devolución"
    const vincularDevolucion = await screen.findByText('Vincular devolución');
    await user.click(vincularDevolucion);

    // Seleccionar devolución disponible
    const devolucionOption = await screen.findByText(/Amazon.com/);
    await user.click(devolucionOption);

    // Assert — se envió POST /CubrirConDevolucion
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/CubrirConDevolucion'),
      );
      expect(post).toBeDefined();
      const body = post!.body as Record<string, unknown>;
      expect(body.partidaId).toBe('p1');
      expect(body.devolucionId).toBe('dev-001');
    });
  });
});

describe('ConciliarExtractoPage — Marcar disputa (R06b)', () => {
  test('Si el usuario marca una partida en disputa, debe enviar POST /Disputa con motivo', async () => {
    // Arrange
    setupHandlers(EXTRACTO_PENDIENTE);
    renderPage();
    const user = userEvent.setup();

    // Act — click en estado de la primera partida
    await screen.findByText('AMZN*1X2Y3Z SEATTLE');
    const porAsignar = screen.getAllByText('Por asignar');
    await user.click(porAsignar[0]);

    // Click en "Marcar partida en disputa"
    const marcarDisputa = await screen.findByText(/Marcar partida en disputa/i);
    await user.click(marcarDisputa);

    // En el diálogo de disputa, abrir el select de motivo y elegir
    const dialog = await screen.findByRole('dialog');
    const motivoSelect = within(dialog).getByRole('combobox');
    await user.click(motivoSelect);
    await user.click(await screen.findByText('Error bancario'));

    // Confirmar
    const botonConfirmar = screen.getByRole('button', { name: /Confirmar/i });
    await user.click(botonConfirmar);

    // Assert — se envió POST /Disputa con motivo 0 (ErrorBancario)
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/Disputa'),
      );
      expect(post).toBeDefined();
      const body = post!.body as Record<string, unknown>;
      expect(body.partidaId).toBe('p1');
      expect(body.motivo).toBe(0);
    });
  });
});

describe('ConciliarExtractoPage — Confirmar extracto (R06)', () => {
  test('Si todas las partidas estan resueltas (100%), debe habilitar "Enviar a confirmación" y enviar POST /Confirmar', async () => {
    // Arrange — extracto con todas las partidas conciliadas
    setupHandlers(EXTRACTO_100_CONCILIADO);
    renderPage();
    const user = userEvent.setup();

    // Act — esperar que cargue
    await screen.findByText('AMZN*1X2Y3Z SEATTLE');

    // Progreso debe ser 100%
    expect(screen.getByText(/100%/)).toBeInTheDocument();

    // Click en "Enviar a confirmación" (debe estar habilitado)
    const botonConfirmar = screen.getByRole('button', { name: /Enviar a confirmación/i });
    expect(botonConfirmar).not.toBeDisabled();
    await user.click(botonConfirmar);

    // Assert — se envió POST /Confirmar
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/Confirmar'),
      );
      expect(post).toBeDefined();
    });
  });

  test('Si no todas las partidas estan resueltas, debe deshabilitar "Enviar a confirmación"', async () => {
    // Arrange — extracto con partidas pendientes (0% conciliado)
    setupHandlers(EXTRACTO_PENDIENTE);

    // Act
    renderPage();

    // Assert — botón deshabilitado
    await screen.findByText('AMZN*1X2Y3Z SEATTLE');
    const botonConfirmar = screen.getByRole('button', { name: /Enviar a confirmación/i });
    expect(botonConfirmar).toBeDisabled();
  });
});
