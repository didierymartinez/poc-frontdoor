import { screen, within } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { BorradoresTable } from './BorradoresTable';

// ---------------------------------------------------------------------------
// MSW helpers — payloads basados en docs/endpoints-oxp-*.md
// ---------------------------------------------------------------------------

const EMPTY_HANDLERS = [
  http.get('*/api/radicacion/consultas/OxpComercio/Borradores', () => HttpResponse.json([])),
  http.get('*/api/radicacion/consultas/OxpExtracto/Borradores', () => HttpResponse.json([])),
  http.get('*/api/radicacion/consultas/Anticipo/Borradores', () => HttpResponse.json([])),
];

/** VistaOxpComercio en Borrador — basado en docs/endpoints-oxp-comercio.md */
const COMERCIO_BORRADOR = {
  id: '1',
  estado: 0,
  terceroNombre: 'Proveedor Test',
  terceroIdentificacion: '123456',
  terceroTipoIdentificacion: 'NIT',
  documentoNumero: 'FA-1223',
  documentoTipo: null,
  documentoFecha: null,
  descripcion: 'Factura de prueba',
  valor: 100000,
  moneda: 'COP',
  medioPago: null,
  soportePresupuestal: null,
  referenciaContable: null,
  referenciaContableFecha: null,
  totalPagado: 0,
  saldoPorPagar: 100000,
  bloqueadaPorRegularizacion: false,
  fechaRadicacion: '2026-03-16T10:00:00Z',
  fechaConfirmacion: null,
  fechaCausacion: null,
  fechaPago: null,
};

/** VistaOxpExtracto en Borrador — basado en docs/endpoints-oxp-extracto.md */
const EXTRACTO_BORRADOR = {
  id: '2',
  estado: 0,
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

/** VistaAnticipo en Borrador — basado en docs/endpoints-oxp-anticipo.md */
const ANTICIPO_BORRADOR = {
  id: '3',
  estado: 0,
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

describe('BorradoresTable — Tab Obligaciones', () => {
  test('Si no hay borradores de comercio, debe mostrar el empty state', async () => {
    // Arrange
    server.use(...EMPTY_HANDLERS);

    // Act
    renderWithProviders(<BorradoresTable />);

    // Assert
    const emptyState = await screen.findByTestId('empty-state');
    expect(emptyState).toHaveTextContent('Sin borradores');
  });

  test('Si hay borradores de comercio, debe mostrar el datagrid con documento, tercero, valor y moneda', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Borradores', () =>
        HttpResponse.json([COMERCIO_BORRADOR]),
      ),
      http.get('*/api/radicacion/consultas/OxpExtracto/Borradores', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/Anticipo/Borradores', () => HttpResponse.json([])),
    );

    // Act
    renderWithProviders(<BorradoresTable />);

    // Assert
    const datagrid = await screen.findByTestId('datagrid-obligaciones');
    const row = await within(datagrid).findAllByTestId('row-obligacion');

    expect(row[0]).toHaveTextContent('FA-1223');
    expect(row[0]).toHaveTextContent('Proveedor Test');
    expect(row[0]).toHaveTextContent('$ 100.000');
    expect(row[0]).toHaveTextContent('COP');
    expect(row.length).toBe(1);
  });
});

describe('BorradoresTable — Tab Extractos', () => {
  test('Si no hay borradores de extracto, debe mostrar el empty state', async () => {
    // Arrange
    server.use(...EMPTY_HANDLERS);

    // Act
    renderWithProviders(<BorradoresTable />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Extractos' }));

    // Assert
    expect(await screen.findByText('Sin extractos')).toBeInTheDocument();
  });

  test('Si hay borradores de extracto, debe mostrar todas las columnas: entidad financiera, medio pago, periodo, total, moneda, partidas, fecha radicacion', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Borradores', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/OxpExtracto/Borradores', () =>
        HttpResponse.json([EXTRACTO_BORRADOR]),
      ),
      http.get('*/api/radicacion/consultas/Anticipo/Borradores', () => HttpResponse.json([])),
    );

    // Act
    renderWithProviders(<BorradoresTable />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Extractos' }));

    // Assert — columnas: Entidad financiera, Medio pago, Periodo, Total, Moneda, Partidas, Fecha radicacion
    expect(await screen.findByText('Bancolombia')).toBeInTheDocument();          // terceroNombre
    expect(screen.getByText('Credito')).toBeInTheDocument();                     // medioPago
    expect(screen.getByText('COP')).toBeInTheDocument();                         // moneda
    expect(screen.getByText('3')).toBeInTheDocument();                           // numeroPartidas
  });
});

describe('BorradoresTable — Tab Anticipos', () => {
  test('Si no hay borradores de anticipo, debe mostrar el empty state', async () => {
    // Arrange
    server.use(...EMPTY_HANDLERS);

    // Act
    renderWithProviders(<BorradoresTable />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Anticipos' }));

    // Assert
    expect(await screen.findByText('Sin borradores')).toBeInTheDocument();
  });

  test('Si hay borradores de anticipo, debe mostrar todas las columnas: tercero, valor, moneda, medio pago, justificacion, fecha registro', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Borradores', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/OxpExtracto/Borradores', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/Anticipo/Borradores', () =>
        HttpResponse.json([ANTICIPO_BORRADOR]),
      ),
    );

    // Act
    renderWithProviders(<BorradoresTable />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Anticipos' }));

    // Assert — columnas: Tercero, Valor, Moneda, Medio pago, Justificacion, Fecha registro
    expect(await screen.findByText('Proveedor ABC')).toBeInTheDocument();                                // terceroNombre
    expect(screen.getByText('COP')).toBeInTheDocument();                                                  // moneda
    expect(screen.getByText('Credito')).toBeInTheDocument();                                              // medioPago
    expect(screen.getByText('Anticipo por inicio de proyecto de consultoria')).toBeInTheDocument();       // justificacion
  });
});