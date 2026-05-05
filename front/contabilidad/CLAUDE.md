# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

Package manager: **Bun** (always use `bun`/`bunx`, never `npm`/`npx`)

```bash
bun run dev       # Start Vite dev server with HMR (port 3000)
bun run build     # TypeScript type-check (tsc -b) + Vite production build
bun run lint      # ESLint with flat config
bun run preview   # Preview production build locally
bun run test      # Run all tests once (vitest run)
bun run test:watch  # Run tests in watch mode
bun vitest run path/to/file.test.ts  # Run a single test file
```

**Git hooks** (Husky): pre-commit runs `bun run build` and `bun run test`. Code must compile and tests must pass before committing.

## Architecture

The project follows **Feature-Sliced Design (FSD)** methodology:

```
src/
├── app/           # App shell: providers, routes, global styles
├── entities/      # Business domain models (e.g., borrador, concepto)
├── features/      # User-facing feature slices (registrar-compra, confirmar-borrador, etc.)
├── pages/         # Route-level page components (thin wrappers composing features/widgets)
├── shared/        # Cross-cutting: api/, config/, hooks/, lib/, model/, ui/
└── widgets/       # Composite UI blocks composed from entities/features
```

FSD layer imports flow **top-down only**: `app → pages → widgets → features → entities → shared`. No circular or upward imports.

**FSD internal structure for features/entities:**
- `api/` — queries (queryOptions factory), mutations
- `model/` — types, Zustand stores, adapters, constants
- `ui/` — components (max 4 per file)
- `hooks/`, `lib/`, `config/` — as needed
- `index.ts` — barrel export (always import from barrel, not deep paths)

## Tech Stack

- **React 19** with **React Compiler** (automatic memoization via babel-plugin-react-compiler)
- **TypeScript 5.9** in strict mode (no unused vars/params, erasable syntax only)
- **Vite 8** for builds
- **MUI 7** with a custom Cosmos theme (`src/app/styles/cosmosTheme.ts`)
  - Primary: violet (#5323de), Secondary: cyan (#00bcd4)
  - Font: IBM Plex Sans
  - Custom `body3` typography variant (augmented in `mui-theme-augmentation.ts`)
  - Dense defaults: small buttons, compact DataGrid (26px rows)
- **Emotion** for CSS-in-JS
- **React Query 5** for server state (staleTime: 30s, retry: 1 for queries / 0 for mutations)
- **Zustand 5** for client state (feature-specific stores + global `useDocumentViewerStore`)
- **React Router 7** — flat routes defined in `src/app/routes/index.tsx`
- **SignalR 10** for real-time notifications (hub at `/notificaciones/hub`)
- **dayjs** for dates (Spanish locale)
- **react-pdf** for PDF viewing

## Key Patterns

**API calls**: Use `httpClient.get/post/put/delete()` from `@/shared/api`. Queries use `queryOptions()` factory pattern from entities layer. HTTP errors follow RFC 7807 ProblemDetails format.

**Path alias**: `@/` maps to `./src/` (configured in vite.config.ts and tsconfig).

**SignalR events**: Use `useOnSignalREvent<T>()` hook from `@/shared/hooks`. Messages follow CloudEvent-like format with `type` and `data` fields.

**Form auto-save**: `useAutoSave()` hook at configurable interval (`VITE_AUTO_SAVE_INTERVAL_MS`, default 10s).

**Dates sent to backend**: Must be ISO datetime format (`YYYY-MM-DDT00:00:00`). Use `toDatetime()` from `@/shared/lib`.

## Testing

- **Vitest** with jsdom environment, setup in `vitest.setup.ts`
- **MSW** for API mocking (server in `shared/lib/testing/msw-server.ts`)
- Use `renderWithProviders()` from `@/shared/lib/testing` — wraps components with QueryClient, MemoryRouter, and LocalizationProvider
- `vitest.setup.ts` mocks: ResizeObserver, react-pdf, MUI X Pro license key

## Environment Variables

- `VITE_API_BASE_URL` — API endpoint (default: `""`, proxied via Vite in dev)
- `VITE_SIGNALR_HUB_URL` — SignalR hub URL (default: `/notificaciones/hub`)
- `VITE_AUTO_SAVE_INTERVAL_MS` — auto-save interval (default: `10000`)

Dev proxy routes `/api/*` and `/notificaciones/hub` to `http://localhost:6100` (Nginx API Gateway).

## Component File Rule

Each `.tsx` file should contain **at most 4 React component definitions** (1 main export + up to 3 small private helpers like cell renderers). If a file exceeds this, split into separate files within the same `ui/` segment. Use `scripts/check-single-component.sh` to validate. The script only counts functions returning JSX, not pure helper functions.

## TypeScript Config

Uses project references (`tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`). Target: ES2023, module resolution: bundler.
