import { screen, waitFor } from '@testing-library/react';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, requestLog } from '@/shared/lib/testing/msw-server';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import { RegistroOCRPage } from './RegistroOCRPage';

// ---------------------------------------------------------------------------
// Mock SignalR — MSW solo intercepta HTTP, no WebSockets.
// vi.mock reemplaza useOnNotificacion con un fake que guarda los callbacks
// en un Map para invocarlos manualmente en los tests.
// Vitest hoistea vi.mock() al inicio del archivo automaticamente,
// asi que se ejecuta ANTES de los imports aunque este escrito despues.
// ---------------------------------------------------------------------------

const notificacionCallbacks = new Map<string, (datos: unknown) => void>();

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    useOnNotificacion: ({ tipo, onMessage, enabled }: { tipo: string; onMessage: (datos: unknown) => void; enabled?: boolean }) => {
      if (enabled !== false) notificacionCallbacks.set(tipo, onMessage);
    },
    useSignalR: () => ({
      connection: { on: () => {}, off: () => {} },
      isConnected: true,
    }),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockFile(name = 'factura.pdf') {
  return new File(['fake-content'], name, { type: 'application/pdf' });
}

function setupUploadSuccess() {
  server.use(
    http.post('*/api/reconocimiento/comandos/ObligacionesPorPagar/AnalizarEvidenciaEconomica', () =>
      HttpResponse.json(null, { status: 200 }),
    ),
  );
}

function setupUploadError() {
  server.use(
    http.post('*/api/reconocimiento/comandos/ObligacionesPorPagar/AnalizarEvidenciaEconomica', () =>
      HttpResponse.json(
        { detail: 'Formato de archivo no soportado' },
        { status: 400 },
      ),
    ),
  );
}

function renderPage() {
  return renderWithProviders(<RegistroOCRPage />, {
    path: 'registro-ocr',
    route: '/registro-ocr',
  });
}

// ---------------------------------------------------------------------------
// Nota: pendingFile se pasa via location.state, lo cual no es fácil de mockear
// con renderWithProviders. En su lugar, mockeamos useLocation para proveer el state.
// ---------------------------------------------------------------------------

// Mock useLocation para inyectar pendingFile
const mockFile = createMockFile();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/registro-ocr',
      search: '',
      hash: '',
      state: { pendingFile: mockFile },
      key: 'test',
    }),
  };
});

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  notificacionCallbacks.clear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RegistroOCRPage — Upload de documento', () => {
  test('Si hay pendingFile, debe enviar POST al endpoint de upload y mostrar "Procesando documento..."', async () => {
    // Arrange
    setupUploadSuccess();

    // Act
    renderPage();

    // Assert — muestra estado de procesamiento
    expect(await screen.findByText('Procesando documento...')).toBeInTheDocument();

    // Verificar que se envió POST al endpoint de upload
    await waitFor(() => {
      const post = requestLog.find(
        (r) => r.method === 'POST' && r.url.includes('/AnalizarEvidenciaEconomica'),
      );
      expect(post).toBeDefined();
    });
  });

  test('Si el upload falla, debe mostrar "Error al procesar documento" con botón Reintentar', async () => {
    // Arrange
    setupUploadError();

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText('Error al procesar documento')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });
});

describe('RegistroOCRPage — Navegación por evento SignalR', () => {
  test('Si llega evento SignalR "ComercioRadicado", debe navegar a /registro-compra/{id}', async () => {
    // Arrange
    setupUploadSuccess();
    renderPage();

    // Esperar que esté en estado processing (upload exitoso)
    await screen.findByText(/Cargando información del borrador/i);

    // Act — simular evento SignalR
    notificacionCallbacks.get('ComercioRadicado')!({ id: 'comercio-123', estado: 'Pendiente' });

    // Assert — navega al formulario de compra
    expect(await screen.findByTestId('navigated-away')).toBeInTheDocument();
  });

  test('Si llega evento SignalR "ExtractoRadicado", debe navegar a /registro-extracto/{id}', async () => {
    // Arrange
    setupUploadSuccess();
    renderPage();
    await screen.findByText(/Cargando información del borrador/i);

    // Act
    notificacionCallbacks.get('ExtractoRadicado')!({ id: 'extracto-456', estado: 'Pendiente' });

    // Assert
    expect(await screen.findByTestId('navigated-away')).toBeInTheDocument();
  });

  test('Si llega evento SignalR "AnticipoRegistrado", debe navegar a /registro-anticipo/{id}', async () => {
    // Arrange
    setupUploadSuccess();
    renderPage();
    await screen.findByText(/Cargando información del borrador/i);

    // Act
    notificacionCallbacks.get('AnticipoRegistrado')!({ id: 'anticipo-789' });

    // Assert
    expect(await screen.findByTestId('navigated-away')).toBeInTheDocument();
  });
});
