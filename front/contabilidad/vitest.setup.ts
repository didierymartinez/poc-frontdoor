import { vi, afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import 'dayjs/locale/es';
import { server, clearRequestLog } from '@/shared/lib/testing/msw-server';
import { LicenseInfo } from '@mui/x-license';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof globalThis.ResizeObserver;

(window as unknown as { __APP_CONFIG__: Record<string, unknown> }).__APP_CONFIG__ = {
  apiBaseUrl: '',
  signalrHubUrl: '/notificaciones/hub',
  autoSaveIntervalMs: 10000,
  workosClientId: '',
};

LicenseInfo.setLicenseKey("77d49a57fbc5f4af35ddb05c5f1742e0Tz0xMTI3MjgsRT0xNzc4MzcxMTk5MDAwLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1RMy0yMDI0LEtWPTI=");

vi.mock('react-pdf', () => ({
  Document: () => null,
  Page: () => null,
  pdfjs: { GlobalWorkerOptions: {} },
}));

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
  clearRequestLog();
});
afterAll(() => server.close());
