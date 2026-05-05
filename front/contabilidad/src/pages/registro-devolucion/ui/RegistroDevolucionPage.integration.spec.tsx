import { screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { RegistroDevolucionPage } from './RegistroDevolucionPage';

// ---------------------------------------------------------------------------
// Mock data — basado en docs/endpoints-oxp-devolucion.md
// ---------------------------------------------------------------------------

function setupEmptyHandlers() {
  server.use(
    http.get('*/api/radicacion/consultas/Devolucion/ComerciosDisponibles', () => HttpResponse.json([])),
    http.get('*/api/radicacion/consultas/Devolucion/ExtractosDisponibles', () => HttpResponse.json([])),
    http.get('*/api/radicacion/consultas/Devolucion/AnticiposDisponibles', () => HttpResponse.json([])),
  );
}

function renderPage() {
  return renderWithProviders(<RegistroDevolucionPage />, {
    path: 'registro-devolucion',
    route: '/registro-devolucion',
  });
}

// ---------------------------------------------------------------------------
// Tests de integración — flujo Registro de Devolución
// ---------------------------------------------------------------------------

describe('RegistroDevolucionPage — Wizard selección de origen', () => {
  test('Si se abre la pagina, debe mostrar el dialogo de selección con los 3 origenes segun docs/endpoints-oxp-devolucion.md', async () => {
    // Arrange
    setupEmptyHandlers();

    // Act
    renderPage();

    // Assert — diálogo muestra los 3 tipos de origen documentados
    expect(await screen.findByText('Selecciona un origen')).toBeInTheDocument();
    expect(screen.getByText('Compra')).toBeInTheDocument();      // Origen Comercio
    expect(screen.getByText('Extracto')).toBeInTheDocument();    // Origen Extracto
    expect(screen.getByText('Anticipo')).toBeInTheDocument();    // Origen Anticipo
  });

  test('Si el usuario selecciona origen Compra, debe avanzar al dialogo de terceros con chip "Compra"', async () => {
    // Arrange
    setupEmptyHandlers();
    renderPage();
    const user = userEvent.setup();

    // Act
    await user.click(await screen.findByText('Compra'));

    // Assert — paso 2: diálogo de terceros con chip indicando el origen seleccionado
    expect(await screen.findByText('Compra')).toBeInTheDocument();
    // El diálogo anterior se cierra y el nuevo tiene un botón de "volver" (arrow-left)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('Si el usuario selecciona origen Anticipo, debe avanzar al dialogo de terceros con chip "Anticipo"', async () => {
    // Arrange
    setupEmptyHandlers();
    renderPage();
    const user = userEvent.setup();

    // Act
    await user.click(await screen.findByText('Anticipo'));

    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
