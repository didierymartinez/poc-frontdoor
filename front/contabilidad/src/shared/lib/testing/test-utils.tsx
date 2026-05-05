import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router-dom';
import { render, type RenderOptions } from '@testing-library/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { MainLayoutContext } from '@/shared/model';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Route path pattern (e.g. '/registro-compra/:id') */
  path?: string;
  /** Initial URL to navigate to (e.g. '/registro-compra/abc-123') */
  route?: string;
}

export function renderWithProviders(
  ui: ReactNode,
  options?: RenderWithProvidersOptions,
) {
  const { path, route, ...renderOptions } = options ?? {};
  const queryClient = createTestQueryClient();

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <Outlet context={{ openDocument: () => {} } satisfies MainLayoutContext} />,
        children: [
          { path: path?.replace(/^\//, '') ?? undefined, index: !path, element: ui },
          { path: '*', element: <div data-testid="navigated-away" /> },
        ],
      },
    ],
    { initialEntries: [route ?? '/'] },
  );

  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </LocalizationProvider>,
    renderOptions,
  );
}
