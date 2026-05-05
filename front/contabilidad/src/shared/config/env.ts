interface AppConfig {
  apiBaseUrl?: string;
  signalrHubUrl?: string;
  autoSaveIntervalMs?: number;
  workosClientId?: string;
}

const runtimeConfig: AppConfig =
  (typeof window !== 'undefined'
    ? (window as unknown as { __APP_CONFIG__?: AppConfig }).__APP_CONFIG__
    : undefined) ?? {};

export const API_BASE_URL = runtimeConfig.apiBaseUrl ?? '';

export const SIGNALR_HUB_URL =
  runtimeConfig.signalrHubUrl ??
  import.meta.env.VITE_SIGNALR_HUB_URL ??
  '/notificaciones/hub';

export const AUTO_SAVE_INTERVAL_MS =
  runtimeConfig.autoSaveIntervalMs ||
  Number(import.meta.env.VITE_AUTO_SAVE_INTERVAL_MS) ||
  10_000;

export const WORKOS_CLIENT_ID =
  runtimeConfig.workosClientId ??
  import.meta.env.VITE_WORKOS_CLIENT_ID ??
  '';


export const VITE_APP_BASE = import.meta.env.VITE_APP_BASE ?? '';