/**
 * Must be imported before anything else in main.ts — Sentry needs to patch
 * modules (http, pg, etc.) as they're required, not after the app is built.
 */
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    // Railway sets this automatically, so events are tied to the commit
    // that's actually deployed without any extra config.
    release: process.env.RAILWAY_GIT_COMMIT_SHA,
    tracesSampleRate: 1.0,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['Authorization'];
      }
      return event;
    },
  });
}
