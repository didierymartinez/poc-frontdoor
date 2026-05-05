import { screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { ConfirmacionTable } from './ConfirmacionTable';

// ---------------------------------------------------------------------------
// MSW helpers — payloads basados en docs/endpoints-oxp-*.md
// ---------------------------------------------------------------------------

/** VistaOxpComercio en estado Confirmada — basado en docs/endpoints-oxp-comercio.md */
const COMERCIO_CONFIRMADA = {
  id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
  estado: 2,
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
  fechaConfirmacion: '2026-03-20T14:00:00Z',
  fechaCausacion: null,
  fechaPago: null,
};

/** VistaExtractoConciliacion — basado en docs/endpoints-oxp-extracto.md (Consultas /OxpExtracto/EnConciliacion) */
const EXTRACTO_EN_CONCILIACION = {
  id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  estado: 3,
  terceroNombre: 'Bancolombia',
  terceroIdentificacion: '890903938',
  terceroTipoIdentificacion: 'NIT',
  periodoDesde: '2026-03-01',
  periodoHasta: '2026-03-31',
  medioPagoTipo: 'Credito',
  medioPagoNumero: '4111111111111111',
  entidadBancaria: 'Bancolombia',
  valorPartidas: 750000,
  moneda: 'COP',
  totalPartidas: 5,
  partidasResueltas: 3,
  porcentajeConciliacion: 60,
  fechaRadicacion: '2026-04-02T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ConfirmacionTable — Tab Obligaciones', () => {
  test('Si no hay obligaciones confirmadas, debe mostrar el empty state', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Confirmadas', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/OxpExtracto/EnConciliacion', () => HttpResponse.json([])),
    );

    // Act
    renderWithProviders(<ConfirmacionTable />);

    // Assert
    expect(await screen.findByText('Sin obligaciones')).toBeInTheDocument();
  });

  test('Si hay obligaciones confirmadas, debe mostrar todas las columnas: ID, tipo, transaccion, tercero, monto, moneda, radicacion', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Confirmadas', () =>
        HttpResponse.json([COMERCIO_CONFIRMADA]),
      ),
      http.get('*/api/radicacion/consultas/OxpExtracto/EnConciliacion', () => HttpResponse.json([])),
    );

    // Act
    renderWithProviders(<ConfirmacionTable />);

    // Assert — columnas: ID (truncado 18), Tipo, Transaccion, Tercero, Monto, Moneda, Radicacion, Acciones
    expect(await screen.findByText('Amazon.com')).toBeInTheDocument();               // terceroNombre
    expect(screen.getByText('e5f6a7b8-c9d0-1234')).toBeInTheDocument();             // id (truncado a 18)
    expect(screen.getByText('COP')).toBeInTheDocument();                             // moneda
    expect(screen.getByText('$1.500.000,00')).toBeInTheDocument();                   // valor formateado
  });
});

describe('ConfirmacionTable — Tab Conciliaciones', () => {
  test('Si no hay conciliaciones, debe mostrar el empty state', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Confirmadas', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/OxpExtracto/EnConciliacion', () => HttpResponse.json([])),
    );

    // Act
    renderWithProviders(<ConfirmacionTable />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Conciliaciones' }));

    // Assert
    expect(await screen.findByText('Sin conciliaciones')).toBeInTheDocument();
  });

  test('Si hay extractos en conciliacion, debe mostrar la entidad financiera y el porcentaje', async () => {
    // Arrange
    server.use(
      http.get('*/api/radicacion/consultas/OxpComercio/Confirmadas', () => HttpResponse.json([])),
      http.get('*/api/radicacion/consultas/OxpExtracto/EnConciliacion', () =>
        HttpResponse.json([EXTRACTO_EN_CONCILIACION]),
      ),
    );

    // Act
    renderWithProviders(<ConfirmacionTable />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Conciliaciones' }));

    // Assert — columnas: Entidad financiera, Medio de pago, Periodo, Valor+Moneda, Conciliacion (partidas/total + %), Radicacion
    expect(await screen.findByText('Bancolombia')).toBeInTheDocument();               // terceroNombre
    expect(screen.getByText('•••• 1111')).toBeInTheDocument();                        // medioPagoNumero formateado
    expect(screen.getByText('$750.000,00')).toBeInTheDocument();                      // valorPartidas
    expect(screen.getByText('COP')).toBeInTheDocument();                               // moneda
    expect(screen.getByText('60%')).toBeInTheDocument();                               // porcentajeConciliacion
    expect(screen.getByText('3/5')).toBeInTheDocument();                               // partidasResueltas/totalPartidas
  });
});
