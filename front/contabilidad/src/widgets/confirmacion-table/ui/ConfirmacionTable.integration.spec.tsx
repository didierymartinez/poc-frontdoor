import { screen, waitFor } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, requestLog } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { ConfirmacionTable } from './ConfirmacionTable';

// ---------------------------------------------------------------------------
// Mock data — basado en docs/endpoints-oxp-comercio.md (Confirmadas)
// ---------------------------------------------------------------------------

const OXP_ID = 'e5f6a7b8-c9d0-1234-efab-345678901234';

/** VistaOxpComercio en estado Pendiente (estado=1) — disponible para confirmar/devolver */
const COMERCIO_PENDIENTE = {
  id: OXP_ID,
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupHandlers() {
  server.use(
    http.get('*/api/radicacion/consultas/OxpComercio/Confirmadas', () =>
      HttpResponse.json([COMERCIO_PENDIENTE]),
    ),
    http.get('*/api/radicacion/consultas/OxpExtracto/EnConciliacion', () =>
      HttpResponse.json([]),
    ),
    http.post(`*/api/radicacion/comandos/ObligacionPorPagar/${OXP_ID}/Causar`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
    http.post(`*/api/radicacion/comandos/ObligacionPorPagar/${OXP_ID}/Devolver`, () =>
      HttpResponse.json(null, { status: 200 }),
    ),
  );
}

// ---------------------------------------------------------------------------
// Tests de integración — flujo Confirmación
// ---------------------------------------------------------------------------

describe('ConfirmacionTable — Confirmar obligación (Pendiente → Causada)', () => {
  test('Si el usuario confirma una obligación desde el botón de la fila, debe enviar POST /Causar', async () => {
    // Arrange
    setupHandlers();
    renderWithProviders(<ConfirmacionTable />);
    const user = userEvent.setup();

    // Act — esperar que cargue la tabla con datos
    await screen.findByText('Amazon.com');

    // Click en el botón de confirmar (IconCheck) de la fila
    const confirmarButton = screen.getByRole('button', { name: 'Confirmar' });
    await user.click(confirmarButton);

    // En el diálogo de confirmación, click en "Confirmar"
    const dialogConfirmar = await screen.findByRole('button', { name: 'Confirmar' });
    await user.click(dialogConfirmar);

    // Assert — se envió POST /Causar
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/Causar'),
      );
      expect(post).toBeDefined();
    });
  });
});

describe('ConfirmacionTable — Devolver obligación (Pendiente → Devuelta)', () => {
  test('Si el usuario devuelve una obligación con motivo, debe enviar POST /Devolver con el motivo segun docs/endpoints-oxp-comercio.md', async () => {
    // Arrange
    setupHandlers();
    renderWithProviders(<ConfirmacionTable />);
    const user = userEvent.setup();

    // Act — esperar que cargue
    await screen.findByText('Amazon.com');

    // Click en el botón de devolver (IconArrowBackUp) de la fila
    const devolverButton = screen.getByRole('button', { name: 'Devolver' });
    await user.click(devolverButton);

    // En el diálogo: seleccionar motivo
    const motivoSelect = await screen.findByLabelText(/Motivo/i);
    await user.click(motivoSelect);
    await user.click(await screen.findByText('Error en datos'));

    // Escribir observaciones
    const observaciones = screen.getByLabelText(/Observaciones/i);
    await user.type(observaciones, 'Datos del tercero incorrectos');

    // Click en "Devolver"
    const dialogDevolver = screen.getByRole('button', { name: 'Devolver' });
    await user.click(dialogDevolver);

    // Assert — se envió POST /Devolver con motivo
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/Devolver'),
      );
      expect(post).toBeDefined();
      const body = post!.body as Record<string, unknown>;
      expect(body.motivo).toContain('error_datos');
      expect(body.motivo).toContain('Datos del tercero incorrectos');
    });
  });
});
