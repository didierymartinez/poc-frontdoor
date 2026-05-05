import { screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { ObligacionesTable } from './ObligacionesTable';

// ---------------------------------------------------------------------------
// MSW helpers — payloads basados en docs/endpoints-oxp-*.md
// ---------------------------------------------------------------------------

const EMPTY_HANDLERS = [
  http.get('*/api/radicacion/consultas/OxpComercio/Pendientes', () => HttpResponse.json([])),
  http.get('*/api/radicacion/consultas/OxpExtracto/Pendientes', () => HttpResponse.json([])),
  http.get('*/api/radicacion/consultas/Anticipo/Vigentes', () => HttpResponse.json([])),
  http.get('*/api/radicacion/consultas/Devolucion/Pendientes', () => HttpResponse.json([])),
];

/** VistaOxpComercio — basado en docs/endpoints-oxp-comercio.md (Consultas /OxpComercio/Pendientes) */
const COMERCIO_PENDIENTE = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  estado: 1,
  terceroNombre: 'Amazon.com',
  terceroIdentificacion: '900123456',
  terceroTipoIdentificacion: 'NIT',
  descripcion: 'Compra de licencias',
  valor: 1500000,
  moneda: 'COP',
  documentoNumero: 'FAC-001',
  documentoTipo: null,
  documentoFecha: '2026-03-15T00:00:00Z',
  medioPago: 'Credito',
  soportePresupuestal: null,
  referenciaContable: null,
  referenciaContableFecha: null,
  totalPagado: 0,
  saldoPorPagar: 1500000,
  bloqueadaPorRegularizacion: false,
  fechaRadicacion: '2026-03-16T10:00:00Z',
  fechaConfirmacion: null,
  fechaCausacion: null,
  fechaPago: null,
};

/** VistaDevolucion — basado en docs/endpoints-oxp-devolucion.md (Consultas /Devolucion/Pendientes) */
const DEVOLUCION_PENDIENTE = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  estado: 0,
  origen: 'Comercio',
  terceroNombre: 'Proveedor ABC',
  terceroIdentificacion: '900123456',
  terceroTipoIdentificacion: 'NIT',
  descripcion: 'Devolucion parcial por error en facturacion',
  valor: 500000,
  moneda: 'COP',
  fechaRadicacion: '2026-04-01T00:00:00Z',
  fechaConfirmacion: null,
  fechaCausacion: null,
};

/** VistaOxpExtracto — basado en docs/endpoints-oxp-extracto.md (Consultas /OxpExtracto/Pendientes) */
const EXTRACTO_PENDIENTE = {
  id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  estado: 1,
  terceroNombre: 'Bancolombia',
  terceroIdentificacion: '890903938',
  terceroTipoIdentificacion: 'NIT',
  periodoDesde: '2026-03-01',
  periodoHasta: '2026-03-31',
  medioPago: 'Credito',
  valorPartidas: 150000,
  valorCargosFinancieros: 4000,
  valorTotal: 154000,
  moneda: 'COP',
  numeroPartidas: 3,
  referenciaContable: null,
  referenciaContableFecha: null,
  totalPagado: 0,
  saldoPorPagar: 154000,
  fechaRadicacion: '2026-04-02T00:00:00Z',
  fechaConfirmacion: null,
  fechaCausacion: null,
  fechaPago: null,
};

/** VistaAnticipo — basado en docs/endpoints-oxp-anticipo.md (Consultas /Anticipo/Vigentes) */
const ANTICIPO_VIGENTE = {
  id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  estado: 1,
  terceroNombre: 'Proveedor ABC',
  terceroIdentificacion: '900123456',
  terceroTipoIdentificacion: 'NIT',
  valor: 5000000,
  moneda: 'COP',
  medioPago: 'Credito',
  justificacion: 'Anticipo por inicio de proyecto de consultoria',
  totalRegularizado: 0,
  saldoPorRegularizar: 5000000,
  totalPagado: 0,
  saldoPorPagar: 5000000,
  fechaRegistro: '2026-04-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ObligacionesTable — Tab Compras', () => {
  test('Si no hay compras pendientes, debe mostrar el empty state', async () => {
    // Arrange
    server.use(...EMPTY_HANDLERS);

    // Act
    renderWithProviders(<ObligacionesTable />);

    // Assert
    expect(await screen.findByText('Tu historial de compras está vacío')).toBeInTheDocument();
  });

  test('Si hay compras pendientes, debe mostrar todas las columnas: ID, medio, transaccion, monto, moneda, tercero, radicacion', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Pendientes', () =>
        HttpResponse.json([COMERCIO_PENDIENTE]),
      ),
      http.get('*/api/radicacion/consultas/OxpExtracto/Pendientes', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/Anticipo/Vigentes', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/Devolucion/Pendientes', () => HttpResponse.json([])),
    );

    // Act
    renderWithProviders(<ObligacionesTable />);

    // Assert — columnas: ID (truncado 13 chars), Medio, Transac., Monto, Moneda, Tercero, Radica.
    expect(await screen.findByText('Amazon.com')).toBeInTheDocument();       // terceroNombre
    expect(screen.getByText('a1b2c3d4-e5f6')).toBeInTheDocument();          // id (truncado a 13)
    expect(screen.getByText('Credito')).toBeInTheDocument();                 // medioPago
    expect(screen.getByText('COP')).toBeInTheDocument();                     // moneda
    // valor formateado con toLocaleString es-CO
    expect(screen.getByText('$1.500.000,00')).toBeInTheDocument();           // valor
  });
});

describe('ObligacionesTable — Tab Devoluciones', () => {
  test('Si hay devoluciones pendientes, debe mostrar el tercero y el origen', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Pendientes', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/OxpExtracto/Pendientes', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/Anticipo/Vigentes', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/Devolucion/Pendientes', () =>
        HttpResponse.json([DEVOLUCION_PENDIENTE]),
      ),
    );

    // Act
    renderWithProviders(<ObligacionesTable />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Devoluciones' }));

    // Assert — columnas: ID, Origen (chip), Descripcion, Monto, Moneda, Tercero, Radicacion
    expect(await screen.findByText('Proveedor ABC')).toBeInTheDocument();                          // tercero
    expect(screen.getByText('b2c3d4e5-f6a7-8901-bcde-f12345678901')).toBeInTheDocument();         // id
    expect(screen.getByText('Devolucion parcial por error en facturacion')).toBeInTheDocument();   // descripcion
    expect(screen.getByText('COP')).toBeInTheDocument();                                           // moneda
    // "Comercio" aparece como filter chip y como chip de origen en la row
    expect(screen.getAllByText('Comercio').length).toBeGreaterThanOrEqual(2);                       // origen
  });
});

describe('ObligacionesTable — Tab Extractos', () => {
  test('Si hay extractos pendientes, debe mostrar la entidad financiera', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Pendientes', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/OxpExtracto/Pendientes', () =>
        HttpResponse.json([EXTRACTO_PENDIENTE]),
      ),
      http.get('*/api/radicacion/consultas/Anticipo/Vigentes', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/Devolucion/Pendientes', () => HttpResponse.json([])),
    );

    // Act
    renderWithProviders(<ObligacionesTable />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Extractos' }));

    // Assert — columnas: ID (truncado), Entidad financiera, Medio pago, Valor extracto, Pago extracto, Periodo, Conciliacion, Radicacion
    expect(await screen.findByText('Bancolombia')).toBeInTheDocument();              // terceroNombre
    expect(screen.getByText('c3d4e5f6-a7b8')).toBeInTheDocument();                  // id (truncado a 13)
    expect(screen.getByText('Credito')).toBeInTheDocument();                         // medioPago
    expect(screen.getByText('$154.000,00')).toBeInTheDocument();                     // valorTotal
  });
});

describe('ObligacionesTable — Tab Anticipos', () => {
  test('Si hay anticipos vigentes, debe mostrar el tercero y el estado', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Pendientes', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/OxpExtracto/Pendientes', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/Anticipo/Vigentes', () =>
        HttpResponse.json([ANTICIPO_VIGENTE]),
      ),
      http.get('*/api/radicacion/consultas/Devolucion/Pendientes', () => HttpResponse.json([])),
    );

    // Act
    renderWithProviders(<ObligacionesTable />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Anticipos' }));

    // Assert — columnas: ID, Transaccion, Medio pago, Monto, Moneda, Tercero, Radicacion, Estado, Vence en
    expect(await screen.findByText('Proveedor ABC')).toBeInTheDocument();         // tercero
    expect(screen.getByText('COP')).toBeInTheDocument();                           // moneda
    // "Vigente" aparece como filter chip y como estado en la row
    expect(screen.getAllByText('Vigente').length).toBeGreaterThanOrEqual(2);        // estado
  });
});
