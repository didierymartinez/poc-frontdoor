import path from 'path'
import { defineConfig, type Plugin } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// El bundle se construye con base = `${VITE_RELEASE_BASE}` (ej. `/oxp/releases/<sha>/`)
// para servir assets inmutables versionados, pero `env.js` se sube por separado a
// `${VITE_APP_BASE}env.js` (ej. `/oxp/env.js`) y se cachea con no-cache.
// Vite rebasa el `src` por el `base` del bundle, así que forzamos la ruta correcta
// con un transform post-build.
const pinEnvJsTo = (appBase: string): Plugin => ({
  name: 'pin-env-js-to-app-base',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      return html.replace(
        /<script\b[^>]*\bsrc="[^"]*\/env\.js"[^>]*><\/script>/,
        `<script src="${appBase}env.js"></script>`,
      );
    },
  },
});

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_RELEASE_BASE ?? '/',
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    pinEnvJsTo(process.env.VITE_APP_BASE ?? ''),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:6100',
        changeOrigin: true,
      },
      '/notificaciones/hub': {
        target: 'http://localhost:6100',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
