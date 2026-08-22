import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// Vercel injects this automatically at build time — no config needed on
// their end. Falling back to 'local' keeps `vite build` working outside Vercel.
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? 'local';

// Конфіг Vite. Dev-сервер піднімається на :5173.
export default defineConfig({
  plugins: [
    react(),
    // Uploads source maps to Sentry on build, then strips them from the
    // public bundle — without this, production stack traces show minified
    // gibberish instead of real file/line numbers. Only runs when
    // SENTRY_AUTH_TOKEN is set (CI/production build), so local dev builds
    // without a token don't fail. Tagging the release with the same commit
    // SHA that main.tsx reports at runtime is what links an error back to
    // its (unminified) source map.
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT_WEB,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !process.env.SENTRY_AUTH_TOKEN,
      release: { name: commitSha },
      sourcemaps: {
        // Without this, the plugin uploads the maps but leaves copies in
        // dist/ too — Vercel would then serve them publicly, handing anyone
        // an unminified readout of the app's source.
        filesToDeleteAfterUpload: ['**/*.map'],
      },
    }),
  ],
  // Vite only exposes env vars prefixed VITE_ to import.meta.env, and only
  // ones actually present in process.env at build time — Vercel's
  // VERCEL_GIT_COMMIT_SHA isn't prefixed, so it has to be wired in explicitly.
  define: {
    'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(commitSha),
  },
  server: {
    port: 5173,
  },
  build: {
    sourcemap: true,
  },
});
