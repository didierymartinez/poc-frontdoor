window.__APP_CONFIG__ = {
  apiBaseUrl: "",
  signalrHubUrl: "/notificaciones/hub",
  autoSaveIntervalMs: 10000,
  // workosClientId no es secret (es identificador público). Si lo definís acá,
  // se usa para dev. Si lo dejás comentado, cae al fallback VITE_WORKOS_CLIENT_ID
  // de .env.local.
  // workosClientId: "client_xxx",
};
