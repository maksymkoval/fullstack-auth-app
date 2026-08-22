import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// Конфіг Vite. Dev-сервер піднімається на :5173.
export default defineConfig({
  plugins: [
    react(),
    // Uploads source maps to Sentry on build, then strips them from the
    // public bundle — without this, production stack traces show minified
    // gibberish instead of real file/line numbers. Only runs when
    // SENTRY_AUTH_TOKEN is set (CI/production build), so local dev builds
    // without a token don't fail.
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT_WEB,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  server: {
    port: 5173,
  },
  build: {
    sourcemap: true,
  },
});
